import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { schema } from "@/db";
import { eq } from "drizzle-orm";

/**
 * GET /api/manager-applications/admin
 * Get all manager applications (admin only)
 *
 * Query params:
 * - status: "pending" | "approved" | "rejected" | "all" (default: "pending")
 */
export async function GET(request: NextRequest) {
    try {
        // Get the session from auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Check if user is authenticated
        if (!session || !session.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Please sign in.",
                    error: "UNAUTHORIZED",
                },
                { status: 401 },
            );
        }

        const userRole = session.user.role || "user";

        // Check if user is admin
        if (userRole !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden. Admin access required.",
                    error: "FORBIDDEN",
                },
                { status: 403 },
            );
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "pending";

        // Get applications
        let applications;
        if (status === "all") {
            applications = await db.query.managerApplications.findMany({
                with: {
                    user: true,
                },
                orderBy: (managerApplications, { desc }) => [
                    desc(managerApplications.createdAt),
                ],
            });
        } else {
            applications = await db.query.managerApplications.findMany({
                where: eq(schema.managerApplications.status, status),
                with: {
                    user: true,
                },
                orderBy: (managerApplications, { desc }) => [
                    desc(managerApplications.createdAt),
                ],
            });
        }

        return NextResponse.json(
            {
                success: true,
                data: applications,
                message: `Found ${applications.length} applications.`,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching manager applications:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch applications.",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
        );
    }
}

/**
 * PATCH /api/manager-applications/admin
 * Approve or reject a manager application (admin only)
 *
 * Request body:
 * {
 *   "applicationId": "string",
 *   "action": "approve" | "reject",
 *   "adminNotes": "string (optional)"
 * }
 */
export async function PATCH(request: NextRequest) {
    try {
        // Get the session from auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Check if user is authenticated
        if (!session || !session.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Please sign in.",
                    error: "UNAUTHORIZED",
                },
                { status: 401 },
            );
        }

        const userRole = session.user.role || "user";
        const adminId = session.user.id;

        // Check if user is admin
        if (userRole !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden. Admin access required.",
                    error: "FORBIDDEN",
                },
                { status: 403 },
            );
        }

        // Parse request body
        const body = await request.json();
        const { applicationId, action, adminNotes } = body;

        // Validate required fields
        if (!applicationId || !action) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields.",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 },
            );
        }

        if (action !== "approve" && action !== "reject") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid action. Must be 'approve' or 'reject'.",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 },
            );
        }

        // Get the application
        const application = await db.query.managerApplications.findFirst({
            where: eq(schema.managerApplications.id, applicationId),
        });

        if (!application) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application not found.",
                    error: "NOT_FOUND",
                },
                { status: 404 },
            );
        }

        if (application.status !== "pending") {
            return NextResponse.json(
                {
                    success: false,
                    message: `Application has already been ${application.status}.`,
                    error: "ALREADY_PROCESSED",
                },
                { status: 400 },
            );
        }

        // Update application status
        const newStatus = action === "approve" ? "approved" : "rejected";
        const updatedApplication = await db
            .update(schema.managerApplications)
            .set({
                status: newStatus,
                adminNotes: adminNotes || null,
                reviewedBy: adminId,
                reviewedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.managerApplications.id, applicationId))
            .returning();

        // If approved, update user role to manager
        if (action === "approve") {
            await db
                .update(schema.user)
                .set({
                    role: "manager",
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(schema.user.id, application.userId));
        }

        return NextResponse.json(
            {
                success: true,
                data: updatedApplication[0],
                message: `Application ${newStatus} successfully.`,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error updating manager application:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update application.",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
        );
    }
}

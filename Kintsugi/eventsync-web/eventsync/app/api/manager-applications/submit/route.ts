import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { schema } from "@/db";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/manager-applications/submit
 * Submit a new manager application
 *
 * Request body:
 * {
 *   "organizationName": "string",
 *   "organizationType": "string",
 *   "contactPhone": "string",
 *   "website": "string (optional)",
 *   "description": "string",
 *   "experience": "string"
 * }
 */
export async function POST(request: NextRequest) {
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

    const userId = session.user.id;
    const userRole = session.user.role || "user";

    // Check if user is already a manager or admin
    if (userRole === "manager" || userRole === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "You already have manager or admin privileges.",
          error: "ALREADY_ELEVATED",
        },
        { status: 400 },
      );
    }

    // Check if user has a pending or approved application
    const existingApplication = await db.query.managerApplications.findFirst({
      where: and(
        eq(schema.managerApplications.userId, userId),
        eq(schema.managerApplications.status, "pending"),
      ),
    });

    if (existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have a pending application.",
          error: "APPLICATION_EXISTS",
        },
        { status: 400 },
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      organizationName,
      organizationType,
      contactPhone,
      website,
      description,
      experience,
    } = body;

    // Validate required fields
    if (
      !organizationName ||
      !organizationType ||
      !contactPhone ||
      !description ||
      !experience
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields.",
          error: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }

    // Create the application
    const application = await db
      .insert(schema.managerApplications)
      .values({
        userId,
        organizationName,
        organizationType,
        contactPhone,
        website: website || null,
        description,
        experience,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: application[0],
        message: "Application submitted successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting manager application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application.",
        error: error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/manager-applications/submit
 * Get the current user's manager application status
 */
export async function GET() {
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

    const userId = session.user.id;

    // Get user's application
    const application = await db.query.managerApplications.findFirst({
      where: eq(schema.managerApplications.userId, userId),
      orderBy: (managerApplications, { desc }) => [
        desc(managerApplications.createdAt),
      ],
    });

    return NextResponse.json(
      {
        success: true,
        data: application || null,
        message: application ? "Application found." : "No application found.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching manager application:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch application.",
        error: error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * PATCH /api/events/[id]/page
 * Update the page design for an event
 *
 * Request body:
 * {
 *   "page": {
 *     "version": "string",
 *     "blocks": [...],
 *     "createdAt": "string",
 *     "updatedAt": "string"
 *   }
 * }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get the session from auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Please sign in.",
                    error: "UNAUTHORIZED",
                },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const userRole = session.user.role || "user";
        const { id: eventId } = await params;

        // Validate UUID format
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(eventId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid event ID format",
                    error: "INVALID_ID",
                },
                { status: 400 }
            );
        }

        // Get the event
        const event = await db.query.event.findFirst({
            where: eq(schema.event.id, eventId),
        });

        if (!event) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Event not found",
                    error: "NOT_FOUND",
                },
                { status: 404 }
            );
        }

        // Check if user is the event manager or admin
        if (event.managerId !== userId && userRole !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Forbidden. You don't have permission to edit this event.",
                    error: "FORBIDDEN",
                },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { page } = body;

        if (!page) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Page design data is required",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        // Validate page structure
        if (!page.version || !Array.isArray(page.blocks)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid page design structure",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        // Update the event with the page design
        const [updatedEvent] = await db
            .update(schema.event)
            .set({
                page: page,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.event.id, eventId))
            .returning();

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: updatedEvent.id,
                    page: updatedEvent.page,
                    updatedAt: updatedEvent.updatedAt,
                },
                message: "Page design saved successfully",
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating event page:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update page design",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/events/[id]/page
 * Get the page design for an event
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;

        // Validate UUID format
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(eventId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid event ID format",
                    error: "INVALID_ID",
                },
                { status: 400 }
            );
        }

        // Get the event
        const event = await db.query.event.findFirst({
            where: eq(schema.event.id, eventId),
        });

        if (!event) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Event not found",
                    error: "NOT_FOUND",
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: event.id,
                    page: event.page,
                },
                message: "Page design retrieved successfully",
            },
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=60, s-maxage=60",
                },
            }
        );
    } catch (error) {
        console.error("Error fetching event page:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch page design",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

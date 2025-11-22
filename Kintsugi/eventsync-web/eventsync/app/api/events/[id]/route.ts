import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/events/[id]
 * Fetches a single event by ID
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "string",
 *     "title": "string",
 *     "description": "string",
 *     "imageUrl": "string | null",
 *     "startDate": "string",
 *     "endDate": "string",
 *     "location": "string",
 *     "maxCapacity": "number | null",
 *     "registrationDeadline": "string",
 *     "status": "string",
 *     "managerId": "string",
 *     "teamId": "string | null",
 *     "createdAt": "string",
 *     "updatedAt": "string"
 *   },
 *   "message": "string"
 * }
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        // Validate ID format (UUID)
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Invalid event ID format",
                    error: "INVALID_ID",
                },
                { status: 400 },
            );
        }

        // Fetch event from database
        const events = await db
            .select({
                id: schema.event.id,
                title: schema.event.title,
                description: schema.event.description,
                imageUrl: schema.event.imageUrl,
                startDate: schema.event.startDate,
                endDate: schema.event.endDate,
                location: schema.event.location,
                maxCapacity: schema.event.maxCapacity,
                registrationDeadline: schema.event.registrationDeadline,
                status: schema.event.status,
                managerId: schema.event.managerId,
                teamId: schema.event.teamId,
                page: schema.event.page,
                createdAt: schema.event.createdAt,
                updatedAt: schema.event.updatedAt,
            })
            .from(schema.event)
            .where(eq(schema.event.id, id))
            .limit(1);

        // Check if event exists
        if (!events || events.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Event not found",
                    error: "NOT_FOUND",
                },
                { status: 404 },
            );
        }

        const event = events[0];

        // Return event data
        return NextResponse.json(
            {
                success: true,
                data: event,
                message: "Event fetched successfully",
            },
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=60, s-maxage=60",
                },
            },
        );
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Failed to fetch event",
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
 * PATCH /api/events/[id]
 * Updates an existing event (only the manager who created it can update)
 *
 * Request body:
 * {
 *   "title": "string (optional)",
 *   "description": "string (optional)",
 *   "imageUrl": "string (optional)",
 *   "startDate": "string (optional)",
 *   "endDate": "string (optional)",
 *   "location": "string (optional)",
 *   "maxCapacity": "number (optional)",
 *   "registrationDeadline": "string (optional)",
 *   "status": "string (optional)"
 * }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        // Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        const user = session.user;
        const role = user.role || "user";

        // Only managers and admins can update events
        if (role !== "manager" && role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Forbidden: Manager access required",
                },
                { status: 403 },
            );
        }

        // Validate ID format (UUID)
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Invalid event ID format",
                    error: "INVALID_ID",
                },
                { status: 400 },
            );
        }

        // Check if event exists and user is the manager
        const existingEvents = await db
            .select()
            .from(schema.event)
            .where(eq(schema.event.id, id))
            .limit(1);

        if (!existingEvents || existingEvents.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Event not found",
                    error: "NOT_FOUND",
                },
                { status: 404 },
            );
        }

        const existingEvent = existingEvents[0];

        // Check if user is the manager of this event (admins can edit any event)
        if (role !== "admin" && existingEvent.managerId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Forbidden: You can only edit your own events",
                },
                { status: 403 },
            );
        }

        // Parse request body
        const body = await request.json();

        // Build update object with only provided fields
        const updateData: Record<string, string | number | boolean | null> = {
            updatedAt: new Date().toISOString(),
        };

        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined)
            updateData.description = body.description;
        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
        if (body.startDate !== undefined) updateData.startDate = body.startDate;
        if (body.endDate !== undefined) updateData.endDate = body.endDate;
        if (body.location !== undefined) updateData.location = body.location;
        if (body.maxCapacity !== undefined)
            updateData.maxCapacity = body.maxCapacity;
        if (body.registrationDeadline !== undefined)
            updateData.registrationDeadline = body.registrationDeadline;
        if (body.status !== undefined) updateData.status = body.status;

        // Update event
        const updatedEvents = await db
            .update(schema.event)
            .set(updateData)
            .where(eq(schema.event.id, id))
            .returning();

        return NextResponse.json(
            {
                success: true,
                data: updatedEvents[0],
                message: "Event updated successfully",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Failed to update event",
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
 * DELETE /api/events/[id]
 * Deletes an event (only the manager who created it can delete)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        // Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Unauthorized",
                },
                { status: 401 },
            );
        }

        const user = session.user;
        const role = user.role || "user";

        // Only managers and admins can delete events
        if (role !== "manager" && role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Forbidden: Manager access required",
                },
                { status: 403 },
            );
        }

        // Validate ID format (UUID)
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Invalid event ID format",
                    error: "INVALID_ID",
                },
                { status: 400 },
            );
        }

        // Check if event exists and user is the manager
        const existingEvents = await db
            .select()
            .from(schema.event)
            .where(eq(schema.event.id, id))
            .limit(1);

        if (!existingEvents || existingEvents.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Event not found",
                    error: "NOT_FOUND",
                },
                { status: 404 },
            );
        }

        const existingEvent = existingEvents[0];

        // Check if user is the manager of this event (admins can delete any event)
        if (role !== "admin" && existingEvent.managerId !== user.id) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Forbidden: You can only delete your own events",
                },
                { status: 403 },
            );
        }

        // Delete event (cascading delete will handle registrations)
        await db.delete(schema.event).where(eq(schema.event.id, id));

        return NextResponse.json(
            {
                success: true,
                data: null,
                message: "Event deleted successfully",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Failed to delete event",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
        );
    }
}

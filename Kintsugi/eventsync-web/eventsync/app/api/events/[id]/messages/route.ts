import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eventMessage, event, user } from "@/db/schema/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/events/[id]/messages - Get all messages for an event
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch all messages for this event
        const messages = await db
            .select({
                id: eventMessage.id,
                title: eventMessage.title,
                content: eventMessage.content,
                priority: eventMessage.priority,
                createdAt: eventMessage.createdAt,
                updatedAt: eventMessage.updatedAt,
                managerId: eventMessage.managerId,
                managerName: user.name,
            })
            .from(eventMessage)
            .leftJoin(user, eq(eventMessage.managerId, user.id))
            .where(eq(eventMessage.eventId, id))
            .orderBy(desc(eventMessage.createdAt));

        return NextResponse.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error("Error fetching event messages:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch event messages",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// POST /api/events/[id]/messages - Create a new event message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                { status: 401 }
            );
        }

        // Check if user is manager or admin
        if (
            session.user.role !== "manager" &&
            session.user.role !== "admin"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only managers and admins can post messages",
                },
                { status: 403 }
            );
        }

        // Verify the event exists and user is the manager (or admin)
        const eventData = await db
            .select()
            .from(event)
            .where(eq(event.id, id))
            .limit(1);

        if (eventData.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Event not found",
                },
                { status: 404 }
            );
        }

        const eventRecord = eventData[0];

        // Check if user is the event manager or admin
        if (
            eventRecord.managerId !== session.user.id &&
            session.user.role !== "admin"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You are not authorized to post messages for this event",
                },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { title, content, priority = "normal" } = body;

        if (!title || !content) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Title and content are required",
                },
                { status: 400 }
            );
        }

        // Validate priority
        const validPriorities = ["low", "normal", "high", "urgent"];
        if (!validPriorities.includes(priority)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid priority value",
                },
                { status: 400 }
            );
        }

        // Create the message
        const newMessage = await db
            .insert(eventMessage)
            .values({
                eventId: id,
                managerId: session.user.id,
                title,
                content,
                priority,
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: "Event message posted successfully",
            data: newMessage[0],
        });
    } catch (error) {
        console.error("Error creating event message:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create event message",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

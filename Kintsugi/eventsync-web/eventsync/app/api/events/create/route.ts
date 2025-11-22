import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        // Get the session from the auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in." },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        // Parse the request body
        const body = await request.json();
        const {
            title,
            description,
            imageUrl,
            maxCapacity,
            startDate,
            endDate,
            location,
            registrationDeadline,
            status = "draft",
            page,
        } = body;

        // Validate required fields
        if (
            !title ||
            !description ||
            !startDate ||
            !endDate ||
            !location ||
            !registrationDeadline
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const deadline = new Date(registrationDeadline);

        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime()) ||
            isNaN(deadline.getTime())
        ) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 },
            );
        }

        if (end <= start) {
            return NextResponse.json(
                { error: "End date must be after start date" },
                { status: 400 },
            );
        }

        if (deadline >= start) {
            return NextResponse.json(
                {
                    error: "Registration deadline must be before event start date",
                },
                { status: 400 },
            );
        }

        // Insert event into database
        const [newEvent] = await db
            .insert(schema.event)
            .values({
                title: title.trim(),
                description: description.trim(),
                imageUrl: imageUrl || null,
                maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                location: location.trim(),
                registrationDeadline: deadline.toISOString(),
                status: status || "draft",
                managerId: userId,
                teamId: null, // Can be added later if needed
                page: page || null,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                event: newEvent,
                message: "Event created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json(
            {
                error: "Failed to create event",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

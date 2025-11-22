import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registration, event, team } from "@/db/schema/schema";
import { eq, and } from "drizzle-orm";

// GET /api/registrations/event/[eventId]/team/[teamId] - Get registration data
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string; teamId: string }> }
) {
    try {
        const { eventId, teamId } = await params;

        // Fetch registration data
        const registrationData = await db
            .select({
                id: registration.id,
                eventId: registration.eventId,
                teamId: registration.teamId,
                status: registration.status,
                registeredAt: registration.registeredAt,
                checkedInAt: registration.checkedInAt,
                cancelledAt: registration.cancelledAt,
                formData: registration.formData,
                createdAt: registration.createdAt,
                updatedAt: registration.updatedAt,
                eventTitle: event.title,
                eventStatus: event.status,
                teamName: team.name,
            })
            .from(registration)
            .leftJoin(event, eq(registration.eventId, event.id))
            .leftJoin(team, eq(registration.teamId, team.id))
            .where(
                and(
                    eq(registration.eventId, eventId),
                    eq(registration.teamId, teamId)
                )
            )
            .limit(1);

        if (registrationData.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Registration not found",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: registrationData[0],
        });
    } catch (error) {
        console.error("Error fetching registration:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch registration",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

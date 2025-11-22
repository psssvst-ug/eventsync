import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registration, event, team, teamMember } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, count } from "drizzle-orm";

// POST /api/registrations - Register a team for an event
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, teamId } = body;

    if (!eventId || !teamId) {
      return NextResponse.json(
        { error: "Event ID and Team ID are required" },
        { status: 400 },
      );
    }

    // Check if event exists
    const [eventRecord] = await db
      .select()
      .from(event)
      .where(eq(event.id, eventId))
      .limit(1);

    if (!eventRecord) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if event is published
    if (eventRecord.status !== "published") {
      return NextResponse.json(
        { error: "Event is not accepting registrations" },
        { status: 400 },
      );
    }

    // Check if registration deadline has passed
    if (
      eventRecord.registrationDeadline &&
      new Date(eventRecord.registrationDeadline) < new Date()
    ) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 },
      );
    }

    // Check if event has already ended
    if (eventRecord.endDate && new Date(eventRecord.endDate) < new Date()) {
      return NextResponse.json(
        {
          error: "Cannot register for an event that has already ended",
        },
        { status: 400 },
      );
    }

    // Check if team exists
    const [teamRecord] = await db
      .select()
      .from(team)
      .where(eq(team.id, teamId))
      .limit(1);

    if (!teamRecord) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is the team creator or a member
    const [memberRecord] = await db
      .select()
      .from(teamMember)
      .where(
        and(
          eq(teamMember.teamId, teamId),
          eq(teamMember.userId, session.user.id),
        ),
      )
      .limit(1);

    if (teamRecord.createdBy !== session.user.id && !memberRecord) {
      return NextResponse.json(
        { error: "You are not authorized to register this team" },
        { status: 403 },
      );
    }

    // Check if team is already registered
    const existingRegistration = await db
      .select()
      .from(registration)
      .where(
        and(eq(registration.eventId, eventId), eq(registration.teamId, teamId)),
      )
      .limit(1);

    if (existingRegistration.length > 0) {
      return NextResponse.json(
        { error: "Team is already registered for this event" },
        { status: 400 },
      );
    }

    // Get team member count
    const [memberCount] = await db
      .select({ count: count() })
      .from(teamMember)
      .where(eq(teamMember.teamId, teamId));

    const teamSize = memberCount.count;

    // Check team size requirements
    if (eventRecord.minTeamSize && teamSize < eventRecord.minTeamSize) {
      return NextResponse.json(
        {
          error: `Team must have at least ${eventRecord.minTeamSize} members`,
        },
        { status: 400 },
      );
    }

    if (eventRecord.maxTeamSize && teamSize > eventRecord.maxTeamSize) {
      return NextResponse.json(
        {
          error: `Team cannot have more than ${eventRecord.maxTeamSize} members`,
        },
        { status: 400 },
      );
    }

    // Check event capacity (if maxCapacity is set, count registered teams)
    if (eventRecord.maxCapacity) {
      const [registrationCount] = await db
        .select({ count: count() })
        .from(registration)
        .where(eq(registration.eventId, eventId));

      if (registrationCount.count >= eventRecord.maxCapacity) {
        return NextResponse.json(
          { error: "Event has reached maximum capacity" },
          { status: 400 },
        );
      }
    }

    // Create the registration
    const [newRegistration] = await db
      .insert(registration)
      .values({
        eventId,
        teamId,
        status: "confirmed",
        registeredAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      {
        message: "Team registered successfully",
        registration: newRegistration,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registering team:", error);
    return NextResponse.json(
      { error: "Failed to register team" },
      { status: 500 },
    );
  }
}

// GET /api/registrations?eventId=xxx - Get all registrations for an event
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    // Get registrations with team details
    const registrations = await db
      .select({
        id: registration.id,
        eventId: registration.eventId,
        teamId: registration.teamId,
        status: registration.status,
        registeredAt: registration.registeredAt,
        checkedInAt: registration.checkedInAt,
        teamName: team.name,
        teamDescription: team.description,
      })
      .from(registration)
      .innerJoin(team, eq(registration.teamId, team.id))
      .where(eq(registration.eventId, eventId));

    // Get team members for each registration
    const registrationsWithMembers = await Promise.all(
      registrations.map(async (reg) => {
        const members = await db
          .select()
          .from(teamMember)
          .where(eq(teamMember.teamId, reg.teamId));

        return {
          ...reg,
          teamMembers: members,
        };
      }),
    );

    return NextResponse.json(
      { registrations: registrationsWithMembers },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 },
    );
  }
}

// DELETE /api/registrations - Cancel a registration
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 },
      );
    }

    // Get the registration
    const [registrationRecord] = await db
      .select()
      .from(registration)
      .where(eq(registration.id, registrationId))
      .limit(1);

    if (!registrationRecord) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    // Get the team to check permissions
    const [teamRecord] = await db
      .select()
      .from(team)
      .where(eq(team.id, registrationRecord.teamId))
      .limit(1);

    if (!teamRecord) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is the team creator
    if (teamRecord.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: "Only team creator can cancel registration" },
        { status: 403 },
      );
    }

    // Update registration status
    await db
      .update(registration)
      .set({
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(registration.id, registrationId));

    return NextResponse.json(
      { message: "Registration cancelled successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 },
    );
  }
}

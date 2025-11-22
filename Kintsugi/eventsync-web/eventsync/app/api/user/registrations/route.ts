import { NextResponse } from "next/server";
import { db } from "@/db";
import { registration, event, team, teamMember } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

// GET /api/user/registrations - Get all registrations for the current user
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all teams where the user is a member or creator
    const userTeams = await db
      .select({ teamId: teamMember.teamId })
      .from(teamMember)
      .where(eq(teamMember.userId, userId));

    const teamIds = userTeams.map((t) => t.teamId);

    // If user has no teams, return empty array
    if (teamIds.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: {
            registrations: [],
            total: 0,
          },
        },
        { status: 200 },
      );
    }

    // Fetch all registrations for user's teams
    const registrations = await db
      .select({
        id: registration.id,
        status: registration.status,
        registeredAt: registration.registeredAt,
        checkedInAt: registration.checkedInAt,
        cancelledAt: registration.cancelledAt,
        formData: registration.formData,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          imageUrl: event.imageUrl,
          status: event.status,
          maxCapacity: event.maxCapacity,
          registrationDeadline: event.registrationDeadline,
        },
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
        },
      })
      .from(registration)
      .innerJoin(event, eq(registration.eventId, event.id))
      .innerJoin(team, eq(registration.teamId, team.id))
      .innerJoin(teamMember, eq(teamMember.teamId, team.id))
      .where(eq(teamMember.userId, userId))
      .orderBy(desc(registration.registeredAt));

    // Get unique registrations (in case user is in multiple teams)
    const uniqueRegistrations = Array.from(
      new Map(registrations.map((reg) => [reg.id, reg])).values(),
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          registrations: uniqueRegistrations,
          total: uniqueRegistrations.length,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 },
    );
  }
}

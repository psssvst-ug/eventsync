import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { registration, event, team, teamMember } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";

/**
 * GET /api/user/activity
 * Fetches recent activity for the current user
 * Includes recent registrations, team joins, and upcoming events
 * Query params:
 *  - limit: number of activities to fetch (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const userId = session.user.id;

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const limit = Math.min(
            parseInt(searchParams.get("limit") || "10", 10),
            50,
        );

        // Get all teams where the user is a member
        const userTeams = await db
            .select({ teamId: teamMember.teamId })
            .from(teamMember)
            .where(eq(teamMember.userId, userId));

        const teamIds = userTeams.map((t) => t.teamId);

        // If user has no teams, return empty activity
        if (teamIds.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        activities: [],
                        total: 0,
                    },
                },
                { status: 200 },
            );
        }

        // Fetch recent registrations
        const recentRegistrations = await db
            .select({
                type: registration.id,
                id: registration.id,
                timestamp: registration.registeredAt,
                status: registration.status,
                event: {
                    id: event.id,
                    title: event.title,
                    startDate: event.startDate,
                    location: event.location,
                },
                team: {
                    id: team.id,
                    name: team.name,
                },
            })
            .from(registration)
            .innerJoin(event, eq(registration.eventId, event.id))
            .innerJoin(team, eq(registration.teamId, team.id))
            .innerJoin(teamMember, eq(teamMember.teamId, team.id))
            .where(eq(teamMember.userId, userId))
            .orderBy(desc(registration.registeredAt))
            .limit(limit);

        // Get recent team memberships
        const recentTeamJoins = await db
            .select({
                type: teamMember.id,
                id: teamMember.id,
                timestamp: teamMember.joinedAt,
                team: {
                    id: team.id,
                    name: team.name,
                    description: team.description,
                },
            })
            .from(teamMember)
            .innerJoin(team, eq(teamMember.teamId, team.id))
            .where(
                and(
                    eq(teamMember.userId, userId),
                    eq(teamMember.status, "accepted"),
                ),
            )
            .orderBy(desc(teamMember.joinedAt))
            .limit(limit);

        // Transform data into unified activity format
        const activities = [
            ...recentRegistrations.map((reg) => ({
                id: reg.id,
                type: "registration" as const,
                timestamp: reg.timestamp,
                title: `Registered for ${reg.event.title}`,
                description: `Your team "${reg.team.name}" is registered for this event`,
                metadata: {
                    eventTitle: reg.event.title,
                    teamName: reg.team.name,
                    location: reg.event.location,
                    startDate: reg.event.startDate,
                    status: reg.status,
                },
            })),
            ...recentTeamJoins
                .filter((join) => join.timestamp !== null)
                .map((join) => ({
                    id: join.id,
                    type: "team_join" as const,
                    timestamp: join.timestamp!,
                    title: `Joined team ${join.team.name}`,
                    description:
                        join.team.description || "Became a member of this team",
                    metadata: {
                        teamName: join.team.name,
                        teamDescription: join.team.description,
                    },
                })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime(),
            )
            .slice(0, limit);

        return NextResponse.json(
            {
                success: true,
                data: {
                    activities,
                    total: activities.length,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error fetching user activity:", error);
        return NextResponse.json(
            { error: "Failed to fetch activity" },
            { status: 500 },
        );
    }
}

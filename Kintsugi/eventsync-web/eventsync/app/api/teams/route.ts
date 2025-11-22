import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { team, teamMember } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

// GET /api/teams - Get all teams for the current user
export async function GET() {
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

        // Get teams created by user
        const createdTeams = await db
            .select()
            .from(team)
            .where(eq(team.createdBy, session.user.id));

        // Get teams where user is a member
        const memberTeams = await db
            .select({
                id: team.id,
                name: team.name,
                description: team.description,
                createdBy: team.createdBy,
                createdAt: team.createdAt,
                updatedAt: team.updatedAt,
            })
            .from(teamMember)
            .innerJoin(team, eq(teamMember.teamId, team.id))
            .where(eq(teamMember.userId, session.user.id));

        // Combine and deduplicate teams
        const allTeams = [
            ...createdTeams,
            ...memberTeams.map((mt: typeof team.$inferSelect) => ({
                id: mt.id,
                name: mt.name,
                description: mt.description,
                createdBy: mt.createdBy,
                createdAt: mt.createdAt,
                updatedAt: mt.updatedAt,
            })),
        ];

        const uniqueTeams = Array.from(
            new Map(allTeams.map((t) => [t.id, t])).values(),
        );

        return NextResponse.json({ teams: uniqueTeams }, { status: 200 });
    } catch (error) {
        console.error("Error fetching teams:", error);
        return NextResponse.json(
            { error: "Failed to fetch teams" },
            { status: 500 },
        );
    }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { name, description } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Team name is required" },
                { status: 400 },
            );
        }

        // Create the team
        const [newTeam] = await db
            .insert(team)
            .values({
                name: name.trim(),
                description: description?.trim() || null,
                createdBy: session.user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .returning();

        // Add the creator as a team leader
        await db.insert(teamMember).values({
            teamId: newTeam.id,
            email: session.user.email,
            name: session.user.name,
            userId: session.user.id,
            role: "leader",
            status: "accepted",
            invitedAt: new Date().toISOString(),
            joinedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return NextResponse.json(
            {
                message: "Team created successfully",
                team: newTeam,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating team:", error);
        return NextResponse.json(
            { error: "Failed to create team" },
            { status: 500 },
        );
    }
}

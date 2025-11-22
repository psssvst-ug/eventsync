import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { team, teamMember, user } from "@/db/schema/schema";
import { eq } from "drizzle-orm";

// GET /api/teams/[id] - Get team details by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch team data
        const teamData = await db
            .select({
                id: team.id,
                name: team.name,
                description: team.description,
                createdBy: team.createdBy,
                createdAt: team.createdAt,
                updatedAt: team.updatedAt,
            })
            .from(team)
            .where(eq(team.id, id))
            .limit(1);

        if (teamData.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team not found",
                },
                { status: 404 }
            );
        }

        // Fetch team members
        const members = await db
            .select({
                id: teamMember.id,
                email: teamMember.email,
                name: teamMember.name,
                userId: teamMember.userId,
                role: teamMember.role,
                status: teamMember.status,
                invitedAt: teamMember.invitedAt,
                joinedAt: teamMember.joinedAt,
                userName: user.name,
            })
            .from(teamMember)
            .leftJoin(user, eq(teamMember.userId, user.id))
            .where(eq(teamMember.teamId, id));

        // Format member data
        const formattedMembers = members.map((member) => ({
            id: member.id,
            name: member.name || member.userName || "Unknown",
            email: member.email,
            role: member.role,
            status: member.status,
            invitedAt: member.invitedAt,
            joinedAt: member.joinedAt,
        }));

        return NextResponse.json({
            success: true,
            data: {
                ...teamData[0],
                members: formattedMembers,
            },
        });
    } catch (error) {
        console.error("Error fetching team:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch team",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

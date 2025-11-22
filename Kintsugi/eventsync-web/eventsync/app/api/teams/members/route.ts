import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teamMember, team, user, account } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { generateSecurePassword, sendCredentialsEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// POST /api/teams/members - Add a member to a team
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
        const { teamId, email, name, role = "member" } = body;

        if (!teamId || !email || !name) {
            return NextResponse.json(
                { error: "Team ID, email, and name are required" },
                { status: 400 },
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email address" },
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
            return NextResponse.json(
                { error: "Team not found" },
                { status: 404 },
            );
        }

        // Check if user is the team creator
        if (teamRecord.createdBy !== session.user.id) {
            return NextResponse.json(
                { error: "Only team creator can add members" },
                { status: 403 },
            );
        }

        // Check if member already exists in the team
        const existingMember = await db
            .select()
            .from(teamMember)
            .where(
                and(eq(teamMember.teamId, teamId), eq(teamMember.email, email)),
            )
            .limit(1);

        if (existingMember.length > 0) {
            return NextResponse.json(
                { error: "Member with this email already exists in the team" },
                { status: 400 },
            );
        }

        // Check if user already exists with this email
        const [existingUser] = await db
            .select()
            .from(user)
            .where(eq(user.email, email.toLowerCase()))
            .limit(1);

        let userId: string;
        let generatedPassword: string | null = null;

        if (existingUser) {
            // User already exists, just add them to the team
            userId = existingUser.id;
        } else {
            // Create a new user account with generated credentials
            const newUserId = randomUUID();
            generatedPassword = generateSecurePassword(12);

            // Hash the password using bcryptjs
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            // Create the user
            const [createdUser] = await db
                .insert(user)
                .values({
                    id: newUserId,
                    email: email.toLowerCase(),
                    name: name.trim(),
                    emailVerified: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    role: "user",
                    banned: false,
                })
                .returning();

            // Create account record with password
            await db.insert(account).values({
                id: randomUUID(),
                userId: createdUser.id,
                accountId: createdUser.id,
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            userId = createdUser.id;
        }

        // Add the member to the team
        const [newMember] = await db
            .insert(teamMember)
            .values({
                teamId,
                email: email.toLowerCase(),
                name: name.trim(),
                userId: userId,
                role: role === "leader" ? "leader" : "member",
                status: "accepted",
                invitedAt: new Date().toISOString(),
                joinedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            .returning();

        // Send credentials email only if a new account was created
        if (generatedPassword) {
            const emailResult = await sendCredentialsEmail({
                to: email.toLowerCase(),
                name: name.trim(),
                email: email.toLowerCase(),
                password: generatedPassword,
                teamName: teamRecord.name,
                teamLeaderName: session.user.name,
            });

            if (!emailResult.success) {
                console.error(
                    "Failed to send credentials email:",
                    emailResult.error,
                );
                // Don't fail the entire request if email fails
                // User account and team membership were still created
            }
        }

        return NextResponse.json(
            {
                message: generatedPassword
                    ? "Team member added successfully. Credentials sent via email."
                    : "Team member invited successfully.",
                member: newMember,
                credentialsSent: !!generatedPassword,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error adding team member:", error);
        return NextResponse.json(
            { error: "Failed to add team member" },
            { status: 500 },
        );
    }
}

// GET /api/teams/members?teamId=xxx - Get all members of a team
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

        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get("teamId");

        if (!teamId) {
            return NextResponse.json(
                { error: "Team ID is required" },
                { status: 400 },
            );
        }

        // Get team members
        const members = await db
            .select()
            .from(teamMember)
            .where(eq(teamMember.teamId, teamId));

        return NextResponse.json({ members }, { status: 200 });
    } catch (error) {
        console.error("Error fetching team members:", error);
        return NextResponse.json(
            { error: "Failed to fetch team members" },
            { status: 500 },
        );
    }
}

// DELETE /api/teams/members - Remove a member from a team
export async function DELETE(request: NextRequest) {
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
        const { memberId } = body;

        if (!memberId) {
            return NextResponse.json(
                { error: "Member ID is required" },
                { status: 400 },
            );
        }

        // Get the member details
        const [member] = await db
            .select()
            .from(teamMember)
            .where(eq(teamMember.id, memberId))
            .limit(1);

        if (!member) {
            return NextResponse.json(
                { error: "Member not found" },
                { status: 404 },
            );
        }

        // Get team to check permissions
        const [teamRecord] = await db
            .select()
            .from(team)
            .where(eq(team.id, member.teamId))
            .limit(1);

        if (!teamRecord) {
            return NextResponse.json(
                { error: "Team not found" },
                { status: 404 },
            );
        }

        // Check if user is the team creator or the member themselves
        if (
            teamRecord.createdBy !== session.user.id &&
            member.userId !== session.user.id
        ) {
            return NextResponse.json(
                { error: "Unauthorized to remove this member" },
                { status: 403 },
            );
        }

        // Delete the member
        await db.delete(teamMember).where(eq(teamMember.id, memberId));

        return NextResponse.json(
            { message: "Team member removed successfully" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Error removing team member:", error);
        return NextResponse.json(
            { error: "Failed to remove team member" },
            { status: 500 },
        );
    }
}

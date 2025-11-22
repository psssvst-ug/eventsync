import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { event, registration, team, teamMember } from "@/db/schema/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendRunningEventEmail } from "@/lib/email";

// POST /api/events/[id]/notify-teams - Send running event emails to all registered teams
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
                    message: "Only managers and admins can send notifications",
                },
                { status: 403 }
            );
        }

        // Fetch event data
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
                    message: "You are not authorized to send notifications for this event",
                },
                { status: 403 }
            );
        }

        // Check if event status is "running"
        if (eventRecord.status !== "running") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Event must be in 'running' status to send notifications",
                },
                { status: 400 }
            );
        }

        // Fetch all registered teams for this event
        const registeredTeams = await db
            .select({
                registrationId: registration.id,
                teamId: registration.teamId,
                teamName: team.name,
            })
            .from(registration)
            .leftJoin(team, eq(registration.teamId, team.id))
            .where(eq(registration.eventId, id));

        if (registeredTeams.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No teams registered for this event",
                },
                { status: 404 }
            );
        }

        // For each team, fetch all members and send emails
        const emailResults = [];
        let successCount = 0;
        let failureCount = 0;

        for (const registeredTeam of registeredTeams) {
            try {
                // Fetch all team members with accepted status
                const members = await db
                    .select({
                        id: teamMember.id,
                        email: teamMember.email,
                        name: teamMember.name,
                        status: teamMember.status,
                    })
                    .from(teamMember)
                    .where(
                        and(
                            eq(teamMember.teamId, registeredTeam.teamId),
                            eq(teamMember.status, "accepted")
                        )
                    );

                if (members.length === 0) {
                    emailResults.push({
                        teamId: registeredTeam.teamId,
                        teamName: registeredTeam.teamName,
                        success: false,
                        message: "No accepted team members found",
                    });
                    failureCount++;
                    continue;
                }

                // Extract email addresses
                const emailAddresses = members
                    .map((member) => member.email)
                    .filter((email) => email);

                if (emailAddresses.length === 0) {
                    emailResults.push({
                        teamId: registeredTeam.teamId,
                        teamName: registeredTeam.teamName,
                        success: false,
                        message: "No valid email addresses found",
                    });
                    failureCount++;
                    continue;
                }

                // Send email to all team members
                const emailResult = await sendRunningEventEmail({
                    to: emailAddresses,
                    eventTitle: eventRecord.title,
                    eventId: id,
                    teamId: registeredTeam.teamId,
                    teamName: registeredTeam.teamName || "Your Team",
                    eventStartDate: eventRecord.startDate,
                    eventLocation: eventRecord.location || "TBD",
                });

                if (emailResult.success) {
                    emailResults.push({
                        teamId: registeredTeam.teamId,
                        teamName: registeredTeam.teamName,
                        success: true,
                        recipientCount: emailAddresses.length,
                        emailId: emailResult.emailId,
                    });
                    successCount++;
                } else {
                    emailResults.push({
                        teamId: registeredTeam.teamId,
                        teamName: registeredTeam.teamName,
                        success: false,
                        message: emailResult.error || "Failed to send email",
                    });
                    failureCount++;
                }
            } catch (error) {
                console.error(
                    `Error sending email to team ${registeredTeam.teamId}:`,
                    error
                );
                emailResults.push({
                    teamId: registeredTeam.teamId,
                    teamName: registeredTeam.teamName,
                    success: false,
                    message:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
                failureCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Notification emails sent: ${successCount} successful, ${failureCount} failed`,
            data: {
                totalTeams: registeredTeams.length,
                successCount,
                failureCount,
                results: emailResults,
            },
        });
    } catch (error) {
        console.error("Error sending notification emails:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to send notification emails",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

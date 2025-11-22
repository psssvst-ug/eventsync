import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    attendanceTracking,
    registration,
    event,
    teamMember,
} from "@/db/schema/schema";
import { eq, and } from "drizzle-orm";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/events/[id]/team/[teamId]/generate-qrcodes - Generate QR codes for a specific team
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; teamId: string }> },
) {
    try {
        const { id: eventId, teamId } = await params;

        // Get session to verify team membership
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Verify user is logged in
        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 },
            );
        }

        // Verify user is a member of this team
        const memberCheck = await db
            .select()
            .from(teamMember)
            .where(
                and(
                    eq(teamMember.teamId, teamId),
                    eq(teamMember.email, session.user.email),
                    eq(teamMember.status, "accepted"),
                ),
            )
            .limit(1);

        if (memberCheck.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Access denied. You are not a member of this team.",
                },
                { status: 403 },
            );
        }

        // Verify registration exists
        const registrationData = await db
            .select()
            .from(registration)
            .where(
                and(
                    eq(registration.eventId, eventId),
                    eq(registration.teamId, teamId),
                ),
            )
            .limit(1);

        if (registrationData.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Team is not registered for this event",
                },
                { status: 404 },
            );
        }

        // Verify event exists
        const eventData = await db
            .select()
            .from(event)
            .where(eq(event.id, eventId))
            .limit(1);

        if (eventData.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Event not found",
                },
                { status: 404 },
            );
        }

        // Get all accepted team members
        const teamMembers = await db
            .select()
            .from(teamMember)
            .where(
                and(
                    eq(teamMember.teamId, teamId),
                    eq(teamMember.status, "accepted"),
                ),
            );

        if (teamMembers.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No accepted team members found",
                },
                { status: 400 },
            );
        }

        // QR code types per member
        const qrTypes = [
            { trackingType: "attendance", label: "Event Attendance" },
            { trackingType: "food_coupon", label: "Lunch Coupon" },
            { trackingType: "food_coupon", label: "Dinner Coupon" },
        ];

        let totalCreated = 0;
        let totalSkipped = 0;
        const results = [];

        // Generate QR codes for each member
        for (const member of teamMembers) {
            for (const qrType of qrTypes) {
                try {
                    const memberLabel = `${qrType.label} - ${member.name}`;

                    // Check if this QR code already exists for this member
                    const existing = await db
                        .select()
                        .from(attendanceTracking)
                        .where(
                            and(
                                eq(attendanceTracking.eventId, eventId),
                                eq(attendanceTracking.teamId, teamId),
                                eq(attendanceTracking.memberId, member.id),
                                eq(
                                    attendanceTracking.trackingType,
                                    qrType.trackingType,
                                ),
                                eq(attendanceTracking.label, qrType.label),
                            ),
                        )
                        .limit(1);

                    if (existing.length > 0) {
                        results.push({
                            memberName: member.name,
                            label: qrType.label,
                            trackingType: qrType.trackingType,
                            status: "skipped",
                            message: "Already exists",
                        });
                        totalSkipped++;
                        continue;
                    }

                    // Generate temporary QR code
                    const tempQrData = JSON.stringify({
                        trackingId: "temp",
                        eventId: eventId,
                        teamId: teamId,
                        memberId: member.id,
                        type: qrType.trackingType,
                        label: memberLabel,
                    });

                    const tempQrCodeUrl = await QRCode.toDataURL(tempQrData, {
                        errorCorrectionLevel: "H",
                        type: "image/png",
                        width: 300,
                        margin: 2,
                    });

                    // Create tracking record with temp QR code
                    const newTracking = await db
                        .insert(attendanceTracking)
                        .values({
                            eventId,
                            teamId,
                            memberId: member.id,
                            trackingType: qrType.trackingType,
                            label: memberLabel,
                            metadata: null,
                            qrCodeData: tempQrCodeUrl,
                        })
                        .returning();

                    // Generate final QR code with actual ID
                    const finalQrData = JSON.stringify({
                        trackingId: newTracking[0].id,
                        eventId: eventId,
                        teamId: teamId,
                        memberId: member.id,
                        type: qrType.trackingType,
                        label: memberLabel,
                    });

                    const finalQrCodeUrl = await QRCode.toDataURL(finalQrData, {
                        errorCorrectionLevel: "H",
                        type: "image/png",
                        width: 300,
                        margin: 2,
                    });

                    // Update with final QR code
                    await db
                        .update(attendanceTracking)
                        .set({ qrCodeData: finalQrCodeUrl })
                        .where(eq(attendanceTracking.id, newTracking[0].id));

                    results.push({
                        memberName: member.name,
                        id: newTracking[0].id,
                        label: memberLabel,
                        trackingType: qrType.trackingType,
                        status: "created",
                    });
                    totalCreated++;
                } catch (error) {
                    console.error(
                        `Error creating QR code for member ${member.name}:`,
                        error,
                    );
                    results.push({
                        memberName: member.name,
                        label: qrType.label,
                        trackingType: qrType.trackingType,
                        status: "error",
                        message:
                            error instanceof Error
                                ? error.message
                                : "Unknown error",
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `QR codes generated: ${totalCreated} created, ${totalSkipped} skipped`,
            data: {
                totalCreated,
                totalSkipped,
                results,
            },
        });
    } catch (error) {
        console.error("Error generating QR codes:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate QR codes",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

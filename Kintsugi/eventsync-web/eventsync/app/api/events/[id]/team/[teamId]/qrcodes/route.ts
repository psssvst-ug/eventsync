import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
    attendanceTracking,
    registration,
    event,
    team,
    teamMember,
} from "@/db/schema/schema";
import { eq, and } from "drizzle-orm";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/events/[id]/team/[teamId]/qrcodes - Get QR codes for a team
export async function GET(
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

        // Fetch all tracking records for this team and event with member info
        const trackingRecords = await db
            .select({
                id: attendanceTracking.id,
                label: attendanceTracking.label,
                trackingType: attendanceTracking.trackingType,
                qrCodeData: attendanceTracking.qrCodeData,
                scannedAt: attendanceTracking.scannedAt,
                scannedBy: attendanceTracking.scannedBy,
                memberId: attendanceTracking.memberId,
                memberName: teamMember.name,
            })
            .from(attendanceTracking)
            .leftJoin(
                teamMember,
                eq(attendanceTracking.memberId, teamMember.id),
            )
            .where(
                and(
                    eq(attendanceTracking.eventId, eventId),
                    eq(attendanceTracking.teamId, teamId),
                ),
            );

        // Process QR codes - generate if not exists, use stored if exists
        const qrCodes = await Promise.all(
            trackingRecords.map(async (record) => {
                let qrCodeUrl = record.qrCodeData;

                // If QR code doesn't exist in DB, generate and store it
                if (!qrCodeUrl) {
                    const qrData = JSON.stringify({
                        trackingId: record.id,
                        eventId: eventId,
                        teamId: teamId,
                        type: record.trackingType,
                        label: record.label,
                    });

                    qrCodeUrl = await QRCode.toDataURL(qrData, {
                        errorCorrectionLevel: "H",
                        type: "image/png",
                        width: 300,
                        margin: 2,
                    });

                    // Store QR code in database
                    await db
                        .update(attendanceTracking)
                        .set({ qrCodeData: qrCodeUrl })
                        .where(eq(attendanceTracking.id, record.id));
                }

                return {
                    id: record.id,
                    label: record.label,
                    trackingType: record.trackingType,
                    qrCodeUrl: qrCodeUrl,
                    isScanned: record.scannedAt !== null,
                    scannedAt: record.scannedAt,
                    scannedBy: record.scannedBy,
                    memberId: record.memberId,
                    memberName: record.memberName,
                };
            }),
        );

        return NextResponse.json({
            success: true,
            data: qrCodes,
        });
    } catch (error) {
        console.error("Error fetching QR codes:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch QR codes",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

// POST /api/events/[id]/team/[teamId]/qrcodes - Create a new QR code tracking entry
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

        const body = await request.json();
        const { trackingType, label, metadata } = body;

        if (!trackingType || !label) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Tracking type and label are required",
                },
                { status: 400 },
            );
        }

        // Validate tracking type
        const validTypes = ["attendance", "food_coupon", "custom"];
        if (!validTypes.includes(trackingType)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid tracking type",
                },
                { status: 400 },
            );
        }

        // Generate QR code first
        const qrData = JSON.stringify({
            trackingId: "temp", // Will be replaced after insert
            eventId: eventId,
            teamId: teamId,
            type: trackingType,
            label: label,
        });

        const tempQrCodeUrl = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: "H",
            type: "image/png",
            width: 300,
            margin: 2,
        });

        // Create tracking record with QR code
        const newTracking = await db
            .insert(attendanceTracking)
            .values({
                eventId,
                teamId,
                trackingType,
                label,
                metadata: metadata || null,
                qrCodeData: tempQrCodeUrl,
            })
            .returning();

        // Generate proper QR code with actual ID
        const finalQrData = JSON.stringify({
            trackingId: newTracking[0].id,
            eventId: eventId,
            teamId: teamId,
            type: trackingType,
            label: label,
        });

        const qrCodeUrl = await QRCode.toDataURL(finalQrData, {
            errorCorrectionLevel: "H",
            type: "image/png",
            width: 300,
            margin: 2,
        });

        // Update with final QR code
        await db
            .update(attendanceTracking)
            .set({ qrCodeData: qrCodeUrl })
            .where(eq(attendanceTracking.id, newTracking[0].id));

        return NextResponse.json({
            success: true,
            message: "QR code created successfully",
            data: {
                id: newTracking[0].id,
                label: newTracking[0].label,
                trackingType: newTracking[0].trackingType,
                qrCodeUrl: qrCodeUrl,
                isScanned: false,
                scannedAt: null,
            },
        });
    } catch (error) {
        console.error("Error creating QR code:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create QR code",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

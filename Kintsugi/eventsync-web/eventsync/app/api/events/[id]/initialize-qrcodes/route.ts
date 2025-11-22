import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { event, registration, attendanceTracking } from "@/db/schema/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import QRCode from "qrcode";

// POST /api/events/[id]/initialize-qrcodes - Initialize default QR codes for all registered teams
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
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
                { status: 401 },
            );
        }

        // Check if user is manager or admin
        if (session.user.role !== "manager" && session.user.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only managers and admins can initialize QR codes",
                },
                { status: 403 },
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
                { status: 404 },
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
                    message:
                        "You are not authorized to initialize QR codes for this event",
                },
                { status: 403 },
            );
        }

        // Fetch all registered teams
        const registeredTeams = await db
            .select({
                teamId: registration.teamId,
            })
            .from(registration)
            .where(eq(registration.eventId, id));

        if (registeredTeams.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No teams registered for this event",
                },
                { status: 404 },
            );
        }

        // Get custom QR types from request body (optional)
        const body = await request.json().catch(() => ({}));
        const customQRTypes = body.qrTypes || [];

        // Default QR code types
        const defaultQRTypes = [
            { trackingType: "attendance", label: "Event Attendance" },
            { trackingType: "food_coupon", label: "Lunch Coupon" },
            { trackingType: "food_coupon", label: "Dinner Coupon" },
        ];

        // Combine default and custom types
        const qrTypes =
            customQRTypes.length > 0 ? customQRTypes : defaultQRTypes;

        let totalCreated = 0;
        let totalSkipped = 0;
        const results = [];

        // Create QR codes for each team
        for (const team of registeredTeams) {
            const teamResults = [];

            for (const qrType of qrTypes) {
                try {
                    // Check if this QR code already exists
                    const existing = await db
                        .select()
                        .from(attendanceTracking)
                        .where(
                            and(
                                eq(attendanceTracking.eventId, id),
                                eq(attendanceTracking.teamId, team.teamId),
                                eq(
                                    attendanceTracking.trackingType,
                                    qrType.trackingType,
                                ),
                                eq(attendanceTracking.label, qrType.label),
                            ),
                        )
                        .limit(1);

                    if (existing.length > 0) {
                        teamResults.push({
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
                        eventId: id,
                        teamId: team.teamId,
                        type: qrType.trackingType,
                        label: qrType.label,
                    });

                    const tempQrCodeUrl = await QRCode.toDataURL(tempQrData, {
                        errorCorrectionLevel: "H",
                        type: "image/png",
                        width: 300,
                        margin: 2,
                    });

                    // Create tracking record with QR code
                    const newTracking = await db
                        .insert(attendanceTracking)
                        .values({
                            eventId: id,
                            teamId: team.teamId,
                            trackingType: qrType.trackingType,
                            label: qrType.label,
                            metadata: qrType.metadata || null,
                            qrCodeData: tempQrCodeUrl,
                        })
                        .returning();

                    // Generate final QR code with actual ID
                    const finalQrData = JSON.stringify({
                        trackingId: newTracking[0].id,
                        eventId: id,
                        teamId: team.teamId,
                        type: qrType.trackingType,
                        label: qrType.label,
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

                    teamResults.push({
                        id: newTracking[0].id,
                        label: qrType.label,
                        trackingType: qrType.trackingType,
                        status: "created",
                    });
                    totalCreated++;
                } catch (error) {
                    console.error(
                        `Error creating QR code for team ${team.teamId}:`,
                        error,
                    );
                    teamResults.push({
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

            results.push({
                teamId: team.teamId,
                qrCodes: teamResults,
            });
        }

        return NextResponse.json({
            success: true,
            message: `QR codes initialized: ${totalCreated} created, ${totalSkipped} skipped`,
            data: {
                totalTeams: registeredTeams.length,
                totalCreated,
                totalSkipped,
                results,
            },
        });
    } catch (error) {
        console.error("Error initializing QR codes:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to initialize QR codes",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceTracking, event, team, user } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id: eventId } = await params;
        const { qrData } = await req.json();

        if (!qrData) {
            return NextResponse.json(
                { success: false, message: "QR code data is required" },
                { status: 400 },
            );
        }

        // Extract the tracking ID from QR data
        // QR data can be either JSON or plain tracking ID
        let trackingId: string;

        try {
            // Try to parse as JSON first
            const parsedData = JSON.parse(qrData);
            trackingId = parsedData.trackingId;
        } catch {
            // If not JSON, treat as plain tracking ID
            trackingId = qrData.trim();
        }

        if (!trackingId) {
            return NextResponse.json(
                { success: false, message: "Invalid QR code format" },
                { status: 400 },
            );
        }

        // Fetch the attendance tracking record
        const trackingRecords = await db
            .select({
                id: attendanceTracking.id,
                eventId: attendanceTracking.eventId,
                teamId: attendanceTracking.teamId,
                trackingType: attendanceTracking.trackingType,
                label: attendanceTracking.label,
                scannedAt: attendanceTracking.scannedAt,
                scannedBy: attendanceTracking.scannedBy,
                teamName: team.name,
                eventTitle: event.title,
                eventManagerId: event.managerId,
            })
            .from(attendanceTracking)
            .leftJoin(team, eq(attendanceTracking.teamId, team.id))
            .leftJoin(event, eq(attendanceTracking.eventId, event.id))
            .where(eq(attendanceTracking.id, trackingId))
            .limit(1);

        if (trackingRecords.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid QR code - not found in system",
                },
                { status: 404 },
            );
        }

        const trackingRecord = trackingRecords[0];

        // Verify the QR code belongs to the correct event
        if (trackingRecord.eventId !== eventId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This QR code does not belong to this event",
                },
                { status: 400 },
            );
        }

        // Verify the user is the event manager or has permission
        if (
            trackingRecord.eventManagerId !== session.user.id &&
            session.user.role !== "admin"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "You don't have permission to scan QR codes for this event",
                },
                { status: 403 },
            );
        }

        // Check if already scanned
        if (trackingRecord.scannedAt) {
            // Get scanner name
            let scannerName = "Unknown";
            if (trackingRecord.scannedBy) {
                const scannerRecords = await db
                    .select({ name: user.name })
                    .from(user)
                    .where(eq(user.id, trackingRecord.scannedBy))
                    .limit(1);
                if (scannerRecords.length > 0) {
                    scannerName = scannerRecords[0].name;
                }
            }

            return NextResponse.json(
                {
                    success: false,
                    message: `This QR code was already scanned on ${new Date(
                        trackingRecord.scannedAt,
                    ).toLocaleString()} by ${scannerName}`,
                },
                { status: 400 },
            );
        }

        // Mark as scanned
        const now = new Date().toISOString();
        await db
            .update(attendanceTracking)
            .set({
                scannedAt: now,
                scannedBy: session.user.id,
                updatedAt: now,
            })
            .where(eq(attendanceTracking.id, trackingId));

        return NextResponse.json({
            success: true,
            message: "QR code verified and marked as used successfully",
            data: {
                id: trackingRecord.id,
                teamName: trackingRecord.teamName || "Unknown Team",
                label: trackingRecord.label,
                trackingType: trackingRecord.trackingType,
                scannedAt: now,
                scannedBy: session.user.name,
            },
        });
    } catch (error) {
        console.error("Error verifying QR code:", error);
        return NextResponse.json(
            {
                success: false,
                message: "An error occurred while verifying the QR code",
            },
            { status: 500 },
        );
    }
}

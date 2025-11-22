/**
 * Script to generate QR codes for all registered teams in an event
 *
 * Usage:
 *   npx tsx scripts/generate-qr-codes.ts <eventId>
 *
 * Or via the API endpoint:
 *   POST /api/events/[eventId]/initialize-qrcodes
 */

import { db } from "@/db";
import { event, registration, attendanceTracking } from "@/db/schema/schema";
import { eq, and } from "drizzle-orm";

async function generateQRCodesForEvent(eventId: string) {
    try {
        console.log(`🔍 Checking event: ${eventId}`);

        // Verify event exists
        const eventData = await db
            .select()
            .from(event)
            .where(eq(event.id, eventId))
            .limit(1);

        if (eventData.length === 0) {
            console.error("❌ Event not found");
            process.exit(1);
        }

        console.log(`✅ Event found: ${eventData[0].title}`);

        // Get all registered teams
        const registeredTeams = await db
            .select({
                teamId: registration.teamId,
            })
            .from(registration)
            .where(eq(registration.eventId, eventId));

        if (registeredTeams.length === 0) {
            console.log("⚠️  No teams registered for this event");
            return;
        }

        console.log(`📋 Found ${registeredTeams.length} registered team(s)`);

        // Default QR code types
        const qrTypes = [
            { trackingType: "attendance", label: "Event Attendance" },
            { trackingType: "food_coupon", label: "Lunch Coupon" },
            { trackingType: "food_coupon", label: "Dinner Coupon" },
        ];

        let totalCreated = 0;
        let totalSkipped = 0;

        // Generate QR codes for each team
        for (const team of registeredTeams) {
            console.log(`\n🔨 Processing team: ${team.teamId}`);

            for (const qrType of qrTypes) {
                // Check if QR code already exists
                const existing = await db
                    .select()
                    .from(attendanceTracking)
                    .where(
                        and(
                            eq(attendanceTracking.eventId, eventId),
                            eq(attendanceTracking.teamId, team.teamId),
                            eq(attendanceTracking.trackingType, qrType.trackingType),
                            eq(attendanceTracking.label, qrType.label)
                        )
                    )
                    .limit(1);

                if (existing.length > 0) {
                    console.log(`   ⏭️  Skipped: ${qrType.label} (already exists)`);
                    totalSkipped++;
                    continue;
                }

                // Create new tracking record
                await db.insert(attendanceTracking).values({
                    eventId,
                    teamId: team.teamId,
                    trackingType: qrType.trackingType,
                    label: qrType.label,
                    metadata: null,
                });

                console.log(`   ✅ Created: ${qrType.label}`);
                totalCreated++;
            }
        }

        console.log("\n" + "=".repeat(50));
        console.log("📊 Summary:");
        console.log(`   Total Teams: ${registeredTeams.length}`);
        console.log(`   QR Codes Created: ${totalCreated}`);
        console.log(`   QR Codes Skipped: ${totalSkipped}`);
        console.log("=".repeat(50));
        console.log("\n✨ Done! QR codes have been generated.");
        console.log(`\n🔗 Teams can view their QR codes at:`);
        console.log(`   http://localhost:3000/running/${eventId}/[teamId]`);

    } catch (error) {
        console.error("❌ Error generating QR codes:", error);
        process.exit(1);
    }
}

// Get event ID from command line arguments
const eventId = process.argv[2];

if (!eventId) {
    console.error("❌ Please provide an event ID");
    console.log("\nUsage:");
    console.log("  npx tsx scripts/generate-qr-codes.ts <eventId>");
    console.log("\nExample:");
    console.log("  npx tsx scripts/generate-qr-codes.ts 9b99e6d1-1085-4546-8747-3073caa55b4a");
    process.exit(1);
}

// Run the script
generateQRCodesForEvent(eventId)
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error("Fatal error:", error);
        process.exit(1);
    });

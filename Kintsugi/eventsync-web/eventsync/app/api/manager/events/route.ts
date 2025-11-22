import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, desc, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/manager/events
 * Fetches events created by the logged-in manager with registration counts
 */
export async function GET() {
  try {
    // Get session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const user = session.user;
    const role = session.user.role || "user";

    // Only managers can access this endpoint
    if (role !== "manager" && role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Forbidden: Manager access required",
        },
        { status: 403 },
      );
    }

    // Fetch events with registration counts
    const events = await db
      .select({
        id: schema.event.id,
        title: schema.event.title,
        description: schema.event.description,
        startDate: schema.event.startDate,
        endDate: schema.event.endDate,
        location: schema.event.location,
        maxCapacity: schema.event.maxCapacity,
        status: schema.event.status,
        imageUrl: schema.event.imageUrl,
        createdAt: schema.event.createdAt,
        registrationCount: count(schema.registration.id),
      })
      .from(schema.event)
      .leftJoin(
        schema.registration,
        eq(schema.event.id, schema.registration.eventId),
      )
      .where(eq(schema.event.managerId, user.id))
      .groupBy(schema.event.id)
      .orderBy(desc(schema.event.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      data: events,
      message: "Events fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching manager events:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to fetch events",
        error: error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}

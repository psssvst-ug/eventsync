import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, desc, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/manager/registrations
 * Fetches recent registrations for the logged-in manager's events
 * Query params:
 *  - limit: number of registrations to fetch (default: 10, max: 50)
 *  - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Get total count of registrations
    const [totalCount] = await db
      .select({ count: count() })
      .from(schema.registration)
      .innerJoin(schema.event, eq(schema.registration.eventId, schema.event.id))
      .where(eq(schema.event.managerId, user.id));

    // Fetch recent registrations for manager's events with team member count
    const registrations = await db
      .select({
        id: schema.registration.id,
        status: schema.registration.status,
        registeredAt: schema.registration.registeredAt,
        checkedInAt: schema.registration.checkedInAt,
        cancelledAt: schema.registration.cancelledAt,
        team: {
          id: schema.team.id,
          name: schema.team.name,
          description: schema.team.description,
        },
        event: {
          id: schema.event.id,
          title: schema.event.title,
          startDate: schema.event.startDate,
          location: schema.event.location,
        },
      })
      .from(schema.registration)
      .innerJoin(schema.event, eq(schema.registration.eventId, schema.event.id))
      .innerJoin(schema.team, eq(schema.registration.teamId, schema.team.id))
      .where(eq(schema.event.managerId, user.id))
      .orderBy(desc(schema.registration.registeredAt))
      .limit(limit)
      .offset(offset);

    // Get team member counts for each registration
    const registrationsWithMemberCount = await Promise.all(
      registrations.map(async (reg) => {
        const [memberCount] = await db
          .select({ count: count() })
          .from(schema.teamMember)
          .where(eq(schema.teamMember.teamId, reg.team.id));

        return {
          ...reg,
          teamMemberCount: memberCount.count,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: registrationsWithMemberCount,
      pagination: {
        total: totalCount.count,
        limit,
        offset,
        hasMore: offset + limit < totalCount.count,
      },
      message: "Registrations fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching manager registrations:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Failed to fetch registrations",
        error: error instanceof Error ? error.message : "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}

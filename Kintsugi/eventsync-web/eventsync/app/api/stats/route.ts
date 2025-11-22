import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, and, count, sql, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/stats
 * Fetches dashboard statistics based on user role
 *
 * Returns different stats for:
 * - user/applicant: registered events, attended events, upcoming events
 * - manager: active events, registrations, check-ins, capacity
 * - admin: total users, total events, pending applications, system health
 */
export async function GET() {
    try {
        // Get session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
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
        const role = user.role || "user";

        // User/Applicant Stats
        if (role === "user") {
            const userId = user.id;

            // Get all teams where the user is a member
            const userTeams = await db
                .select({ teamId: schema.teamMember.teamId })
                .from(schema.teamMember)
                .where(eq(schema.teamMember.userId, userId));

            const teamIds = userTeams.map((t) => t.teamId);

            // If user has no teams, return zero stats
            if (teamIds.length === 0) {
                return NextResponse.json({
                    success: true,
                    data: {
                        registeredEvents: 0,
                        attendedEvents: 0,
                        upcomingEvents: 0,
                    },
                    message: "User stats fetched successfully",
                });
            }

            // Count registered events (unique events across all user's teams)
            const registrations = await db
                .select({ eventId: schema.registration.eventId })
                .from(schema.registration)
                .innerJoin(
                    schema.teamMember,
                    eq(schema.registration.teamId, schema.teamMember.teamId),
                )
                .where(eq(schema.teamMember.userId, userId));

            const uniqueEventIds = new Set(registrations.map((r) => r.eventId));
            const registeredEvents = uniqueEventIds.size;

            // Count attended events (checked in)
            const attendedRegistrations = await db
                .select({ eventId: schema.registration.eventId })
                .from(schema.registration)
                .innerJoin(
                    schema.teamMember,
                    eq(schema.registration.teamId, schema.teamMember.teamId),
                )
                .where(
                    and(
                        eq(schema.teamMember.userId, userId),
                        sql`${schema.registration.checkedInAt} IS NOT NULL`,
                    ),
                );

            const uniqueAttendedIds = new Set(
                attendedRegistrations.map((r) => r.eventId),
            );
            const attendedEvents = uniqueAttendedIds.size;

            // Count upcoming events (events with future start dates that user is registered for)
            const now = new Date().toISOString();
            const upcomingRegistrations = await db
                .select({ eventId: schema.registration.eventId })
                .from(schema.registration)
                .innerJoin(
                    schema.event,
                    eq(schema.registration.eventId, schema.event.id),
                )
                .innerJoin(
                    schema.teamMember,
                    eq(schema.registration.teamId, schema.teamMember.teamId),
                )
                .where(
                    and(
                        eq(schema.teamMember.userId, userId),
                        gte(schema.event.startDate, now),
                    ),
                );

            const uniqueUpcomingIds = new Set(
                upcomingRegistrations.map((r) => r.eventId),
            );
            const upcomingEvents = uniqueUpcomingIds.size;

            return NextResponse.json({
                success: true,
                data: {
                    registeredEvents,
                    attendedEvents,
                    upcomingEvents,
                },
                message: "User stats fetched successfully",
            });
        }

        // Manager Stats
        if (role === "manager") {
            const managerId = user.id;

            // Count active events (published status)
            const [activeEventsResult] = await db
                .select({ count: count() })
                .from(schema.event)
                .where(
                    and(
                        eq(schema.event.managerId, managerId),
                        eq(schema.event.status, "published"),
                    ),
                );

            const activeEvents = activeEventsResult.count || 0;

            // Count total registrations for manager's events
            const [registrationsResult] = await db
                .select({ count: count() })
                .from(schema.registration)
                .innerJoin(
                    schema.event,
                    eq(schema.registration.eventId, schema.event.id),
                )
                .where(eq(schema.event.managerId, managerId));

            const totalRegistrations = registrationsResult.count || 0;

            // Count check-ins for manager's events
            const [checkInsResult] = await db
                .select({ count: count() })
                .from(schema.registration)
                .innerJoin(
                    schema.event,
                    eq(schema.registration.eventId, schema.event.id),
                )
                .where(
                    and(
                        eq(schema.event.managerId, managerId),
                        sql`${schema.registration.checkedInAt} IS NOT NULL`,
                    ),
                );

            const totalCheckIns = checkInsResult.count || 0;

            // Calculate average capacity (events with max capacity set)
            const capacityEvents = await db
                .select({
                    maxCapacity: schema.event.maxCapacity,
                    registrations: count(schema.registration.id),
                })
                .from(schema.event)
                .leftJoin(
                    schema.registration,
                    eq(schema.event.id, schema.registration.eventId),
                )
                .where(
                    and(
                        eq(schema.event.managerId, managerId),
                        sql`${schema.event.maxCapacity} IS NOT NULL`,
                        sql`${schema.event.maxCapacity} > 0`,
                    ),
                )
                .groupBy(schema.event.id, schema.event.maxCapacity);

            let avgCapacity = 0;
            if (capacityEvents.length > 0) {
                const totalFillRate = capacityEvents.reduce((sum, event) => {
                    const fillRate = event.maxCapacity
                        ? (event.registrations / event.maxCapacity) * 100
                        : 0;
                    return sum + fillRate;
                }, 0);
                avgCapacity = Math.round(totalFillRate / capacityEvents.length);
            }

            return NextResponse.json({
                success: true,
                data: {
                    activeEvents,
                    totalRegistrations,
                    totalCheckIns,
                    avgCapacity,
                },
                message: "Manager stats fetched successfully",
            });
        }

        // Admin Stats
        if (role === "admin") {
            // Count total users
            const [usersResult] = await db
                .select({ count: count() })
                .from(schema.user);

            const totalUsers = usersResult.count || 0;

            // Count total events
            const [eventsResult] = await db
                .select({ count: count() })
                .from(schema.event);

            const totalEvents = eventsResult.count || 0;

            // Count pending manager applications
            const [pendingAppsResult] = await db
                .select({ count: count() })
                .from(schema.managerApplications)
                .where(eq(schema.managerApplications.status, "pending"));

            const pendingApplications = pendingAppsResult.count || 0;

            // Count users by role
            const [regularUsersResult] = await db
                .select({ count: count() })
                .from(schema.user)
                .where(eq(schema.user.role, "user"));

            const regularUsers = regularUsersResult.count || 0;

            const [managersResult] = await db
                .select({ count: count() })
                .from(schema.user)
                .where(eq(schema.user.role, "manager"));

            const managers = managersResult.count || 0;

            const [adminsResult] = await db
                .select({ count: count() })
                .from(schema.user)
                .where(eq(schema.user.role, "admin"));

            const admins = adminsResult.count || 0;

            // Count active events (published)
            const [activeEventsResult] = await db
                .select({ count: count() })
                .from(schema.event)
                .where(eq(schema.event.status, "published"));

            const activeEvents = activeEventsResult.count || 0;

            return NextResponse.json({
                success: true,
                data: {
                    totalUsers,
                    totalEvents,
                    pendingApplications,
                    regularUsers,
                    managers,
                    admins,
                    activeEvents,
                    systemHealth: 99.9, // This could be calculated from actual metrics
                },
                message: "Admin stats fetched successfully",
            });
        }

        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Invalid role",
            },
            { status: 400 },
        );
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Failed to fetch stats",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
        );
    }
}

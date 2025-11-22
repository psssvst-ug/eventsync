import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { desc, asc, eq, and, or, gte, like, sql } from "drizzle-orm";

/**
 * GET /api/events/list
 * Fetches a list of events with optional pagination and filtering
 *
 * Query Parameters:
 * - page: number (default: 1) - Page number for pagination
 * - limit: number (default: 10, max: 100) - Number of events per page
 * - status: string (optional) - Filter by event status (draft, published, cancelled)
 * - search: string (optional) - Search in title and description
 * - sortBy: string (default: "createdAt") - Sort field (createdAt, startDate, title)
 * - sortOrder: string (default: "desc") - Sort order (asc, desc)
 * - upcoming: boolean (optional) - Filter only upcoming events
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "events": [...],
 *     "pagination": {
 *       "page": number,
 *       "limit": number,
 *       "total": number,
 *       "totalPages": number,
 *       "hasMore": boolean
 *     }
 *   },
 *   "message": "string"
 * }
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse pagination parameters
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(
            100,
            Math.max(1, parseInt(searchParams.get("limit") || "10")),
        );
        const offset = (page - 1) * limit;

        // Parse filter parameters
        const statusFilter = searchParams.get("status");
        const searchQuery = searchParams.get("search");
        const upcomingOnly = searchParams.get("upcoming") === "true";

        // Parse sort parameters
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        // Build where conditions
        const conditions = [];

        // Status filter
        if (statusFilter) {
            conditions.push(eq(schema.event.status, statusFilter));
        }

        // Search filter (title or description)
        if (searchQuery && searchQuery.trim() !== "") {
            conditions.push(
                or(
                    like(schema.event.title, `%${searchQuery}%`),
                    like(schema.event.description, `%${searchQuery}%`),
                ),
            );
        }

        // Upcoming events filter
        if (upcomingOnly) {
            const now = new Date().toISOString();
            conditions.push(gte(schema.event.startDate, now));
        }

        // Determine sort column
        let sortColumn;
        switch (sortBy) {
            case "startDate":
                sortColumn = schema.event.startDate;
                break;
            case "title":
                sortColumn = schema.event.title;
                break;
            case "endDate":
                sortColumn = schema.event.endDate;
                break;
            case "createdAt":
            default:
                sortColumn = schema.event.createdAt;
                break;
        }

        // Determine sort direction
        const sortFn = sortOrder === "asc" ? asc : desc;

        // Build the where clause
        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined;

        // Fetch events with pagination
        const events = await db
            .select({
                id: schema.event.id,
                title: schema.event.title,
                description: schema.event.description,
                imageUrl: schema.event.imageUrl,
                startDate: schema.event.startDate,
                endDate: schema.event.endDate,
                location: schema.event.location,
                maxCapacity: schema.event.maxCapacity,
                registrationDeadline: schema.event.registrationDeadline,
                status: schema.event.status,
                managerId: schema.event.managerId,
                teamId: schema.event.teamId,
                page: schema.event.page,
                createdAt: schema.event.createdAt,
                updatedAt: schema.event.updatedAt,
            })
            .from(schema.event)
            .where(whereClause)
            .orderBy(sortFn(sortColumn))
            .limit(limit)
            .offset(offset);

        // Get total count for pagination
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(schema.event)
            .where(whereClause);

        const totalCount = Number(count);
        const totalPages = Math.ceil(totalCount / limit);
        const hasMore = page < totalPages;

        // Return response
        return NextResponse.json(
            {
                success: true,
                data: {
                    events: events,
                    pagination: {
                        page: page,
                        limit: limit,
                        total: totalCount,
                        totalPages: totalPages,
                        hasMore: hasMore,
                    },
                },
                message: "Events fetched successfully",
            },
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "public, max-age=60, s-maxage=60",
                },
            },
        );
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Failed to fetch events",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, gte, lte } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        // Get the session from the auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized. Please sign in." },
                { status: 401 },
            );
        }

        const userId = session.user.id;
        const userRole = session.user.role;

        // Parse the request body
        const body = await request.json();
        const {
            title,
            description,
            imageUrl,
            maxCapacity,
            startDate,
            endDate,
            location,
            registrationDeadline,
            registrationFee = 0,
            currency = "USD",
            status = "draft",
            page,
            organizationId,
        } = body;

        // Validate required fields
        if (
            !title ||
            !description ||
            !startDate ||
            !endDate ||
            !location ||
            !registrationDeadline ||
            !organizationId
        ) {
            return NextResponse.json(
                { error: "Missing required fields. Organization ID is required." },
                { status: 400 },
            );
        }

        // Verify user is a member of the organization with manager or admin role
        if (userRole !== "admin") {
            const [membership] = await db
                .select()
                .from(schema.organizationMember)
                .where(
                    and(
                        eq(schema.organizationMember.organizationId, organizationId),
                        eq(schema.organizationMember.userId, userId),
                        eq(schema.organizationMember.status, "active")
                    )
                )
                .limit(1);

            if (!membership) {
                return NextResponse.json(
                    { error: "You are not a member of this organization" },
                    { status: 403 },
                );
            }

            if (membership.role !== "admin" && membership.role !== "manager") {
                return NextResponse.json(
                    { error: "Only organization admins and managers can create events" },
                    { status: 403 },
                );
            }
        }

        // Check organization limits based on pricing plan
        const [organization] = await db
            .select({
                id: schema.organization.id,
                subscriptionStatus: schema.organization.subscriptionStatus,
                pricingPlan: {
                    id: schema.pricingPlan.id,
                    maxEvents: schema.pricingPlan.maxEvents,
                    maxAttendeesPerEvent: schema.pricingPlan.maxAttendeesPerEvent,
                },
            })
            .from(schema.organization)
            .leftJoin(
                schema.pricingPlan,
                eq(schema.organization.pricingPlanId, schema.pricingPlan.id)
            )
            .where(eq(schema.organization.id, organizationId))
            .limit(1);

        if (!organization) {
            return NextResponse.json(
                { error: "Organization not found" },
                { status: 404 },
            );
        }

        // Check if organization subscription is active
        if (
            organization.subscriptionStatus !== "active" &&
            organization.subscriptionStatus !== "trial"
        ) {
            return NextResponse.json(
                {
                    error: "Organization subscription is not active. Please renew your subscription.",
                },
                { status: 403 },
            );
        }

        // Check event limits for this month
        if (organization.pricingPlan && organization.pricingPlan.maxEvents > 0) {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const eventsThisMonth = await db
                .select()
                .from(schema.event)
                .where(
                    and(
                        eq(schema.event.organizationId, organizationId),
                        gte(schema.event.createdAt, firstDayOfMonth.toISOString()),
                        lte(schema.event.createdAt, lastDayOfMonth.toISOString())
                    )
                );

            if (eventsThisMonth.length >= organization.pricingPlan.maxEvents) {
                return NextResponse.json(
                    {
                        error: `Organization has reached the maximum number of events (${organization.pricingPlan.maxEvents}) for the current plan this month`,
                    },
                    { status: 403 },
                );
            }
        }

        // Check attendee limits
        if (
            organization.pricingPlan &&
            organization.pricingPlan.maxAttendeesPerEvent > 0 &&
            maxCapacity &&
            parseInt(maxCapacity) > organization.pricingPlan.maxAttendeesPerEvent
        ) {
            return NextResponse.json(
                {
                    error: `Event capacity (${maxCapacity}) exceeds the plan limit (${organization.pricingPlan.maxAttendeesPerEvent})`,
                },
                { status: 403 },
            );
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        const deadline = new Date(registrationDeadline);

        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime()) ||
            isNaN(deadline.getTime())
        ) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 },
            );
        }

        if (end <= start) {
            return NextResponse.json(
                { error: "End date must be after start date" },
                { status: 400 },
            );
        }

        if (deadline >= start) {
            return NextResponse.json(
                {
                    error: "Registration deadline must be before event start date",
                },
                { status: 400 },
            );
        }

        // Insert event into database
        const [newEvent] = await db
            .insert(schema.event)
            .values({
                title: title.trim(),
                description: description.trim(),
                imageUrl: imageUrl || null,
                maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                location: location.trim(),
                registrationDeadline: deadline.toISOString(),
                registrationFee: registrationFee.toString(),
                currency: currency || "USD",
                status: status || "draft",
                managerId: userId,
                organizationId: organizationId,
                teamId: null, // Can be added later if needed
                page: page || null,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                event: newEvent,
                message: "Event created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json(
            {
                error: "Failed to create event",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

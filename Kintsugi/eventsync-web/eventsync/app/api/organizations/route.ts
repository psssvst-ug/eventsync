import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, and, or } from "drizzle-orm";

// GET /api/organizations - List organizations for the current user
export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized", error: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const user = session.user;

        // Get organizations where user is a member
        const organizations = await db
            .select({
                id: schema.organization.id,
                name: schema.organization.name,
                description: schema.organization.description,
                type: schema.organization.type,
                website: schema.organization.website,
                logo: schema.organization.logo,
                contactEmail: schema.organization.contactEmail,
                contactPhone: schema.organization.contactPhone,
                subscriptionStatus: schema.organization.subscriptionStatus,
                isActive: schema.organization.isActive,
                createdAt: schema.organization.createdAt,
                updatedAt: schema.organization.updatedAt,
                memberRole: schema.organizationMember.role,
                memberStatus: schema.organizationMember.status,
                pricingPlan: {
                    id: schema.pricingPlan.id,
                    name: schema.pricingPlan.name,
                    displayName: schema.pricingPlan.displayName,
                },
            })
            .from(schema.organizationMember)
            .innerJoin(
                schema.organization,
                eq(schema.organizationMember.organizationId, schema.organization.id)
            )
            .leftJoin(
                schema.pricingPlan,
                eq(schema.organization.pricingPlanId, schema.pricingPlan.id)
            )
            .where(eq(schema.organizationMember.userId, user.id));

        return NextResponse.json({
            success: true,
            data: organizations,
            message: "Organizations fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch organizations",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

// POST /api/organizations - Create a new organization
export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized", error: "UNAUTHORIZED" },
                { status: 401 }
            );
        }

        const user = session.user;

        // Check if user is a manager or admin
        if (user.role !== "manager" && user.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only managers and admins can create organizations",
                    error: "FORBIDDEN",
                },
                { status: 403 }
            );
        }

        const body = await req.json();
        const {
            name,
            description,
            type,
            website,
            contactEmail,
            contactPhone,
            address,
            pricingPlanId,
        } = body;

        // Validate required fields
        if (!name || !type || !contactEmail) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Name, type, and contact email are required",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        // If no pricing plan is specified, get the free plan
        let planId = pricingPlanId;
        if (!planId) {
            const freePlan = await db
                .select()
                .from(schema.pricingPlan)
                .where(eq(schema.pricingPlan.name, "free"))
                .limit(1);

            if (freePlan.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "No pricing plans available. Please contact administrator.",
                        error: "NO_PRICING_PLANS",
                    },
                    { status: 500 }
                );
            }
            planId = freePlan[0].id;
        }

        // Calculate trial end date (14 days from now)
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        // Create organization
        const [organization] = await db
            .insert(schema.organization)
            .values({
                name,
                description,
                type,
                website,
                contactEmail,
                contactPhone,
                address,
                pricingPlanId: planId,
                subscriptionStatus: "trial",
                trialEndsAt: trialEndsAt.toISOString(),
            })
            .returning();

        // Add creator as admin member
        await db.insert(schema.organizationMember).values({
            organizationId: organization.id,
            userId: user.id,
            role: "admin",
            status: "active",
        });

        return NextResponse.json(
            {
                success: true,
                data: organization,
                message: "Organization created successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating organization:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create organization",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

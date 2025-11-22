import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";

// GET /api/organizations/[id] - Get organization details
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Get organization with pricing plan and member details
        const [organization] = await db
            .select({
                id: schema.organization.id,
                name: schema.organization.name,
                description: schema.organization.description,
                type: schema.organization.type,
                website: schema.organization.website,
                logo: schema.organization.logo,
                contactEmail: schema.organization.contactEmail,
                contactPhone: schema.organization.contactPhone,
                address: schema.organization.address,
                subscriptionStatus: schema.organization.subscriptionStatus,
                subscriptionStartDate: schema.organization.subscriptionStartDate,
                subscriptionEndDate: schema.organization.subscriptionEndDate,
                trialEndsAt: schema.organization.trialEndsAt,
                isActive: schema.organization.isActive,
                createdAt: schema.organization.createdAt,
                updatedAt: schema.organization.updatedAt,
                pricingPlan: {
                    id: schema.pricingPlan.id,
                    name: schema.pricingPlan.name,
                    displayName: schema.pricingPlan.displayName,
                    description: schema.pricingPlan.description,
                    price: schema.pricingPlan.price,
                    currency: schema.pricingPlan.currency,
                    maxEvents: schema.pricingPlan.maxEvents,
                    maxEventManagers: schema.pricingPlan.maxEventManagers,
                    maxAttendeesPerEvent: schema.pricingPlan.maxAttendeesPerEvent,
                    features: schema.pricingPlan.features,
                },
            })
            .from(schema.organization)
            .leftJoin(
                schema.pricingPlan,
                eq(schema.organization.pricingPlanId, schema.pricingPlan.id)
            )
            .where(eq(schema.organization.id, id))
            .limit(1);

        if (!organization) {
            return NextResponse.json(
                { success: false, message: "Organization not found", error: "NOT_FOUND" },
                { status: 404 }
            );
        }

        // Check if user is a member (unless admin)
        if (user.role !== "admin") {
            const [membership] = await db
                .select()
                .from(schema.organizationMember)
                .where(
                    and(
                        eq(schema.organizationMember.organizationId, id),
                        eq(schema.organizationMember.userId, user.id)
                    )
                )
                .limit(1);

            if (!membership) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "You are not a member of this organization",
                        error: "FORBIDDEN",
                    },
                    { status: 403 }
                );
            }
        }

        // Get members
        const members = await db
            .select({
                id: schema.organizationMember.id,
                userId: schema.organizationMember.userId,
                role: schema.organizationMember.role,
                status: schema.organizationMember.status,
                joinedAt: schema.organizationMember.joinedAt,
                user: {
                    id: schema.user.id,
                    name: schema.user.name,
                    email: schema.user.email,
                    image: schema.user.image,
                },
            })
            .from(schema.organizationMember)
            .innerJoin(
                schema.user,
                eq(schema.organizationMember.userId, schema.user.id)
            )
            .where(eq(schema.organizationMember.organizationId, id));

        return NextResponse.json({
            success: true,
            data: {
                ...organization,
                members,
            },
            message: "Organization fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching organization:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch organization",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

// PATCH /api/organizations/[id] - Update organization
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Check if user is an admin of the organization (or system admin)
        if (user.role !== "admin") {
            const [membership] = await db
                .select()
                .from(schema.organizationMember)
                .where(
                    and(
                        eq(schema.organizationMember.organizationId, id),
                        eq(schema.organizationMember.userId, user.id),
                        eq(schema.organizationMember.role, "admin")
                    )
                )
                .limit(1);

            if (!membership) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Only organization admins can update the organization",
                        error: "FORBIDDEN",
                    },
                    { status: 403 }
                );
            }
        }

        const body = await req.json();
        const {
            name,
            description,
            type,
            website,
            logo,
            contactEmail,
            contactPhone,
            address,
        } = body;

        // Build update object
        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (website !== undefined) updateData.website = website;
        if (logo !== undefined) updateData.logo = logo;
        if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
        if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
        if (address !== undefined) updateData.address = address;

        const [updatedOrg] = await db
            .update(schema.organization)
            .set(updateData)
            .where(eq(schema.organization.id, id))
            .returning();

        if (!updatedOrg) {
            return NextResponse.json(
                { success: false, message: "Organization not found", error: "NOT_FOUND" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedOrg,
            message: "Organization updated successfully",
        });
    } catch (error) {
        console.error("Error updating organization:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update organization",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Only system admins or organization admins can delete
        if (user.role !== "admin") {
            const [membership] = await db
                .select()
                .from(schema.organizationMember)
                .where(
                    and(
                        eq(schema.organizationMember.organizationId, id),
                        eq(schema.organizationMember.userId, user.id),
                        eq(schema.organizationMember.role, "admin")
                    )
                )
                .limit(1);

            if (!membership) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Only organization admins can delete the organization",
                        error: "FORBIDDEN",
                    },
                    { status: 403 }
                );
            }
        }

        // Delete organization (cascade will handle related records)
        await db.delete(schema.organization).where(eq(schema.organization.id, id));

        return NextResponse.json({
            success: true,
            message: "Organization deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting organization:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete organization",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

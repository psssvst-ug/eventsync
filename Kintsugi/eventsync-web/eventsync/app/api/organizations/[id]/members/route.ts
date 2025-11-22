import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";

// POST /api/organizations/[id]/members - Add member to organization
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: organizationId } = await params;
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

        // Check if user is an admin of the organization
        const [membership] = await db
            .select()
            .from(schema.organizationMember)
            .where(
                and(
                    eq(schema.organizationMember.organizationId, organizationId),
                    eq(schema.organizationMember.userId, user.id),
                    eq(schema.organizationMember.role, "admin")
                )
            )
            .limit(1);

        if (!membership && user.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only organization admins can add members",
                    error: "FORBIDDEN",
                },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { userId: targetUserId, role } = body;

        if (!targetUserId || !role) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User ID and role are required",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        if (role !== "admin" && role !== "manager") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Role must be 'admin' or 'manager'",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        // Check if user exists
        const [targetUser] = await db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, targetUserId))
            .limit(1);

        if (!targetUser) {
            return NextResponse.json(
                { success: false, message: "User not found", error: "NOT_FOUND" },
                { status: 404 }
            );
        }

        // Check if user is already a member
        const [existingMember] = await db
            .select()
            .from(schema.organizationMember)
            .where(
                and(
                    eq(schema.organizationMember.organizationId, organizationId),
                    eq(schema.organizationMember.userId, targetUserId)
                )
            )
            .limit(1);

        if (existingMember) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User is already a member of this organization",
                    error: "ALREADY_MEMBER",
                },
                { status: 400 }
            );
        }

        // Check if adding this member would exceed the plan limit
        const [organization] = await db
            .select({
                pricingPlanId: schema.organization.pricingPlanId,
            })
            .from(schema.organization)
            .where(eq(schema.organization.id, organizationId))
            .limit(1);

        if (organization) {
            const [plan] = await db
                .select()
                .from(schema.pricingPlan)
                .where(eq(schema.pricingPlan.id, organization.pricingPlanId))
                .limit(1);

            if (plan && plan.maxEventManagers > 0) {
                const managers = await db
                    .select()
                    .from(schema.organizationMember)
                    .where(
                        and(
                            eq(schema.organizationMember.organizationId, organizationId),
                            eq(schema.organizationMember.role, "manager")
                        )
                    );

                if (role === "manager" && managers.length >= plan.maxEventManagers) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: `Organization has reached the maximum number of event managers (${plan.maxEventManagers}) for the current plan`,
                            error: "PLAN_LIMIT_REACHED",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // Add member
        const [newMember] = await db
            .insert(schema.organizationMember)
            .values({
                organizationId,
                userId: targetUserId,
                role,
                status: "active",
                invitedBy: user.id,
            })
            .returning();

        return NextResponse.json(
            {
                success: true,
                data: newMember,
                message: "Member added successfully",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding member:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to add member",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/organizations/[id]/members?userId=xxx - Remove member from organization
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: organizationId } = await params;
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
        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("userId");

        if (!targetUserId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User ID is required",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        // Check if current user is an admin of the organization
        const [membership] = await db
            .select()
            .from(schema.organizationMember)
            .where(
                and(
                    eq(schema.organizationMember.organizationId, organizationId),
                    eq(schema.organizationMember.userId, user.id),
                    eq(schema.organizationMember.role, "admin")
                )
            )
            .limit(1);

        if (!membership && user.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only organization admins can remove members",
                    error: "FORBIDDEN",
                },
                { status: 403 }
            );
        }

        // Prevent removing the last admin
        if (targetUserId !== user.id) {
            const [targetMember] = await db
                .select()
                .from(schema.organizationMember)
                .where(
                    and(
                        eq(schema.organizationMember.organizationId, organizationId),
                        eq(schema.organizationMember.userId, targetUserId)
                    )
                )
                .limit(1);

            if (targetMember && targetMember.role === "admin") {
                const admins = await db
                    .select()
                    .from(schema.organizationMember)
                    .where(
                        and(
                            eq(schema.organizationMember.organizationId, organizationId),
                            eq(schema.organizationMember.role, "admin")
                        )
                    );

                if (admins.length <= 1) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Cannot remove the last admin of the organization",
                            error: "LAST_ADMIN",
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // Remove member
        await db
            .delete(schema.organizationMember)
            .where(
                and(
                    eq(schema.organizationMember.organizationId, organizationId),
                    eq(schema.organizationMember.userId, targetUserId)
                )
            );

        return NextResponse.json({
            success: true,
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error("Error removing member:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to remove member",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

// PATCH /api/organizations/[id]/members - Update member role
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: organizationId } = await params;
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
        const body = await req.json();
        const { userId: targetUserId, role } = body;

        if (!targetUserId || !role) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User ID and role are required",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        if (role !== "admin" && role !== "manager") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Role must be 'admin' or 'manager'",
                    error: "VALIDATION_ERROR",
                },
                { status: 400 }
            );
        }

        // Check if current user is an admin
        const [membership] = await db
            .select()
            .from(schema.organizationMember)
            .where(
                and(
                    eq(schema.organizationMember.organizationId, organizationId),
                    eq(schema.organizationMember.userId, user.id),
                    eq(schema.organizationMember.role, "admin")
                )
            )
            .limit(1);

        if (!membership && user.role !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only organization admins can update member roles",
                    error: "FORBIDDEN",
                },
                { status: 403 }
            );
        }

        // Get target member
        const [targetMember] = await db
            .select()
            .from(schema.organizationMember)
            .where(
                and(
                    eq(schema.organizationMember.organizationId, organizationId),
                    eq(schema.organizationMember.userId, targetUserId)
                )
            )
            .limit(1);

        if (!targetMember) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Member not found",
                    error: "NOT_FOUND",
                },
                { status: 404 }
            );
        }

        // Prevent demoting the last admin
        if (targetMember.role === "admin" && role !== "admin") {
            const admins = await db
                .select()
                .from(schema.organizationMember)
                .where(
                    and(
                        eq(schema.organizationMember.organizationId, organizationId),
                        eq(schema.organizationMember.role, "admin")
                    )
                );

            if (admins.length <= 1) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Cannot demote the last admin of the organization",
                        error: "LAST_ADMIN",
                    },
                    { status: 400 }
                );
            }
        }

        // Update member role
        const [updatedMember] = await db
            .update(schema.organizationMember)
            .set({ role, updatedAt: new Date().toISOString() })
            .where(eq(schema.organizationMember.id, targetMember.id))
            .returning();

        return NextResponse.json({
            success: true,
            data: updatedMember,
            message: "Member role updated successfully",
        });
    } catch (error) {
        console.error("Error updating member role:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update member role",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

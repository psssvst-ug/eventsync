import { db, schema } from "@/db";
import { eq, and } from "drizzle-orm";

export interface OrganizationPermissionCheck {
    isMember: boolean;
    isAdmin: boolean;
    isManager: boolean;
    membership?: any;
}

/**
 * Check if a user has permissions in an organization
 */
export async function checkOrganizationPermission(
    userId: string,
    organizationId: string,
    userRole?: string
): Promise<OrganizationPermissionCheck> {
    // System admins have access to everything
    if (userRole === "admin") {
        return {
            isMember: true,
            isAdmin: true,
            isManager: true,
        };
    }

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
        return {
            isMember: false,
            isAdmin: false,
            isManager: false,
        };
    }

    return {
        isMember: true,
        isAdmin: membership.role === "admin",
        isManager: membership.role === "manager" || membership.role === "admin",
        membership,
    };
}

/**
 * Check if a user can manage an event (is event manager or organization admin/manager)
 */
export async function canManageEvent(
    userId: string,
    eventId: string,
    userRole?: string
): Promise<boolean> {
    // System admins can manage everything
    if (userRole === "admin") {
        return true;
    }

    const [event] = await db
        .select()
        .from(schema.event)
        .where(eq(schema.event.id, eventId))
        .limit(1);

    if (!event) {
        return false;
    }

    // Event creator can manage
    if (event.managerId === userId) {
        return true;
    }

    // Check organization permissions if event has an organization
    if (!event.organizationId) {
        // Event without organization can only be managed by creator or system admin
        return false;
    }

    const permissions = await checkOrganizationPermission(
        userId,
        event.organizationId
    );

    return permissions.isAdmin || permissions.isManager;
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(userId: string) {
    return await db
        .select({
            id: schema.organization.id,
            name: schema.organization.name,
            role: schema.organizationMember.role,
            status: schema.organizationMember.status,
        })
        .from(schema.organizationMember)
        .innerJoin(
            schema.organization,
            eq(schema.organizationMember.organizationId, schema.organization.id)
        )
        .where(eq(schema.organizationMember.userId, userId));
}

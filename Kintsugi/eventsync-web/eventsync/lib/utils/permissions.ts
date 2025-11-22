// User permission utility functions

export type UserRole = "user" | "manager" | "admin";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  name: string;
}

export interface Event {
  id: string;
  managerId: string;
  teamId?: string;
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === "admin";
}

/**
 * Check if user is a manager or admin
 */
export function isManagerOrAbove(user: User | null | undefined): boolean {
  return user?.role === "manager" || user?.role === "admin";
}

/**
 * Check if user can edit an event
 * User can edit if they are:
 * - Admin
 * - Manager
 * - Event manager (creator)
 */
export function canEditEvent(
  user: User | null | undefined,
  event: Event | null | undefined
): boolean {
  if (!user || !event) return false;

  if (isAdmin(user)) return true;
  if (isManagerOrAbove(user) && user.id === event.managerId) return true;

  return false;
}

/**
 * Check if user can customize event page
 * Same as canEditEvent - managers and above can customize pages
 */
export function canCustomizeEventPage(
  user: User | null | undefined,
  event: Event | null | undefined
): boolean {
  return canEditEvent(user, event);
}

/**
 * Check if user can delete an event
 * Only admins and the event manager can delete
 */
export function canDeleteEvent(
  user: User | null | undefined,
  event: Event | null | undefined
): boolean {
  if (!user || !event) return false;

  if (isAdmin(user)) return true;
  if (user.id === event.managerId) return true;

  return false;
}

/**
 * Check if user can manage registrations
 * Admins, managers, and event managers can manage registrations
 */
export function canManageRegistrations(
  user: User | null | undefined,
  event: Event | null | undefined
): boolean {
  return canEditEvent(user, event);
}

/**
 * Check if user can create events
 * Managers and admins can create events
 */
export function canCreateEvent(user: User | null | undefined): boolean {
  return isManagerOrAbove(user);
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    user: "User",
    manager: "Manager",
    admin: "Administrator",
  };

  return roleNames[role] || "User";
}

/**
 * Check if user has minimum required role
 */
export function hasMinimumRole(
  user: User | null | undefined,
  requiredRole: UserRole
): boolean {
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    manager: 2,
    admin: 3,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

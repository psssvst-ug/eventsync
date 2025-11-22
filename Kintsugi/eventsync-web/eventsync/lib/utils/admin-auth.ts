import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { SessionValidationResult, AdminSessionData } from "@/lib/types/auth";

interface ExtendedNextRequest extends NextRequest {
    adminSession?: AdminSessionData;
}

/**
 * Validates if the current session belongs to an admin user
 * @param request - The NextRequest object containing headers
 * @returns SessionValidationResult with validation details
 */
export async function validateAdminSession(
    request: NextRequest,
): Promise<SessionValidationResult> {
    try {
        // Get the session from Better Auth
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // Check if session exists
        if (!session) {
            return {
                isValid: false,
                isAdmin: false,
                error: "No active session found",
            };
        }

        // Check if user has admin role
        if (session.user.role !== "admin") {
            return {
                isValid: true,
                isAdmin: false,
                error: "Access denied. Admin role required.",
            };
        }

        // Return successful validation with session data
        return {
            isValid: true,
            isAdmin: true,
            session: {
                id: session.session.id,
                userId: session.session.userId,
                user: {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    role: session.user.role,
                    createdAt: session.user.createdAt,
                    updatedAt: session.user.updatedAt,
                },
                expiresAt: session.session.expiresAt,
                createdAt: session.session.createdAt,
                updatedAt: session.session.updatedAt,
            },
        };
    } catch (error) {
        console.error("Error validating admin session:", error);
        return {
            isValid: false,
            isAdmin: false,
            error: "Internal server error during session validation",
        };
    }
}

/**
 * Middleware-like function to check admin role from headers
 * @param headers - Request headers (can be from NextRequest.headers or Headers)
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdminUser(headers: Headers): Promise<boolean> {
    try {
        const session = await auth.api.getSession({ headers });
        return session?.user?.role === "admin";
    } catch (error) {
        console.error("Error checking admin user:", error);
        return false;
    }
}

/**
 * Get the current user's role from session
 * @param headers - Request headers
 * @returns Promise<string | null> - user role or null if no session
 */
export async function getUserRole(headers: Headers): Promise<string | null> {
    try {
        const session = await auth.api.getSession({ headers });
        return session?.user?.role || null;
    } catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
}

/**
 * Higher-order function to create admin-protected API handlers
 * @param handler - The actual API handler function
 * @returns Protected handler that validates admin role first
 */
export function withAdminAuth<T extends unknown[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>,
) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
        const validation = await validateAdminSession(request);

        if (!validation.isValid) {
            return new Response(JSON.stringify({ error: validation.error }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!validation.isAdmin) {
            return new Response(JSON.stringify({ error: validation.error }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Add session to request for use in handler
        (request as ExtendedNextRequest).adminSession = validation.session;

        return handler(request, ...args);
    };
}

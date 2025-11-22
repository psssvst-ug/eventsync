import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/user
 * Fetches the current authenticated user's data including role
 *
 * Response format:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "string",
 *     "name": "string",
 *     "email": "string",
 *     "role": "string",
 *     "emailVerified": boolean,
 *     "image": "string | null",
 *     "createdAt": "string",
 *     "updatedAt": "string",
 *     "banned": boolean,
 *     "banReason": "string | null",
 *     "banExpires": "string | null"
 *   },
 *   "message": "string"
 * }
 */
export async function GET() {
    try {
        // Get the session from auth
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Check if user is authenticated
        if (!session || !session.user) {
            return NextResponse.json(
                {
                    success: false,
                    data: null,
                    message: "Unauthorized. Please sign in.",
                    error: "UNAUTHORIZED",
                },
                { status: 401 },
            );
        }

        // Extract user data
        const userData = {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: session.user.role || "user",
            emailVerified: session.user.emailVerified || false,
            image: session.user.image || null,
            createdAt: session.user.createdAt || new Date().toISOString(),
            updatedAt: session.user.updatedAt || new Date().toISOString(),
            banned: session.user.banned || false,
            banReason: session.user.banReason || null,
            banExpires: session.user.banExpires || null,
        };

        // Return user data
        return NextResponse.json(
            {
                success: true,
                data: userData,
                message: "User data fetched successfully",
            },
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store, max-age=0",
                },
            },
        );
    } catch (error) {
        console.error("Error fetching user data:", error);
        return NextResponse.json(
            {
                success: false,
                data: null,
                message: "Failed to fetch user data",
                error:
                    error instanceof Error
                        ? error.message
                        : "INTERNAL_SERVER_ERROR",
            },
            { status: 500 },
        );
    }
}

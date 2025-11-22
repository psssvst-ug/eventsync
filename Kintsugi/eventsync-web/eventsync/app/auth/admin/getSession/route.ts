import { NextRequest, NextResponse } from "next/server";
import {
    AdminSessionResponse,
    AdminSessionErrorResponse,
} from "@/lib/types/auth";
import { validateAdminSession } from "@/lib/utils/admin-auth";

export async function GET(request: NextRequest) {
    try {
        // Validate admin session using utility function
        const validation = await validateAdminSession(request);

        // Check if session is valid
        if (!validation.isValid) {
            const errorResponse: AdminSessionErrorResponse = {
                error: validation.error || "Invalid session",
            };
            return NextResponse.json(errorResponse, { status: 401 });
        }

        // Check if user has admin role
        if (!validation.isAdmin) {
            const errorResponse: AdminSessionErrorResponse = {
                error:
                    validation.error || "Access denied. Admin role required.",
            };
            return NextResponse.json(errorResponse, { status: 403 });
        }

        // Return the session data for admin users
        const response: AdminSessionResponse = {
            success: true,
            session: validation.session!,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in admin getSession:", error);
        const errorResponse: AdminSessionErrorResponse = {
            error: "Internal server error",
        };
        return NextResponse.json(errorResponse, { status: 500 });
    }
}

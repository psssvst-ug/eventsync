import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";

// GET /api/pricing - Get all active pricing plans
export async function GET(req: NextRequest) {
    try {
        const plans = await db
            .select()
            .from(schema.pricingPlan)
            .where(eq(schema.pricingPlan.isActive, true))
            .orderBy(asc(schema.pricingPlan.sortOrder), asc(schema.pricingPlan.price));

        return NextResponse.json({
            success: true,
            data: plans,
            message: "Pricing plans fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching pricing plans:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch pricing plans",
                error: "INTERNAL_SERVER_ERROR",
            },
            { status: 500 }
        );
    }
}

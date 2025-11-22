import "dotenv/config";
import { db, schema } from "../db";

async function seedPricingPlans() {
    console.log("Seeding pricing plans...");

    const plans = [
        {
            name: "free",
            displayName: "Free",
            description: "Perfect for getting started",
            price: "0",
            currency: "USD",
            maxEvents: 1,
            maxEventManagers: 1,
            maxAttendeesPerEvent: 50,
            features: [
                "1 event per month",
                "1 event manager",
                "Up to 50 attendees per event",
                "Basic QR code check-in",
                "Email support",
            ],
            isActive: true,
            sortOrder: 0,
        },
        {
            name: "starter",
            displayName: "Starter",
            description: "For small organizations",
            price: "29",
            currency: "USD",
            maxEvents: 5,
            maxEventManagers: 3,
            maxAttendeesPerEvent: 200,
            features: [
                "5 events per month",
                "3 event managers",
                "Up to 200 attendees per event",
                "Advanced QR code features",
                "Team management",
                "Custom event pages",
                "Email & chat support",
            ],
            isActive: true,
            sortOrder: 1,
        },
        {
            name: "professional",
            displayName: "Professional",
            description: "For growing organizations",
            price: "99",
            currency: "USD",
            maxEvents: 20,
            maxEventManagers: 10,
            maxAttendeesPerEvent: 1000,
            features: [
                "20 events per month",
                "10 event managers",
                "Up to 1000 attendees per event",
                "All Starter features",
                "Analytics & reporting",
                "Custom branding",
                "API access",
                "Priority support",
            ],
            isActive: true,
            sortOrder: 2,
        },
        {
            name: "enterprise",
            displayName: "Enterprise",
            description: "For large organizations",
            price: "299",
            currency: "USD",
            maxEvents: -1, // Unlimited
            maxEventManagers: -1, // Unlimited
            maxAttendeesPerEvent: -1, // Unlimited
            features: [
                "Unlimited events",
                "Unlimited event managers",
                "Unlimited attendees",
                "All Professional features",
                "Dedicated account manager",
                "Custom integrations",
                "SLA guarantee",
                "24/7 phone support",
                "On-premise deployment option",
            ],
            isActive: true,
            sortOrder: 3,
        },
    ];

    try {
        for (const plan of plans) {
            const [existing] = await db
                .select()
                .from(schema.pricingPlan)
                .where((table: any) => table.name === plan.name)
                .limit(1);

            if (existing) {
                console.log(`Plan "${plan.displayName}" already exists, skipping...`);
            } else {
                await db.insert(schema.pricingPlan).values({
                    ...plan,
                    features: plan.features as any,
                });
                console.log(`Created plan: ${plan.displayName}`);
            }
        }

        console.log("Pricing plans seeded successfully!");
    } catch (error) {
        console.error("Error seeding pricing plans:", error);
        throw error;
    }
}

seedPricingPlans()
    .then(() => {
        console.log("Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Failed:", error);
        process.exit(1);
    });

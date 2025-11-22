"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface PricingPlan {
    id: string;
    name: string;
    displayName: string;
    description: string;
    price: string;
    currency: string;
    maxEvents: number;
    maxEventManagers: number;
    maxAttendeesPerEvent: number;
    features: string[];
    isActive: boolean;
    sortOrder: number;
}

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPricingPlans();
    }, []);

    const fetchPricingPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/pricing-supabase");
            if (response.ok) {
                const data = await response.json();
                setPlans(data.data || []);
            } else {
                console.error("Error fetching pricing plans - database may not be migrated");
            }
        } catch (error) {
            console.error("Error fetching pricing plans:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (planId: string, planName: string) => {
        if (!session) {
            router.push("/auth?redirect=/pricing");
            return;
        }

        const userRole = session.user?.role;
        if (userRole !== "manager" && userRole !== "admin") {
            router.push("/apply-manager");
            return;
        }

        // For free plan, go directly to create organization
        if (planName === "free") {
            router.push("/organizations/create");
        } else {
            // For paid plans, redirect to create organization with plan preselected
            router.push(`/organizations/create?plan=${planId}`);
        }
    };

    const formatLimit = (limit: number) => {
        if (limit === -1) return "Unlimited";
        return limit.toString();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold">Pricing Plans</h1>
                </div>
                <Card className="max-w-2xl mx-auto border-yellow-200 bg-yellow-50">
                    <CardHeader>
                        <CardTitle>Database Migration Required</CardTitle>
                        <CardDescription>
                            The pricing plans table hasn't been created yet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm">
                            To use the Organizations and Pricing features, you need to run the database migration:
                        </p>
                        <div className="bg-background p-4 rounded-md">
                            <code className="text-sm">
                                cd Kintsugi/eventsync-web/eventsync<br />
                                psql $DATABASE_URL &lt; migrations/001_add_organizations.sql
                            </code>
                        </div>
                        <p className="text-sm">
                            For detailed instructions, see <code>Kintsugi/DATABASE_SETUP.md</code>
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-12 text-center">
                <h1 className="mb-4 text-4xl font-bold">Simple, Transparent Pricing</h1>
                <p className="text-xl text-muted-foreground">
                    Choose the plan that best fits your event management needs
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                    All plans include a 14-day free trial
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => {
                    const isPopular = plan.name === "professional";
                    const isFree = plan.name === "free";

                    return (
                        <Card
                            key={plan.id}
                            className={`relative flex flex-col ${
                                isPopular ? "border-primary shadow-lg" : ""
                            }`}
                        >
                            {isPopular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    Most Popular
                                </Badge>
                            )}

                            <CardHeader>
                                <CardTitle className="text-2xl">
                                    {plan.displayName}
                                </CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1">
                                <div className="mb-6">
                                    <span className="text-4xl font-bold">
                                        ${plan.price}
                                    </span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">
                                            Plan Limits:
                                        </div>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            <li>
                                                • {formatLimit(plan.maxEvents)} events/month
                                            </li>
                                            <li>
                                                •{" "}
                                                {formatLimit(plan.maxEventManagers)} event
                                                managers
                                            </li>
                                            <li>
                                                •{" "}
                                                {formatLimit(plan.maxAttendeesPerEvent)}{" "}
                                                attendees/event
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium">Features:</div>
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={isPopular ? "default" : "outline"}
                                    onClick={() => handleSelectPlan(plan.id, plan.name)}
                                >
                                    {isFree ? "Get Started" : "Start Free Trial"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* FAQ or Additional Info */}
            <div className="mt-16 text-center">
                <h2 className="mb-4 text-2xl font-bold">Need Help Choosing?</h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                    Contact our sales team for a personalized recommendation or to discuss
                    enterprise options with custom features and pricing.
                </p>
                <Button className="mt-4" variant="outline">
                    Contact Sales
                </Button>
            </div>

            {/* Trust Section */}
            <div className="mt-16 rounded-lg bg-muted/50 p-8 text-center">
                <h3 className="mb-4 text-xl font-semibold">
                    Trusted by Organizations Worldwide
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <div className="mb-1 text-3xl font-bold text-primary">99.9%</div>
                        <div className="text-sm text-muted-foreground">Uptime SLA</div>
                    </div>
                    <div>
                        <div className="mb-1 text-3xl font-bold text-primary">
                            24/7
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Support Available
                        </div>
                    </div>
                    <div>
                        <div className="mb-1 text-3xl font-bold text-primary">
                            GDPR
                        </div>
                        <div className="text-sm text-muted-foreground">Compliant</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

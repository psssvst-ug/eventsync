"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PricingPlan {
    id: string;
    name: string;
    displayName: string;
    description: string;
    price: string;
    currency: string;
    features: string[];
}

export default function CreateOrganizationPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        type: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
        address: "",
        pricingPlanId: "",
    });

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            const userRole = session.user?.role;
            if (userRole !== "manager" && userRole !== "admin") {
                router.push("/organizations");
            }
            fetchPricingPlans();
            // Pre-fill contact email with user's email
            setFormData((prev) => ({
                ...prev,
                contactEmail: session.user?.email || "",
            }));
        }
    }, [session, router]);

    const fetchPricingPlans = async () => {
        try {
            const response = await fetch("/api/pricing-supabase");
            if (response.ok) {
                const data = await response.json();
                setPricingPlans(data.data || []);
                // Set default to free plan
                const freePlan = data.data.find((p: PricingPlan) => p.name === "free");
                if (freePlan) {
                    setFormData((prev) => ({ ...prev, pricingPlanId: freePlan.id }));
                }
            }
        } catch (error) {
            console.error("Error fetching pricing plans:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/orgs-supabase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push(`/organizations/${data.data.id}`);
                }, 1500);
            } else {
                setError(data.error || data.message || "Failed to create organization");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (isPending) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="container mx-auto max-w-2xl p-6">
            <Button
                variant="ghost"
                className="mb-4"
                onClick={() => router.push("/organizations")}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Organizations
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-center">
                        <Building2 className="mr-2 h-6 w-6 text-primary" />
                        <CardTitle>Create Organization</CardTitle>
                    </div>
                    <CardDescription>
                        Set up a new organization to manage events and team members
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success && (
                        <Alert className="mb-4 border-green-200 bg-green-50">
                            <AlertDescription>
                                Organization created successfully! Redirecting...
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert className="mb-4 border-red-200 bg-red-50">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g., Tech Events Inc."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    handleChange("description", e.target.value)
                                }
                                placeholder="Brief description of your organization"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Organization Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => handleChange("type", value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select organization type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="educational">
                                        Educational
                                    </SelectItem>
                                    <SelectItem value="corporate">Corporate</SelectItem>
                                    <SelectItem value="nonprofit">Non-Profit</SelectItem>
                                    <SelectItem value="government">Government</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">Contact Email *</Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) =>
                                    handleChange("contactEmail", e.target.value)
                                }
                                placeholder="contact@example.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input
                                id="contactPhone"
                                type="tel"
                                value={formData.contactPhone}
                                onChange={(e) =>
                                    handleChange("contactPhone", e.target.value)
                                }
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleChange("website", e.target.value)}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleChange("address", e.target.value)}
                                placeholder="Full address of your organization"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pricingPlan">Pricing Plan *</Label>
                            <Select
                                value={formData.pricingPlanId}
                                onValueChange={(value) =>
                                    handleChange("pricingPlanId", value)
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a pricing plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pricingPlans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.displayName} - ${plan.price}/month
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                All new organizations start with a 14-day free trial
                            </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/organizations")}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Organization
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

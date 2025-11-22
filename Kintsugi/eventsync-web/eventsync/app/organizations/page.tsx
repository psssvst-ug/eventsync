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
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Users,
    Plus,
    Loader2,
    CreditCard,
    Settings,
} from "lucide-react";

interface Organization {
    id: string;
    name: string;
    description: string;
    type: string;
    subscriptionStatus: string;
    memberRole: string;
    memberStatus: string;
    pricingPlan: {
        id: string;
        name: string;
        displayName: string;
    };
}

export default function OrganizationsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session) {
            fetchOrganizations();
        }
    }, [session]);

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/orgs-supabase");
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            active: "default",
            trial: "secondary",
            suspended: "destructive",
            cancelled: "destructive",
        };
        return (
            <Badge variant={variants[status] || "secondary"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getRoleBadge = (role: string) => {
        return (
            <Badge variant={role === "admin" ? "default" : "secondary"}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
        );
    };

    if (isPending || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const canCreateOrg =
        session.user?.role === "manager" || session.user?.role === "admin";

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Organizations</h1>
                        <p className="text-muted-foreground">
                            Manage your organizations and create events
                        </p>
                    </div>
                    {canCreateOrg && (
                        <Button onClick={() => router.push("/organizations/create")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Organization
                        </Button>
                    )}
                </div>
            </div>

            {!canCreateOrg && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <p className="text-sm">
                            You need to be a manager to create organizations.{" "}
                            <a
                                href="/apply-manager"
                                className="font-medium text-blue-600 underline"
                            >
                                Apply to become a manager
                            </a>
                        </p>
                    </CardContent>
                </Card>
            )}

            {organizations.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">
                            No Organizations Yet
                        </h3>
                        <p className="mb-4 text-center text-muted-foreground">
                            {canCreateOrg
                                ? "Create your first organization to start managing events"
                                : "Join an organization to participate in events"}
                        </p>
                        {canCreateOrg && (
                            <Button onClick={() => router.push("/organizations/create")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Organization
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {organizations.map((org) => (
                        <Card
                            key={org.id}
                            className="cursor-pointer transition-shadow hover:shadow-lg"
                            onClick={() => router.push(`/organizations/${org.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        <Building2 className="mr-2 h-5 w-5 text-primary" />
                                        <CardTitle className="text-xl">
                                            {org.name}
                                        </CardTitle>
                                    </div>
                                    {getRoleBadge(org.memberRole)}
                                </div>
                                <CardDescription>
                                    {org.description || "No description"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Type:
                                        </span>
                                        <span className="font-medium">
                                            {org.type
                                                .charAt(0)
                                                .toUpperCase() + org.type.slice(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Plan:
                                        </span>
                                        <span className="font-medium">
                                            {org.pricingPlan.displayName}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Status:
                                        </span>
                                        {getStatusBadge(org.subscriptionStatus)}
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/organizations/${org.id}`);
                                        }}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Manage
                                    </Button>
                                    {org.memberRole === "admin" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(
                                                    `/organizations/${org.id}/members`
                                                );
                                            }}
                                        >
                                            <Users className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

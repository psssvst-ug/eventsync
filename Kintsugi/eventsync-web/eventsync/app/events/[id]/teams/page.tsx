"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Users,
    Mail,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowLeft,
    User,
    Crown,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
    id: string;
    email: string;
    name: string | null;
    role: string;
    status: string;
    invitedAt: string;
    joinedAt: string | null;
}

interface Registration {
    id: string;
    eventId: string;
    teamId: string;
    status: string;
    registeredAt: string;
    checkedInAt: string | null;
    teamName: string;
    teamDescription: string | null;
    teamMembers: TeamMember[];
}

interface EventData {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    location: string | null;
    maxCapacity: number | null;
}

export default function EventTeamsPage() {
    const params = useParams();
    const id = params.id as string;

    const [event, setEvent] = useState<EventData | null>(null);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch event details
                const eventResponse = await fetch(`/api/events/${id}`);
                if (!eventResponse.ok) {
                    throw new Error("Failed to fetch event");
                }
                const eventData = await eventResponse.json();
                setEvent(eventData.data);

                // Fetch registrations
                const registrationsResponse = await fetch(
                    `/api/registrations?eventId=${id}`,
                );
                if (!registrationsResponse.ok) {
                    throw new Error("Failed to fetch registrations");
                }
                const registrationsData = await registrationsResponse.json();
                setRegistrations(registrationsData.registrations || []);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load data",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return (
                    <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmed
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge variant="destructive" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Cancelled
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getMemberStatusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return (
                    <Badge variant="default" size="sm">
                        Accepted
                    </Badge>
                );
            case "pending":
                return (
                    <Badge variant="secondary" size="sm">
                        Pending
                    </Badge>
                );
            case "declined":
                return (
                    <Badge variant="destructive" size="sm">
                        Declined
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" size="sm">
                        {status}
                    </Badge>
                );
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <Skeleton className="h-8 w-64 mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-destructive mb-4">
                            <XCircle className="w-5 h-5" />
                            <p className="font-semibold">Error</p>
                        </div>
                        <p className="text-muted-foreground">{error}</p>
                        <Link href={`/events/${id}`}>
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Event
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            {/* Header */}
            <div className="mb-6">
                <Link href={`/events/${id}`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Event
                    </Button>
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Registered Teams
                        </h1>
                        <p className="text-muted-foreground">{event.title}</p>
                    </div>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        {registrations.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Total Teams
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Registrations List */}
            {registrations.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium mb-2">
                            No teams registered yet
                        </p>
                        <p className="text-muted-foreground">
                            Teams that register for this event will appear here
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {registrations.map((registration) => (
                        <Card key={registration.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CardTitle className="text-xl">
                                                {registration.teamName}
                                            </CardTitle>
                                            {getStatusBadge(
                                                registration.status,
                                            )}
                                        </div>
                                        {registration.teamDescription && (
                                            <p className="text-sm text-muted-foreground">
                                                {registration.teamDescription}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Registration Info */}
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Registered on{" "}
                                                {formatDate(
                                                    registration.registeredAt,
                                                )}
                                            </span>
                                        </div>
                                        {registration.checkedInAt && (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Checked In</span>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Team Members */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-4 h-4 text-muted-foreground" />
                                            <p className="font-medium text-sm">
                                                Team Members (
                                                {
                                                    registration.teamMembers
                                                        .length
                                                }
                                                )
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {registration.teamMembers.map(
                                                (member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                {member.role ===
                                                                "leader" ? (
                                                                    <Crown className="w-5 h-5 text-primary" />
                                                                ) : (
                                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium text-sm">
                                                                        {member.name ||
                                                                            "No name"}
                                                                    </p>
                                                                    {member.role ===
                                                                        "leader" && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            size="sm"
                                                                        >
                                                                            Leader
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Mail className="w-3 h-3" />
                                                                    {
                                                                        member.email
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {getMemberStatusBadge(
                                                            member.status,
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

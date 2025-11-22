"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Calendar,
    MapPin,
    Users,
    Loader2,
    CheckCircle2,
    Clock,
    XCircle,
    List,
    ExternalLink,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl: string | null;
    status: string;
    maxCapacity: number | null;
    registrationDeadline: string;
}

interface Team {
    id: string;
    name: string;
    description: string | null;
}

interface Registration {
    id: string;
    status: string;
    registeredAt: string;
    checkedInAt: string | null;
    cancelledAt: string | null;
    formData: Record<string, unknown> | null;
    event: Event;
    team: Team;
}

interface ApiResponse {
    success: boolean;
    data: {
        registrations: Registration[];
        total: number;
    };
    error?: string;
}

interface MyRegistrationsModalProps {
    trigger?:
        | React.ReactElement
        | ((props: React.HTMLAttributes<HTMLElement>) => React.ReactElement);
}

export function MyRegistrationsModal({ trigger }: MyRegistrationsModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchRegistrations();
        }
    }, [open]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/user/registrations");
            const data: ApiResponse = await response.json();

            if (data.success) {
                setRegistrations(data.data.registrations);
            } else {
                setError(data.error || "Failed to fetch registrations");
            }
        } catch (err) {
            console.error("Error fetching registrations:", err);
            setError("An error occurred while fetching your registrations");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string, checkedIn: string | null) => {
        if (checkedIn) {
            return (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Checked In
                </Badge>
            );
        }

        switch (status) {
            case "confirmed":
                return (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Confirmed
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-100 text-red-800 border-red-300">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getEventStatus = (event: Event) => {
        const now = new Date();
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (now > endDate) {
            return { label: "Completed", variant: "secondary" as const };
        } else if (now >= startDate && now <= endDate) {
            return { label: "Ongoing", variant: "default" as const };
        } else {
            return { label: "Upcoming", variant: "outline" as const };
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
                render={(props) =>
                    trigger ? (
                        typeof trigger === "function" ? (
                            trigger(props)
                        ) : (
                            <span {...props}>{trigger}</span>
                        )
                    ) : (
                        <button
                            {...props}
                            className="relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                        >
                            <List className="h-4 w-4" />
                            My Registrations
                        </button>
                    )
                }
            />
            <DialogContent className="max-w-4xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        My Event Registrations
                    </DialogTitle>
                    <DialogDescription>
                        View all events you&apos;ve registered for with your
                        teams
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">
                            Loading your registrations...
                        </span>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <p className="text-destructive text-lg mb-4">{error}</p>
                        <Button onClick={fetchRegistrations} variant="outline">
                            Try Again
                        </Button>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg mb-2">
                            No registrations yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Browse events and register with your team to get
                            started
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Total: {registrations.length} registration
                                {registrations.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <ScrollArea className="h-[500px] pr-4">
                            <div className="space-y-4">
                                {registrations.map((reg) => {
                                    const eventStatus = getEventStatus(
                                        reg.event,
                                    );
                                    return (
                                        <Card
                                            key={reg.id}
                                            className="overflow-hidden hover:shadow-md transition-shadow"
                                        >
                                            <CardHeader className="pb-3 px-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg mb-2">
                                                            {reg.event.title}
                                                        </CardTitle>
                                                        <div className="flex flex-wrap gap-2">
                                                            {getStatusBadge(
                                                                reg.status,
                                                                reg.checkedInAt,
                                                            )}
                                                            <Badge
                                                                variant={
                                                                    eventStatus.variant
                                                                }
                                                                className={
                                                                    reg.event
                                                                        .status ===
                                                                        "running" ||
                                                                    eventStatus.label ===
                                                                        "Ongoing"
                                                                        ? "bg-green-500 text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {
                                                                    eventStatus.label
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {reg.event.imageUrl && (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={
                                                                reg.event
                                                                    .imageUrl
                                                            }
                                                            alt={
                                                                reg.event.title
                                                            }
                                                            className="w-20 h-20 object-cover rounded-md"
                                                        />
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 px-6 pb-6">
                                                {reg.event.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {reg.event.description}
                                                    </p>
                                                )}

                                                <Separator />

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {formatDate(
                                                                    reg.event
                                                                        .startDate,
                                                                )}
                                                            </p>
                                                            <p className="text-muted-foreground text-xs">
                                                                {formatTime(
                                                                    reg.event
                                                                        .startDate,
                                                                )}{" "}
                                                                -{" "}
                                                                {formatTime(
                                                                    reg.event
                                                                        .endDate,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    reg.event
                                                                        .location
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="font-medium">
                                                                {reg.team.name}
                                                            </p>
                                                            <p className="text-muted-foreground text-xs">
                                                                Your team
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-2">
                                                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="font-medium">
                                                                Registered
                                                            </p>
                                                            <p className="text-muted-foreground text-xs">
                                                                {formatDate(
                                                                    reg.registeredAt,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {reg.event.maxCapacity && (
                                                    <div className="pt-2">
                                                        <p className="text-xs text-muted-foreground">
                                                            Max Capacity:{" "}
                                                            {
                                                                reg.event
                                                                    .maxCapacity
                                                            }{" "}
                                                            attendees
                                                        </p>
                                                    </div>
                                                )}

                                                {(reg.event.status ===
                                                    "running" ||
                                                    getEventStatus(reg.event)
                                                        .label ===
                                                        "Ongoing") && (
                                                    <div className="pt-3 border-t">
                                                        <Link
                                                            href={`/running/${reg.event.id}/${reg.team.id}`}
                                                            passHref
                                                        >
                                                            <Button
                                                                className="w-full mt-3 bg-green-600 hover:bg-green-700"
                                                                size="lg"
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                                View Running
                                                                Event Portal
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RegisterTeamModal } from "@/components/modals/register-team-modal";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    ArrowLeft,
    Share2,
    Edit,
    Loader2,
    ExternalLink,
    QrCode,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PageDesignStorage } from "@/lib/utils/page-design-storage";
import { PageDesign } from "@/lib/types/page-builder";
import BlockRenderer from "@/components/page-builder/block-renderer";
import { useSession } from "@/lib/auth-client";

interface EventData {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    startDate: string;
    endDate: string;
    location: string;
    maxCapacity: number | null;
    minTeamSize: number | null;
    maxTeamSize: number | null;
    registrationDeadline: string;
    status: string;
    managerId: string;
    teamId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    success: boolean;
    data: EventData | null;
    message: string;
    error?: string;
}

export default function EventDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: session } = useSession();

    const [event, setEvent] = useState<EventData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageDesign, setPageDesign] = useState<PageDesign | null>(null);
    const [userRegistration, setUserRegistration] = useState<{
        teamId: string;
        teamName: string;
        registrationId: string;
    } | null>(null);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/events/${id}`);
            const data: ApiResponse = await response.json();

            if (data.success && data.data) {
                setEvent(data.data);
            } else {
                setError(data.message || "Failed to fetch event");
            }
        } catch (err) {
            console.error("Error fetching event:", err);
            setError("An error occurred while fetching the event");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                await fetchEvent();
                // Load page design from database/localStorage
                const design = await PageDesignStorage.loadDesign(id);
                setPageDesign(design);
                // Check if user is registered for this event
                await checkUserRegistration();
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const checkUserRegistration = async () => {
        if (!session?.user) return;

        try {
            const response = await fetch("/api/user/registrations");
            const data = await response.json();

            if (data.success && data.data.registrations) {
                const registration = data.data.registrations.find(
                    (reg: { event: { id: string } }) => reg.event.id === id,
                );

                if (registration) {
                    setUserRegistration({
                        teamId: registration.team.id,
                        teamName: registration.team.name,
                        registrationId: registration.id,
                    });
                }
            }
        } catch (error) {
            console.error("Error checking user registration:", error);
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

    const formatDateTime = (dateString: string) => {
        return `${formatDate(dateString)} at ${formatTime(dateString)}`;
    };

    // Mock registration count - this should come from an API
    const currentRegistrations = 0;
    const registrationPercentage = event?.maxCapacity
        ? Math.round((currentRegistrations / event.maxCapacity) * 100)
        : 0;

    // Check if user is manager or admin
    const canEditPage =
        session?.user &&
        (session.user.role === "admin" || session.user.role === "manager");

    // Check if user is the event manager
    const isEventManager =
        session?.user && event?.managerId === session.user.id;

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <Link href="/events">
                        <Button variant="ghost" className="gap-2 my-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Events
                        </Button>
                    </Link>
                    <div className="text-center py-12">
                        <p className="text-destructive text-lg mb-4">
                            {error || "Event not found"}
                        </p>
                        <Button onClick={fetchEvent} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Back Button */}
                <Link href="/events">
                    <Button variant="ghost" className="gap-2 my-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Events
                    </Button>
                </Link>

                {/* Hero Section */}
                <div className="relative">
                    {event.imageUrl ? (
                        <div className="h-64 md:h-96 rounded-xl overflow-hidden bg-muted relative">
                            <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-64 md:h-96 rounded-xl bg-muted flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-muted-foreground" />
                        </div>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                                        {event.title}
                                    </h1>
                                    <Badge variant="outline">
                                        {event.status === "published"
                                            ? "Accepting Registrations"
                                            : event.status}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    {isEventManager && (
                                        <Link href={`/events/${id}/scanner`}>
                                            <Button variant="default" size="sm">
                                                <QrCode className="w-4 h-4 mr-2" />
                                                QR Scanner
                                            </Button>
                                        </Link>
                                    )}
                                    <Button variant="outline" size="icon">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {formatDateTime(event.startDate)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                </div>
                                {event.maxCapacity && (
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>
                                            {currentRegistrations} /{" "}
                                            {event.maxCapacity} registered
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-semibold">
                                    About This Event
                                </h2>
                                {canEditPage && (
                                    <Link href={`/events/${id}/designer`}>
                                        <Button variant="outline" size="sm">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Customize Page
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="space-y-4">
                                {pageDesign && pageDesign.blocks.length > 0 ? (
                                    <>
                                        {pageDesign.blocks
                                            .sort((a, b) => a.order - b.order)
                                            .map((block) => (
                                                <BlockRenderer
                                                    key={block.id}
                                                    block={block}
                                                    isPreview
                                                />
                                            ))}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground leading-relaxed">
                                        {event.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h2 className="text-xl font-semibold mb-3">
                                Schedule
                            </h2>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                                        <Clock className="w-4 h-4" />
                                        <span>9:00 AM</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Registration & Welcome Coffee
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Check in and grab some refreshments
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                                        <Clock className="w-4 h-4" />
                                        <span>10:00 AM</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Keynote Presentation
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Opening keynote by industry leaders
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                                        <Clock className="w-4 h-4" />
                                        <span>12:00 PM</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Lunch Break
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Networking lunch with attendees
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                                        <Clock className="w-4 h-4" />
                                        <span>2:00 PM</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Workshops & Breakout Sessions
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Interactive hands-on workshops
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-[120px]">
                                        <Clock className="w-4 h-4" />
                                        <span>4:00 PM</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            Closing Remarks
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Wrap up and final thoughts
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h2 className="text-xl font-semibold mb-3">
                                Event Organizer
                            </h2>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-medium">
                                                EM
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Event Manager
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Manager ID:{" "}
                                                {event.managerId.substring(
                                                    0,
                                                    8,
                                                )}
                                                ...
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Registration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">
                                            Capacity
                                        </span>
                                        <span className="font-medium">
                                            {registrationPercentage}% filled
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{
                                                width: `${registrationPercentage}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {event.maxCapacity
                                            ? event.maxCapacity -
                                              currentRegistrations
                                            : "Unlimited"}{" "}
                                        {event.maxCapacity
                                            ? "spots remaining"
                                            : "capacity"}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Price
                                        </span>
                                        <span className="font-semibold text-lg">
                                            Free
                                        </span>
                                    </div>
                                </div>

                                {event.status === "running" &&
                                userRegistration ? (
                                    <Link
                                        href={`/running/${event.id}/${userRegistration.teamId}`}
                                    >
                                        <Button className="w-full" size="lg">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View Running Event Portal
                                        </Button>
                                    </Link>
                                ) : (
                                    <RegisterTeamModal
                                        eventId={event.id}
                                        eventTitle={event.title}
                                        eventDate={formatDateTime(
                                            event.startDate,
                                        )}
                                        eventLocation={event.location}
                                        minTeamSize={event.minTeamSize || 1}
                                        maxTeamSize={event.maxTeamSize || 5}
                                        trigger={
                                            <button
                                                className="w-full relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border bg-primary text-primary-foreground px-4 py-2.5 text-base font-medium shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={
                                                    event.status !== "published"
                                                }
                                            >
                                                {event.status === "published"
                                                    ? "Register Team"
                                                    : event.status ===
                                                        "published"
                                                      ? "Register Team"
                                                      : event.status ===
                                                          "cancelled"
                                                        ? "Event Cancelled"
                                                        : "Registration Closed"}
                                            </button>
                                        }
                                    />
                                )}

                                {event.status === "running" &&
                                    userRegistration && (
                                        <p className="text-xs text-center text-muted-foreground">
                                            Team: {userRegistration.teamName}
                                        </p>
                                    )}

                                {event.status !== "running" && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        Registration confirmation will be sent
                                        to your email
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">
                                    Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">
                                        Start Date
                                    </p>
                                    <p className="font-medium">
                                        {formatDateTime(event.startDate)}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">
                                        End Date
                                    </p>
                                    <p className="font-medium">
                                        {formatDateTime(event.endDate)}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">
                                        Location
                                    </p>
                                    <p className="font-medium">
                                        {event.location}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">
                                        Status
                                    </p>
                                    <Badge
                                        variant={
                                            event.status === "published"
                                                ? "default"
                                                : event.status === "cancelled"
                                                  ? "destructive"
                                                  : "secondary"
                                        }
                                    >
                                        {event.status}
                                    </Badge>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground">
                                        Registration Deadline
                                    </p>
                                    <p className="font-medium">
                                        {formatDateTime(
                                            event.registrationDeadline,
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {canEditPage && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Manage Event
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/events/${id}/teams`}>
                                        <Button
                                            variant="outline"
                                            className="w-full gap-2"
                                        >
                                            <Users className="w-4 h-4" />
                                            View Registered Teams
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

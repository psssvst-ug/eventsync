"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    AlertCircle,
    QrCode,
    ArrowLeft,
    Loader2,
    MessageSquare,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";

interface EventData {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    startDate: string;
    endDate: string;
    location: string;
    status: string;
    page: {
        rules?: string;
    } | null;
}

interface TeamData {
    id: string;
    name: string;
    description: string;
    members: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        userId?: string;
    }>;
}

interface RegistrationData {
    id: string;
    status: string;
    registeredAt: string;
    formData: Record<string, unknown> | null;
}

interface EventMessage {
    id: string;
    title: string;
    content: string;
    priority: string;
    createdAt: string;
    managerName: string;
}

interface QRCodeData {
    id: string;
    label: string;
    trackingType: string;
    qrCodeUrl: string;
    isScanned: boolean;
    scannedAt: string | null;
    memberId: string | null;
    memberName: string | null;
}

export default function RunningEventPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const teamId = params.teamId as string;
    const { data: session } = useSession();

    const [event, setEvent] = useState<EventData | null>(null);
    const [team, setTeam] = useState<TeamData | null>(null);
    const [registration, setRegistration] = useState<RegistrationData | null>(
        null,
    );
    const [messages, setMessages] = useState<EventMessage[]>([]);
    const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);
    const [generatingQR, setGeneratingQR] = useState(false);
    const [currentQRIndex, setCurrentQRIndex] = useState(0);
    const [selectedMember, setSelectedMember] = useState<string>("all");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                setAccessDenied(false);

                // Fetch event data
                const eventResponse = await fetch(`/api/events/${eventId}`);
                const eventData = await eventResponse.json();
                if (!eventData.success) {
                    throw new Error(
                        eventData.message || "Failed to load event",
                    );
                }
                setEvent(eventData.data);

                // Fetch team data
                const teamResponse = await fetch(`/api/teams/${teamId}`);
                const teamData = await teamResponse.json();
                if (!teamData.success) {
                    throw new Error(teamData.message || "Failed to load team");
                }
                setTeam(teamData.data);

                // Check if user is a member of this team
                if (session?.user) {
                    const isMember = teamData.data.members.some(
                        (member: { email: string; status: string }) =>
                            member.email === session.user.email &&
                            member.status === "accepted",
                    );

                    if (!isMember) {
                        setAccessDenied(true);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch registration data
                const regResponse = await fetch(
                    `/api/registrations/event/${eventId}/team/${teamId}`,
                );
                const regData = await regResponse.json();
                if (regData.success) {
                    setRegistration(regData.data);
                }

                // Fetch event messages
                const messagesResponse = await fetch(
                    `/api/events/${eventId}/messages`,
                );
                const messagesData = await messagesResponse.json();
                if (messagesData.success) {
                    setMessages(messagesData.data);
                }

                // Fetch QR codes for this team
                const qrResponse = await fetch(
                    `/api/events/${eventId}/team/${teamId}/qrcodes`,
                );
                const qrData = await qrResponse.json();
                if (qrData.success) {
                    setQRCodes(qrData.data);

                    // If no QR codes exist, automatically generate them
                    if (qrData.data.length === 0) {
                        await generateQRCodes();
                    }
                }
            } catch (err) {
                console.error("Error loading data:", err);
                setError(
                    err instanceof Error ? err.message : "Failed to load data",
                );
            } finally {
                setLoading(false);
            }
        };

        if (eventId && teamId) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, teamId, session]);

    const generateQRCodes = async () => {
        try {
            setGeneratingQR(true);

            const response = await fetch(
                `/api/events/${eventId}/team/${teamId}/generate-qrcodes`,
                {
                    method: "POST",
                },
            );

            const data = await response.json();

            if (data.success) {
                // Reload QR codes
                const qrResponse = await fetch(
                    `/api/events/${eventId}/team/${teamId}/qrcodes`,
                );
                const qrData = await qrResponse.json();
                if (qrData.success) {
                    setQRCodes(qrData.data);
                }
            }
        } catch (error) {
            console.error("Error generating QR codes:", error);
        } finally {
            setGeneratingQR(false);
        }
    };

    const nextQR = () => {
        setCurrentQRIndex((prev) => (prev + 1) % qrCodes.length);
    };

    const previousQR = () => {
        setCurrentQRIndex(
            (prev) => (prev - 1 + qrCodes.length) % qrCodes.length,
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500 text-white";
            case "high":
                return "bg-orange-500 text-white";
            case "normal":
                return "bg-blue-500 text-white";
            case "low":
                return "bg-gray-500 text-white";
            default:
                return "bg-gray-500 text-white";
        }
    };

    const downloadQRCode = (qrCodeUrl: string, label: string) => {
        const link = document.createElement("a");
        link.href = qrCodeUrl;
        link.download = `${label.replace(/\s+/g, "_")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Compute filtered QR codes based on selected member
    const filteredQRCodes = qrCodes.filter((qr) => {
        if (selectedMember === "all") return true;
        if (selectedMember === "me") {
            const currentMember = team?.members.find(
                (m) => m.email === session?.user?.email,
            );
            return qr.memberId === currentMember?.id;
        }
        return qr.memberId === selectedMember;
    });

    // Get current user's member data
    const currentUserMember = team?.members.find(
        (m) => m.email === session?.user?.email && m.status === "accepted",
    );

    // Get members who have QR codes assigned
    const membersWithQRs =
        team?.members.filter((member) =>
            qrCodes.some((qr) => qr.memberId === member.id),
        ) || [];

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="gap-2 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
                                <p className="text-lg font-semibold mb-2">
                                    Access Denied
                                </p>
                                <p className="text-muted-foreground mb-4">
                                    You are not a member of this team. Only team
                                    members can access this event portal.
                                </p>
                                <Link href="/dashboard">
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !event || !team) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <Link href="/events">
                        <Button variant="ghost" className="gap-2 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Events
                        </Button>
                    </Link>
                    <Card className="max-w-2xl mx-auto">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                                <p className="text-lg font-semibold mb-2">
                                    {error || "Event or Team not found"}
                                </p>
                                <p className="text-muted-foreground">
                                    Please check the URL and try again.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="gap-2 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2 mb-2">
                        <Badge
                            variant="secondary"
                            className="bg-green-500 text-white"
                        >
                            <Clock className="w-3 h-3 mr-1" />
                            Event Running
                        </Badge>
                    </div>

                    <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
                    <p className="text-lg text-muted-foreground mb-4">
                        Team: {team.name}
                    </p>
                </div>

                {/* Event Image */}
                {event.imageUrl && (
                    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
                        <Image
                            src={event.imageUrl}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-semibold">
                                            Date & Time
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(event.startDate)} -{" "}
                                            {formatDate(event.endDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-semibold">
                                            Location
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.location}
                                        </p>
                                    </div>
                                </div>

                                {event.description && (
                                    <div>
                                        <p className="font-semibold mb-2">
                                            Description
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Rules & Regulations */}
                        {event.page?.rules && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Rules & Regulations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="prose prose-sm max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{
                                            __html: event.page.rules,
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Event Messages */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Event Updates ({messages.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {messages.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        No messages yet
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className="border rounded-lg p-4 space-y-2"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold">
                                                        {message.title}
                                                    </h3>
                                                    <Badge
                                                        className={getPriorityColor(
                                                            message.priority,
                                                        )}
                                                    >
                                                        {message.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {message.content}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        Posted by{" "}
                                                        {message.managerName}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatDateTime(
                                                            message.createdAt,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Team Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Team Members
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {team.members
                                        .filter(
                                            (member) =>
                                                member.status === "accepted",
                                        )
                                        .map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between"
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.email}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        member.role === "leader"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {member.role}
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* QR Codes with Member Tabs */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5" />
                                    QR Codes
                                    {filteredQRCodes.length > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto"
                                        >
                                            {currentQRIndex + 1} /{" "}
                                            {filteredQRCodes.length}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Member Filter Tabs */}
                                {qrCodes.length > 0 &&
                                    (membersWithQRs.length > 0 ||
                                        currentUserMember) && (
                                        <Tabs
                                            value={selectedMember}
                                            onValueChange={(value) => {
                                                setSelectedMember(value);
                                                setCurrentQRIndex(0);
                                            }}
                                            className="mb-4"
                                        >
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="all">
                                                    <Users className="w-4 h-4 mr-2" />
                                                    All Team
                                                </TabsTrigger>
                                                {currentUserMember && (
                                                    <TabsTrigger value="me">
                                                        <User className="w-4 h-4 mr-2" />
                                                        My QR Codes
                                                    </TabsTrigger>
                                                )}
                                                {membersWithQRs.length > 0 &&
                                                    membersWithQRs.length <=
                                                        5 &&
                                                    membersWithQRs.map(
                                                        (member: {
                                                            id: string;
                                                            name: string;
                                                        }) => (
                                                            <TabsTrigger
                                                                key={member.id}
                                                                value={
                                                                    member.id
                                                                }
                                                            >
                                                                {member.name}
                                                            </TabsTrigger>
                                                        ),
                                                    )}
                                            </TabsList>
                                        </Tabs>
                                    )}
                                {/* QR Code Display */}
                                {generatingQR ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Generating QR codes...
                                        </p>
                                    </div>
                                ) : filteredQRCodes.length === 0 &&
                                  qrCodes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground mb-4">
                                            No QR codes available yet
                                        </p>
                                        <Button
                                            onClick={generateQRCodes}
                                            size="sm"
                                        >
                                            Generate QR Codes
                                        </Button>
                                    </div>
                                ) : filteredQRCodes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            No QR codes available for this
                                            selection
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Carousel */}
                                        <div className="relative">
                                            <div className="border rounded-lg p-6 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold text-lg">
                                                            {
                                                                filteredQRCodes[
                                                                    currentQRIndex
                                                                ].label
                                                            }
                                                        </p>
                                                        <p className="text-sm text-muted-foreground capitalize">
                                                            {filteredQRCodes[
                                                                currentQRIndex
                                                            ].trackingType.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </p>
                                                        {filteredQRCodes[
                                                            currentQRIndex
                                                        ].memberName && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                For:{" "}
                                                                {
                                                                    filteredQRCodes[
                                                                        currentQRIndex
                                                                    ].memberName
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    {filteredQRCodes[
                                                        currentQRIndex
                                                    ].isScanned && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-green-500 text-white"
                                                        >
                                                            Scanned
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="bg-white p-6 rounded-lg flex items-center justify-center relative">
                                                    <Image
                                                        src={
                                                            filteredQRCodes[
                                                                currentQRIndex
                                                            ].qrCodeUrl
                                                        }
                                                        alt={
                                                            filteredQRCodes[
                                                                currentQRIndex
                                                            ].label
                                                        }
                                                        width={250}
                                                        height={250}
                                                        className={`w-full max-w-[250px] h-auto ${
                                                            filteredQRCodes[
                                                                currentQRIndex
                                                            ].isScanned
                                                                ? "blur-md"
                                                                : ""
                                                        }`}
                                                    />
                                                    {filteredQRCodes[
                                                        currentQRIndex
                                                    ].isScanned && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-2xl shadow-lg border-4 border-red-600 transform -rotate-12">
                                                                EXPIRED
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {filteredQRCodes[currentQRIndex]
                                                    .isScanned &&
                                                    filteredQRCodes[
                                                        currentQRIndex
                                                    ].scannedAt && (
                                                        <p className="text-xs text-muted-foreground text-center">
                                                            Scanned at:{" "}
                                                            {formatDateTime(
                                                                filteredQRCodes[
                                                                    currentQRIndex
                                                                ].scannedAt!,
                                                            )}
                                                        </p>
                                                    )}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() =>
                                                        downloadQRCode(
                                                            filteredQRCodes[
                                                                currentQRIndex
                                                            ].qrCodeUrl,
                                                            filteredQRCodes[
                                                                currentQRIndex
                                                            ].label,
                                                        )
                                                    }
                                                >
                                                    Download QR Code
                                                </Button>
                                            </div>

                                            {/* Navigation Arrows */}
                                            {filteredQRCodes.length > 1 && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
                                                        onClick={previousQR}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
                                                        onClick={nextQR}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>

                                        {/* Dots Indicator */}
                                        {filteredQRCodes.length > 1 && (
                                            <div className="flex justify-center gap-2 pt-2">
                                                {filteredQRCodes.map(
                                                    (_qr, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() =>
                                                                setCurrentQRIndex(
                                                                    index,
                                                                )
                                                            }
                                                            className={`h-2 rounded-full transition-all ${
                                                                index ===
                                                                currentQRIndex
                                                                    ? "w-8 bg-primary"
                                                                    : "w-2 bg-muted-foreground/30"
                                                            }`}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Registration Status */}
                        {registration && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registration Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Status
                                            </span>
                                            <Badge
                                                variant={
                                                    registration.status ===
                                                    "confirmed"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {registration.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Registered
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDate(
                                                    registration.registeredAt,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

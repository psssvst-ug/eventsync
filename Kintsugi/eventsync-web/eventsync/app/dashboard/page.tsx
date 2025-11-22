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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Users,
    TrendingUp,
    FileText,
    User,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    UserPlus,
    Activity,
    XCircle,
    Eye,
    Loader2,
    Edit,
    Settings as SettingsIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ManagerApplication {
    id: string;
    userId: string;
    organizationName: string;
    organizationType: string;
    contactPhone: string;
    website?: string;
    description: string;
    experience: string;
    status: string;
    adminNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    // Stats state
    const [stats, setStats] = useState<{
        registeredEvents?: number;
        attendedEvents?: number;
        upcomingEvents?: number;
        activeEvents?: number;
        totalRegistrations?: number;
        totalCheckIns?: number;
        avgCapacity?: number;
        totalUsers?: number;
        totalEvents?: number;
        pendingApplications?: number;
        regularUsers?: number;
        managers?: number;
        admins?: number;
        systemHealth?: number;
    } | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Manager-specific state
    const [managerEvents, setManagerEvents] = useState<
        Array<{
            id: string;
            title: string;
            description: string | null;
            startDate: string;
            endDate: string | null;
            location: string | null;
            maxCapacity: number | null;
            status: string;
            imageUrl: string | null;
            createdAt: string;
            registrationCount: number;
        }>
    >([]);
    const [managerEventsLoading, setManagerEventsLoading] = useState(false);
    const [recentRegistrations, setRecentRegistrations] = useState<
        Array<{
            id: string;
            status: string;
            registeredAt: string;
            team: {
                id: string;
                name: string;
            };
            event: {
                id: string;
                title: string;
            };
        }>
    >([]);
    const [registrationsLoading, setRegistrationsLoading] = useState(false);

    // User-specific state
    const [userTeams, setUserTeams] = useState<
        Array<{
            id: string;
            name: string;
            description: string | null;
            createdBy: string;
            createdAt: string;
            updatedAt: string;
        }>
    >([]);
    const [userTeamsLoading, setUserTeamsLoading] = useState(false);
    const [userRegistrations, setUserRegistrations] = useState<
        Array<{
            id: string;
            status: string;
            registeredAt: string;
            checkedInAt: string | null;
            cancelledAt: string | null;
            event: {
                id: string;
                title: string;
                description: string;
                startDate: string;
                endDate: string;
                location: string;
                imageUrl: string | null;
                status: string;
            };
            team: {
                id: string;
                name: string;
            };
        }>
    >([]);
    const [userRegistrationsLoading, setUserRegistrationsLoading] =
        useState(false);
    const [userActivity, setUserActivity] = useState<
        Array<{
            id: string;
            type: "registration" | "team_join";
            timestamp: string;
            title: string;
            description: string;
            metadata: Record<string, unknown>;
        }>
    >([]);
    const [userActivityLoading, setUserActivityLoading] = useState(false);

    // Admin-specific state
    const [applications, setApplications] = useState<ManagerApplication[]>([]);
    const [selectedApplication, setSelectedApplication] =
        useState<ManagerApplication | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<"approve" | "reject">(
        "approve",
    );
    const [adminNotes, setAdminNotes] = useState("");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("pending");
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const response = await fetch("/api/stats");
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchManagerEvents = async () => {
        setManagerEventsLoading(true);
        try {
            const response = await fetch("/api/manager/events");
            const data = await response.json();

            if (data.success) {
                setManagerEvents(data.data || []);
            }
        } catch (err) {
            console.error("Error fetching manager events:", err);
        } finally {
            setManagerEventsLoading(false);
        }
    };

    const fetchRecentRegistrations = async () => {
        setRegistrationsLoading(true);
        try {
            const response = await fetch("/api/manager/registrations");
            const data = await response.json();

            if (data.success) {
                setRecentRegistrations(data.data || []);
            }
        } catch (err) {
            console.error("Error fetching registrations:", err);
        } finally {
            setRegistrationsLoading(false);
        }
    };

    const fetchUserTeams = async () => {
        setUserTeamsLoading(true);
        try {
            const response = await fetch("/api/teams");
            const data = await response.json();

            if (data.teams) {
                setUserTeams(data.teams);
            }
        } catch (err) {
            console.error("Error fetching user teams:", err);
        } finally {
            setUserTeamsLoading(false);
        }
    };

    const fetchUserRegistrations = async () => {
        setUserRegistrationsLoading(true);
        try {
            const response = await fetch("/api/user/registrations");
            const data = await response.json();

            if (data.success) {
                setUserRegistrations(data.data.registrations || []);
            }
        } catch (err) {
            console.error("Error fetching user registrations:", err);
        } finally {
            setUserRegistrationsLoading(false);
        }
    };

    const fetchUserActivity = async () => {
        setUserActivityLoading(true);
        try {
            const response = await fetch("/api/user/activity?limit=10");
            const data = await response.json();

            if (data.success) {
                setUserActivity(data.data.activities || []);
            }
        } catch (err) {
            console.error("Error fetching user activity:", err);
        } finally {
            setUserActivityLoading(false);
        }
    };

    const fetchApplications = async (status: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/manager-applications/admin?status=${status}`,
            );
            const data = await response.json();

            if (data.success) {
                setApplications(data.data || []);
            } else {
                setError(data.message || "Failed to fetch applications");
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            setError("An error occurred while fetching applications");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        fetchApplications(value);
    };

    const openDialog = (
        application: ManagerApplication,
        action: "approve" | "reject",
    ) => {
        setSelectedApplication(application);
        setDialogAction(action);
        setAdminNotes("");
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
        setSelectedApplication(null);
        setAdminNotes("");
    };

    const handleApplicationAction = async () => {
        if (!selectedApplication) return;

        setProcessing(true);
        setError(null);

        try {
            const response = await fetch("/api/manager-applications/admin", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    applicationId: selectedApplication.id,
                    action: dialogAction,
                    adminNotes: adminNotes || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                fetchApplications(activeTab);
                closeDialog();
            } else {
                setError(data.message || "Failed to process application");
            }
        } catch (err) {
            console.error("Error processing application:", err);
            setError("An error occurred while processing the application");
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchStats();
            const userRole = session?.user?.role || "user";
            if (userRole === "admin") {
                fetchApplications("pending");
            } else if (userRole === "manager") {
                fetchManagerEvents();
                fetchRecentRegistrations();
            } else if (userRole === "user") {
                fetchUserTeams();
                fetchUserRegistrations();
                fetchUserActivity();
            }
        }
    }, [session]);

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const user = session.user;
    const role = user.role || "user";

    // User/Applicant Dashboard
    if (role === "user") {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Welcome back, {user.name}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your event registrations
                            </p>
                        </div>
                        <Badge variant="secondary" className="gap-2">
                            <User className="w-3 h-3" />
                            Applicant
                        </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Registered Events
                                </CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.registeredEvents || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Total registrations
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Attended
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.attendedEvents || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Past events
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Upcoming
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.upcomingEvents || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Events scheduled
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* My Registrations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Registrations</CardTitle>
                                <CardDescription>
                                    Events you&apos;ve registered for
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {userRegistrationsLoading ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </div>
                                ) : userRegistrations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            No registrations yet
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {userRegistrations
                                            .slice(0, 3)
                                            .map((registration) => {
                                                const getStatusBadge = (
                                                    status: string,
                                                ) => {
                                                    switch (status) {
                                                        case "confirmed":
                                                            return (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-green-500/10 text-green-700 border-green-200"
                                                                >
                                                                    Confirmed
                                                                </Badge>
                                                            );
                                                        case "pending":
                                                            return (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-yellow-500/10 text-yellow-700 border-yellow-200"
                                                                >
                                                                    Pending
                                                                </Badge>
                                                            );
                                                        case "cancelled":
                                                            return (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-red-500/10 text-red-700 border-red-200"
                                                                >
                                                                    Cancelled
                                                                </Badge>
                                                            );
                                                        default:
                                                            return (
                                                                <Badge variant="outline">
                                                                    {status}
                                                                </Badge>
                                                            );
                                                    }
                                                };

                                                return (
                                                    <div
                                                        key={registration.id}
                                                        className="flex items-center justify-between p-3 rounded-lg border"
                                                    >
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    registration
                                                                        .event
                                                                        .title
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Registered{" "}
                                                                {new Date(
                                                                    registration.registeredAt,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        {getStatusBadge(
                                                            registration.status,
                                                        )}
                                                    </div>
                                                );
                                            })}

                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() =>
                                                router.push("/events")
                                            }
                                        >
                                            View All Registrations
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* My Teams */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Teams</CardTitle>
                                <CardDescription>
                                    Teams you belong to
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {userTeamsLoading ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </div>
                                ) : userTeams.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No teams yet</p>
                                        <p className="text-xs mt-1">
                                            Create or join a team to get started
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {userTeams.slice(0, 3).map((team) => (
                                            <div
                                                key={team.id}
                                                className="flex items-start gap-3 p-3 rounded-lg border"
                                            >
                                                <Users className="w-5 h-5 text-primary mt-0.5" />
                                                <div className="flex-1 space-y-1">
                                                    <p className="text-sm font-medium">
                                                        {team.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {team.description ||
                                                            "No description"}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {userTeams.length > 3 && (
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2"
                                                onClick={() =>
                                                    router.push("/dashboard")
                                                }
                                            >
                                                <Users className="w-4 h-4" />
                                                View All Teams
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your latest actions and updates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {userActivityLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                </div>
                            ) : userActivity.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">
                                        No recent activity
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {userActivity
                                        .slice(0, 5)
                                        .map((activity, index) => (
                                            <div key={activity.id}>
                                                {index > 0 && <Separator />}
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`w-2 h-2 rounded-full mt-2 ${
                                                            activity.type ===
                                                            "registration"
                                                                ? "bg-green-500"
                                                                : "bg-blue-500"
                                                        }`}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                activity.description
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(
                                                                activity.timestamp,
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => router.push("/events")}
                                >
                                    <Calendar className="w-4 h-4" />
                                    Browse Events
                                </Button>
                                <Button
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => router.push("/create")}
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Team
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Manager Application CTA */}
                    <Card className="border-primary/50 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Want to Create Events?
                            </CardTitle>
                            <CardDescription>
                                Apply for manager access to create and manage
                                your own events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                As a manager, you&apos;ll be able to create
                                events, manage registrations, track attendees,
                                and access advanced event management features.
                            </p>
                            <Button
                                onClick={() => router.push("/apply-manager")}
                                className="gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Apply for Manager Access
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Event Manager Dashboard
    if (role === "manager") {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Event Manager Portal
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your events and applications
                            </p>
                        </div>
                        <Badge variant="secondary" className="gap-2">
                            <Users className="w-3 h-3" />
                            Manager
                        </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Events
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.activeEvents || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Published events
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Registrations
                                </CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.totalRegistrations || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Total registrations
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Check-ins
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.totalCheckIns || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Attended events
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Capacity
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.avgCapacity || 0}%
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Average fill rate
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* My Events */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>My Events</CardTitle>
                                        <CardDescription>
                                            Events you&apos;re managing
                                        </CardDescription>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="gap-2"
                                        onClick={() =>
                                            router.push("/create/events")
                                        }
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Event
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {managerEventsLoading ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </div>
                                ) : managerEvents.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No events yet</p>
                                        <p className="text-xs">
                                            Create your first event to get
                                            started
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {managerEvents
                                            .slice(0, 3)
                                            .map((event) => (
                                                <div
                                                    key={event.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="space-y-1 flex-1">
                                                        <p className="text-sm font-medium">
                                                            {event.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                event.startDate,
                                                            ).toLocaleDateString()}{" "}
                                                            •{" "}
                                                            {
                                                                event.registrationCount
                                                            }{" "}
                                                            attendees
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                event.status ===
                                                                "published"
                                                                    ? "bg-green-500/10 text-green-700 border-green-200"
                                                                    : event.status ===
                                                                        "draft"
                                                                      ? "bg-gray-500/10 text-gray-700 border-gray-200"
                                                                      : "bg-blue-500/10 text-blue-700 border-blue-200"
                                                            }
                                                        >
                                                            {event.status}
                                                        </Badge>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/events/${event.id}/edit`,
                                                                )
                                                            }
                                                            className="gap-1"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                router.push(
                                                                    `/events/${event.id}`,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                        {managerEvents.length > 3 && (
                                            <Button
                                                variant="outline"
                                                className="w-full gap-2"
                                                onClick={() =>
                                                    router.push("/events")
                                                }
                                            >
                                                <SettingsIcon className="w-4 h-4" />
                                                Manage All Events
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Registrations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Registrations</CardTitle>
                                <CardDescription>
                                    Latest event registrations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {registrationsLoading ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </div>
                                ) : recentRegistrations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            No registrations yet
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {recentRegistrations
                                            .slice(0, 3)
                                            .map((registration) => (
                                                <div
                                                    key={registration.id}
                                                    className="flex items-center justify-between p-3 rounded-lg border"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium">
                                                                {
                                                                    registration
                                                                        .team
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Registered for{" "}
                                                                {
                                                                    registration
                                                                        .event
                                                                        .title
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            registration.status ===
                                                            "confirmed"
                                                                ? "bg-green-500/10 text-green-700 border-green-200"
                                                                : "bg-yellow-500/10 text-yellow-700 border-yellow-200"
                                                        }
                                                    >
                                                        {registration.status}
                                                    </Badge>
                                                </div>
                                            ))}

                                        {recentRegistrations.length > 3 && (
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                            >
                                                View All Registrations
                                            </Button>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest updates on your events
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {registrationsLoading || managerEventsLoading ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                </div>
                            ) : recentRegistrations.length === 0 &&
                              managerEvents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No activity yet</p>
                                </div>
                            ) : (
                                <>
                                    {recentRegistrations
                                        .slice(0, 5)
                                        .map((registration, index) => (
                                            <div key={registration.id}>
                                                {index > 0 && <Separator />}
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                                    <div className="flex-1">
                                                        <p className="text-sm">
                                                            New registration
                                                            from team{" "}
                                                            <span className="font-medium">
                                                                {
                                                                    registration
                                                                        .team
                                                                        .name
                                                                }
                                                            </span>{" "}
                                                            for{" "}
                                                            <span className="font-medium">
                                                                {
                                                                    registration
                                                                        .event
                                                                        .title
                                                                }
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(
                                                                registration.registeredAt,
                                                            ).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    if (role === "admin") {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Admin Dashboard
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                System overview and management
                            </p>
                        </div>
                        <Badge variant="secondary" className="gap-2">
                            <Shield className="w-3 h-3" />
                            Administrator
                        </Badge>
                    </div>

                    {/* System Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Users
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.totalUsers?.toLocaleString() ||
                                                0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            All users
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Events
                                </CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.totalEvents || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            All events
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Pending Applications
                                </CardTitle>
                                <UserPlus className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.pendingApplications || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Awaiting review
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">
                                    System Health
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                {statsLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {stats?.systemHealth || 99.9}%
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Uptime
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Manager Applications */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Manager Applications</CardTitle>
                            <CardDescription>
                                Review and manage applications for manager
                                access
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert variant="error" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Tabs
                                value={activeTab}
                                onValueChange={handleTabChange}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="pending">
                                        Pending
                                    </TabsTrigger>
                                    <TabsTrigger value="approved">
                                        Approved
                                    </TabsTrigger>
                                    <TabsTrigger value="rejected">
                                        Rejected
                                    </TabsTrigger>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                </TabsList>

                                <TabsContent value={activeTab} className="mt-4">
                                    {loading ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                        </div>
                                    ) : applications.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No applications found</p>
                                        </div>
                                    ) : (
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Applicant
                                                        </TableHead>
                                                        <TableHead>
                                                            Organization
                                                        </TableHead>
                                                        <TableHead>
                                                            Type
                                                        </TableHead>
                                                        <TableHead>
                                                            Submitted
                                                        </TableHead>
                                                        <TableHead>
                                                            Status
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Actions
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {applications.map(
                                                        (application) => (
                                                            <TableRow
                                                                key={
                                                                    application.id
                                                                }
                                                            >
                                                                <TableCell>
                                                                    <div>
                                                                        <p className="font-medium">
                                                                            {application
                                                                                .user
                                                                                ?.name ||
                                                                                "Unknown"}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {application
                                                                                .user
                                                                                ?.email ||
                                                                                "N/A"}
                                                                        </p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        application.organizationName
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="capitalize"
                                                                    >
                                                                        {
                                                                            application.organizationType
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {new Date(
                                                                        application.createdAt,
                                                                    ).toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant={
                                                                            application.status ===
                                                                            "approved"
                                                                                ? "default"
                                                                                : application.status ===
                                                                                    "rejected"
                                                                                  ? "destructive"
                                                                                  : "secondary"
                                                                        }
                                                                        className="capitalize"
                                                                    >
                                                                        {application.status ===
                                                                            "approved" && (
                                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                        )}
                                                                        {application.status ===
                                                                            "rejected" && (
                                                                            <XCircle className="w-3 h-3 mr-1" />
                                                                        )}
                                                                        {application.status ===
                                                                            "pending" && (
                                                                            <Clock className="w-3 h-3 mr-1" />
                                                                        )}
                                                                        {
                                                                            application.status
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setSelectedApplication(
                                                                                    application,
                                                                                );
                                                                                setShowDialog(
                                                                                    true,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Eye className="w-4 h-4 mr-1" />
                                                                            View
                                                                        </Button>
                                                                        {application.status ===
                                                                            "pending" && (
                                                                            <>
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        openDialog(
                                                                                            application,
                                                                                            "approve",
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                                    Approve
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="destructive"
                                                                                    onClick={() =>
                                                                                        openDialog(
                                                                                            application,
                                                                                            "reject",
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                                    Reject
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Action Dialog */}
                    <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {dialogAction === "approve"
                                        ? "Approve Application"
                                        : "Reject Application"}
                                </DialogTitle>
                                <DialogDescription>
                                    {selectedApplication && (
                                        <>
                                            Review the application from{" "}
                                            {selectedApplication.user?.name}
                                        </>
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            {selectedApplication && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Applicant Name
                                            </Label>
                                            <p className="font-medium">
                                                {selectedApplication.user
                                                    ?.name || "Unknown"}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Email
                                            </Label>
                                            <p className="font-medium">
                                                {selectedApplication.user
                                                    ?.email || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Organization
                                            </Label>
                                            <p className="font-medium">
                                                {
                                                    selectedApplication.organizationName
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Type
                                            </Label>
                                            <p className="font-medium capitalize">
                                                {
                                                    selectedApplication.organizationType
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Contact Phone
                                            </Label>
                                            <p className="font-medium">
                                                {
                                                    selectedApplication.contactPhone
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Website
                                            </Label>
                                            <p className="font-medium">
                                                {selectedApplication.website ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-muted-foreground">
                                            Organization Description
                                        </Label>
                                        <p className="mt-1 text-sm">
                                            {selectedApplication.description}
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-muted-foreground">
                                            Event Management Experience
                                        </Label>
                                        <p className="mt-1 text-sm">
                                            {selectedApplication.experience}
                                        </p>
                                    </div>

                                    {selectedApplication.status !==
                                        "pending" && (
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Status
                                            </Label>
                                            <div className="mt-1">
                                                <Badge
                                                    variant={
                                                        selectedApplication.status ===
                                                        "approved"
                                                            ? "default"
                                                            : "destructive"
                                                    }
                                                    className="capitalize"
                                                >
                                                    {selectedApplication.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    {selectedApplication.adminNotes && (
                                        <div>
                                            <Label className="text-muted-foreground">
                                                Admin Notes
                                            </Label>
                                            <p className="mt-1 text-sm">
                                                {selectedApplication.adminNotes}
                                            </p>
                                        </div>
                                    )}

                                    {selectedApplication.status ===
                                        "pending" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="adminNotes">
                                                Admin Notes (Optional)
                                            </Label>
                                            <Textarea
                                                id="adminNotes"
                                                placeholder="Add any notes or feedback for the applicant..."
                                                value={adminNotes}
                                                onChange={(e) =>
                                                    setAdminNotes(
                                                        e.target.value,
                                                    )
                                                }
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <DialogFooter>
                                {selectedApplication?.status === "pending" && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={closeDialog}
                                            disabled={processing}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant={
                                                dialogAction === "approve"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                            onClick={handleApplicationAction}
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    {dialogAction ===
                                                    "approve" ? (
                                                        <>
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            Approve
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                                {selectedApplication?.status !== "pending" && (
                                    <Button onClick={closeDialog}>Close</Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        );
    }

    // Default fallback
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>
                        Your role is not recognized
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Please contact an administrator to set up your account
                        role.
                    </p>
                    <Button
                        className="w-full mt-4"
                        onClick={() => router.push("/")}
                    >
                        Return Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

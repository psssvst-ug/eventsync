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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import {
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
    Shield,
    AlertCircle,
    Eye,
    FileText,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export default function AdminPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session?.user) {
            const userRole = session.user.role || "user";
            if (userRole !== "admin") {
                router.push("/dashboard");
            } else {
                fetchApplications("pending");
            }
        }
    }, [session, router]);

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
                // Refresh the applications list
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

    if (isPending || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const user = session.user;
    const userRole = user.role || "user";

    if (userRole !== "admin") {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <Alert variant="error">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                            You don&apos;t have permission to access this page.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    const pendingCount = applications.filter(
        (app) => app.status === "pending",
    ).length;
    const approvedCount = applications.filter(
        (app) => app.status === "approved",
    ).length;
    const rejectedCount = applications.filter(
        (app) => app.status === "rejected",
    ).length;

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Shield className="h-8 w-8" />
                            Admin Panel
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage manager applications and system settings
                        </p>
                    </div>
                    <Badge variant="default" className="gap-2">
                        <Shield className="w-3 h-3" />
                        Administrator
                    </Badge>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Applications
                            </CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeTab === "pending"
                                    ? applications.length
                                    : pendingCount}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Awaiting review
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Approved
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeTab === "approved"
                                    ? applications.length
                                    : approvedCount}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Total approved managers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Rejected
                            </CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeTab === "rejected"
                                    ? applications.length
                                    : rejectedCount}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Declined applications
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Applications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manager Applications</CardTitle>
                        <CardDescription>
                            Review and manage applications for manager access
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
                                                    <TableHead>Type</TableHead>
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
                                                            key={application.id}
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
                                                                              ? "error"
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
            </div>

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
                                        {selectedApplication.user?.name ||
                                            "Unknown"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Email
                                    </Label>
                                    <p className="font-medium">
                                        {selectedApplication.user?.email ||
                                            "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Organization
                                    </Label>
                                    <p className="font-medium">
                                        {selectedApplication.organizationName}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Type
                                    </Label>
                                    <p className="font-medium capitalize">
                                        {selectedApplication.organizationType}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Contact Phone
                                    </Label>
                                    <p className="font-medium">
                                        {selectedApplication.contactPhone}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">
                                        Website
                                    </Label>
                                    <p className="font-medium">
                                        {selectedApplication.website || "N/A"}
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

                            {selectedApplication.status !== "pending" && (
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
                                                    : "error"
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

                            {selectedApplication.status === "pending" && (
                                <div className="space-y-2">
                                    <Label htmlFor="adminNotes">
                                        Admin Notes (Optional)
                                    </Label>
                                    <Textarea
                                        id="adminNotes"
                                        placeholder="Add any notes or feedback for the applicant..."
                                        value={adminNotes}
                                        onChange={(e) =>
                                            setAdminNotes(e.target.value)
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
                                            {dialogAction === "approve" ? (
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
    );
}

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
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ManagerApplication {
    id: string;
    status: string;
    organizationName: string;
    organizationType: string;
    contactPhone: string;
    website?: string;
    description: string;
    experience: string;
    adminNotes?: string;
    createdAt: string;
    reviewedAt?: string;
}

export default function ApplyManagerPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [application, setApplication] = useState<ManagerApplication | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        organizationName: "",
        organizationType: "",
        contactPhone: "",
        website: "",
        description: "",
        experience: "",
    });

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session?.user) {
            fetchApplication();
        }
    }, [session]);

    const fetchApplication = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/manager-applications/submit");
            const data = await response.json();

            if (data.success && data.data) {
                setApplication(data.data);
            }
        } catch (err) {
            console.error("Error fetching application:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch("/api/manager-applications/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setApplication(data.data);
                setFormData({
                    organizationName: "",
                    organizationType: "",
                    contactPhone: "",
                    website: "",
                    description: "",
                    experience: "",
                });
            } else {
                setError(data.message || "Failed to submit application");
            }
        } catch (err) {
            setError("An error occurred while submitting your application");
            console.error("Error submitting application:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prev) => ({ ...prev, organizationType: value }));
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

    // If user is already a manager or admin
    if (userRole === "manager" || userRole === "admin") {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Manager Access</CardTitle>
                            <CardDescription>
                                You already have manager privileges
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertTitle>Access Granted</AlertTitle>
                                <AlertDescription>
                                    You already have {userRole} access. You can
                                    create and manage events from your
                                    dashboard.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="mt-4"
                            >
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // If user has an existing application
    if (application) {
        return (
            <div className="min-h-screen bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Manager Application Status</CardTitle>
                            <CardDescription>
                                Track your application progress
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {application.status === "pending" && (
                                <Alert>
                                    <Clock className="h-4 w-4" />
                                    <AlertTitle>
                                        Application Pending Review
                                    </AlertTitle>
                                    <AlertDescription>
                                        Your application has been submitted and
                                        is awaiting review by our admin team.
                                        You will be notified once a decision is
                                        made.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {application.status === "approved" && (
                                <Alert className="border-green-500">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <AlertTitle>
                                        Application Approved
                                    </AlertTitle>
                                    <AlertDescription>
                                        Congratulations! Your application has
                                        been approved. Your account has been
                                        upgraded to manager status. Please
                                        refresh the page or log out and log back
                                        in to access manager features.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {application.status === "rejected" && (
                                <Alert variant="error">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>
                                        Application Rejected
                                    </AlertTitle>
                                    <AlertDescription>
                                        Unfortunately, your application was not
                                        approved at this time.
                                        {application.adminNotes && (
                                            <div className="mt-2">
                                                <strong>Admin Notes:</strong>{" "}
                                                {application.adminNotes}
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4 border-t pt-4">
                                <h3 className="font-semibold">
                                    Application Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">
                                            Organization
                                        </p>
                                        <p className="font-medium">
                                            {application.organizationName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Type
                                        </p>
                                        <p className="font-medium">
                                            {application.organizationType}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Phone
                                        </p>
                                        <p className="font-medium">
                                            {application.contactPhone}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Submitted
                                        </p>
                                        <p className="font-medium">
                                            {new Date(
                                                application.createdAt,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => router.push("/dashboard")}
                                    variant="outline"
                                >
                                    Back to Dashboard
                                </Button>
                                {application.status === "rejected" && (
                                    <Button
                                        onClick={() => setApplication(null)}
                                        variant="default"
                                    >
                                        Apply Again
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Application form
    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Apply for Manager Access</CardTitle>
                        <CardDescription>
                            Fill out this form to request manager privileges.
                            Once approved, you&apos;ll be able to create and
                            manage events.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="error">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>
                                        Your application has been submitted
                                        successfully! You will be notified once
                                        it&apos;s reviewed.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="organizationName">
                                    Organization Name *
                                </Label>
                                <Input
                                    id="organizationName"
                                    name="organizationName"
                                    placeholder="Enter your organization name"
                                    value={formData.organizationName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organizationType">
                                    Organization Type *
                                </Label>
                                <Select
                                    value={formData.organizationType}
                                    onValueChange={handleSelectChange}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="corporate">
                                            Corporate
                                        </SelectItem>
                                        <SelectItem value="nonprofit">
                                            Non-Profit
                                        </SelectItem>
                                        <SelectItem value="educational">
                                            Educational Institution
                                        </SelectItem>
                                        <SelectItem value="government">
                                            Government
                                        </SelectItem>
                                        <SelectItem value="community">
                                            Community Group
                                        </SelectItem>
                                        <SelectItem value="individual">
                                            Individual
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactPhone">
                                    Contact Phone *
                                </Label>
                                <Input
                                    id="contactPhone"
                                    name="contactPhone"
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website">
                                    Website (Optional)
                                </Label>
                                <Input
                                    id="website"
                                    name="website"
                                    type="url"
                                    placeholder="https://example.com"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Organization Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe your organization and its mission..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Provide details about your organization and
                                    why you need manager access.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">
                                    Event Management Experience *
                                </Label>
                                <Textarea
                                    id="experience"
                                    name="experience"
                                    placeholder="Describe your experience in organizing and managing events..."
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    rows={4}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Share your experience with event planning,
                                    management, and any relevant achievements.
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/dashboard")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

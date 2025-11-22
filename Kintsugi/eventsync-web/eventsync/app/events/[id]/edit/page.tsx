"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardPanel,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
} from "@/components/ui/field";
import { toastManager } from "@/components/ui/toast";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Image as ImageIcon,
    Loader2,
    ArrowLeft,
    Save,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/datetime-picker";

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params?.id as string;
    const { data: session, isPending } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        maxCapacity: "",
        location: "",
        status: "draft",
    });

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [registrationDeadline, setRegistrationDeadline] = useState<
        Date | undefined
    >();

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    useEffect(() => {
        if (session && eventId) {
            fetchEventData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, eventId]);

    const fetchEventData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/events/${eventId}`);
            const data = await response.json();

            if (data.success && data.data) {
                const event = data.data;

                setFormData({
                    title: event.title || "",
                    description: event.description || "",
                    imageUrl: event.imageUrl || "",
                    maxCapacity: event.maxCapacity?.toString() || "",
                    location: event.location || "",
                    status: event.status || "draft",
                });

                // Set Date objects
                setStartDate(
                    event.startDate ? new Date(event.startDate) : undefined,
                );
                setEndDate(event.endDate ? new Date(event.endDate) : undefined);
                setRegistrationDeadline(
                    event.registrationDeadline
                        ? new Date(event.registrationDeadline)
                        : undefined,
                );
            } else {
                toastManager.add({
                    title: "Error",
                    description: "Failed to load event data",
                });
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error fetching event:", error);
            toastManager.add({
                title: "Error",
                description: "Failed to load event data",
            });
            router.push("/dashboard");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Event name is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Event description is required";
        }

        if (!startDate) {
            newErrors.startDate = "Start date and time is required";
        }

        if (!endDate) {
            newErrors.endDate = "End date and time is required";
        }

        if (startDate && endDate && endDate <= startDate) {
            newErrors.endDate = "End date must be after start date";
        }

        if (!formData.location.trim()) {
            newErrors.location = "Location/venue is required";
        }

        if (
            formData.maxCapacity &&
            (isNaN(Number(formData.maxCapacity)) ||
                Number(formData.maxCapacity) <= 0)
        ) {
            newErrors.maxCapacity =
                "Maximum capacity must be a positive number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (
        e: React.FormEvent,
        statusOverride?: string,
    ) => {
        e.preventDefault();

        if (!validateForm()) {
            toastManager.add({
                title: "Validation Error",
                description: "Please fix the errors in the form",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const eventData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim() || null,
                maxCapacity: formData.maxCapacity
                    ? parseInt(formData.maxCapacity)
                    : null,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
                location: formData.location.trim(),
                registrationDeadline: registrationDeadline?.toISOString(),
                status: statusOverride || formData.status,
            };

            const response = await fetch(`/api/events/${eventId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(eventData),
            });

            const result = await response.json();

            if (result.success) {
                toastManager.add({
                    title: "Success",
                    description: "Event updated successfully!",
                });
                router.push("/dashboard");
            } else {
                toastManager.add({
                    title: "Error",
                    description: result.message || "Failed to update event",
                });
            }
        } catch (error) {
            console.error("Error updating event:", error);
            toastManager.add({
                title: "Error",
                description: "An error occurred while updating the event",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (result.success) {
                toastManager.add({
                    title: "Success",
                    description: "Event deleted successfully!",
                });
                router.push("/dashboard");
            } else {
                toastManager.add({
                    title: "Error",
                    description: result.message || "Failed to delete event",
                });
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            toastManager.add({
                title: "Error",
                description: "An error occurred while deleting the event",
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    if (isPending || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const userRole = session.user.role || "user";
    if (userRole !== "manager" && userRole !== "admin") {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            You need manager access to edit events.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="gap-2 mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Edit Event
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Update your event details and settings
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Essential details about your event
                                </CardDescription>
                            </CardHeader>
                            <CardPanel>
                                <div className="space-y-4">
                                    <Field>
                                        <FieldLabel htmlFor="title">
                                            Event Name *
                                        </FieldLabel>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Annual Tech Conference 2024"
                                        />
                                        <FieldDescription>
                                            Give your event a clear and
                                            descriptive name
                                        </FieldDescription>
                                        {errors.title && (
                                            <FieldError>
                                                {errors.title}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="description">
                                            Event Description *
                                        </FieldLabel>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe your event, what attendees can expect, and any important details..."
                                            rows={5}
                                        />
                                        <FieldDescription>
                                            Provide a detailed description of
                                            your event
                                        </FieldDescription>
                                        {errors.description && (
                                            <FieldError>
                                                {errors.description}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="imageUrl">
                                            Event Image URL
                                        </FieldLabel>
                                        <div className="flex gap-2">
                                            <ImageIcon className="w-5 h-5 text-muted-foreground mt-2" />
                                            <Input
                                                id="imageUrl"
                                                name="imageUrl"
                                                type="url"
                                                value={formData.imageUrl}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com/event-image.jpg"
                                            />
                                        </div>
                                        <FieldDescription>
                                            Add a cover image URL for your event
                                            (optional)
                                        </FieldDescription>
                                        {errors.imageUrl && (
                                            <FieldError>
                                                {errors.imageUrl}
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>
                            </CardPanel>
                        </Card>

                        {/* Date & Time */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Date & Time</CardTitle>
                                <CardDescription>
                                    When will your event take place?
                                </CardDescription>
                            </CardHeader>
                            <CardPanel>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field>
                                        <FieldLabel>
                                            <Calendar className="w-4 h-4" />
                                            Start Date & Time
                                        </FieldLabel>
                                        <DateTimePicker
                                            date={startDate}
                                            setDate={(date) => {
                                                setStartDate(date);
                                                if (errors.startDate) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        startDate: "",
                                                    }));
                                                }
                                            }}
                                            placeholder="Select start date and time"
                                        />
                                        {errors.startDate && (
                                            <FieldError>
                                                {errors.startDate}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel>
                                            <Clock className="w-4 h-4" />
                                            End Date & Time
                                        </FieldLabel>
                                        <DateTimePicker
                                            date={endDate}
                                            setDate={(date) => {
                                                setEndDate(date);
                                                if (errors.endDate) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        endDate: "",
                                                    }));
                                                }
                                            }}
                                            placeholder="Select end date and time"
                                        />
                                        {errors.endDate && (
                                            <FieldError>
                                                {errors.endDate}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel>
                                            <Calendar className="w-4 h-4" />
                                            Registration Deadline
                                        </FieldLabel>
                                        <DateTimePicker
                                            date={registrationDeadline}
                                            setDate={(date) => {
                                                setRegistrationDeadline(date);
                                                if (
                                                    errors.registrationDeadline
                                                ) {
                                                    setErrors((prev) => ({
                                                        ...prev,
                                                        registrationDeadline:
                                                            "",
                                                    }));
                                                }
                                            }}
                                            placeholder="Select registration deadline"
                                        />
                                        <FieldDescription>
                                            Last date and time for registrations
                                            (optional)
                                        </FieldDescription>
                                        {errors.registrationDeadline && (
                                            <FieldError>
                                                {errors.registrationDeadline}
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>
                            </CardPanel>
                        </Card>

                        {/* Location & Capacity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location & Capacity</CardTitle>
                                <CardDescription>
                                    Where will your event be held?
                                </CardDescription>
                            </CardHeader>
                            <CardPanel>
                                <div className="space-y-4">
                                    <Field>
                                        <FieldLabel htmlFor="location">
                                            Location/Venue *
                                        </FieldLabel>
                                        <div className="flex gap-2">
                                            <MapPin className="w-5 h-5 text-muted-foreground mt-2" />
                                            <Input
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Conference Center, 123 Main St, City"
                                            />
                                        </div>
                                        <FieldDescription>
                                            Provide the full address or venue
                                            name
                                        </FieldDescription>
                                        {errors.location && (
                                            <FieldError>
                                                {errors.location}
                                            </FieldError>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="maxCapacity">
                                            Maximum Capacity
                                        </FieldLabel>
                                        <div className="flex gap-2">
                                            <Users className="w-5 h-5 text-muted-foreground mt-2" />
                                            <Input
                                                id="maxCapacity"
                                                name="maxCapacity"
                                                type="number"
                                                min="1"
                                                value={formData.maxCapacity}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 100"
                                            />
                                        </div>
                                        <FieldDescription>
                                            Maximum number of attendees
                                            (optional)
                                        </FieldDescription>
                                        {errors.maxCapacity && (
                                            <FieldError>
                                                {errors.maxCapacity}
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>
                            </CardPanel>
                        </Card>

                        {/* Action Buttons */}
                        <Card>
                            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isSubmitting || isDeleting}
                                    className="gap-2 w-full sm:w-auto"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Event
                                </Button>

                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={(e) =>
                                            handleSubmit(e, "draft")
                                        }
                                        disabled={isSubmitting}
                                        className="gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save as Draft
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={(e) =>
                                            handleSubmit(e, "published")
                                        }
                                        disabled={isSubmitting}
                                        className="gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Update & Publish
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </form>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Are you sure you want to delete this event?
                            </DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will
                                permanently delete the event and all associated
                                registrations.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete Event"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

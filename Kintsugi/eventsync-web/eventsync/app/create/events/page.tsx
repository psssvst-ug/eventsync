"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";
import { DateTimePicker } from "@/components/ui/datetime-picker";

export default function CreateEventPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        imageUrl: "",
        maxCapacity: "",
        location: "",
    });

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [registrationDeadline, setRegistrationDeadline] = useState<
        Date | undefined
    >();

    const [errors, setErrors] = useState<Record<string, string>>({});

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

        if (!registrationDeadline) {
            newErrors.registrationDeadline =
                "Registration deadline is required";
        }

        if (
            formData.maxCapacity &&
            formData.maxCapacity.trim() !== "" &&
            parseInt(formData.maxCapacity) < 1
        ) {
            newErrors.maxCapacity = "Maximum registrants must be at least 1";
        }

        if (
            formData.imageUrl &&
            formData.imageUrl.trim() !== "" &&
            !isValidUrl(formData.imageUrl)
        ) {
            newErrors.imageUrl = "Please enter a valid URL";
        }

        setErrors(newErrors);

        // Log errors for debugging
        if (Object.keys(newErrors).length > 0) {
            console.log("Validation errors:", newErrors);
        }

        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }

        const isValid = validateForm();
        if (!isValid) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.querySelector(
                    `[name="${firstErrorField}"]`,
                );
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }

            toastManager.add({
                title: "Validation Error",
                description: "Please fill in all required fields correctly",
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/events/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    imageUrl: formData.imageUrl || null,
                    maxCapacity: formData.maxCapacity
                        ? parseInt(formData.maxCapacity)
                        : null,
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString(),
                    location: formData.location,
                    registrationDeadline: registrationDeadline?.toISOString(),
                    status: "draft",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create event");
            }

            toastManager.add({
                title: "Success!",
                description: "Event created successfully",
                type: "success",
            });

            router.push(`/dashboard`);
        } catch (error) {
            toastManager.add({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to create event",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) {
        router.push("/auth");
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="mb-4 gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    Create New Event
                </h1>
                <p className="text-muted-foreground text-lg">
                    Fill in the details to create your event
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Event Details</CardTitle>
                        <CardDescription>
                            Provide information about your event
                        </CardDescription>
                    </CardHeader>

                    <CardPanel className="space-y-6">
                        {/* Event Name */}
                        <Field>
                            <FieldLabel>
                                Event Name{" "}
                                <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Enter event name"
                                aria-invalid={!!errors.title}
                            />
                            {errors.title && (
                                <FieldError>{errors.title}</FieldError>
                            )}
                        </Field>

                        {/* Event Description */}
                        <Field>
                            <FieldLabel>
                                Event Description{" "}
                                <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your event..."
                                rows={4}
                                aria-invalid={!!errors.description}
                            />
                            {errors.description && (
                                <FieldError>{errors.description}</FieldError>
                            )}
                        </Field>

                        {/* Event Banner Image URL */}
                        <Field>
                            <FieldLabel className="gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Event Banner Image URL
                            </FieldLabel>
                            <Input
                                name="imageUrl"
                                type="url"
                                value={formData.imageUrl}
                                onChange={handleInputChange}
                                placeholder="https://example.com/image.jpg"
                                aria-invalid={!!errors.imageUrl}
                            />
                            <FieldDescription>
                                Optional: Provide a URL for the event banner
                                image
                            </FieldDescription>
                            {errors.imageUrl && (
                                <FieldError>{errors.imageUrl}</FieldError>
                            )}
                        </Field>

                        {/* Maximum Registrants */}
                        <Field>
                            <FieldLabel className="gap-2">
                                <Users className="w-4 h-4" />
                                Maximum Registrants
                            </FieldLabel>
                            <Input
                                name="maxCapacity"
                                type="number"
                                min="1"
                                value={formData.maxCapacity}
                                onChange={handleInputChange}
                                placeholder="Enter maximum number of registrants"
                                aria-invalid={!!errors.maxCapacity}
                            />
                            <FieldDescription>
                                Optional: Leave empty for unlimited capacity
                            </FieldDescription>
                            {errors.maxCapacity && (
                                <FieldError>{errors.maxCapacity}</FieldError>
                            )}
                        </Field>

                        {/* Start Date and Time */}
                        <Field name="startDate">
                            <FieldLabel className="gap-2">
                                <Calendar className="w-4 h-4" />
                                Start Date & Time{" "}
                                <span className="text-destructive">*</span>
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
                                <FieldError>{errors.startDate}</FieldError>
                            )}
                        </Field>

                        {/* End Date and Time */}
                        <Field name="endDate">
                            <FieldLabel className="gap-2">
                                <Clock className="w-4 h-4" />
                                End Date & Time{" "}
                                <span className="text-destructive">*</span>
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
                                <FieldError>{errors.endDate}</FieldError>
                            )}
                        </Field>

                        {/* Location/Venue */}
                        <Field>
                            <FieldLabel className="gap-2">
                                <MapPin className="w-4 h-4" />
                                Location/Venue{" "}
                                <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="Enter event location or venue"
                                aria-invalid={!!errors.location}
                            />
                            {errors.location && (
                                <FieldError>{errors.location}</FieldError>
                            )}
                        </Field>

                        {/* Registration Deadline */}
                        <Field name="registrationDeadline">
                            <FieldLabel className="gap-2">
                                <Calendar className="w-4 h-4" />
                                Registration Deadline{" "}
                                <span className="text-destructive">*</span>
                            </FieldLabel>
                            <DateTimePicker
                                date={registrationDeadline}
                                setDate={(date) => {
                                    setRegistrationDeadline(date);
                                    if (errors.registrationDeadline) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            registrationDeadline: "",
                                        }));
                                    }
                                }}
                                placeholder="Select registration deadline"
                            />
                            {errors.registrationDeadline && (
                                <FieldError>
                                    {errors.registrationDeadline}
                                </FieldError>
                            )}
                        </Field>
                    </CardPanel>

                    <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end">
                        <Link href="/dashboard">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating Event...
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-4 h-4" />
                                    Create Event
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}

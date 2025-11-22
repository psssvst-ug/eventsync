"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toastManager } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface CreateEventModalProps {
    trigger?: React.ReactNode;
}

export function CreateEventModal({ trigger }: CreateEventModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        maxCapacity: "",
    });

    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    startDate: startDate?.toISOString(),
                    endDate: endDate?.toISOString(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create event");
            }

            // Show success toast
            toastManager.add({
                title: "Success!",
                description: "Event created successfully",
                type: "success",
            });

            // Reset form and close modal
            setFormData({
                title: "",
                description: "",
                location: "",
                maxCapacity: "",
            });
            setStartDate(undefined);
            setEndDate(undefined);
            setOpen(false);

            // Refresh the page or redirect to event details
            router.refresh();
        } catch (error) {
            // Show error toast
            toastManager.add({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to create event",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger>{trigger}</DialogTrigger>
            ) : (
                <DialogTrigger
                    render={(props) => (
                        <Button {...props} size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Event
                        </Button>
                    )}
                />
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-2">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new event
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                            id="title"
                            placeholder="Tech Conference 2024"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe your event..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <DateTimePicker
                                date={startDate}
                                setDate={setStartDate}
                                placeholder="Select start date and time"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <DateTimePicker
                                date={endDate}
                                setDate={setEndDate}
                                placeholder="Select end date and time"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="San Francisco, CA"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    location: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxCapacity">Max Capacity</Label>
                        <Input
                            id="maxCapacity"
                            type="number"
                            placeholder="100"
                            value={formData.maxCapacity}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    maxCapacity: e.target.value,
                                })
                            }
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Event"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

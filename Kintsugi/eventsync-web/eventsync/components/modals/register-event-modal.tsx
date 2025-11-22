"use client";

import { useState, cloneElement, isValidElement } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RegisterEventModalProps {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation?: string;
    trigger?:
        | React.ReactElement
        | ((props: React.HTMLAttributes<HTMLElement>) => React.ReactElement);
}

export function RegisterEventModal({
    eventTitle,
    eventDate,
    eventLocation,
    trigger,
}: RegisterEventModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"form" | "confirmation">("form");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dietaryRestrictions: "",
        specialRequirements: "",
        agreeToTerms: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // TODO: Implement API call to register for event
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setLoading(false);
        setStep("confirmation");
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            setStep("form");
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                dietaryRestrictions: "",
                specialRequirements: "",
                agreeToTerms: false,
            });
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger
                    render={(props) =>
                        typeof trigger === "function"
                            ? trigger(props)
                            : isValidElement(trigger)
                              ? cloneElement(trigger, props)
                              : trigger
                    }
                />
            ) : (
                <DialogTrigger>
                    <Button className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Register
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-4">
                {step === "form" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Register for Event</DialogTitle>
                            <DialogDescription>
                                Complete the form to register for {eventTitle}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-4 border rounded-lg bg-muted/30 space-y-1 mb-4">
                            <p className="text-sm font-medium">{eventTitle}</p>
                            <p className="text-xs text-muted-foreground">
                                {eventDate}
                            </p>
                            {eventLocation && (
                                <p className="text-xs text-muted-foreground">
                                    {eventLocation}
                                </p>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">
                                        First Name *
                                    </Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                firstName: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">
                                        Last Name *
                                    </Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                lastName: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dietary">
                                    Dietary Restrictions
                                </Label>
                                <Input
                                    id="dietary"
                                    placeholder="Vegetarian, Vegan, Gluten-free, etc."
                                    value={formData.dietaryRestrictions}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            dietaryRestrictions: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="special">
                                    Special Requirements
                                </Label>
                                <Textarea
                                    id="special"
                                    placeholder="Any special requirements or accessibility needs..."
                                    value={formData.specialRequirements}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            specialRequirements: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>

                            <div className="flex items-start gap-2">
                                <Checkbox
                                    id="terms"
                                    checked={formData.agreeToTerms}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            agreeToTerms: checked === true,
                                        })
                                    }
                                    required
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    I agree to the terms and conditions and
                                    understand the event cancellation policy *
                                </Label>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        "Complete Registration"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Registration Confirmed!</DialogTitle>
                            <DialogDescription>
                                You&apos;re all set for the event
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-8 space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                            </div>

                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Event
                                        </p>
                                        <p className="font-medium">
                                            {eventTitle}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Date & Time
                                        </p>
                                        <p className="font-medium">
                                            {eventDate}
                                        </p>
                                    </div>

                                    {eventLocation && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Location
                                            </p>
                                            <p className="font-medium">
                                                {eventLocation}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Registered As
                                        </p>
                                        <p className="font-medium">
                                            {formData.firstName}{" "}
                                            {formData.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formData.email}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <p className="text-sm text-muted-foreground text-center">
                                A confirmation email has been sent to{" "}
                                <span className="font-medium text-foreground">
                                    {formData.email}
                                </span>
                            </p>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Close
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

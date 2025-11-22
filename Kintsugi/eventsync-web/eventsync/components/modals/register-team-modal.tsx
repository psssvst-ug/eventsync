"use client";

import { useState, useEffect } from "react";
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
import { UserPlus, Loader2, CheckCircle2, X, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cloneElement, isValidElement } from "react";

interface RegisterTeamModalProps {
    eventId: string;
    eventTitle: string;
    eventDate: string;
    eventLocation?: string;
    minTeamSize?: number;
    maxTeamSize?: number;
    trigger?:
        | React.ReactElement
        | ((props: React.HTMLAttributes<HTMLElement>) => React.ReactElement);
}

interface TeamMember {
    id: string;
    email: string;
    name: string;
}

export function RegisterTeamModal({
    eventId,
    eventTitle,
    eventDate,
    eventLocation,
    minTeamSize = 1,
    maxTeamSize = 5,
    trigger,
}: RegisterTeamModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"form" | "confirmation">("form");
    const [teamName, setTeamName] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const [leaderName, setLeaderName] = useState("");
    const [leaderEmail, setLeaderEmail] = useState("");
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [currentMemberEmail, setCurrentMemberEmail] = useState("");
    const [currentMemberName, setCurrentMemberName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            // Pre-fill leader info from session if available
            // This would be populated from the session in real implementation
        }
    }, [open]);

    const addMember = () => {
        if (!currentMemberEmail || !currentMemberName) {
            setError("Please enter both name and email for the team member");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentMemberEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        // Check if email already exists
        if (
            members.some((m) => m.email === currentMemberEmail) ||
            currentMemberEmail === leaderEmail
        ) {
            setError("This email is already added");
            return;
        }

        // Check max team size
        if (members.length >= maxTeamSize - 1) {
            setError(`Maximum team size is ${maxTeamSize} members (including leader)`);
            return;
        }

        const newMember: TeamMember = {
            id: Math.random().toString(36).substring(7),
            email: currentMemberEmail,
            name: currentMemberName,
        };

        setMembers([...members, newMember]);
        setCurrentMemberEmail("");
        setCurrentMemberName("");
        setError("");
    };

    const removeMember = (id: string) => {
        setMembers(members.filter((m) => m.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate team name
        if (!teamName.trim()) {
            setError("Please enter a team name");
            return;
        }

        // Validate leader info
        if (!leaderName.trim() || !leaderEmail.trim()) {
            setError("Please enter team leader information");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(leaderEmail)) {
            setError("Please enter a valid email address for team leader");
            return;
        }

        // Validate team size
        const totalMembers = members.length + 1; // +1 for leader
        if (totalMembers < minTeamSize) {
            setError(`Minimum team size is ${minTeamSize} members`);
            return;
        }

        setLoading(true);

        try {
            // Create team
            const teamResponse = await fetch("/api/teams", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: teamName,
                    description: teamDescription,
                }),
            });

            if (!teamResponse.ok) {
                throw new Error("Failed to create team");
            }

            const teamData = await teamResponse.json();
            const teamId = teamData.team.id;

            // Add team members
            const memberPromises = members.map((member) =>
                fetch("/api/teams/members", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        teamId,
                        email: member.email,
                        name: member.name,
                        role: "member",
                    }),
                }),
            );

            await Promise.all(memberPromises);

            // Register team for event
            const registrationResponse = await fetch("/api/registrations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    eventId,
                    teamId,
                }),
            });

            if (!registrationResponse.ok) {
                throw new Error("Failed to register team for event");
            }

            setStep("confirmation");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to register team. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => {
            setStep("form");
            setTeamName("");
            setTeamDescription("");
            setLeaderName("");
            setLeaderEmail("");
            setMembers([]);
            setCurrentMemberEmail("");
            setCurrentMemberName("");
            setError("");
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
                        <Users className="w-4 h-4" />
                        Register Team
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-2">
                {step === "form" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Register Team for Event</DialogTitle>
                            <DialogDescription>
                                Create a team and register for {eventTitle}. Team
                                size: {minTeamSize}-{maxTeamSize} members
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Event Details */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Event
                                            </span>
                                            <span className="font-medium">
                                                {eventTitle}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Date
                                            </span>
                                            <span className="text-sm">
                                                {eventDate}
                                            </span>
                                        </div>
                                        {eventLocation && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Location
                                                </span>
                                                <span className="text-sm">
                                                    {eventLocation}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Team Information */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">Team Information</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="teamName">
                                        Team Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="teamName"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="Enter your team name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="teamDescription">
                                        Team Description (Optional)
                                    </Label>
                                    <Textarea
                                        id="teamDescription"
                                        value={teamDescription}
                                        onChange={(e) =>
                                            setTeamDescription(e.target.value)
                                        }
                                        placeholder="Brief description of your team"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Team Leader Information */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">
                                    Team Leader Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="leaderName">
                                            Full Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="leaderName"
                                            value={leaderName}
                                            onChange={(e) =>
                                                setLeaderName(e.target.value)
                                            }
                                            placeholder="Your full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="leaderEmail">
                                            Email <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="leaderEmail"
                                            type="email"
                                            value={leaderEmail}
                                            onChange={(e) =>
                                                setLeaderEmail(e.target.value)
                                            }
                                            placeholder="leader@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Team Members</h3>
                                    <Badge variant="secondary">
                                        {members.length + 1} / {maxTeamSize} members
                                    </Badge>
                                </div>

                                {/* Current Members List */}
                                {members.length > 0 && (
                                    <div className="space-y-2">
                                        {members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {member.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {member.email}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeMember(member.id)
                                                    }
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Member Form */}
                                {members.length < maxTeamSize - 1 && (
                                    <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                                        <p className="text-sm font-medium">
                                            Add Team Member
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <Input
                                                placeholder="Member name"
                                                value={currentMemberName}
                                                onChange={(e) =>
                                                    setCurrentMemberName(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Input
                                                type="email"
                                                placeholder="member@example.com"
                                                value={currentMemberEmail}
                                                onChange={(e) =>
                                                    setCurrentMemberEmail(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addMember}
                                            className="w-full"
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Add Member
                                        </Button>
                                    </div>
                                )}

                                {minTeamSize > 1 && members.length + 1 < minTeamSize && (
                                    <p className="text-xs text-muted-foreground">
                                        You need to add at least{" "}
                                        {minTeamSize - members.length - 1} more{" "}
                                        {minTeamSize - members.length - 1 === 1
                                            ? "member"
                                            : "members"}{" "}
                                        to meet the minimum team size requirement.
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                                    {error}
                                </div>
                            )}

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
                                            Registering...
                                        </>
                                    ) : (
                                        "Register Team"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <DialogTitle className="text-center">
                                Team Registered Successfully!
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Your team has been registered for the event.
                            </DialogDescription>
                        </DialogHeader>

                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Team Name
                                    </p>
                                    <p className="font-medium">{teamName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Event
                                    </p>
                                    <p className="font-medium">{eventTitle}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Team Members
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm">
                                            {leaderName} (Leader) - {leaderEmail}
                                        </p>
                                        {members.map((member) => (
                                            <p key={member.id} className="text-sm">
                                                {member.name} - {member.email}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                                Invitation emails have been sent to all team members.
                                They will receive a link to join the team.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleClose} className="w-full">
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

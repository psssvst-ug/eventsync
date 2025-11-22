"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MyRegistrationsModal } from "@/components/modals/my-registrations-modal";

interface Event {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    startDate: string;
    endDate: string;
    location: string;
    maxCapacity: number | null;
    registrationDeadline: string;
    status: string;
    managerId: string;
    teamId: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    success: boolean;
    data: {
        events: Event[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
        };
    };
    message: string;
}

export default function EventsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchEvents();
    }, [page, selectedStatus]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: "12",
                sortBy: "startDate",
                sortOrder: "asc",
                upcoming: "true",
            });

            if (selectedStatus !== "all") {
                params.append("status", selectedStatus);
            }

            if (searchQuery.trim()) {
                params.append("search", searchQuery.trim());
            }

            const response = await fetch(`/api/events/list?${params}`);
            const data: ApiResponse = await response.json();

            if (data.success) {
                setEvents(data.data.events);
                setTotalPages(data.data.pagination.totalPages);
            } else {
                setError(data.message || "Failed to fetch events");
            }
        } catch (err) {
            setError("An error occurred while fetching events");
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchEvents();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })} - ${end.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })}`;
    };

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "cancelled", label: "Cancelled" },
    ];

    const filteredEvents = events.filter((event) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Browse Events
                    </h1>
                    <p className="text-muted-foreground">
                        Discover and register for upcoming events
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                        />
                    </div>
                    <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                    >
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} variant="default">
                        Search
                    </Button>
                    <MyRegistrationsModal />
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <p className="text-destructive text-lg">{error}</p>
                        <Button
                            onClick={fetchEvents}
                            variant="outline"
                            className="mt-4"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Events Grid */}
                {!loading && !error && (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.map((event) => {
                                const capacity = event.maxCapacity || 0;
                                // Note: We don't have registration count from the API yet
                                // This would need to be added to the API response
                                const registered = 0;
                                const percentage =
                                    capacity > 0
                                        ? Math.round(
                                              (registered / capacity) * 100,
                                          )
                                        : 0;
                                const spotsLeft =
                                    capacity > 0 ? capacity - registered : 0;

                                return (
                                    <Card
                                        key={event.id}
                                        className="flex flex-col hover:shadow-lg transition-all"
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <CardTitle className="text-xl line-clamp-2">
                                                    {event.title}
                                                </CardTitle>
                                                <Badge
                                                    variant={
                                                        event.status ===
                                                        "published"
                                                            ? "default"
                                                            : event.status ===
                                                                "cancelled"
                                                              ? "destructive"
                                                              : "secondary"
                                                    }
                                                >
                                                    {event.status}
                                                </Badge>
                                            </div>
                                            <CardDescription className="line-clamp-2">
                                                {event.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col gap-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {formatDate(
                                                            event.startDate,
                                                        )}{" "}
                                                        •{" "}
                                                        {formatTime(
                                                            event.startDate,
                                                            event.endDate,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="line-clamp-1">
                                                        {event.location}
                                                    </span>
                                                </div>
                                                {event.maxCapacity && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="h-4 w-4" />
                                                        <span>
                                                            Capacity:{" "}
                                                            {event.maxCapacity}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {event.maxCapacity && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">
                                                            {percentage}% filled
                                                        </span>
                                                        <span className="font-medium">
                                                            {spotsLeft} spots
                                                            available
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-1.5">
                                                        <div
                                                            className="bg-primary h-1.5 rounded-full transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="gap-2 mt-auto pt-2">
                                                <Link
                                                    href={`/events/${event.id}`}
                                                    className=""
                                                >
                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-5"
                                                    >
                                                        Learn More
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {filteredEvents.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg">
                                    No events found matching your criteria
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

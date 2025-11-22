"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function DateTimePicker({
    date,
    setDate,
    placeholder = "Pick a date and time",
    disabled = false,
    className,
}: DateTimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedDateTime, setSelectedDateTime] = React.useState<
        Date | undefined
    >(date);
    const [timeValue, setTimeValue] = React.useState<string>(
        date ? format(date, "HH:mm") : "09:00",
    );

    React.useEffect(() => {
        if (date) {
            setSelectedDateTime(date);
            setTimeValue(format(date, "HH:mm"));
        }
    }, [date]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) {
            setSelectedDateTime(undefined);
            setDate(undefined);
            return;
        }

        // Parse the time value
        const [hours, minutes] = timeValue.split(":").map(Number);

        // Create new date with selected date and current time
        const newDateTime = new Date(selectedDate);
        newDateTime.setHours(hours);
        newDateTime.setMinutes(minutes);
        newDateTime.setSeconds(0);
        newDateTime.setMilliseconds(0);

        setSelectedDateTime(newDateTime);
        setDate(newDateTime);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTimeValue = e.target.value;
        setTimeValue(newTimeValue);

        if (!selectedDateTime) return;

        const [hours, minutes] = newTimeValue.split(":").map(Number);
        const newDateTime = new Date(selectedDateTime);
        newDateTime.setHours(hours);
        newDateTime.setMinutes(minutes);

        setSelectedDateTime(newDateTime);
        setDate(newDateTime);
    };

    const handleClear = () => {
        setSelectedDateTime(undefined);
        setDate(undefined);
        setTimeValue("09:00");
    };

    const handleNow = () => {
        const now = new Date();
        setSelectedDateTime(now);
        setDate(now);
        setTimeValue(format(now, "HH:mm"));
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDateTime && "text-muted-foreground",
                        className,
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDateTime ? (
                        format(selectedDateTime, "PPP 'at' HH:mm")
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col sm:flex-row">
                    <Calendar
                        mode="single"
                        selected={selectedDateTime}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    <div className="border-t sm:border-t-0 sm:border-l border-border p-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Time</Label>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="time"
                                    value={timeValue}
                                    onChange={handleTimeChange}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNow}
                                className="w-full"
                            >
                                Now
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClear}
                                className="w-full"
                                disabled={!selectedDateTime}
                            >
                                Clear
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="w-full"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

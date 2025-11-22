import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Users,
    Bell,
    Zap,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient */}
               

                <div className="container mx-auto px-4 py-20 md:py-32">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Zap className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                                Event Management Made Simple
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                            Sync Your Events,{" "}
                            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Seamlessly
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Create, manage, and coordinate events effortlessly.
                            EventSync brings all your scheduling needs into one
                            powerful platform.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/auth">
                                <Button size="lg" className="gap-2 group">
                                    Get Started Free
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="/events">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Browse Events
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
                            <div className="space-y-1">
                                <div className="text-3xl md:text-4xl font-bold text-foreground">
                                    10K+
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Events Created
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl md:text-4xl font-bold text-foreground">
                                    5K+
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Active Users
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl md:text-4xl font-bold text-foreground">
                                    98%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Satisfaction
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-32 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Section Header */}
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                                Everything You Need
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Powerful features to help you manage events
                                efficiently and keep everyone in sync.
                            </p>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="group p-6 rounded-xl border bg-background hover:shadow-lg transition-all">
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Smart Scheduling
                                </h3>
                                <p className="text-muted-foreground">
                                    Intelligent event scheduling with conflict
                                    detection and automatic reminders.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group p-6 rounded-xl border bg-background hover:shadow-lg transition-all">
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Team Collaboration
                                </h3>
                                <p className="text-muted-foreground">
                                    Share events with your team and manage
                                    attendees with ease.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group p-6 rounded-xl border bg-background hover:shadow-lg transition-all">
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                                    <Bell className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Real-time Notifications
                                </h3>
                                <p className="text-muted-foreground">
                                    Get instant updates about event changes and
                                    upcoming schedules.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group p-6 rounded-xl border bg-background hover:shadow-lg transition-all">
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Quick Actions
                                </h3>
                                <p className="text-muted-foreground">
                                    Create and manage events with lightning-fast
                                    keyboard shortcuts.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group p-6 rounded-xl border bg-background hover:shadow-lg transition-all">
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Task Management
                                </h3>
                                <p className="text-muted-foreground">
                                    Organize tasks and to-dos alongside your
                                    event schedule.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="group p-6 rounded-xl border bg-background hover:shadow-lg transition-all">
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">
                                    Calendar Sync
                                </h3>
                                <p className="text-muted-foreground">
                                    Seamlessly integrate with Google Calendar,
                                    Outlook, and more.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                            Ready to Get Started?
                        </h2>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of users who are already managing
                            their events with EventSync.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link href="/auth">
                                <Button size="lg" className="gap-2 group">
                                    Start Free Today
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="lg" variant="outline">
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/60">
                                <Calendar className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-bold">EventSync</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2024 EventSync. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link
                                href="/about"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                About
                            </Link>
                            <Link
                                href="/contact"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Contact
                            </Link>
                            <Link
                                href="/privacy"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Privacy
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

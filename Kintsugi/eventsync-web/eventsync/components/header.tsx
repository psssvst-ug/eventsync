"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/mood-toggle";
import { useSession } from "@/lib/auth-client";
import { LogIn, Loader2, Box } from "lucide-react";

export function Header() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const user = session?.user;

    const handleAuthClick = () => {
        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/auth");
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full  bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo - Left */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 transition-all hover:opacity-80"
                    >
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Box className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            EventSync
                        </span>
                    </Link>

                    {/* Navigation - Center */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        <Link href="/events">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm font-medium"
                            >
                                Events
                            </Button>
                        </Link>
                        <Link href="/about">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm font-medium"
                            >
                                About
                            </Button>
                        </Link>
                        {user?.role === "user" && (
                            <Link href="/apply-manager">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-sm font-medium"
                                >
                                    Apply Manager
                                </Button>
                            </Link>
                        )}
                    </nav>

                    {/* Actions - Right */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button
                            variant={user ? "default" : "outline"}
                            size="sm"
                            onClick={handleAuthClick}
                            disabled={isPending}
                            className="gap-2 font-medium"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="hidden sm:inline">
                                        Loading...
                                    </span>
                                </>
                            ) : user ? (
                                <>
                                    <span className="hidden sm:inline">
                                        Dashboard
                                    </span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Sign In
                                    </span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

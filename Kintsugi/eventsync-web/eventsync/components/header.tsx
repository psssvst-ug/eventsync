"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/mood-toggle";
import { useSession } from "@/lib/auth-client";
import { LogIn, Loader2, Box, Menu, X } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const user = session?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleAuthClick = () => {
        if (user) {
            router.push("/dashboard");
        } else {
            router.push("/auth");
        }
    };

    const NavLinks = () => (
        <>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium w-full md:w-auto justify-start"
                >
                    Events
                </Button>
            </Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium w-full md:w-auto justify-start"
                >
                    Pricing
                </Button>
            </Link>
            {(user?.role === "manager" || user?.role === "admin") && (
                <Link href="/organizations" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium w-full md:w-auto justify-start"
                    >
                        Organizations
                    </Button>
                </Link>
            )}
            <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium w-full md:w-auto justify-start"
                >
                    About
                </Button>
            </Link>
            {user?.role === "user" && (
                <Link href="/apply-manager" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-medium w-full md:w-auto justify-start"
                    >
                        Apply Manager
                    </Button>
                </Link>
            )}
        </>
    );

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

                    {/* Navigation - Center (Desktop) */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                        <NavLinks />
                    </nav>

                    {/* Actions - Right */}
                    <div className="flex items-center gap-2">
                        {/* Mobile Menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="sm">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-64">
                                <div className="flex flex-col gap-2 mt-8">
                                    <NavLinks />
                                </div>
                            </SheetContent>
                        </Sheet>

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

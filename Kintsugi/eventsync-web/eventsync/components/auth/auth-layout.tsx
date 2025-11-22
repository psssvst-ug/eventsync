"use client";

import { useState } from "react";

import SignIn from "./sign-in-form";
import SignUp from "./sign-up-form";

import { Button } from "@/components/ui/button";

type AuthMode = "signin" | "signup";
type SignUpStep = "form" | "verification";

interface AuthLayoutProps {
    initialMode?: AuthMode;
}

export function AuthLayout({ initialMode = "signin" }: AuthLayoutProps = {}) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [signUpStep, setSignUpStep] = useState<SignUpStep>("form");

    // These handlers would be implemented with actual auth logic
    /*
    const router = useRouter();
    const [signUpEmail, setSignUpEmail] = useState("");

    const handleSignIn = (data: { email: string; password: string }) => {
        console.log("Sign in:", data);
        router.push("/onboarding");
    };

    const handleSignUp = (data: {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        console.log("Sign up:", data);
        setSignUpEmail(data.email);
        setSignUpStep("verification");
    };

    const handleEmailVerification = (code: string) => {
        console.log("Verification code:", code);
        router.push("/onboarding");
    };

    const handleBackToSignUp = () => {
        setSignUpStep("form");
    };

    const handleResendCode = async () => {
        console.log("Resending verification code to:", signUpEmail);
        return Promise.resolve();
    };

    const handleGoogleAuth = () => {
        console.log(mode === "signin" ? "Google sign-in" : "Google sign-up");
        router.push("/onboarding");
    };
    */

    return (
        <div className="flex min-h-screen">
            {/* Left Panel - Auth Form */}
            <div className="w-full flex items-center justify-center p-6 lg:p-12 overflow-y-auto scrollbar-hide relative z-10">
                <div className="w-full max-w-md">
                    {/* Logo & Header */}
                    {/* <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Box className="w-7 h-7 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    EventSync
                                </h1>
                                <p className="text-sm text-muted-foreground transition-all duration-300">
                                    {mode === "signin"
                                        ? "Welcome back"
                                        : "Create your account"}
                                </p>
                            </div>
                        </div>

                        {signUpStep === "form" && (
                            <div className="transition-all duration-300">
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    {mode === "signin"
                                        ? "Sign in to your account"
                                        : "Start your journey"}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {mode === "signin"
                                        ? "Continue your journey with us"
                                        : "Join us and bring your ideas to life"}
                                </p>
                            </div>
                        )}
                    </div> */}

                    {/* Toggle between Sign In and Sign Up - Smooth Rounded */}
                    {signUpStep === "form" && (
                        <div className="flex gap-2 p-1.5 bg-muted/30 backdrop-blur-sm rounded-full mb-6 border border-border/50">
                            <button
                                type="button"
                                onClick={() => setMode("signin")}
                                className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-500 ease-out ${
                                    mode === "signin"
                                        ? "bg-background text-foreground shadow-lg shadow-primary/10 border border-border/50 scale-105"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/20 scale-100"
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode("signup")}
                                className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-500 ease-out ${
                                    mode === "signup"
                                        ? "bg-background text-foreground shadow-lg shadow-primary/10 border border-border/50 scale-105"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/20 scale-100"
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {/* Forms Container */}
                    <div className="relative">
                        {/* Sign In Form */}
                        <div
                            className={`transition-all duration-300 ${
                                mode === "signin" && signUpStep === "form"
                                    ? "opacity-100 visible relative"
                                    : "opacity-0 invisible absolute top-0 left-0 right-0 pointer-events-none"
                            }`}
                        >
                            <SignIn />
                        </div>

                        {/* Sign Up Form */}
                        <div
                            className={`transition-all duration-300 ${
                                mode === "signup" && signUpStep === "form"
                                    ? "opacity-100 visible relative"
                                    : "opacity-0 invisible absolute top-0 left-0 right-0 pointer-events-none"
                            }`}
                        >
                            <SignUp />
                        </div>
                    </div>

                    {/* Alternative action link */}
                    {signUpStep === "form" && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-muted-foreground">
                                {mode === "signin"
                                    ? "Don't have an account? "
                                    : "Already have an account? "}
                                <Button
                                    type="button"
                                    variant="link"
                                    className="text-primary p-0 h-auto font-medium hover:underline"
                                    onClick={() => {
                                        setMode(
                                            mode === "signin"
                                                ? "signup"
                                                : "signin",
                                        );
                                        setSignUpStep("form");
                                    }}
                                >
                                    {mode === "signin" ? "Sign up" : "Sign in"}
                                </Button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

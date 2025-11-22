import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/header";

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "EventSync - Manage Your Events",
    description: "Create, manage, and sync your events seamlessly",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${outfit.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    defaultTheme="system"
                    storageKey="eventsync-theme"
                >
                    <ToastProvider position="top-right">
                        <Header />
                        {children}
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

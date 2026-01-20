"use client";

import { useState } from "react";
import { signIn, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Logo from "../navbar/Logo";

export default function UnifiedAuth() {
    const { data: session, isPending } = useSession();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signIn.username({
                username,
                password,
            });

            if (error) {
                const errorMessage = error.message || "Failed to sign in";
                if (errorMessage.includes("Invalid")) {
                    toast.error("Invalid credentials. Please try again.");
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.success("Signed in successfully");
                // Refresh the page to trigger session update and redirect
                window.location.href = "/";
            }
        } catch (err: any) {
            console.error("Sign in error:", err);
            toast.error("Unable to connect. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Checking authentication...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-card/80 border border-border/50 rounded-xl shadow-2xl backdrop-blur-md p-8">
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center flex flex-col items-center">
                        <div className="mb-4">
                            <Logo />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Admin Login</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Sign in to access the admin dashboard</p>
                    </div>
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Sign in
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

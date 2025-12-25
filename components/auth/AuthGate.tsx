"use client";

import { useSession } from "@/lib/auth-client";
import UnifiedAuth from "./UnifiedAuth";
import { usePathname } from "next/navigation";

interface AuthGateProps {
    children: React.ReactNode;
}

// Routes that don't require full verification
const PUBLIC_ROUTES = [
    "/login",
    "/sign-in", // Keep for legacy/middleware redirect safety
    "/sign-up",
    "/verify-phone",
];

export default function AuthGate({ children }: AuthGateProps) {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();

    const isPublicRoute = PUBLIC_ROUTES.some(route => {
        if (route === "/") return pathname === "/";
        return pathname.startsWith(route);
    });

    // Check if user is fully verified
    const isPhoneVerified = (session?.user as any)?.phoneVerified;

    // If session exists, they MUST be verified even for public routes (except auth routes)
    if (session) {
        if (!isPhoneVerified) {
            // Allow them to see /login without AuthGate interference (UnifiedAuth handles navigation inside)
            // But if they are on /login, UnifiedAuth is already rendered by the page.
            // If they are on Dashboard, AuthGate should render UnifiedAuth.

            const isAuthRoute = ["/login", "/sign-in", "/sign-up", "/verify-phone"].some(route => pathname.startsWith(route));

            if (isAuthRoute) {
                return <>{children}</>;
            }

            console.log("AuthGate: Authenticated but not verified. Enforcing verification UI.");
            return (
                <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="relative z-10 w-full max-w-md">
                        <UnifiedAuth />
                    </div>
                </div>
            );
        }
    }

    // If not logged in, allow public routes
    if (!session && isPublicRoute) {
        return <>{children}</>;
    }

    // If not logged in and private route (e.g. Dashboard)
    if (!session) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="relative z-10 w-full max-w-md">
                    <UnifiedAuth />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

"use client";

import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = [
    "/login",
];

export default function AuthGate({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isPending) {
            const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

            if (!session && !isPublicRoute) {
                router.push("/login");
            } else if (session && isPublicRoute) {
                router.push("/");
            }
        }
    }, [session, isPending, pathname, router]);

    return <>{children}</>;
}

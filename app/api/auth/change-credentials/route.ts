import { NextRequest, NextResponse } from "next/server";
import { updateAdminCredentials } from "@/lib/credentials";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        // Verify user is authenticated
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Verify user is admin
        if ((session.user as any).role !== "ADMIN") {
            return NextResponse.json(
                { success: false, error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { currentPassword, newUsername, newPassword } = body;

        if (!currentPassword || !newUsername || !newPassword) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const result = await updateAdminCredentials(
            currentPassword,
            newUsername,
            newPassword
        );

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error in change-credentials API:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

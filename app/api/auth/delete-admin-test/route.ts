import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Temporary endpoint to delete admin user for re-initialization
export async function DELETE(request: NextRequest) {
    try {
        // Delete all accounts for admin user
        await prisma.account.deleteMany({
            where: {
                user: {
                    username: 'admin',
                },
            },
        });

        // Delete admin user
        await prisma.user.deleteMany({
            where: {
                username: 'admin',
            },
        });

        return NextResponse.json({
            success: true,
            message: "Admin user deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting admin user:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete admin user" },
            { status: 500 }
        );
    }
}

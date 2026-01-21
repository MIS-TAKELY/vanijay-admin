import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { senMail } from "@/services/nodeMailer.services";

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';
const BACKUP_EMAIL = 'mailitttome@gmail.com';

/**
 * Initialize admin user using better-auth's internal password hashing
 * This endpoint will delete existing admin and recreate using better-auth signup
 */
export async function POST(request: NextRequest) {
    try {
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                username: DEFAULT_USERNAME,
            },
        });

        if (existingAdmin) {
            // Delete existing admin's accounts first
            await prisma.account.deleteMany({
                where: {
                    userId: existingAdmin.id,
                },
            });

            // Delete existing admin user
            await prisma.user.delete({
                where: {
                    id: existingAdmin.id,
                },
            });

            console.log('Existing admin user deleted');
        }

        // Use better-auth's signup endpoint to create user with properly hashed password
        const authBaseUrl = process.env.BETTER_AUTH_URL?.replace(/\/$/, '') || 'http://localhost:3002'; // Fallback for local dev if not set
        const signupResponse = await fetch(`${authBaseUrl}/api/auth/sign-up/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: `${DEFAULT_USERNAME}@vanijay.com`,
                password: DEFAULT_PASSWORD,
                name: 'Administrator',
                username: DEFAULT_USERNAME,
            }),
        });

        if (!signupResponse.ok) {
            const error = await signupResponse.json();
            throw new Error(`Signup failed: ${JSON.stringify(error)}`);
        }

        // Update user to set role and verification status
        await prisma.user.update({
            where: {
                username: DEFAULT_USERNAME,
            },
            data: {
                role: 'ADMIN',
                emailVerified: true,
                phoneVerified: true,
            },
        });

        console.log('Admin user created with default credentials via better-auth');

        // Send initial credentials backup
        try {
            await senMail(BACKUP_EMAIL, 'CREDENTIALS_BACKUP', {
                username: DEFAULT_USERNAME,
                password: DEFAULT_PASSWORD,
                timestamp: new Date().toISOString(),
                isInitial: true,
            });
        } catch (emailError) {
            console.error('Failed to send backup email:', emailError);
            // Don't fail the initialization if email fails
        }

        return NextResponse.json({
            success: true,
            message: "Admin user initialized successfully. Default credentials: username='admin', password='admin123'. A backup email has been sent.",
        });
    } catch (error) {
        console.error("Error initializing admin user:", error);
        return NextResponse.json(
            { success: false, error: "Failed to initialize admin user: " + (error as Error).message },
            { status: 500 }
        );
    }
}

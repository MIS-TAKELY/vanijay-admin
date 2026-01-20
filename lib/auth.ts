import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { username } from "better-auth/plugins";
import { senMail } from "@/services/nodeMailer.services";
import { AuthUser, GoogleProfile, FacebookProfile, TikTokProfile } from "@/types/auth";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        username(),
    ],
    advanced: {
        useSecureCookies: true,
    },
    emailVerification: {
        sendOnSignUp: false,
        autoSignInAfterVerification: false,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "ADMIN"
            },
            phoneVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
            otp: {
                type: "string",
                required: false,
            },
            otpExpiresAt: {
                type: "date",
                required: false,
            },
            firstName: {
                type: "string",
                required: false,
            },
            lastName: {
                type: "string",
                required: false,
            },
            avatarImageUrl: {
                type: "string",
                required: false,
            },
        }
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002",
    trustedOrigins: [
        "http://localhost:3002",
        "http://localhost:3001",
        "https://prashasana.vanijay.com"
    ]
});

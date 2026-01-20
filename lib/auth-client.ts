import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3002",

    plugins: [
        usernameClient()
    ]
})

export const { signIn, signUp, useSession, signOut, sendVerificationEmail } = authClient;


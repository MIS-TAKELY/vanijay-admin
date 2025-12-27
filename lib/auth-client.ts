import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NODE_ENV === "production" ? (process.env.BETTER_AUTH_URL): "http://localhost:3000",

    plugins: [
        usernameClient()
    ]
})

export const { signIn, signUp, useSession, signOut, sendVerificationEmail } = authClient;


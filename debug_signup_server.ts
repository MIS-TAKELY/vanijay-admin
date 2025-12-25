
import { auth } from "./lib/auth";
import { headers } from "next/headers";

async function debugSignup() {
    const email = `server_test_${Date.now()}@example.com`;
    const password = "password123";
    const name = "Server Test";
    const username = `server_test_${Date.now()}`;

    console.log("Attempting Direct Server Signup with:", { email, username });

    try {
        // Mock request context if needed, but signUpEmail usually works with simple params
        const res = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                username,
                firstName: "Server",
                lastName: "Test",
                // role: "ADMIN" // Omitted
            }
        });

        console.log("Signup Result:", res);
    } catch (error: any) {
        console.error("Signup Failed:");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Status:", error.status);
        console.error("Stack:", error.stack);
        if (error.cause) console.error("Cause:", error.cause);

        // If it's a BetterAuth error, it might have detailed 'body' or 'error' prop
        if (error.body) console.error("Error Body:", error.body);
    }
}

debugSignup();

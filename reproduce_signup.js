async function testSignup() {
    const email = `test_admin_${Date.now()}@example.com`;
    const password = "password123";
    const name = "Test Admin";
    const username = `test_admin_${Date.now()}`;

    console.log("Attempting signup with:", { email, username });

    try {
        const response = await fetch('http://localhost:3000/api/auth/sign-up/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                name,
                username,
                firstName: "Test",
                lastName: "Admin",
                // role: "ADMIN" // Intentionally omitted
            }),
        });

        // Try to parse JSON, if fails, print text
        let data;
        const text = await response.text();
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = text;
        }

        console.log("Status:", response.status);
        console.log("Response:", typeof data === 'object' ? JSON.stringify(data, null, 2) : data);

        if (!response.ok) {
            console.error("Signup failed!");
        } else {
            console.log("Signup successful!");
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

testSignup();

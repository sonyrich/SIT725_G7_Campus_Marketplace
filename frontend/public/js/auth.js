const API_URL = "http://localhost:3000/api/auth";

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const studentId = document.getElementById("studentId").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("registerMessage");

        if (password !== confirmPassword) {
            message.textContent = "Passwords do not match.";
            message.style.color = "red";
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    studentId,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message || "Registration successful!";
                message.style.color = "green";

                registerForm.reset();

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                message.textContent = data.message || "Registration failed.";
                message.style.color = "red";
            }

        } catch (error) {
            console.error("Registration error:", error);
            message.textContent = "Cannot connect to the server.";
            message.style.color = "red";
        }
    });
}

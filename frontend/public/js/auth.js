const API_URL = "http://localhost:3000/api/auth";

document.addEventListener("DOMContentLoaded", function () {

    // ======================================================
    // REGISTER
    // ======================================================

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const fullName = document.getElementById("fullName").value.trim();
            const email = document.getElementById("email").value.trim();
            const studentId = document.getElementById("studentId").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword =
                document.getElementById("confirmPassword").value;
            const message = document.getElementById("registerMessage");

            if (password !== confirmPassword) {
                message.textContent = "Passwords do not match.";
                message.style.color = "red";
                return;
            }

            try {
                const response = await fetch(API_URL + "/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullName: fullName,
                        email: email,
                        studentId: studentId,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    message.textContent =
                        data.message || "Registration successful!";
                    message.style.color = "green";

                    registerForm.reset();

                    setTimeout(function () {
                        window.location.href = "login.html";
                    }, 1500);
                } else {
                    message.textContent =
                        data.message || "Registration failed.";
                    message.style.color = "red";
                }

            } catch (error) {
                console.error("Registration error:", error);

                message.textContent =
                    "Cannot connect to the server. Please try again.";
                message.style.color = "red";
            }
        });
    }


    // ======================================================
    // LOGIN
    // ======================================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const email =
                document.getElementById("loginEmail").value.trim();

            const password =
                document.getElementById("loginPassword").value;

            const message =
                document.getElementById("loginMessage");

            try {
                const response = await fetch(API_URL + "/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {

                    message.textContent = "Login successful!";
                    message.style.color = "green";

                    localStorage.setItem(
                        "token",
                        data.data.token
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.data.user)
                    );

                    setTimeout(function () {
                        window.location.href = "index.html";
                    }, 1000);

                } else {

                    message.textContent =
                        data.message || "Invalid email or password.";

                    message.style.color = "red";
                }

            } catch (error) {

                console.error("Login error:", error);

                message.textContent =
                    "Cannot connect to the server. Please try again.";

                message.style.color = "red";
            }
        });
    }

});
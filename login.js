
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("login-form");
        const error = document.getElementById("form-error");

        if (!form || !error) {
            console.error("Login form or error element not found!");
            return;
        }

        form.addEventListener("submit", async function (event) {

            event.preventDefault();

            error.hidden = true;
            error.textContent = "";

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            // Check empty fields
            if (email === "" || password === "") {
                error.textContent = "Please enter email and password.";
                error.hidden = false;
                return;
            }

            try {

                // Send login details to PHP
                const response = await fetch("login.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                // Receive PHP response
                const result = await response.json();

                if (response.ok && result.success) {

                    alert("Login successful!");

                    // Redirect to dashboard
                    window.location.href = "user-dashboard.html";

                } else {

                    error.textContent =
                        result.message || "Invalid email or password.";

                    error.hidden = false;
                }

            } catch (err) {

                console.error("Login error:", err);

                error.textContent =
                    "Cannot connect to the server. Check XAMPP and PHP.";

                error.hidden = false;
            }

        });

    });

})();


(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        const form = document.getElementById("register-form");
        const error = document.getElementById("form-error");
        const success = document.getElementById("form-success");

        if (!form || !error || !success) {
            console.error("Registration form elements not found!");
            return;
        }

        form.addEventListener("submit", async function (event) {

            event.preventDefault();

            error.hidden = true;
            success.hidden = true;

            const name = document.getElementById("full-name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirm = document.getElementById("confirm-password").value;

            // Check empty fields
            if (!name || !email || !password || !confirm) {
                error.textContent = "Please fill in all fields.";
                error.hidden = false;
                return;
            }

            // Check password length
            if (password.length < 8) {
                error.textContent =
                    "Password must be at least 8 characters.";
                error.hidden = false;
                return;
            }

            // Confirm password
            if (password !== confirm) {
                error.textContent = "Passwords do not match.";
                error.hidden = false;
                return;
            }

            try {

                // Send user data to PHP
                const response = await fetch("register.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        confirm: confirm
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {

                    success.textContent = result.message;
                    success.hidden = false;

                    form.reset();

                    // Redirect to login page
                    window.location.href = "login.html";

                } else {

                    error.textContent =
                        result.message || "Registration failed.";

                    error.hidden = false;
                }

            } catch (err) {

                console.error("Registration error:", err);

                error.textContent =
                    "Cannot connect to the server. Check XAMPP.";

                error.hidden = false;
            }

        });

    });

})();

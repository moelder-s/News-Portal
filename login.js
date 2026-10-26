
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. DAY MODE & NIGHT MODE
    // ==========================================

    const themeButton = document.getElementById("theme-toggle");
    const themeLabel = document.querySelector(".toggle-label");
    const root = document.documentElement;

    function changeTheme(theme) {

        // Apply theme to the entire page
        root.setAttribute("data-theme", theme);

        // FIX: Show the correct current theme name
        if (themeLabel) {
            themeLabel.textContent =
                theme === "dark" ? "Night" : "Day";
        }

        // Update switch position and accessibility
        if (themeButton) {
            themeButton.setAttribute(
                "aria-pressed",
                String(theme === "dark")
            );

            themeButton.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Switch to Day Mode"
                    : "Switch to Night Mode"
            );
        }
    }

    // DEFAULT: Always start in Day Mode
    changeTheme("light");

    // Theme toggle
    if (themeButton) {
        themeButton.addEventListener("click", function () {

            const currentTheme = root.getAttribute("data-theme");

            if (currentTheme === "light") {
                changeTheme("dark");
            } else {
                changeTheme("light");
            }
        });
    }


    // ==========================================
    // 2. MOBILE NAVIGATION
    // ==========================================

    const menuButton = document.getElementById("nav-burger");
    const nav = document.getElementById("main-nav");

    if (menuButton && nav) {

        menuButton.addEventListener("click", function () {

            nav.classList.toggle("open");

            const isOpen = nav.classList.contains("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close menu" : "Open menu"
            );
        });

        nav.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                nav.classList.remove("open");

                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open menu");
            });
        });
    }


    // ==========================================
    // 3. LOGIN FORM VALIDATION + PHP/MYSQL
    // ==========================================

    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("form-error");

    if (loginForm && errorMessage) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Clear previous messages
            errorMessage.textContent = "";
            errorMessage.hidden = true;

            // Check empty fields
            if (email === "" || password === "") {

                errorMessage.textContent =
                    "Please enter your email and password.";

                errorMessage.hidden = false;
                return;
            }

            // Validate email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                errorMessage.textContent =
                    "Please enter a valid email address.";

                errorMessage.hidden = false;
                return;
            }

            const loginButton =
                loginForm.querySelector('button[type="submit"]');

            if (loginButton) {
                loginButton.disabled = true;
                loginButton.textContent = "Logging in...";
            }

            try {

                // Send login details to PHP
                const response = await fetch("login.php", {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "same-origin",

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {

                    // Login successful
                    window.location.href = "home.php";
                    return;

                } else {

                    errorMessage.textContent =
                        result.message || "Invalid email or password.";

                    errorMessage.hidden = false;
                }

            } catch (error) {

                console.error("Login error:", error);

                errorMessage.textContent =
                    "Cannot connect to the server. Please check XAMPP.";

                errorMessage.hidden = false;

            } finally {

                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = "Log in";
                }
            }

        });
    }

});

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // Mobile menu
    const burger = document.getElementById("nav-burger");
    const nav = document.getElementById("main-nav");
    if (burger && nav) {
        burger.addEventListener("click", function () {
            const open = nav.classList.toggle("open");
            burger.setAttribute("aria-expanded", String(open));
            burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("open");
                burger.setAttribute("aria-expanded", "false");
                burger.setAttribute("aria-label", "Open menu");
            });
        });
    }

    const faculty = document.getElementById('faculty');
    const course = document.getElementById('course');
    const options = {"Faculty of Computing": ["Computer Science", "Software Engineering", "Information Technology", "Data Science", "Other course"], "Faculty of Business": ["Business Management", "Accounting and Finance", "Marketing Management", "Human Resource Management", "Other course"], "Faculty of Engineering": ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering", "Other course"], "Faculty of Science": ["Biomedical Science", "Public Health", "Other course"], "Other": ["Other course"]};
    faculty?.addEventListener('change', () => {
      course.replaceChildren(new Option('Select your course', ''));
      (options[faculty.value] || []).forEach(name => course.add(new Option(name, name)));
      course.disabled = !faculty.value;
    });

    // Register via PHP/MySQL (the server must implement register.php).
    const form = document.getElementById("register-form");
    const errorBox = document.getElementById("form-error");
    const successBox = document.getElementById("form-success");
    if (!form || !errorBox || !successBox) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        errorBox.hidden = true;
        successBox.hidden = true;
        errorBox.textContent = "";
        successBox.textContent = "";

        const full_name = document.getElementById("full-name").value.trim();
        const emailInput = document.getElementById("email");
        const email = emailInput.value.trim().toLowerCase();
        const selectedFaculty = faculty?.value || '';
        const selectedCourse = course?.value || '';
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm-password").value;
        const button = form.querySelector('button[type="submit"]');

        function showError(message) {
            errorBox.textContent = message;
            errorBox.hidden = false;
        }

        if (!full_name || !email || !password || !confirm) {
            showError("Please fill in all fields.");
            return;
        }
        if (!selectedFaculty || !selectedCourse) {
            showError("Please select your faculty and course.");
            return;
        }
        if (!emailInput.checkValidity()) {
            showError("Please enter a valid email address.");
            return;
        }
        if (password.length < 8) {
            showError("Password must contain at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            showError("Passwords do not match.");
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = "Creating account...";
        }
        try {
            const response = await fetch("register.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ full_name, email, password, faculty: selectedFaculty, course: selectedCourse })
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                showError(result.message || "Registration failed. Please try again.");
                return;
            }
            successBox.textContent = "Account created! You can now log in.";
            successBox.hidden = false;
            form.reset();
            if (button) button.textContent = "Account created";
            // User can use the visible Log in link to continue.
        } catch (error) {
            console.error("Registration request failed:", error);
            showError("Cannot connect to register.php. Open the project through XAMPP, not file:///.");
        } finally {
            if (button) {
                button.disabled = false;
                if (button.textContent !== "Account created") button.textContent = "Create account";
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    var themeToggle = document.getElementById("theme-toggle");
    var themeLabel = document.querySelector(".toggle-label");
    var form = document.getElementById("pw-form");
    var message = document.getElementById("msg");

    // ==============================
    // DAY / NIGHT THEME
    // Always opens in Day mode. The toggle switches to Night.
    // ==============================
    function setTheme(theme) {
        var isDay = theme === "light";

        document.body.classList.toggle("light-mode", isDay);

        themeLabel.textContent = isDay ? "Day" : "Night";
        themeToggle.setAttribute("aria-pressed", String(!isDay));
        themeToggle.setAttribute(
            "aria-label",
            isDay ? "Switch to dark mode" : "Switch to light mode"
        );
    }

    setTheme("light");

    themeToggle.addEventListener("click", function () {
        var isDay = document.body.classList.contains("light-mode");
        setTheme(isDay ? "dark" : "light");
    });

    // ==============================
    // PASSWORD FORM CHECK (HTML + JS only, nothing is saved)
    // ==============================
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var currentPassword = document.getElementById("current").value;
        var newPassword = document.getElementById("new").value;
        var confirmPassword = document.getElementById("confirm").value;

        var errorMessage = "";

        if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
            errorMessage = "Please fill in all the fields.";
        } else if (newPassword.length < 8) {
            errorMessage = "New password must be at least 8 characters.";
        } else if (newPassword === currentPassword) {
            errorMessage = "New password must be different from the current password.";
        } else if (newPassword !== confirmPassword) {
            errorMessage = "New passwords do not match.";
        }

        if (errorMessage) {
            message.textContent = errorMessage;
            message.className = "msg err";
        } else {
            message.textContent = "Password updated successfully.";
            message.className = "msg ok";
            form.reset();
        }
    });
});
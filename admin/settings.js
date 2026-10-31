document.addEventListener("DOMContentLoaded", function () {
    var themeToggle = document.getElementById("themeToggle");
    var themeLabel = document.getElementById("themeLabel");
    var form = document.getElementById("pw-form");
    var message = document.getElementById("msg");

    // ==============================
    // DAY / NIGHT THEME
    // Always opens in Day mode. The toggle switches to Night.
    // Only the header and glass cards change, the background stays the same.
    // ==============================
    function setTheme(night) {
        document.body.classList.toggle("night", night);
        document.body.classList.toggle("day", !night);

        themeLabel.textContent = night ? "Night" : "Day";
        themeToggle.setAttribute("aria-pressed", String(night));
    }

    setTheme(false);

    themeToggle.addEventListener("click", function () {
        var isNight = document.body.classList.contains("night");
        setTheme(!isNight);
    });

    // ==============================
    // FOOTER YEAR
    // ==============================
    document.getElementById("year").textContent = new Date().getFullYear();

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
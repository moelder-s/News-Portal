// ============================================================
// Student registration — front-end demo only.
// Saves new accounts into localStorage purely so login.js has
// something to check against in the browser. Replace this with a
// real POST /register call once a backend exists — never store
// real passwords in localStorage in production.
// ============================================================

(function () {
    "use strict";

    var USERS_KEY = "nig-demo-users";

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { /* unavailable */ }
    }

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("register-form");
        if (!form) return;

        var error = document.getElementById("form-error");
        var success = document.getElementById("form-success");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            error.hidden = true;
            success.hidden = true;

            var name = document.getElementById("full-name").value.trim();
            var email = document.getElementById("email").value.trim().toLowerCase();
            var password = document.getElementById("password").value;
            var confirm = document.getElementById("confirm-password").value;

            if (password.length < 8) {
                error.textContent = "Password must be at least 8 characters.";
                error.hidden = false;
                return;
            }
            if (password !== confirm) {
                error.textContent = "Passwords don't match.";
                error.hidden = false;
                return;
            }

            var users = getUsers();
            if (users.some(function (u) { return u.email === email; })) {
                error.textContent = "An account with that email already exists.";
                error.hidden = false;
                return;
            }

            users.push({ name: name, email: email, password: password });
            saveUsers(users);

            success.textContent = "Account created — redirecting to log in\u2026";
            success.hidden = false;
            setTimeout(function () { window.location.href = "login.html"; }, 900);
        });
    });
})();

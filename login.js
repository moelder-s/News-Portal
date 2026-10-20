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

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("login-form");
        if (!form) return;

        var error = document.getElementById("form-error");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            error.hidden = true;

            var email = document.getElementById("email").value.trim().toLowerCase();
            var password = document.getElementById("password").value;

            var match = getUsers().find(function (u) {
                return u.email === email && u.password === password;
            });

            if (!match) {
                error.textContent = "Invalid email or password.";
                error.hidden = false;
                return;
            }

            try { localStorage.setItem("nig-current-user", match.email); } catch (e) { /* unavailable */ }
            window.location.href = "user-dashboard.html";
        });
    });
})();

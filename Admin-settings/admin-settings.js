// ============================================================
// News In Green — Admin shared behaviour
// Theme toggle, mobile sidebar, generic modal open/close, logout.
// ============================================================

(function () {
    "use strict";

    /* ---------- Mobile sidebar ---------- */

    function initSidebar() {
        var burger = document.getElementById("sidebar-burger");
        var sidebar = document.getElementById("sidebar");
        if (!burger || !sidebar) return;

        burger.addEventListener("click", function (e) {
            e.stopPropagation();
            var isOpen = sidebar.classList.toggle("is-open");
            burger.setAttribute("aria-expanded", String(isOpen));
        });
        document.addEventListener("click", function (e) {
            if (sidebar.classList.contains("is-open") &&
                !sidebar.contains(e.target) && e.target !== burger) {
                sidebar.classList.remove("is-open");
                burger.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* ---------- Generic modal helpers ----------
       Any element with [data-open-modal="id"] opens #id.
       Any element with [data-close-modal] closes its containing overlay. */

    function initModals() {
        document.querySelectorAll("[data-open-modal]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var modal = document.getElementById(btn.getAttribute("data-open-modal"));
                if (modal) modal.classList.add("is-open");
            });
        });
        document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var overlay = btn.closest(".modal-overlay");
                if (overlay) overlay.classList.remove("is-open");
            });
        });
        document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
            overlay.addEventListener("click", function (e) {
                if (e.target === overlay) overlay.classList.remove("is-open");
            });
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                document.querySelectorAll(".modal-overlay.is-open").forEach(function (o) {
                    o.classList.remove("is-open");
                });
            }
        });
    }

    /* ---------- Logout ---------- */

    function initLogout() {
        var logout = document.getElementById("logout-link");
        if (!logout) return;
        logout.addEventListener("click", function (e) {
            e.preventDefault();
            // Demo only: no session to clear yet. Once auth exists, clear
            // the session/token here before redirecting.
            window.location.href = "admin-login.html";
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initSidebar();
        initModals();
        initLogout();
    });
})();


// ============================================================
// Admin — Settings (change password)
// Demo-only: reads/writes the password to localStorage under the
// same key admin-login.js checks against. Replace with a real
// PATCH /admin/password call (with server-side current-password
// verification) once a backend exists.
// ============================================================

(function () {
    "use strict";

    var PASSWORD_KEY = "nig-admin-password";
    var DEFAULT_PASSWORD = "DISABLED_SERVER_AUTH";

    function getStoredPassword() {
        try {
            return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
        } catch (e) {
            return DEFAULT_PASSWORD;
        }
    }

    function setStoredPassword(value) {
        try { localStorage.setItem(PASSWORD_KEY, value); } catch (e) { /* unavailable */ }
    }

    document.addEventListener("DOMContentLoaded", function () {
        var form = document.getElementById("password-form");
        var error = document.getElementById("settings-error");
        var success = document.getElementById("settings-success");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            error.hidden = true;
            success.hidden = true;

            var current = document.getElementById("current-password").value;
            var next = document.getElementById("new-password").value;
            var confirm = document.getElementById("confirm-password").value;

            if (current !== getStoredPassword()) {
                error.textContent = "Current password is incorrect.";
                error.hidden = false;
                return;
            }
            if (next.length < 6) {
                error.textContent = "New password must be at least 6 characters.";
                error.hidden = false;
                return;
            }
            if (next !== confirm) {
                error.textContent = "New passwords don't match.";
                error.hidden = false;
                return;
            }

            setStoredPassword(next);
            form.reset();
            success.textContent = "Password updated. Use it next time you log in.";
            success.hidden = false;
        });
    });
})();
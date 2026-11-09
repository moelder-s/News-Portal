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
// Admin — Announcements
// Front-end only: adds a row on publish, with a Remove action.
// Wire the form up to your backend (e.g. PATCH articles.featured)
// when ready.
// ============================================================

(function () {
    "use strict";

    var CATEGORY_LABEL = { academic: "Academic", events: "Events", sports: "Sports", general: "General" };

    document.addEventListener("DOMContentLoaded", function () {
        var body = document.getElementById("announcements-body");
        var form = document.getElementById("announcement-form");
        var modal = document.getElementById("announcement-modal");

        function clearEmptyRow() {
            var empty = body.querySelector(".empty-row");
            if (empty) empty.remove();
        }

        function restoreEmptyRowIfNeeded() {
            if (!body.children.length) {
                body.innerHTML = '<tr class="empty-row"><td colspan="4">No featured or breaking items right now.</td></tr>';
            }
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            var title = document.getElementById("announcement-title").value.trim() || "Untitled";
            var type = document.getElementById("announcement-type").value;
            var category = document.getElementById("announcement-category").value;

            clearEmptyRow();
            var tr = document.createElement("tr");
            var badgeClass = type === "breaking" ? "badge-breaking" : "badge-featured";
            var badgeLabel = type === "breaking" ? "Breaking" : "Featured";

            tr.innerHTML =
                "<td></td>" +
                '<td><span class="badge ' + badgeClass + '">' + badgeLabel + "</span></td>" +
                '<td><span class="badge badge-category">' + CATEGORY_LABEL[category] + "</span></td>" +
                '<td class="row-actions"><button class="btn btn-danger btn-sm" type="button" data-action="remove">Remove</button></td>';
            tr.children[0].textContent = title;
            body.appendChild(tr);

            tr.querySelector('[data-action="remove"]').addEventListener("click", function () {
                tr.remove();
                restoreEmptyRowIfNeeded();
            });

            form.reset();
            modal.classList.remove("is-open");
        });
    });
})();

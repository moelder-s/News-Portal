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
// Admin — Categories
// Front-end only: adds, renames, and deletes rows in the table.
// Wire this up to POST/PUT/DELETE /categories when a backend exists.
// ============================================================

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var body = document.getElementById("categories-body");
        var form = document.getElementById("category-form");
        var nameInput = document.getElementById("category-name");
        var modal = document.getElementById("category-modal");
        var modalTitle = document.getElementById("category-modal-title");
        var renamingRow = null;

        function bindRowActions(tr) {
            tr.querySelector('[data-action="delete"]').addEventListener("click", function () {
                tr.remove();
            });
            tr.querySelector('[data-action="rename"]').addEventListener("click", function () {
                renamingRow = tr;
                modalTitle.textContent = "Rename category";
                nameInput.value = tr.children[0].textContent;
                modal.classList.add("is-open");
            });
        }

        // Wire up the rows already in the page.
        body.querySelectorAll("tr").forEach(bindRowActions);

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var name = nameInput.value.trim();
            if (!name) return;

            if (renamingRow) {
                renamingRow.children[0].textContent = name;
                renamingRow = null;
            } else {
                var tr = document.createElement("tr");
                tr.innerHTML =
                    "<td></td>" +
                    '<td class="cell-muted">0</td>' +
                    '<td class="row-actions">' +
                        '<button class="btn btn-ghost btn-sm" type="button" data-action="rename">Rename</button>' +
                        '<button class="btn btn-danger btn-sm" type="button" data-action="delete">Delete</button>' +
                    "</td>";
                tr.children[0].textContent = name;
                body.appendChild(tr);
                bindRowActions(tr);
            }

            form.reset();
            modalTitle.textContent = "New category";
            modal.classList.remove("is-open");
        });
    });
})();

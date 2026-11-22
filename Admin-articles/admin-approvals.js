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
// Admin — Approvals
// Front-end only: opens a preview modal for a pending submission and
// removes the row on Approve/Reject. Wire the two buttons up to
// PATCH /articles/:id { status: 'approved' | 'rejected' } when a
// backend exists.
// ============================================================

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        var body = document.getElementById("approvals-body");
        var modal = document.getElementById("preview-modal");
        var titleEl = document.getElementById("preview-title");
        var metaEl = document.getElementById("preview-meta");
        var contentEl = document.getElementById("preview-content");
        var approveBtn = document.getElementById("preview-approve");
        var rejectBtn = document.getElementById("preview-reject");

        var activeRow = null;

        function restoreEmptyRowIfNeeded() {
            if (!body.children.length) {
                body.innerHTML = '<tr class="empty-row"><td colspan="5">Nothing waiting for review right now.</td></tr>';
            }
        }

        body.addEventListener("click", function (e) {
            var btn = e.target.closest('[data-action="review"]');
            if (!btn) return;

            activeRow = btn.closest("tr");
            titleEl.textContent = btn.getAttribute("data-title") || "Untitled";
            metaEl.textContent = btn.getAttribute("data-meta") || "";
            contentEl.textContent = btn.getAttribute("data-content") || "";
            modal.classList.add("is-open");
        });

        function resolve() {
            if (activeRow) {
                activeRow.remove();
                activeRow = null;
                restoreEmptyRowIfNeeded();
            }
            modal.classList.remove("is-open");
        }

        approveBtn.addEventListener("click", resolve);
        rejectBtn.addEventListener("click", resolve);
    });
})();

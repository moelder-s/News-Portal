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
// Admin — Articles
// Front-end only: renders new rows into the table on submit and
// supports deleting a row. Wire the form's submit handler up to
// your backend (POST /articles, PUT /articles/:id) when ready.
// ============================================================

(function () {
    "use strict";

    var CATEGORY_LABEL = { academic: "Academic", events: "Events", sports: "Sports", general: "General" };
    var STATUS_LABEL = { approved: "Approved", pending: "Pending", rejected: "Rejected" };

    document.addEventListener("DOMContentLoaded", function () {
        var body = document.getElementById("articles-body");
        var form = document.getElementById("article-form");
        var modal = document.getElementById("article-modal");
        var modalTitle = document.getElementById("article-modal-title");

        function clearEmptyRow() {
            var empty = body.querySelector(".empty-row");
            if (empty) empty.remove();
        }

        function restoreEmptyRowIfNeeded() {
            if (!body.children.length) {
                body.innerHTML = '<tr class="empty-row"><td colspan="6">No articles yet — create the first one.</td></tr>';
            }
        }

        function addRow(data) {
            clearEmptyRow();
            var tr = document.createElement("tr");
            tr.innerHTML =
                "<td>" + escapeHtml(data.title) + "</td>" +
                '<td><span class="badge badge-category">' + CATEGORY_LABEL[data.category] + "</span></td>" +
                '<td class="cell-muted">You</td>' +
                '<td><span class="badge badge-' + data.status + '">' + STATUS_LABEL[data.status] + "</span></td>" +
                '<td class="cell-muted">Just now</td>' +
                '<td class="row-actions">' +
                    '<button class="btn btn-ghost btn-sm" type="button" data-action="edit">Edit</button>' +
                    '<button class="btn btn-danger btn-sm" type="button" data-action="delete">Delete</button>' +
                "</td>";
            body.appendChild(tr);

            tr.querySelector('[data-action="delete"]').addEventListener("click", function () {
                tr.remove();
                restoreEmptyRowIfNeeded();
            });
            tr.querySelector('[data-action="edit"]').addEventListener("click", function () {
                modalTitle.textContent = "Edit article";
                document.getElementById("article-title").value = data.title;
                document.getElementById("article-category").value = data.category;
                document.getElementById("article-status").value = data.status;
                document.getElementById("article-content").value = data.content;
                modal.classList.add("is-open");
            });
        }

        function escapeHtml(str) {
            var div = document.createElement("div");
            div.textContent = str;
            return div.innerHTML;
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            addRow({
                title: document.getElementById("article-title").value.trim() || "Untitled article",
                category: document.getElementById("article-category").value,
                status: document.getElementById("article-status").value,
                content: document.getElementById("article-content").value
            });
            form.reset();
            modalTitle.textContent = "New article";
            modal.classList.remove("is-open");
        });
    });
})();
// ============================================================
// News In Green — homepage (home.html)
// Theme toggle, time-of-day greeting, and the "Browse:" pills that
// filter the tiles. Uses the same "nig-theme" key as the other
// pages, so the day/night choice carries across the whole site.
// ============================================================

(function () {
    "use strict";

    var root = document.documentElement;
    var THEME_KEY = "nig-theme";

    /* ---------- Theme (day / night) ---------- */

    function syncThemeButton() {
        var btn = document.getElementById("theme-toggle");
        if (!btn) return;
        var isDark = root.getAttribute("data-theme") === "dark";
        btn.setAttribute("aria-pressed", String(isDark));
    }

    function initTheme() {
        syncThemeButton();
        var btn = document.getElementById("theme-toggle");
        if (!btn) return;
        btn.addEventListener("click", function () {
            var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", next);
            try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
            syncThemeButton();
        });
    }

    /* ---------- Greeting ---------- */

    function initGreeting() {
        var el = document.getElementById("greeting-text");
        if (!el) return;

        var hour = new Date().getHours();
        var greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

        var email = null;
        try { email = localStorage.getItem("nig-current-user"); } catch (e) { /* storage unavailable */ }

        el.textContent = email ? greeting + ", " + email.split("@")[0] : greeting;
    }

    /* ---------- Browse pills -> filter tiles ---------- */

    function initBrowse() {
        var pills = document.querySelectorAll(".pill");
        var tiles = document.querySelectorAll(".tile");
        var title = document.getElementById("page-title");
        if (!pills.length) return;

        pills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                pills.forEach(function (p) {
                    p.classList.remove("is-active");
                    p.setAttribute("aria-pressed", "false");
                });
                pill.classList.add("is-active");
                pill.setAttribute("aria-pressed", "true");

                var filter = pill.getAttribute("data-filter");
                if (title) title.textContent = pill.getAttribute("data-title") || title.textContent;

                tiles.forEach(function (tile) {
                    var show = filter === "all" || tile.getAttribute("data-group") === filter;
                    tile.hidden = !show;
                    if (show) {
                        // replay the entrance animation on the tiles that appear
                        tile.style.animation = "none";
                        void tile.offsetWidth;
                        tile.style.animation = "";
                    }
                });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        initGreeting();
        initBrowse();
    });
})();

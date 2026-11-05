// ============================================================
// News In Green — homepage (home.html)
// Theme toggle, time-of-day greeting, and the "Browse:" pills that
// filter the tiles. Uses the same "nig-theme" key as the other
// pages, so the day/night choice carries across the whole site.
// ============================================================

(function () {
    "use strict";

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


    /* Keep the fixed glass header visible without overlapping the hero.
       Measure after site-shared.js constructs the navigation; remeasure on resize. */
    function initFixedHomeHeader() {
        var header = document.querySelector('body > header.topbar.portal-unified-header');
        var spacer = document.querySelector('body > .nig-home-header-spacer');
        if (!header || !spacer) return;
        function syncHeaderSpace() {
            var headerHeight = header.getBoundingClientRect().height;
            var clearance = window.matchMedia('(max-width: 650px)').matches ? 4 : 6;
            // Leave the same visual separation as the original floating header.
            spacer.style.setProperty('--nig-home-header-space', Math.ceil(headerHeight + clearance) + 'px');
        }
        syncHeaderSpace();
        window.addEventListener('resize', syncHeaderSpace, { passive: true });
        if ('ResizeObserver' in window) {
            new ResizeObserver(syncHeaderSpace).observe(header);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        // Guest-only Login button in the Home header (not on other pages).
        if (window.NIG_LOGGED_IN === false) {
            var actions = document.querySelector('body > header.portal-unified-header .portal-unified-actions');
            if (actions && !actions.querySelector('.nig-home-login')) {
                var login = document.createElement('a');
                login.className = 'nig-home-login';
                login.href = 'login.html';
                login.textContent = 'Log in';
                login.setAttribute('aria-label', 'Log in to News In Green');
                actions.prepend(login);
            }
        }
        initFixedHomeHeader();
        initGreeting();
        initBrowse();
    });
})();

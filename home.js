(function () {
    "use strict";

    // =====================================
    // NEWS IN GREEN - HOME PAGE JAVASCRIPT
    // =====================================

    var root = document.documentElement;
    var THEME_KEY = "nig-theme";


    // =====================================
    // 1. NIGHT / DAY MODE
    // =====================================

    function syncThemeButton() {

        var btn = document.getElementById("theme-toggle");

        if (!btn) return;

        var isDark =
            root.getAttribute("data-theme") === "dark";

        btn.setAttribute("aria-pressed", String(isDark));

        btn.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    }


    function initTheme() {

        var savedTheme = null;

        try {
            savedTheme = localStorage.getItem(THEME_KEY);
        } catch (e) {
            console.log("Theme storage unavailable");
        }

        // Use saved theme when available
        if (savedTheme === "dark" || savedTheme === "light") {
            root.setAttribute("data-theme", savedTheme);
        }

        syncThemeButton();

        var btn = document.getElementById("theme-toggle");

        if (!btn) return;

        btn.addEventListener("click", function () {

            var currentTheme =
                root.getAttribute("data-theme");

            var nextTheme =
                currentTheme === "dark" ? "light" : "dark";

            root.setAttribute("data-theme", nextTheme);

            try {
                localStorage.setItem(THEME_KEY, nextTheme);
            } catch (e) {
                console.log("Could not save theme");
            }

            syncThemeButton();

        });
    }


    // =====================================
    // 2. USER GREETING
    // =====================================

    function initGreeting() {

        var greetingElement =
            document.getElementById("greeting-text");

        if (!greetingElement) return;

        // The logged-in user's name is already
        // displayed securely by home.php.
        // Do not replace it with localStorage data.

        // Example from PHP:
        // Hello, Anura
        // Hello, Guest

    }


    // =====================================
    // 3. CATEGORY FILTERING
    // =====================================

    function initBrowse() {

        var pills = document.querySelectorAll(".pill");

        var tiles = document.querySelectorAll(".tile");

        var title = document.getElementById("page-title");

        if (!pills.length) return;


        pills.forEach(function (pill) {

            pill.addEventListener("click", function () {

                // Remove active state from all buttons
                pills.forEach(function (p) {

                    p.classList.remove("is-active");

                    p.setAttribute("aria-pressed", "false");

                });


                // Activate selected button
                pill.classList.add("is-active");

                pill.setAttribute("aria-pressed", "true");


                // Get selected category
                var filter = pill.getAttribute("data-filter");


                // Update title
                if (title) {

                    title.textContent =
                        pill.getAttribute("data-title") ||
                        "News Portal";

                }


                // Filter cards
                tiles.forEach(function (tile) {

                    var group =
                        tile.getAttribute("data-group");

                    var show =
                        filter === "all" ||
                        group === filter;

                    tile.hidden = !show;


                    // Restart animation for visible cards
                    if (show) {

                        tile.style.animation = "none";

                        void tile.offsetWidth;

                        tile.style.animation = "";

                    }

                });

            });

        });

    }


    // =====================================
    // 4. INITIALIZE HOME PAGE
    // =====================================

    document.addEventListener("DOMContentLoaded", function () {

        initTheme();

        initGreeting();

        initBrowse();

    });

})();


// ==========================================
// NEWS IN GREEN - USER DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    // ==========================================
    // 1. DAY MODE & NIGHT MODE
    // ==========================================

    const root = document.documentElement;
    const themeButton = document.getElementById("theme-toggle");
    const themeLabel = document.querySelector(".toggle-label");

    function changeTheme(theme) {

        const isDark = theme === "dark";

        // Apply the theme to the page
        root.setAttribute(
            "data-theme",
            isDark ? "dark" : "light"
        );

        // Update theme name
        if (themeLabel) {
            themeLabel.textContent = isDark ? "Night" : "Day";
        }

        // Update switch position
        if (themeButton) {
            themeButton.setAttribute(
                "aria-pressed",
                String(isDark)
            );

            themeButton.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to day mode"
                    : "Switch to night mode"
            );
        }
    }

    // DEFAULT - DAY MODE
    changeTheme("light");

    // Change theme on click
    if (themeButton) {

        themeButton.addEventListener("click", function () {

            const currentTheme =
                root.getAttribute("data-theme");

            if (currentTheme === "light") {
                changeTheme("dark");
            } else {
                changeTheme("light");
            }

        });
    }


    // ==========================================
    // 2. MOBILE NAVIGATION
    // ==========================================

    const menuButton = document.getElementById("nav-burger");
    const nav = document.getElementById("main-nav");

    if (menuButton && nav) {

        menuButton.addEventListener("click", function () {

            const isOpen = nav.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Close menu" : "Open menu"
            );

        });

        // Close menu after clicking a navigation link
        nav.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                nav.classList.remove("open");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuButton.setAttribute(
                    "aria-label",
                    "Open menu"
                );

            });
        });
    }

    // ==========================================
    // 3. DASHBOARD DATA
    // ==========================================

    // The statistics and sample submissions
    // currently come from dashboard.html.
    //
    // Connect these to your PHP/MySQL backend
    // when you are ready to display real user data.

});

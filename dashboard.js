
// ==========================================
// NEWS IN GREEN - USER DASHBOARD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    // ==========================================
    // 1. DAY MODE & NIGHT MODE
    // ==========================================

    // Day/night preference is owned by site-shared.js.

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

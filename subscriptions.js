
// =======================================
// NEWS IN GREEN - SUBSCRIPTIONS PAGE
// =======================================

document.addEventListener("DOMContentLoaded", function () {

    // ===================================
    // 1. NIGHT / DAY MODE
    // ===================================

    const themeToggle = document.getElementById("theme-toggle");
    const themeLabel = document.querySelector(".toggle-label");

    function applyTheme(theme) {

        document.documentElement.setAttribute("data-theme", theme);

        if (theme === "dark") {
            themeLabel.textContent = "Night";
            themeToggle.setAttribute("aria-pressed", "true");
            themeToggle.setAttribute(
                "aria-label", "Switch to day mode"
            );
        } else {
            themeLabel.textContent = "Day";
            themeToggle.setAttribute("aria-pressed", "false");
            themeToggle.setAttribute(
                "aria-label", "Switch to night mode"
            );
        }
    }

    let savedTheme = localStorage.getItem("theme");

    if (savedTheme !== "dark" && savedTheme !== "light") {
        savedTheme = "light";
    }

    applyTheme(savedTheme);

    themeToggle.addEventListener("click", function () {

        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        const newTheme =
            currentTheme === "dark" ? "light" : "dark";

        applyTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    });


    // ===================================
    // 2. MOBILE NAVIGATION
    // ===================================

    const menuButton = document.getElementById("nav-burger");
    const mainNav = document.getElementById("main-nav");

    menuButton.addEventListener("click", function () {

        mainNav.classList.toggle("open");

        const isOpen = mainNav.classList.contains("open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    // Close the menu after clicking a link
    const navLinks = mainNav.querySelectorAll("a");

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {

            mainNav.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open menu");
        });
    });


    // ===================================
    // 3. SUBSCRIPTIONS
    // ===================================

    const STORAGE_KEY = "nig_subscriptions";

    const checkboxes = document.querySelectorAll(".sub-check");
    const countText = document.getElementById("sub-count");
    const message = document.getElementById("sub-message");

    const subscribeAllBtn = document.getElementById("subscribe-all");
    const clearAllBtn = document.getElementById("clear-all");


    // Load previously saved subscriptions
    function loadSubscriptions() {

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const result = saved ? JSON.parse(saved) : [];

            return Array.isArray(result) ? result : [];

        } catch (error) {
            return [];
        }
    }


    // Get selected category names
    function getSelected() {

        const selected = [];

        checkboxes.forEach(function (checkbox) {

            if (checkbox.checked) {
                selected.push(checkbox.value);
            }

        });

        return selected;
    }


    // Save subscriptions
    function saveSubscriptions() {

        const selected = getSelected();

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(selected)
            );
        } catch (error) {
            message.textContent =
                "Unable to save subscriptions in this browser.";
        }
    }


    // Update subscription count and card design
    function refreshPage() {

        let count = 0;

        checkboxes.forEach(function (checkbox) {

            const card = checkbox.closest(".sub-card");

            if (checkbox.checked) {
                count++;
                card.classList.add("is-subscribed");
            } else {
                card.classList.remove("is-subscribed");
            }

        });

        countText.textContent =
            count + " of " + checkboxes.length +
            " categories subscribed";
    }


    // Turn category name into readable text
    function niceName(value) {

        return value.charAt(0).toUpperCase() +
               value.slice(1);
    }


    // Load saved checkbox states
    const savedSubscriptions = loadSubscriptions();

    checkboxes.forEach(function (checkbox) {

        checkbox.checked =
            savedSubscriptions.includes(checkbox.value);

        checkbox.addEventListener("change", function () {

            refreshPage();
            saveSubscriptions();

            if (checkbox.checked) {
                message.textContent =
                    "Subscribed to " + niceName(checkbox.value) + ".";
            } else {
                message.textContent =
                    "Unsubscribed from " + niceName(checkbox.value) + ".";
            }

        });

    });


    // ===================================
    // 4. SUBSCRIBE TO ALL
    // ===================================

    subscribeAllBtn.addEventListener("click", function () {

        checkboxes.forEach(function (checkbox) {
            checkbox.checked = true;
        });

        refreshPage();
        saveSubscriptions();

        message.textContent = "Subscribed to all categories!";
    });


    // ===================================
    // 5. CLEAR ALL
    // ===================================

    clearAllBtn.addEventListener("click", function () {

        checkboxes.forEach(function (checkbox) {
            checkbox.checked = false;
        });

        refreshPage();
        saveSubscriptions();

        message.textContent = "All subscriptions cleared!";
    });


    // ===================================
    // 6. INITIAL PAGE UPDATE
    // ===================================

    refreshPage();

});

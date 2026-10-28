document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ==================================
    // DARK / LIGHT THEME
    // (same "theme" key as the dashboard, so both pages stay in sync)
    // ==================================

    const themeToggle = document.getElementById("theme-toggle");
    const themeLabel = document.querySelector(".toggle-label");

    function saveTheme(theme) {
        try {
            localStorage.setItem("theme", theme);
        } catch (error) {
            console.log("Theme could not be saved");
        }
    }

    function getSavedTheme() {
        try {
            return localStorage.getItem("theme");
        } catch (error) {
            return null;
        }
    }

    function applyTheme(theme) {
        const light = theme === "light";

        document.body.classList.toggle("light-mode", light);

        if (themeLabel) {
            themeLabel.textContent = light ? "Day" : "Night";
        }

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(light));
            themeToggle.setAttribute(
                "aria-label",
                light ? "Switch to dark mode" : "Switch to light mode"
            );
        }
    }

    function setTheme(theme) {
        applyTheme(theme);
        saveTheme(theme);
    }

    applyTheme(getSavedTheme() === "light" ? "light" : "dark");

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const light = document.body.classList.contains("light-mode");
            setTheme(light ? "dark" : "light");
        });
    }

    // Keep theme in sync if changed in another tab
    window.addEventListener("storage", function (event) {
        if (event.key === "theme") {
            applyTheme(event.newValue === "light" ? "light" : "dark");
        }
    });

    // ==================================
    // MOBILE MENU
    // ==================================

    const burger = document.getElementById("nav-burger");
    const nav = document.getElementById("main-nav");

    if (burger && nav) {
        burger.addEventListener("click", function () {
            const open = nav.classList.toggle("open");
            burger.setAttribute("aria-expanded", String(open));
        });
    }

    const articleCards = Array.from(
    document.querySelectorAll(".article-card")
);

      const articles = articleCards.map(function (card) {

    return {
        element: card,
        title: card.querySelector("h3").textContent,
        category: card.dataset.category,
        description: card.querySelector("p").textContent,
        date: card.dataset.date
    };

}
);

    // ==================================
    // GET HTML ELEMENTS
    // ==================================

    const categoryButtons = document.querySelectorAll(".category-btn");
    const container = document.getElementById("articles-container");

    const searchInput = document.getElementById("search-input");
    const fromDate = document.getElementById("from-date");
    const toDate = document.getElementById("to-date");

    const filterBtn = document.getElementById("filter-btn");
    const clearBtn = document.getElementById("clear-btn");

    const emptyMessage = document.getElementById("empty-message");

    const previousBtn = document.getElementById("previous-btn");
    const nextBtn = document.getElementById("next-btn");
    const pageNumber = document.getElementById("page-number");

    let selectedCategory = "All";
    let currentPage = 1;
    const articlesPerPage = 100; // change to 4 if not working

    function normalizeCategory(category) {
        const normalized = category.trim().toLowerCase();
        return normalized === "events" ? "event" : normalized;
    }

    // ==================================
    // ARTICLE CARD CREATION
    // ==================================


    // ==================================
    // FILTER ARTICLES
    // ==================================

    function getFilteredArticles() {
        const query = searchInput.value.trim().toLowerCase();
        const from = fromDate.value;
        const to = toDate.value;

        return articles.filter(function (article) {

            const matchesCategory =
                selectedCategory === "All" ||
                normalizeCategory(article.category) ===
                normalizeCategory(selectedCategory);

            const matchesSearch =
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query);

            const matchesFrom = !from || article.date >= from;
            const matchesTo = !to || article.date <= to;

            return (
                matchesCategory &&
                matchesSearch &&
                matchesFrom &&
                matchesTo
            );
        });
    }

    // ==================================
    // DISPLAY ARTICLES
    // ==================================
function displayArticles() {

    const filtered = getFilteredArticles();
    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / articlesPerPage)
    );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const start = (currentPage - 1) * articlesPerPage;
    const end = start + articlesPerPage;

    const visibleArticles = filtered.slice(start, end);

    // Hide all articles first
    articleCards.forEach(function (card) {
        card.style.display = "none";
    });

    // Show only articles for current page
    visibleArticles.forEach(function (article) {
        article.element.style.display = "";
    });

    // Show / hide empty message
    emptyMessage.hidden = filtered.length > 0;

    if (filtered.length === 0) {
        emptyMessage.textContent = "No articles found.";
    }

    // Update page number
    pageNumber.textContent = currentPage;

    // Update pagination buttons
    previousBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
}
    // ==================================
    // CATEGORY BUTTONS
    // ==================================

    function selectCategory(category) {
        selectedCategory = category;
        currentPage = 1;

        categoryButtons.forEach(function (button) {
            const active =
                button.dataset.category.toLowerCase() ===
                category.toLowerCase();

            button.classList.toggle("active", active);
        });

        displayArticles();
    }

    categoryButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            selectCategory(button.dataset.category);
        });
    });

    // ==================================
    // SEARCH
    // ==================================

    searchInput.addEventListener("input", function () {
        currentPage = 1;
        displayArticles();
    });

    // ==================================
    // DATE FILTER
    // ==================================

    filterBtn.addEventListener("click", function () {
        currentPage = 1;
        displayArticles();
    });

    fromDate.addEventListener("change", function () {
        currentPage = 1;
        displayArticles();
    });

    toDate.addEventListener("change", function () {
        currentPage = 1;
        displayArticles();
    });

    // ==================================
    // CLEAR FILTERS
    // ==================================

    clearBtn.addEventListener("click", function () {
        searchInput.value = "";
        fromDate.value = "";
        toDate.value = "";

        selectCategory("All");
    });

    // ==================================
    // PAGINATION
    // ==================================

    previousBtn.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            displayArticles();
        }
    });

    nextBtn.addEventListener("click", function () {
        const filtered = getFilteredArticles();
        const totalPages = Math.ceil(
            filtered.length / articlesPerPage
        );

        if (currentPage < totalPages) {
            currentPage++;
            displayArticles();
        }
    });

    // ==================================
    // CATEGORY FROM URL HASH
    // Example: browse.html#sports
    // ==================================

    function applyHashCategory() {
        const hash = window.location.hash.replace("#", "").toLowerCase();

        const validCategories = [
            "academic",
            "events",
            "sports",
            "general"
        ];

        if (validCategories.includes(hash)) {
            selectCategory(
                hash.charAt(0).toUpperCase() + hash.slice(1)
            );
        }
    }

    window.addEventListener("hashchange", applyHashCategory);

    // ==================================
    // SEARCH FROM URL
    // Example: browse.html?q=sports
    // ==================================

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q");

    if (initialQuery) {
        searchInput.value = initialQuery;
    }

    // ==================================
    // INITIAL DISPLAY
    // ==================================

    applyHashCategory();
    displayArticles();

});
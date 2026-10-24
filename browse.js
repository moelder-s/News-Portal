
document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ==================================
    // DARK / LIGHT THEME
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

    function setTheme(theme) {
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

        saveTheme(theme);
    }

    setTheme(getSavedTheme() === "light" ? "light" : "dark");

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const light = document.body.classList.contains("light-mode");

            setTheme(light ? "dark" : "light");
        });
    }

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

    // ==================================
    // DEMO ARTICLE DATA
    // Replace with actual approved articles
    // ==================================

    const articles = [
        {
            title: "University Examination Updates",
            category: "Academic",
            description: "Important information about upcoming examinations and university schedules.",
            date: "2026-10-21"
        },
        {
            title: "Annual University Sports Meet",
            category: "Sports",
            description: "Students are preparing for the annual university sports competition.",
            date: "2026-10-20"
        },
        {
            title: "Campus Cultural Festival",
            category: "Events",
            description: "A special cultural event celebrating student creativity and talent.",
            date: "2026-10-18"
        },
        {
            title: "University Library Opening Hours",
            category: "Academic",
            description: "Updated library opening hours for students during the semester.",
            date: "2026-10-15"
        },
        {
            title: "Student Cricket Tournament",
            category: "Sports",
            description: "The interfaculty cricket tournament begins this month.",
            date: "2026-10-14"
        },
        {
            title: "Student Community News",
            category: "General",
            description: "Latest updates and announcements from the student community.",
            date: "2026-10-12"
        },
        {
            title: "Technology Workshop",
            category: "Events",
            description: "A technology workshop for students interested in software development.",
            date: "2026-10-10"
        },
        {
            title: "New Student Facilities",
            category: "General",
            description: "New facilities have been introduced to improve campus life.",
            date: "2026-10-08"
        }
    ];

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
    const articlesPerPage = 4;

    // ==================================
    // ARTICLE CARD CREATION
    // ==================================

    function createArticleCard(article) {
        const card = document.createElement("article");
        card.className = "article-card";
        card.dataset.category = article.category;
        card.dataset.date = article.date;

        const category = document.createElement("span");
        category.className = "article-category";
        category.textContent = article.category;

        const title = document.createElement("h3");
        title.textContent = article.title;

        const description = document.createElement("p");
        description.textContent = article.description;

        const meta = document.createElement("div");
        meta.className = "article-meta";

        const date = document.createElement("span");
        date.textContent = article.date;

        meta.appendChild(date);

        card.appendChild(category);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(meta);

        return card;
    }

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
                article.category.toLowerCase() ===
                selectedCategory.toLowerCase();

            const matchesSearch =
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                article.category.toLowerCase().includes(query);

            const matchesFrom =
                !from || article.date >= from;

            const matchesTo =
                !to || article.date <= to;

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

        container.innerHTML = "";

        visibleArticles.forEach(function (article) {
            container.appendChild(createArticleCard(article));
        });

        emptyMessage.hidden = filtered.length > 0;

        if (filtered.length === 0) {
            emptyMessage.textContent = "No articles found.";
        }

        pageNumber.textContent = currentPage;

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

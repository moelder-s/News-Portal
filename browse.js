const articles = [
    {
        title: "NSBM Marks 10 Years with Anniversary Celebrations",
        category: "Events",
        description:
            "Special events led by the Islamic Society and Hindu Society will mark a decade of NSBM Green University on 22nd October.",
        date: "2026-10-19"
    },

    {
        title: "Islamic Society to Host Exhibition and Function",
        category: "Events",
        description:
            "The NSBM Islamic Society will hold an exhibition and a special function as part of the university’s 10th anniversary celebrations.",
        date: "2026-10-17"
    },

    {
        title: "Hindu Society Presents NATHAM'26",
        category: "Events",
        description:
            "The NSBM Hindu Society will organise Naadham 2026, a cultural function, to celebrate the university’s 10th anniversary..",
        date: "2026-10-15"
    },

    {
        title: "October Intake Students Join NSBM Today",
        category: "Academic",
        description:
            "The October 2026 intake of new students arrived at the university today to begin their academic journey at NSBM Green University.",
        date: "2026-10-12"
    },

    {
        title: "Student Community Volunteers for Green Campus",
        category: "General",
        description:
            "Students join together to support environmental activities and create a greener campus.",
        date: "2026-10-10"
    },

    {
        title: "Campus Technology Exhibition",
        category: "Events",
        description:
            "A technology exhibition gives students an opportunity to demonstrate their latest projects.",
        date: "2026-10-08"
    }
];



const articlesContainer =
    document.getElementById("articles-container");

const emptyMessage =
    document.getElementById("empty-message");

const searchInput =
    document.getElementById("search-input");

const fromDate =
    document.getElementById("from-date");

const toDate =
    document.getElementById("to-date");

const filterButton =
    document.getElementById("filter-btn");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const previousButton =
    document.getElementById("previous-btn");

const nextButton =
    document.getElementById("next-btn");

const pageNumber =
    document.getElementById("page-number");

const themeToggle =
    document.getElementById("theme-toggle");

const toggleLabel =
    document.querySelector(".toggle-label");

const toggleThumb =
    document.querySelector(".toggle-thumb");


let selectedCategory = "All";

let currentPage = 1;

const articlesPerPage = 4;



function displayArticles(list) {

    articlesContainer.innerHTML = "";

    if (list.length === 0) {

        emptyMessage.classList.remove("hidden");

        previousButton.disabled = true;
        nextButton.disabled = true;

        return;
    }

    emptyMessage.classList.add("hidden");


    const totalPages =
        Math.ceil(list.length / articlesPerPage);


    if (currentPage > totalPages) {

        currentPage = totalPages;
    }


    const start =
        (currentPage - 1) * articlesPerPage;

    const end =
        start + articlesPerPage;


    const currentArticles =
        list.slice(start, end);


    currentArticles.forEach(article => {

        const card =
            document.createElement("article");

        card.className = "article-card";

        card.innerHTML = `
            <span class="article-category">
                ${article.category}
            </span>

            <h3>
                ${article.title}
            </h3>

            <p>
                ${article.description}
            </p>

            <div class="article-meta">
                <span>News In Green</span>
                <span>${formatDate(article.date)}</span>
            </div>
        `;

        articlesContainer.appendChild(card);
    });


    pageNumber.textContent = currentPage;

    previousButton.disabled =
        currentPage === 1;

    nextButton.disabled =
        currentPage >= totalPages;
}


function formatDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}



function filterArticles() {

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    const from =
        fromDate.value;

    const to =
        toDate.value;


    const filtered =
        articles.filter(article => {

            /* Category */

            const categoryMatch =
                selectedCategory === "All" ||
                article.category === selectedCategory;


            /* Search */

            const searchMatch =
                article.title
                    .toLowerCase()
                    .includes(searchText) ||

                article.description
                    .toLowerCase()
                    .includes(searchText);


            /* From date */

            const fromMatch =
                !from ||
                article.date >= from;


            /* To date */

            const toMatch =
                !to ||
                article.date <= to;


            return (
                categoryMatch &&
                searchMatch &&
                fromMatch &&
                toMatch
            );
        });


    currentPage = 1;

    displayArticles(filtered);
}



categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            categoryButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            this.classList.add("active");


            selectedCategory =
                this.dataset.category;


            filterArticles();
        }
    );
});



searchInput.addEventListener(
    "input",
    filterArticles
);



filterButton.addEventListener(
    "click",
    filterArticles
);


previousButton.addEventListener(
    "click",
    function () {

        if (currentPage > 1) {

            currentPage--;

            filterArticles();
        }
    }
);


nextButton.addEventListener(
    "click",
    function () {

        const searchText =
            searchInput.value
                .trim()
                .toLowerCase();

        const filtered =
            articles.filter(article => {

                const categoryMatch =
                    selectedCategory === "All" ||
                    article.category === selectedCategory;

                const searchMatch =
                    article.title
                        .toLowerCase()
                        .includes(searchText) ||

                    article.description
                        .toLowerCase()
                        .includes(searchText);

                return categoryMatch && searchMatch;
            });


        const totalPages =
            Math.ceil(
                filtered.length / articlesPerPage
            );


        if (currentPage < totalPages) {

            currentPage++;

            displayArticles(filtered);
        }
    }
);


themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-mode"
        );


        const lightMode =
            document.body.classList.contains(
                "light-mode"
            );


        if (lightMode) {

            toggleLabel.textContent = "Day";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            themeToggle.setAttribute(
                "aria-pressed",
                "true"
            );

            toggleThumb.style.right = "21px";

            toggleThumb.style.background = "#ffffff";

        } else {

            toggleLabel.textContent = "Night";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            themeToggle.setAttribute(
                "aria-pressed",
                "false"
            );

            toggleThumb.style.right = "2px";

            toggleThumb.style.background = "#07100c";
        }
    }
);


const navBurger =
    document.getElementById("nav-burger");

const mainNav =
    document.querySelector(".main-nav");


navBurger.addEventListener(
    "click",
    function () {

        const isOpen =
            mainNav.classList.toggle("mobile-open");

        navBurger.setAttribute(
            "aria-expanded",
            isOpen
        );
    }
);



displayArticles(articles);
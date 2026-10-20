
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
/* =====================================================
   ADMIN ANNOUNCEMENTS JAVASCRIPT
===================================================== */


/* =====================================================
   GET HTML ELEMENTS
===================================================== */

const openModalBtn =
    document.getElementById("openModalBtn");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const modalOverlay =
    document.getElementById("modalOverlay");

const announcementForm =
    document.getElementById("announcementForm");

const announcementTable =
    document.getElementById("announcementTable");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const categoryFilter =
    document.getElementById("categoryFilter");

const modalTitle =
    document.getElementById("modalTitle");

const editId =
    document.getElementById("editId");

const titleInput =
    document.getElementById("announcementTitle");

const descriptionInput =
    document.getElementById("announcementDescription");

const typeInput =
    document.getElementById("announcementType");

const categoryInput =
    document.getElementById("announcementCategory");

const statusInput =
    document.getElementById("announcementStatus");

const themeToggle =
    document.getElementById("themeToggle");

const themeText =
    document.getElementById("themeText");

const logoutBtn =
    document.getElementById("logoutBtn");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");



/* =====================================================
   LOAD ANNOUNCEMENTS
===================================================== */

let announcements =
    JSON.parse(
        localStorage.getItem("newsInGreenAnnouncements")
    ) || [

        {
            id: 1,

            title:
                "Welcome to News In Green",

            description:
                "This is your first announcement.",

            type:
                "Featured",

            category:
                "General",

            date:
                "2026-10-28",

            status:
                "Published"
        }

    ];



/* =====================================================
   SAVE TO LOCAL STORAGE
===================================================== */

function saveAnnouncements() {

    localStorage.setItem(
        "newsInGreenAnnouncements",
        JSON.stringify(announcements)
    );

}



/* =====================================================
   DISPLAY ANNOUNCEMENTS
===================================================== */

function displayAnnouncements() {

    const searchValue =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedType =
        typeFilter.value;

    const selectedCategory =
        categoryFilter.value;


    const filteredAnnouncements =
        announcements.filter(item => {

            const matchesSearch =
                item.title
                    .toLowerCase()
                    .includes(searchValue)
                ||
                item.description
                    .toLowerCase()
                    .includes(searchValue);


            const matchesType =
                selectedType === "all"
                ||
                item.type === selectedType;


            const matchesCategory =
                selectedCategory === "all"
                ||
                item.category === selectedCategory;


            return (
                matchesSearch &&
                matchesType &&
                matchesCategory
            );

        });


    announcementTable.innerHTML = "";


    if (filteredAnnouncements.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    filteredAnnouncements.forEach(
        (item, index) => {

            const row =
                document.createElement("tr");


            let badgeClass =
                "badge-general";


            if (item.type === "Breaking") {

                badgeClass =
                    "badge-breaking";

            }


            if (item.type === "Featured") {

                badgeClass =
                    "badge-featured";

            }


            const statusClass =
                item.status === "Draft"
                ? "draft"
                : "";


            row.innerHTML = `

                <td>

                    <div class="announcement-title">

                        ${escapeHTML(item.title)}

                    </div>

                    <div class="announcement-description">

                        ${escapeHTML(item.description)}

                    </div>

                </td>


                <td>

                    <span class="badge ${badgeClass}">

                        ${escapeHTML(item.type)}

                    </span>

                </td>


                <td>

                    ${escapeHTML(item.category)}

                </td>


                <td>

                    ${formatDate(item.date)}

                </td>


                <td>

                    <span class="status ${statusClass}">

                        ${escapeHTML(item.status)}

                    </span>

                </td>


                <td>

                    <div class="actions">

                        <button
                            class="action-btn edit-btn"
                            onclick="editAnnouncement(${item.id})"
                            title="Edit">

                            ✎

                        </button>


                        <button
                            class="action-btn delete-btn"
                            onclick="deleteAnnouncement(${item.id})"
                            title="Delete">

                            🗑

                        </button>

                    </div>

                </td>

            `;


            announcementTable.appendChild(row);

        }
    );

}



/* =====================================================
   ESCAPE HTML
   Prevent unsafe HTML from being inserted
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}



/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {

    const dateObject =
        new Date(date);


    return dateObject.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}



/* =====================================================
   OPEN MODAL
===================================================== */

function openModal() {

    modalOverlay.classList.add("active");

    document.body.style.overflow =
        "hidden";

}



/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    modalOverlay.classList.remove("active");

    document.body.style.overflow =
        "";

    announcementForm.reset();

    editId.value = "";

    modalTitle.textContent =
        "New Announcement";

}



/* =====================================================
   NEW ANNOUNCEMENT
===================================================== */

openModalBtn.addEventListener(
    "click",
    () => {

        announcementForm.reset();

        editId.value = "";

        modalTitle.textContent =
            "New Announcement";

        openModal();

    }
);



/* =====================================================
   CLOSE MODAL BUTTONS
===================================================== */

closeModalBtn.addEventListener(
    "click",
    closeModal
);


cancelBtn.addEventListener(
    "click",
    closeModal
);



/* =====================================================
   CLOSE WHEN CLICK OUTSIDE MODAL
===================================================== */

modalOverlay.addEventListener(
    "click",
    (event) => {

        if (
            event.target === modalOverlay
        ) {

            closeModal();

        }

    }
);



/* =====================================================
   ADD / UPDATE ANNOUNCEMENT
===================================================== */

announcementForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const title =
            titleInput.value.trim();

        const description =
            descriptionInput.value.trim();

        const type =
            typeInput.value;

        const category =
            categoryInput.value;

        const status =
            statusInput.value;


        if (
            !title ||
            !description ||
            !type ||
            !category
        ) {

            showToast(
                "Please fill all required fields."
            );

            return;

        }


        /* =========================================
           EDIT EXISTING
        ========================================= */

        if (editId.value) {

            const id =
                Number(editId.value);


            const index =
                announcements.findIndex(
                    item => item.id === id
                );


            if (index !== -1) {

                announcements[index] = {

                    ...announcements[index],

                    title:
                        title,

                    description:
                        description,

                    type:
                        type,

                    category:
                        category,

                    status:
                        status

                };

            }


            showToast(
                "Announcement updated successfully!"
            );

        }


        /* =========================================
           ADD NEW
        ========================================= */

        else {

            const newAnnouncement = {

                id:
                    Date.now(),

                title:
                    title,

                description:
                    description,

                type:
                    type,

                category:
                    category,

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                status:
                    status

            };


            announcements.unshift(
                newAnnouncement
            );


            showToast(
                "Announcement added successfully!"
            );

        }


        saveAnnouncements();

        displayAnnouncements();

        closeModal();

    }
);



/* =====================================================
   EDIT ANNOUNCEMENT
===================================================== */

function editAnnouncement(id) {

    const item =
        announcements.find(
            announcement =>
                announcement.id === id
        );


    if (!item) {

        return;

    }


    editId.value =
        item.id;

    titleInput.value =
        item.title;

    descriptionInput.value =
        item.description;

    typeInput.value =
        item.type;

    categoryInput.value =
        item.category;

    statusInput.value =
        item.status;


    modalTitle.textContent =
        "Edit Announcement";


    openModal();

}



/* =====================================================
   DELETE ANNOUNCEMENT
===================================================== */

function deleteAnnouncement(id) {

    const item =
        announcements.find(
            announcement =>
                announcement.id === id
        );


    if (!item) {

        return;

    }


    const confirmDelete =
        confirm(
            `Delete "${item.title}"?`
        );


    if (!confirmDelete) {

        return;

    }


    announcements =
        announcements.filter(
            announcement =>
                announcement.id !== id
        );


    saveAnnouncements();

    displayAnnouncements();


    showToast(
        "Announcement deleted."
    );

}



/* =====================================================
   SEARCH
===================================================== */

searchInput.addEventListener(
    "input",
    displayAnnouncements
);



/* =====================================================
   FILTERS
===================================================== */

typeFilter.addEventListener(
    "change",
    displayAnnouncements
);


categoryFilter.addEventListener(
    "change",
    displayAnnouncements
);



/* =====================================================
   THEME TOGGLE
===================================================== */

const savedTheme =
    localStorage.getItem(
        "adminTheme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light-mode"
    );

    themeText.textContent =
        "Night";

    themeToggle.setAttribute(
        "aria-label",
        "Switch to dark mode"
    );

}



themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light-mode"
        );


        const isLight =
            document.body.classList.contains(
                "light-mode"
            );


        if (isLight) {

            localStorage.setItem(
                "adminTheme",
                "light"
            );

            themeText.textContent =
                "Night";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

        }

        else {

            localStorage.setItem(
                "adminTheme",
                "dark"
            );

            themeText.textContent =
                "Day";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

        }

    }
);



/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.addEventListener(
    "click",
    () => {

        const confirmLogout =
            confirm(
                "Are you sure you want to log out?"
            );


        if (confirmLogout) {

            window.location.href =
                "admin-login.html";

        }

    }
);



/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}



/* =====================================================
   INITIAL LOAD
===================================================== */

displayAnnouncements();
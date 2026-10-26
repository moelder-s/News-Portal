// ==============================
// DAY / NIGHT THEME (same method as browse.js)
// ==============================

var themeToggle = document.getElementById("theme-toggle");
var themeLabel = document.querySelector(".toggle-label");

function getSavedTheme() {
    try {
        return localStorage.getItem("theme");
    } catch (error) {
        return null;
    }
}

function saveTheme(theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch (error) {
        // storage blocked, the page still works
    }
}

function setTheme(theme) {
    var light = theme === "light";

    document.body.classList.toggle("light-mode", light);

    themeLabel.textContent = light ? "Day" : "Night";
    themeToggle.setAttribute("aria-pressed", String(light));
    themeToggle.setAttribute(
        "aria-label",
        light ? "Switch to dark mode" : "Switch to light mode"
    );

    saveTheme(theme);
}

// Day is the default
setTheme(getSavedTheme() === "dark" ? "dark" : "light");

themeToggle.addEventListener("click", function () {
    var light = document.body.classList.contains("light-mode");
    setTheme(light ? "dark" : "light");
});


// ==============================
// MOBILE MENU
// ==============================

var burger = document.getElementById("nav-burger");
var nav = document.getElementById("main-nav");

burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
});


// ==============================
// SUBSCRIPTIONS (saved in MySQL through PHP)
// ==============================

var API = "subscriptions-api.php";

var checkboxes = document.querySelectorAll(".sub-check");
var countText = document.getElementById("sub-count");
var message = document.getElementById("sub-message");
var subscribeAllBtn = document.getElementById("subscribe-all");
var clearAllBtn = document.getElementById("clear-all");

function showMessage(text) {
    message.textContent = text;
}

function niceName(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

// Send one request to the PHP file
function sendRequest(action, category) {
    var data = new FormData();
    data.append("action", action);
    if (category) {
        data.append("category", category);
    }

    return fetch(API, { method: "POST", body: data }).then(function (response) {
        return response.json();
    });
}

// Update the green borders and the "x of 4" text
function refreshPage() {
    var count = 0;

    for (var i = 0; i < checkboxes.length; i++) {
        var card = checkboxes[i].closest(".sub-card");
        card.classList.toggle("is-subscribed", checkboxes[i].checked);
        if (checkboxes[i].checked) {
            count++;
        }
    }

    countText.textContent = count + " of " + checkboxes.length + " categories subscribed";
}

// Tick the boxes that the database says are subscribed
function showSubscribed(list) {
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = list.indexOf(checkboxes[i].value) !== -1;
    }
    refreshPage();
}

function serverError() {
    showMessage("Could not reach the server. Open this page through http://localhost and start Apache and MySQL.");
}

// One switch changed
function handleChange(event) {
    var box = event.target;
    var action = box.checked ? "subscribe" : "unsubscribe";

    sendRequest(action, box.value)
        .then(function (result) {
            showSubscribed(result.subscribed);
            showMessage((box.checked ? "Subscribed to " : "Unsubscribed from ") + niceName(box.value) + ".");
        })
        .catch(function () {
            box.checked = !box.checked;
            refreshPage();
            serverError();
        });
}

// Subscribe to all / Clear all
function setAll(state) {
    sendRequest(state ? "subscribe_all" : "clear_all")
        .then(function (result) {
            showSubscribed(result.subscribed);
            showMessage(state ? "Subscribed to all categories." : "All subscriptions cleared.");
        })
        .catch(serverError);
}

for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("change", handleChange);
}

subscribeAllBtn.addEventListener("click", function () { setAll(true); });
clearAllBtn.addEventListener("click", function () { setAll(false); });

// When the page opens, load saved subscriptions from the database
sendRequest("list")
    .then(function (result) {
        showSubscribed(result.subscribed);
    })
    .catch(serverError);
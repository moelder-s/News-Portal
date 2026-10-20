var themeToggle = document.getElementById("theme-toggle");
var themeLabel = themeToggle.querySelector(".toggle-label");

function applyTheme(mode) {
    if (mode === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.setAttribute("aria-pressed", "true");
        themeLabel.textContent = "Night";
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        themeToggle.setAttribute("aria-pressed", "false");
        themeLabel.textContent = "Day";
    }
}

applyTheme(localStorage.getItem("theme") || "dark");

themeToggle.addEventListener("click", function () {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    var newMode = isDark ? "light" : "dark";
    localStorage.setItem("theme", newMode);
    applyTheme(newMode);
});



var STORAGE_KEY = "nig_subscriptions";

var checkboxes = document.querySelectorAll(".sub-check");
var countText = document.getElementById("sub-count");
var message = document.getElementById("sub-message");
var subscribeAllBtn = document.getElementById("subscribe-all");
var clearAllBtn = document.getElementById("clear-all");

function loadSubscriptions() {
    try {
        var saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        return [];
    }
}

function saveSubscriptions(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
        showMessage("Could not save your choices on this browser.");
    }
}

function getSelected() {
    var list = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            list.push(checkboxes[i].value);
        }
    }
    return list;
}

function showMessage(text) {
    message.textContent = text;
}

function refreshPage() {
    var selected = getSelected();

    for (var i = 0; i < checkboxes.length; i++) {
        var card = checkboxes[i].closest(".sub-card");
        card.classList.toggle("is-subscribed", checkboxes[i].checked);
    }

    countText.textContent = selected.length + " of " + checkboxes.length + " categories subscribed";
}

function niceName(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function handleChange(event) {
    var box = event.target;
    saveSubscriptions(getSelected());
    refreshPage();

    if (box.checked) {
        showMessage("Subscribed to " + niceName(box.value) + ".");
    } else {
        showMessage("Unsubscribed from " + niceName(box.value) + ".");
    }
}

function setAll(state) {
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = state;
    }
    saveSubscriptions(getSelected());
    refreshPage();
    showMessage(state ? "Subscribed to all categories." : "All subscriptions cleared.");
}

var savedList = loadSubscriptions();
for (var i = 0; i < checkboxes.length; i++) {
    checkboxes[i].checked = savedList.indexOf(checkboxes[i].value) !== -1;
    checkboxes[i].addEventListener("change", handleChange);
}

subscribeAllBtn.addEventListener("click", function () { setAll(true); });
clearAllBtn.addEventListener("click", function () { setAll(false); });

refreshPage();
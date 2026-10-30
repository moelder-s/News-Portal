// Theme is owned by site-shared.js.

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

var API = "subscriptions_api.php";

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
    var csrfToken = document.getElementById("csrf-token");
    if (csrfToken) data.append("csrf", csrfToken.value);
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

// ==============================
// LIVE-STYLE NOTIFICATIONS
// Only events from categories the signed-in user follows are returned.
// The page polls every 8 seconds while it remains open.
// ==============================

var notificationsAPI = "subscription_notifications_api.php";
var notificationList = document.getElementById("notification-list");
var notificationBadge = document.getElementById("sub-notification-badge");
var unreadCount = document.getElementById("notification-unread-count");
var markAllReadButton = document.getElementById("mark-all-read");
var notificationToast = document.getElementById("notification-toast");
var newestNotificationId = null;
var toastTimer = null;
var notificationRows = [];

function escapeText(value) {
    return String(value == null ? "" : value);
}

function postNotificationAction(action, id) {
    var data = new FormData();
    data.append("action", action);
    var csrfToken = document.getElementById("csrf-token");
    if (csrfToken) data.append("csrf", csrfToken.value);
    if (id) data.append("id", id);

    return fetch(notificationsAPI, {
        method: "POST",
        body: data,
        cache: "no-store"
    }).then(function (response) {
        return response.json();
    });
}

function updateNotificationBadges(count) {
    var safeCount = Math.max(0, Number(count) || 0);
    notificationBadge.textContent = safeCount > 99 ? "99+" : String(safeCount);
    notificationBadge.hidden = safeCount === 0;
    notificationBadge.setAttribute("aria-label", safeCount + " unread notifications");

    unreadCount.textContent = safeCount + " unread";
    unreadCount.hidden = safeCount === 0;
}

function showNotificationToast(row) {
    notificationToast.replaceChildren();
    var title = document.createElement("strong");
    title.textContent = escapeText(row.title);
    var messageText = document.createElement("span");
    messageText.textContent = escapeText(row.message);
    notificationToast.appendChild(title);
    notificationToast.appendChild(messageText);
    notificationToast.hidden = false;

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
        notificationToast.hidden = true;
    }, 6500);
}

function markOneRead(id) {
    return postNotificationAction("read", id).then(function () {
        for (var i = 0; i < notificationRows.length; i++) {
            if (String(notificationRows[i].id) === String(id)) {
                notificationRows[i].is_read = 1;
            }
        }
        renderNotifications(notificationRows);
        return loadNotifications(false);
    });
}

function renderNotifications(rows) {
    notificationList.replaceChildren();
    notificationList.setAttribute("aria-busy", "false");

    if (!rows || rows.length === 0) {
        var empty = document.createElement("p");
        empty.className = "notifications-empty";
        empty.textContent = "No notifications yet. Follow a category to hear about new submissions, published stories, and approved comments.";
        notificationList.appendChild(empty);
        return;
    }

    rows.forEach(function (row) {
        var item = document.createElement("article");
        item.className = "notification-item" + (Number(row.is_read) === 0 ? " is-unread" : "");

        var dot = document.createElement("span");
        dot.className = "notification-dot";
        dot.setAttribute("aria-hidden", "true");

        var link = document.createElement("a");
        link.className = "notification-link";
        link.href = row.link_url || "#notifications";

        var title = document.createElement("h3");
        title.textContent = escapeText(row.title);
        var body = document.createElement("p");
        body.textContent = escapeText(row.message);
        var time = document.createElement("time");
        time.textContent = escapeText(row.created_at);
        time.dateTime = escapeText(row.created_at).replace(" ", "T");

        link.appendChild(title);
        link.appendChild(body);
        link.appendChild(time);
        link.addEventListener("click", function (event) {
            if (Number(row.is_read) !== 0) return;
            event.preventDefault();
            var destination = link.href;
            markOneRead(row.id).catch(function () {}).finally(function () {
                window.location.href = destination;
            });
        });

        item.appendChild(dot);
        item.appendChild(link);
        notificationList.appendChild(item);
    });
}

function loadNotifications(allowToast) {
    return fetch(notificationsAPI + "?action=poll", { cache: "no-store" })
        .then(function (response) {
            if (!response.ok) throw new Error("Notification request failed");
            return response.json();
        })
        .then(function (result) {
            if (!result.success) throw new Error(result.message || "Could not load notifications");
            var rows = Array.isArray(result.notifications) ? result.notifications : [];
            var newestId = rows.length ? Number(rows[0].id) : 0;

            if (newestNotificationId === null) {
                newestNotificationId = newestId;
            } else if (allowToast && newestId > newestNotificationId && rows.length) {
                showNotificationToast(rows[0]);
                newestNotificationId = newestId;
            } else if (newestId > newestNotificationId) {
                newestNotificationId = newestId;
            }

            notificationRows = rows;
            updateNotificationBadges(result.unread || 0);
            renderNotifications(rows);
            return result;
        })
        .catch(function () {
            notificationList.setAttribute("aria-busy", "false");
            if (!notificationList.children.length) {
                var error = document.createElement("p");
                error.className = "notifications-empty";
                error.textContent = "Notifications could not be loaded. Check that Apache and MySQL are running, then refresh this page.";
                notificationList.appendChild(error);
            }
        });
}

markAllReadButton.addEventListener("click", function () {
    markAllReadButton.disabled = true;
    postNotificationAction("read_all")
        .then(function () { return loadNotifications(false); })
        .catch(function () {
            showMessage("Could not mark notifications as read. Please try again.");
        })
        .finally(function () { markAllReadButton.disabled = false; });
});

loadNotifications(false);
window.setInterval(function () { loadNotifications(true); }, 8000);
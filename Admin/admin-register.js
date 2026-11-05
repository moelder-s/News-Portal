(function () {
    "use strict";

    // Basic form validation; the PHP endpoint creates the admin account.
    // Do not store admin credentials in JavaScript or localStorage.
    const form = document.getElementById("register-form");
    const errorBox = document.getElementById("form-error");
    const successBox = document.getElementById("form-success");
    if (form) form.addEventListener("submit", async function (event) {
        event.preventDefault();
        errorBox.hidden = true;
        successBox.hidden = true;
        const fullName = document.getElementById("full-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const userId = document.getElementById("user-id").value.trim();
        const password = document.getElementById("password").value;
        const confirmation = document.getElementById("confirm-password").value;
        const fail = message => { errorBox.textContent = message; errorBox.hidden = false; };
        if (!fullName || !email || !userId || !password || !confirmation) return fail("Complete all fields.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.");
        if (userId.length < 3) return fail("User ID must contain at least 3 characters.");
        if (password.length < 8) return fail("Password must be at least 8 characters.");
        if (password !== confirmation) return fail("Passwords do not match.");
        const button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = "Submitting...";
        try {
            // The PHP endpoint creates an active admin account.
            const response = await fetch("admin-register.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ full_name: fullName, email, user_id: userId, password })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Registration was not accepted.");
            successBox.textContent = data.message || "Account created. You can now log in.";
            successBox.hidden = false;
            form.reset();
        } catch (error) {
            fail(error instanceof SyntaxError
                ? "Registration server not configured. Set up admin-register.php first."
                : error.message || "Could not send registration request. Check your server.");
        } finally {
            button.disabled = false;
            button.textContent = "Create admin account";
        }
    });

    /* Stable full-screen stars and faint light streaks (seeded placement). */
    var starLayer = document.getElementById("deep-stars");
    var streakLayer = document.getElementById("space-streaks");
    var seed = 2026;
    function random() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    }
    if (starLayer) {
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < 125; i++) {
            var star = document.createElement("i");
            star.className = "deep-star";
            star.style.left = (random() * 100).toFixed(2) + "%";
            star.style.top = (random() * 100).toFixed(2) + "%";
            star.style.setProperty("--size", (random() > .94 ? 2 : 1) + "px");
            star.style.setProperty("--brightness", (.21 + random() * .58).toFixed(2));
            star.style.setProperty("--duration", (4 + random() * 9).toFixed(1) + "s");
            star.style.setProperty("--delay", (-random() * 12).toFixed(1) + "s");
            fragment.appendChild(star);
        }
        starLayer.appendChild(fragment);
    }
    if (streakLayer) {
        var streaks = document.createDocumentFragment();
        for (var j = 0; j < 9; j++) {
            var streak = document.createElement("i");
            streak.className = "space-streak";
            streak.style.left = (random() * 100).toFixed(2) + "%";
            streak.style.top = (random() * 100).toFixed(2) + "%";
            streak.style.setProperty("--width", (19 + random() * 45).toFixed(0) + "px");
            streak.style.setProperty("--opacity", (.15 + random() * .3).toFixed(2));
            streak.style.setProperty("--duration", (6 + random() * 8).toFixed(1) + "s");
            streak.style.setProperty("--delay", (-random() * 10).toFixed(1) + "s");
            streaks.appendChild(streak);
        }
        streakLayer.appendChild(streaks);
    }

    /* Smooth inertial rotation; stars do not move off the screen. */
    var globe = document.getElementById("globe");
    var sky = document.getElementById("rotating-sky");
    var reducedMotion = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (globe && !reducedMotion) {
        var currentAngle = 0;
        var desiredAngle = 0;
        var lastFrame = 0;
        var lastTouchY = null;
        function animateEarth(time) {
            var elapsed = lastFrame ? Math.min((time - lastFrame) / 1000, .05) : .016;
            lastFrame = time;
            desiredAngle += elapsed * .32;
            currentAngle += (desiredAngle - currentAngle) * (1 - Math.exp(-elapsed * 2.8));
            var angle = currentAngle.toFixed(3) + "deg";
            globe.style.setProperty("--globe-rot", angle);
            if (sky) sky.style.setProperty("--sky-rot", angle);
            requestAnimationFrame(animateEarth);
        }
        requestAnimationFrame(animateEarth);
        window.addEventListener("wheel", function (event) {
            desiredAngle += Math.max(-100, Math.min(100, event.deltaY)) * .025;
        }, { passive: true });
        window.addEventListener("touchstart", function (event) {
            lastTouchY = event.touches[0].clientY;
        }, { passive: true });
        window.addEventListener("touchmove", function (event) {
            if (lastTouchY === null) return;
            var y = event.touches[0].clientY;
            desiredAngle += (lastTouchY - y) * .025;
            lastTouchY = y;
        }, { passive: true });
        window.addEventListener("touchend", function () { lastTouchY = null; }, { passive: true });
    }
})();

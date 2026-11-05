// ============================================================
// Admin Login — form handling + moving space background
// ============================================================

(function () {
    "use strict";

    // Credentials are checked by admin-backend.js against the PHP server.

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

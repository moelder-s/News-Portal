/* ==========================================================================
   BOOKMARKS PAGE SCRIPT  |  News In Green
   File: js/bookmark.js

   PARTS IN THIS FILE:
     PART 1  Theme switch (dark / light) for the background, header,
             middle section and footer
     PART 2  Page start-up (runs when the page loads)

   Needs js/links.js to be loaded first (uses applyPageLinks).
   Both scripts sit right after the <body> tag in bookmark.html, so the saved
   theme is applied before the page is drawn (no flash of the wrong theme).
   ========================================================================== */


/* ==========================================================================
   PART 1 of 2: THEME SWITCH (dark / light)
   - The theme is a class on <body>: "dark-mode" or "light-mode".
     bookmark.css colours the whole page from that class.
   - The choice is saved in the browser, so it is remembered next visit
     (and the placeholder page temp.html uses the same saved theme).
   ========================================================================== */

// Puts the theme on the page. save = true also remembers it for next time.
function applyTheme(mode, save) {
    // swap the body class: dark-mode <-> light-mode
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(mode + '-mode');

    // update the toggle text in the header (Night / Day), if it exists yet
    var label = document.querySelector('.toggle-label');
    if (label) label.textContent = (mode === 'dark') ? 'Night' : 'Day';

    // remember the choice (try/catch: storage can be blocked in some browsers)
    if (save) {
        try { localStorage.setItem('theme', mode); } catch (e) {}
    }
}

// Called by the toggle button in the header (onclick="toggleTheme()")
function toggleTheme() {
    applyTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark', true);
}


/* ==========================================================================
   PART 2 of 2: PAGE START-UP
   1. Right away: apply the saved theme (dark by default)
   2. When the page has loaded: fix the toggle text and fill in all the page
      links from js/links.js (the header and footer exist by then)
   ========================================================================== */

(function init() {
    var saved = 'dark';
    try { saved = localStorage.getItem('theme') === 'light' ? 'light' : 'dark'; } catch (e) {}
    applyTheme(saved, false);

    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(saved, false);   // the header did not exist yet above

        if (typeof applyPageLinks === 'function') {
            applyPageLinks();       // from js/links.js
        } else {
            console.warn('js/links.js did not load, so the page links are not set.');
        }
    });
})();

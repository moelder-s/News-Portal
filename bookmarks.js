function applyTheme(mode, save) {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(mode + '-mode');

    var label = document.querySelector('.toggle-label');
    if (label) label.textContent = (mode === 'dark') ? 'Night' : 'Day';

    if (save) {
        try { localStorage.setItem('theme', mode); } catch (e) {}
    }
}

function toggleTheme() {
    applyTheme(document.body.classList.contains('dark-mode') ? 'light' : 'dark', true);
}

(function init() {
    var saved = 'light';
    try { 
        localStorage.setItem('theme', 'light');
    } catch (e) {}
    applyTheme(saved, false);

    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(saved, false);   

        if (typeof applyPageLinks === 'function') {
            applyPageLinks();       
        } else {
            console.warn('js/links.js did not load, so the page links are not set.');
        }
    });
})();

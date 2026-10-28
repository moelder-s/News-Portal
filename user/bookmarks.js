// Combined theme controls and article bookmark buttons.
// Load this file once per page, using defer.

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


// The Browse/Home member loads this script and supplies REAL database article IDs.
(function () {
    'use strict';
    let statePromise;
    const saved = new Set();
    let csrf = '';
    const busy = new Set();
    function message(text) {
        let node = document.getElementById('bookmark-message');
        if (!node) { node = document.createElement('p'); node.id = 'bookmark-message'; node.setAttribute('role', 'status'); document.body.appendChild(node); }
        node.textContent = text;
    }
    function paint() {
        document.querySelectorAll('[data-bookmark-id]').forEach(function (button) {
            const id = Number(button.dataset.bookmarkId);
            const active = saved.has(id);
            button.type = 'button';
            button.textContent = active ? 'Remove bookmark' : 'Save bookmark';
            button.setAttribute('aria-pressed', String(active));
            button.disabled = busy.has(id);
        });
    }
    async function load() {
        const response = await fetch('bookmarks.php?api=1', {credentials:'same-origin', cache:'no-store'});
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Cannot load bookmarks.');
        csrf = result.csrf_token;
        saved.clear(); result.article_ids.forEach(function (id) { saved.add(Number(id)); });
        paint();
    }
    function initialState() {
        if (!statePromise) statePromise = load().catch(function (error) { statePromise = null; throw error; });
        return statePromise;
    }
    document.addEventListener('click', async function (event) {
        const button = event.target.closest('[data-bookmark-id]');
        if (!button) return;
        event.preventDefault();
        const id = Number(button.dataset.bookmarkId);
        if (!Number.isSafeInteger(id) || id <= 0) { message('A real database article ID is needed.'); return; }
        if (busy.has(id)) return;
        busy.add(id); paint();
        try {
            await initialState();
            const action = saved.has(id) ? 'remove' : 'add';
            const response = await fetch('bookmarks.php?api=1', {
                method:'POST', credentials:'same-origin',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({article_id:id, action:action, csrf_token:csrf})
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                if (response.status === 401 || response.status === 403) statePromise = null;
                throw new Error(result.message || 'Bookmark could not be changed.');
            }
            if (result.saved) saved.add(id); else saved.delete(id);
            message(result.saved ? 'Bookmark saved.' : 'Bookmark removed.');
        } catch (error) { message(error.message); }
        finally { busy.delete(id); paint(); }
    });
    document.addEventListener('DOMContentLoaded', function () {
        // Dynamically created article cards are supported too.
        const observer = new MutationObserver(function (changes) {
            if (changes.some(function (change) { return Array.from(change.addedNodes).some(function (node) { return node.nodeType === 1 && (node.matches('[data-bookmark-id]') || node.querySelector('[data-bookmark-id]')); }); })) {
                initialState().then(paint).catch(function (error) { message(error.message); });
            }
        });
        observer.observe(document.body, {childList:true, subtree:true});
        if (document.querySelector('[data-bookmark-id]')) initialState().catch(function (error) { message(error.message); });
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('nav-burger');
    const menu = document.getElementById('main-nav');

    if (!button || !menu) return;

    button.addEventListener('click', function () {
        const isOpen = menu.classList.toggle('open');

        button.setAttribute('aria-expanded', String(isOpen));
        button.setAttribute(
            'aria-label',
            isOpen ? 'Close menu' : 'Open menu'
        );
    });
});


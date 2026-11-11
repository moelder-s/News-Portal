(() => {
    'use strict';

    const root = document.documentElement;

    // localStorage can throw (private mode, blocked storage) - never let it break the page
    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        /* ---------- Theme toggle ---------- */
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const themeLabel = themeToggle.querySelector('.toggle-label');

            const applyTheme = (isDark) => {
                if (isDark) root.setAttribute('data-theme', 'dark');
                else root.removeAttribute('data-theme');
                themeToggle.setAttribute('aria-pressed', String(isDark));
                themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to night mode');
                if (themeLabel) themeLabel.textContent = isDark ? 'Night' : 'Day';
            };

            // The inline <head> script has already set data-theme (no flash); sync the UI to it
            applyTheme(store.get('theme') === 'dark');

            themeToggle.addEventListener('click', () => {
                const goDark = root.getAttribute('data-theme') !== 'dark';
                applyTheme(goDark);
                store.set('theme', goDark ? 'dark' : 'light');
            });
        }

        /* ---------- Mobile nav burger ---------- */
        const burger = document.getElementById('nav-burger');
        const nav = document.getElementById('main-nav');
        if (burger && nav) {
            const setMenu = (open) => {
                nav.classList.toggle('open', open);
                burger.classList.toggle('open', open);
                burger.setAttribute('aria-expanded', String(open));
                burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            };
            burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
            nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
        }

        // NOTE: #logout-link currently has no behaviour (href="#"). Hook your real logout here.
    });
})();

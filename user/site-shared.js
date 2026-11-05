/* News In Green: one theme owner, shared navigation and decorative effects. */
(() => {
    'use strict';
    const root = document.documentElement;
    const key = 'nig-theme';
    const valid = value => value === 'light' || value === 'dark';
    let initial = 'light';
    try {
        const saved = localStorage.getItem(key) || localStorage.getItem('theme');
        if (valid(saved)) initial = saved;
    } catch (_) { /* A blocked storage area must not stop page scripts. */ }

    function setTheme(value, persist = true) {
        const theme = valid(value) ? value : 'light';
        root.dataset.theme = theme;
        if (document.body) {
            document.body.classList.toggle('light-mode', theme === 'light');
            document.body.classList.toggle('dark-mode', theme === 'dark');
        }
        if (persist) {
            try {
                localStorage.setItem(key, theme);
                // Compatibility for links/scripts outside this bundle.
                localStorage.setItem('theme', theme);
            } catch (_) {}
        }
        document.querySelectorAll('#theme-toggle, #portal-theme-toggle').forEach(button => {
            button.setAttribute('aria-pressed', String(theme === 'dark'));
            button.setAttribute('aria-label', theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode');
            const symbol = button.querySelector('.theme-symbol');
            if (symbol) symbol.innerHTML = theme === 'dark'
                ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.985 12.486A9 9 0 0 1 11.514 3.015a9 9 0 1 0 9.471 9.471Z"/></svg>'
                : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';
            const label = button.querySelector('.toggle-label');
            if (label) label.textContent = theme === 'dark' ? 'Night' : 'Day';
        });
        window.dispatchEvent(new CustomEvent('nig:themechange', { detail: { theme } }));
    }
    const toggle = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    window.NIGTheme = Object.freeze({ set: setTheme, toggle, get: () => root.dataset.theme });
    window.toggleTheme = toggle; // Legacy inline controls call the same preference.
    setTheme(initial, false); // Runs synchronously in <head>, before styles paint.
    window.addEventListener('storage', event => {
        if (event.key === key || event.key === null) setTheme(event.newValue, false);
    });

    // A page restored from browser history must adopt the latest saved preference.
    window.addEventListener('pageshow', () => {
        let theme = root.dataset.theme;
        try {
            const saved = localStorage.getItem(key) || localStorage.getItem('theme');
            theme = valid(saved) ? saved : 'light';
        } catch (_) {}
        setTheme(theme, false);
    });

    const paths = {
        home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/>',
        browse: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        dashboard: '<path d="M4 20V11h4v9M10 20V4h4v16M16 20v-7h4v7"/>',
        bookmarks: '<path d="M6 3h12v18l-6-4-6 4z"/>',
        subscriptions: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        submit: '<path d="m4 20 4.5-1 11-11-3.5-3.5-11 11zM14 6l3.5 3.5"/>',
        help: '<path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="12" width="4" height="7" rx="2"/><rect x="18" y="12" width="4" height="7" rx="2"/><path d="M20 19c0 2-3 3-7 3"/>',
        bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9zM10 21h4"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
    };
    const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;

    function initHeader() {
        const header = document.querySelector('header.site-header, header.topbar');
        if (!header || header.querySelector('.portal-unified-inner')) return;
        header.classList.add('portal-unified-header');
        const wrapper = document.createElement('div');
        wrapper.className = 'portal-unified-inner';
        const links = [['home', 'Home'], ['browse', 'Browse'], ['dashboard', 'Dashboard'], ['bookmarks', 'Bookmarks'], ['subscriptions', 'Subscriptions'], ['submit', 'Submit Article'], ['help', 'Help/Support']];
        wrapper.innerHTML = `<a href="home.php" class="portal-unified-brand"><img class="portal-ng-combined-logo" src="ng-header-logo.png" alt="NSBM News In Green NG logo"><span><strong>News <em>In Green</em></strong><small>NSBM UNIVERSITY NEWS PORTAL</small></span></a><nav class="portal-unified-nav" aria-label="Primary navigation">${links.map(([id, label]) => `<a href="${(window.NIG_LOGGED_IN === false && id !== 'home') ? 'login.html' : id + '.php'}" data-nav="${id}"><span class="portal-nav-icon">${svg(id)}</span><span>${label}</span></a>`).join('')}</nav><div class="portal-unified-actions"><a class="portal-header-notices" href="notifications.php" aria-label="Notifications">${svg('bell')}</a><a href="login.php" class="portal-header-account" aria-label="Log in">${svg('user')}</a><button type="button" id="portal-theme-toggle" aria-label="Toggle color theme" title="Toggle light or dark mode"><span class="theme-symbol" aria-hidden="true"></span></button></div>`;
        header.prepend(wrapper);
        const page = location.pathname.split('/').pop().replace(/\.(php|html)$/, '');
        wrapper.querySelectorAll('[data-nav]').forEach(link => {
            if (link.dataset.nav === page) {
                link.classList.add('selected');
                link.setAttribute('aria-current', 'page');
            }
        });
        // Header tab hover: use an inline priority so older per-page !important
        // styles cannot cancel the pop-up. Only the hovered tab moves.
        wrapper.querySelectorAll('.portal-unified-nav > a').forEach(tab => {
            const applyHover = active => {
                tab.style.setProperty('transition', 'transform .24s cubic-bezier(.2,.75,.2,1), box-shadow .24s ease, background-color .24s ease, border-color .24s ease', 'important');
                tab.style.setProperty('transform', active ? 'translate3d(0,-6px,0) scale(1.09)' : 'translate3d(0,0,0) scale(1)', 'important');
                tab.style.setProperty('box-shadow', active ? '0 10px 26px rgba(26,166,86,.35), 0 0 17px rgba(35,199,102,.28)' : '', 'important');
                tab.style.setProperty('position', 'relative', 'important');
                tab.style.setProperty('z-index', active ? '6' : '1', 'important');
            };
            applyHover(false);
            tab.addEventListener('pointerenter', () => applyHover(true));
            tab.addEventListener('pointerleave', () => applyHover(false));
            tab.addEventListener('focus', () => applyHover(true));
            tab.addEventListener('blur', () => applyHover(false));
        });
        const account = wrapper.querySelector('.portal-header-account');
        if (page === 'profile') account.setAttribute('aria-current', 'page');
        wrapper.querySelector('#portal-theme-toggle').addEventListener('click', toggle);
        document.querySelectorAll('#theme-toggle').forEach(button => {
            button.removeAttribute('onclick');
            button.addEventListener('click', toggle);
        });

        const notices = wrapper.querySelector('.portal-header-notices');
        let pollTimer = null;
        let polling = false;
        async function poll() {
            if (document.hidden || polling) return;
            polling = true;
            try {
                const response = await fetch('profile_api.php?notifications=1', { credentials: 'same-origin', cache: 'no-store' });
                if (!response.ok) return;
                const result = await response.json();
                const count = Math.max(0, Number(result.unread) || 0);
                notices.classList.toggle('has-unread', count > 0);
                notices.setAttribute('aria-label', count ? `Notifications: ${count} unread` : 'Notifications');
            } catch (_) { /* Navigation stays usable if an API is unavailable. */ }
            finally { polling = false; }
        }
        fetch('profile_api.php', { credentials: 'same-origin', cache: 'no-store' })
            .then(response => response.ok ? response.json() : null)
            .then(profile => {
                if (!profile?.logged_in) { notices.href = 'login.php'; return; }
                account.href = 'profile.php';
                account.setAttribute('aria-label', 'Your profile');
                if (profile.avatar) {
                    const photo = document.createElement('img');
                    photo.src = profile.avatar;
                    photo.alt = '';
                    photo.addEventListener('error', () => { account.innerHTML = svg('user'); }, { once: true });
                    account.replaceChildren(photo);
                }
                const out = document.createElement('a');
                out.href = 'logout.php'; out.className = 'portal-logout'; out.textContent = 'Log out';
                wrapper.querySelector('.portal-unified-actions').append(out);
                poll();
                pollTimer = window.setInterval(poll, 30000);
                document.addEventListener('visibilitychange', poll);
            }).catch(() => {});
        window.addEventListener('pagehide', event => {
            if (!event.persisted && pollTimer) clearInterval(pollTimer);
        });
    }

    function initBackground() {
        if (document.querySelector('.portal-day-particles')) return;
        let seed = 40819;
        const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
        const canvas = document.createElement('canvas');
        canvas.className = 'portal-day-particles';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.prepend(canvas);
        const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
        if (!ctx) return;
        // Bake the glow once, then reuse this tiny sprite for every dark-mode dot.
        // No per-frame shadow blur or extra DOM star animations are needed.
        const glow = document.createElement('canvas');
        glow.width = 32; glow.height = 32;
        const glowCtx = glow.getContext('2d');
        if (glowCtx) {
            const gradient = glowCtx.createRadialGradient(16, 16, 0, 16, 16, 15);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.14, 'rgba(245,249,255,.95)');
            gradient.addColorStop(0.34, 'rgba(224,237,255,.3)');
            gradient.addColorStop(1, 'rgba(224,237,255,0)');
            glowCtx.fillStyle = gradient;
            glowCtx.fillRect(0, 0, 32, 32);
        }
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        const pointer = matchMedia('(any-pointer: fine)');
        const controller = new AbortController();
        const signal = controller.signal;
        const mouse = { x: 0, y: 0, active: false };
        const colors = ['#218660', '#418b94', '#8e9b60'];
        let dots = [], width = 0, height = 0;
        let frame = 0, resizeFrame = 0, lastDraw = 0, lastInteraction = -Infinity;
        let typing = false;
        const interval = 1000 / 20;
        const settleTime = 1600;
        const canAnimate = () => !document.hidden && !motion.matches && pointer.matches && !typing;

        function stop() {
            cancelAnimationFrame(frame);
            frame = 0;
            lastDraw = 0;
        }

        function render(time, animate, dt = 1) {
            ctx.clearRect(0, 0, width, height);
            const dark = root.dataset.theme === 'dark';
            for (const dot of dots) {
                let targetX = dot.homeX;
                let targetY = dot.homeY;
                if (animate) {
                    // Gentle drift during interaction; the visible field is held still when idle.
                    targetX += Math.sin(time * 0.00017 + dot.phase) * 7;
                    targetY += Math.cos(time * 0.00013 + dot.phase * 1.7) * 7;
                    if (mouse.active) {
                        const dx = dot.x - mouse.x;
                        const dy = dot.y - mouse.y;
                        const distance = Math.hypot(dx, dy);
                        const radius = 170;
                        if (distance < radius) {
                            const strength = 65 * Math.pow(1 - distance / radius, 2);
                            // An exact overlap still has a stable direction of escape.
                            targetX += (distance > 0.01 ? dx / distance : Math.cos(dot.phase)) * strength;
                            targetY += (distance > 0.01 ? dy / distance : Math.sin(dot.phase)) * strength;
                        }
                    }
                    const damping = Math.pow(0.8, dt);
                    dot.vx = (dot.vx + (targetX - dot.x) * 0.055 * dt) * damping;
                    dot.vy = (dot.vy + (targetY - dot.y) * 0.055 * dt) * damping;
                    dot.x += dot.vx * dt;
                    dot.y += dot.vy * dt;
                } else {
                    dot.x = dot.homeX; dot.y = dot.homeY;
                    dot.vx = 0; dot.vy = 0;
                }
                ctx.globalAlpha = dark ? Math.min(0.97, dot.alpha + 0.33) : dot.alpha;
                if (dark && glowCtx) {
                    const radius = dot.size * 3;
                    ctx.drawImage(glow, dot.x - radius, dot.y - radius, radius * 2, radius * 2);
                } else {
                    ctx.beginPath();
                    ctx.fillStyle = dark ? '#f5f9ff' : dot.color;
                    ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        }

        function draw(time) {
            frame = 0;
            if (!canAnimate()) { sync(); return; }
            if (time - lastInteraction > settleTime) { stop(); return; }
            const elapsed = lastDraw ? time - lastDraw : interval;
            if (elapsed >= interval - 1) {
                render(time, true, Math.min(elapsed / interval, 2));
                lastDraw = time;
            }
            frame = requestAnimationFrame(draw);
        }

        function sync() {
            document.body.classList.toggle('portal-background-paused', document.hidden);
            if (document.hidden) {
                stop();
                ctx.clearRect(0, 0, width, height);
                return;
            }
            if (canAnimate() && performance.now() - lastInteraction <= settleTime) {
                if (!frame) frame = requestAnimationFrame(draw);
            } else {
                // Idle, focused-form, touch and reduced-motion states keep a still field.
                stop();
                render(performance.now(), false);
            }
        }

        function size() {
            resizeFrame = 0;
            width = Math.max(1, innerWidth);
            height = Math.max(1, innerHeight);
            const ratio = Math.min(devicePixelRatio || 1, 1.25);
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            const cap = pointer.matches ? 85 : 40;
            const count = Math.min(cap, Math.max(45, Math.round(width * height / 16000)));
            const columns = Math.max(1, Math.round(Math.sqrt(count * width / height)));
            const rows = Math.ceil(count / columns);
            // A jittered grid spreads dots over the entire viewport, not around the cursor.
            dots = Array.from({ length: count }, (_, i) => {
                const homeX = (i % columns + 0.5 + (rnd() - 0.5) * 0.7) * width / columns;
                const homeY = (Math.floor(i / columns) + 0.5 + (rnd() - 0.5) * 0.7) * height / rows;
                return { homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0,
                    size: 1.4 + rnd() * 1.3, alpha: 0.36 + rnd() * 0.23,
                    phase: rnd() * Math.PI * 2, color: colors[i % colors.length] };
            });
            sync();
        }

        function move(event) {
            if (event.pointerType === 'touch' || !canAnimate()) return;
            mouse.x = event.clientX; mouse.y = event.clientY; mouse.active = true;
            lastInteraction = performance.now();
            if (!frame) frame = requestAnimationFrame(draw);
        }
        const leave = () => {
            const wasActive = mouse.active;
            mouse.active = false;
            if (wasActive && canAnimate()) {
                lastInteraction = performance.now();
                if (!frame) frame = requestAnimationFrame(draw);
            }
        };
        const isEditor = element => Boolean(element?.matches?.('input, textarea, select, [contenteditable="true"]'));
        document.addEventListener('focusin', event => { typing = isEditor(event.target); sync(); }, { signal });
        document.addEventListener('focusout', event => { typing = isEditor(event.relatedTarget); sync(); }, { signal });
        window.addEventListener('pointermove', move, { passive: true, signal });
        window.addEventListener('pointerout', event => { if (!event.relatedTarget) leave(); }, { passive: true, signal });
        window.addEventListener('blur', () => { mouse.active = false; stop(); }, { signal });
        window.addEventListener('resize', () => {
            if (!resizeFrame) resizeFrame = requestAnimationFrame(size);
        }, { passive: true, signal });
        window.addEventListener('nig:themechange', sync, { signal });
        document.addEventListener('visibilitychange', () => { leave(); sync(); }, { signal });
        motion.addEventListener('change', sync, { signal });
        pointer.addEventListener('change', size, { signal });
        window.addEventListener('pagehide', event => {
            leave(); stop(); cancelAnimationFrame(resizeFrame); resizeFrame = 0;
            if (!event.persisted) controller.abort();
        }, { signal });
        window.addEventListener('pageshow', sync, { signal });
        size();
    }

    function initLogoRendering() {
        // Alpha-only SVG effect: near-white backdrop becomes transparent; RGB is untouched.
        // Both original logo files remain byte-for-byte unchanged.
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        defs.setAttribute('width', '0'); defs.setAttribute('height', '0'); defs.setAttribute('aria-hidden', 'true');
        defs.style.position = 'absolute';
        defs.innerHTML = '<defs><filter id="portal-logo-alpha" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -20 -20 -20 0 59"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>';
        document.body.prepend(defs);
        document.querySelectorAll('img[src$="ng-header-logo.png"], img[src$="nsbm-logo.png"]').forEach(logo => logo.classList.add('portal-logo-alpha'));
    }

    document.addEventListener('DOMContentLoaded', () => {
        initHeader();
        setTheme(root.dataset.theme, false);
        initLogoRendering(); initBackground();
        document.querySelectorAll('.portal-greeting').forEach(greeting => {
            const hour = new Date().getHours();
            greeting.textContent = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
        });
        document.querySelectorAll('footer .footer-brand img, footer .footer-brand .brand-mark, footer .footer-brand .nsbm-badge, footer .footer-brand .brand-icon, footer .footer-brand .footer-logo, footer .footer-brand > svg, footer .footer-brand .portal-letter-mark').forEach(el => el.remove());
        document.querySelectorAll('.nig-reveal').forEach(button => button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.for); if (!input) return;
            input.type = input.type === 'password' ? 'text' : 'password';
            button.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
            button.setAttribute('aria-pressed', String(input.type === 'text'));
            button.setAttribute('title', input.type === 'password' ? 'Show password' : 'Hide password');
        }));
    });
})();

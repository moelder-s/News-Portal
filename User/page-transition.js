/* News In Green — simultaneous 500ms page slider for separate PHP/HTML documents.
   Both pages stay rendered during the transition, as in Retro Cake Lab.
   A same-origin iframe preserves each page's original scripts, forms and CSS.
   The browser address is kept current via History API. */
(function () {
  'use strict';

  const DURATION = 500;
  const EASING = 'cubic-bezier(.4,0,.2,1)';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inFrame = window !== window.top;
  const marker = 'nig-slider-2026';
  const ext = /\.(?:php|html?)$/i;
  const scope = /\/(?:User|Admin)\//i;
  let host = null;
  let activeFrame = null;
  let busy = false;
  let firstTransition = true;
  let nextUrl = '';

  function destination(link) {
    if (!link || !link.hasAttribute('href') || link.hasAttribute('download')) return null;
    if (link.target && link.target.toLowerCase() !== '_self') return null;
    const raw = link.getAttribute('href').trim();
    if (!raw || raw[0] === '#' || /^(?:javascript:|mailto:|tel:|data:)/i.test(raw)) return null;
    let url;
    try { url = new URL(raw, location.href); } catch (_) { return null; }
    if (url.origin !== location.origin) return null;
    if (!scope.test(url.pathname) || !ext.test(url.pathname)) return null;
    if (url.href === location.href) return null;
    // Preserve standard in-page anchors rather than reloading the document.
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return null;
    return url.href;
  }

  function clickHandler(e) {
    if (e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const link = e.target.closest && e.target.closest('a[href]');
    if (!link) return;
    const url = destination(link);
    if (!url) return;
    e.preventDefault();
    if (inFrame) {
      // Only our same-origin top-level host accepts the message.
      window.parent.postMessage({kind:marker, op:'navigate', url}, location.origin);
    } else {
      navigate(url, true);
    }
  }

  document.addEventListener('click', clickHandler);
  if (inFrame) return;

  function ensureHost() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'nig-slider-host';
    host.setAttribute('aria-label', 'Website page transition');
    // Append beside <body> so animating the outgoing body cannot move this host.
    document.documentElement.appendChild(host);
  }

  function createFrame(url) {
    const f = document.createElement('iframe');
    f.className = 'nig-slider-frame';
    f.title = 'News In Green page';
    f.setAttribute('aria-label', 'Website content');
    f.setAttribute('loading', 'eager');
    f.setAttribute('referrerpolicy', 'same-origin');
    f.style.opacity = '0';
    f.style.visibility = 'hidden';
    f.style.pointerEvents = 'none';
    f.src = url;
    return f;
  }

  function currentFrameUrl(frame) {
    try {
      const href = frame.contentWindow.location.href;
      return new URL(href, location.href).origin === location.origin ? href : null;
    } catch (_) { return null; }
  }

  function updateAddress(url, replace) {
    const existing = new URL(location.href);
    if (existing.href === url) return;
    try {
      if (replace) history.replaceState({nigSlider:true},'',url);
      else history.pushState({nigSlider:true},'',url);
    } catch (_) { /* Do not interrupt page navigation on History API errors. */ }
  }

  async function animate(oldScreen, newFrame) {
    newFrame.style.visibility = 'visible';
    newFrame.style.pointerEvents = 'auto';
    newFrame.style.opacity = '1';
    if (reduceMotion || !newFrame.animate || !oldScreen.animate) return;
    const options = {duration:DURATION, easing:EASING, fill:'both'};
    // Identical slide vectors and fade curve to the Retro Cake Lab reference.
    const leave = oldScreen.animate([
      {transform:'translate3d(0,0,0)',opacity:1},
      {transform:'translate3d(-60px,0,0)',opacity:0}
    ],options);
    const arrive = newFrame.animate([
      {transform:'translate3d(60px,0,0)',opacity:0},
      {transform:'translate3d(0,0,0)',opacity:1}
    ],options);
    try { await Promise.all([leave.finished,arrive.finished]); }
    catch (_) { /* Navigation may cancel an animation. */ }
    finally { leave.cancel(); arrive.cancel(); }
  }

  function navigate(url, addHistory) {
    if (busy) return;
    if (!url || !scope.test(new URL(url).pathname)) return;
    if (activeFrame && currentFrameUrl(activeFrame) === url) return;
    busy = true;
    nextUrl = url;
    ensureHost();
    const frame = createFrame(url);
    host.appendChild(frame);

    let completed = false;
    // If loading fails, preserve ordinary browser navigation.
    const fallback = setTimeout(() => {
      if (completed || !busy) return;
      completed = true;
      window.location.assign(url);
    }, 16000);

    frame.addEventListener('load', async () => {
      if (completed) return;
      const arrivedUrl = currentFrameUrl(frame);
      if (!arrivedUrl || !scope.test(new URL(arrivedUrl).pathname)) {
        completed = true;
        clearTimeout(fallback);
        window.location.assign(url);
        return;
      }
      completed = true;
      clearTimeout(fallback);
      const prior = activeFrame || document.body;
      await animate(prior,frame);
      if (activeFrame) {
        activeFrame.remove();
      } else {
        // Keep the original document functional until the first slide completes.
        document.body.classList.add('nig-slider-source-hidden');
        document.documentElement.classList.add('nig-slider-active');
      }
      activeFrame = frame;
      if (addHistory) updateAddress(arrivedUrl,false);
      document.title = frame.contentDocument?.title || document.title;
      try { frame.contentWindow.focus(); } catch (_) {}
      busy = false;
    },{once:true});
  }

  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || e.data.kind !== marker || e.data.op !== 'navigate') return;
    if (!activeFrame || e.source !== activeFrame.contentWindow) return;
    let url;
    try { url = new URL(e.data.url,location.href); } catch (_) { return; }
    if (url.origin !== location.origin || !scope.test(url.pathname) || !ext.test(url.pathname)) return;
    navigate(url.href,true);
  });

  window.addEventListener('popstate', () => {
    if (activeFrame) navigate(location.href,false);
  });
})();

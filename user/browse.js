document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    document.getElementById('nav-burger')?.addEventListener('click', () => {
        document.getElementById('main-nav')?.classList.toggle('open');
    });

    const container = document.getElementById('articles-container');
    let data = [];
    let loaded = false;
    const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
    const allowedCategories = categoryButtons.map(button => button.dataset.category);
    const routeCategory = () => {
        const requested = new URL(location.href).searchParams.get('category');
        return allowedCategories.includes(requested) ? requested : 'All';
    };
    let chosen = routeCategory();
    const syncCategoryButtons = () => categoryButtons.forEach(button => {
        const selected = button.dataset.category === chosen;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
    syncCategoryButtons();
    let page = 1;
    const perPage = 6;

    const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));

    const fallbackImage = category => ({
        Academic: 'Article.jpg', Events: 'Events.jpg', Sports: 'Sports.jpg', General: 'General.jpg'
    }[String(category || '').trim()] || 'Article.jpg');

    function updateCategoryURL() {
        const url = new URL(location.href);
        if (chosen === 'All') url.searchParams.delete('category');
        else url.searchParams.set('category', chosen);
        if (url.href !== location.href) history.pushState(null, '', url);
    }

    function draw() {
        if (!loaded || !container) return;
        const query = (document.getElementById('search-input')?.value || '').toLowerCase();
        const from = document.getElementById('from-date')?.value || '';
        const to = document.getElementById('to-date')?.value || '';
        const status = document.getElementById('filter-status');
        const invalidRange = Boolean(from && to && from > to);
        if (status) {
            status.hidden = !invalidRange;
            status.textContent = invalidRange ? 'The From date must be on or before the To date.' : '';
        }
        if (invalidRange) return;
        const found = data.filter(article =>
            (chosen === 'All' || article.category === chosen) &&
            (`${article.title} ${article.description} ${article.category}`).toLowerCase().includes(query) &&
            (!from || String(article.created_at || '').slice(0, 10) >= from) &&
            (!to || String(article.created_at || '').slice(0, 10) <= to)
        );
        const pages = Math.max(1, Math.ceil(found.length / perPage));
        if (page > pages) page = pages;
        const chunk = found.slice((page - 1) * perPage, page * perPage);

        container.innerHTML = chunk.map(article => {
            const id = Number(article.id);
            const fallback = fallbackImage(article.category);
            const image = String(article.image || '').trim() || fallback;
            const saved = Number(article.is_bookmarked) === 1;
            return `
                <article class="article-card">
                    <a href="article.php?id=${id}" class="article-card-link">
                        <img class="article-card-image" loading="lazy" src="${safe(image)}" alt="${safe(article.title)}" onerror="this.onerror=null;this.src='${fallback}';">
                        <span class="article-category">${safe(article.category)}</span>
                        <h3>${safe(article.title)}</h3>
                        <p>${safe(article.description)}</p>
                        <div class="article-meta">${safe(article.created_at)}</div>
                        <span class="read-article-link">Read full article →</span>
                    </a>
                    <br class="bookmark-break" aria-hidden="true">
                    <button type="button" class="bookmark-card-button${saved ? ' is-saved' : ''}"
                        data-bookmark-button data-article-id="${id}" data-saved="${saved ? '1' : '0'}"
                        aria-pressed="${saved ? 'true' : 'false'}">
                        ${saved ? '✓ Saved to bookmarks' : '☆ Save bookmark'}
                    </button>
                </article>`;
        }).join('');

        const summary = document.getElementById('results-count');
        if (summary) summary.textContent = found.length ?
            `Showing ${(page - 1) * perPage + 1}–${Math.min(page * perPage, found.length)} of ${found.length} articles` : '0 articles';
        container.setAttribute('aria-busy', 'false');
        document.getElementById('empty-message')?.toggleAttribute('hidden', found.length !== 0);
        const pageNumber = document.getElementById('page-number');
        if (pageNumber) pageNumber.textContent = `${page} / ${pages}`;
        document.getElementById('previous-btn')?.toggleAttribute('disabled', page <= 1);
        document.getElementById('next-btn')?.toggleAttribute('disabled', page >= pages);
    }

    container?.addEventListener('click', async event => {
        const saveButton = event.target.closest('[data-bookmark-button]');
        if (!saveButton) return;

        event.preventDefault();
        event.stopPropagation();
        if (saveButton.disabled) return;

        saveButton.disabled = true;
        const formData = new URLSearchParams({
            article_id: saveButton.dataset.articleId || '',
            csrf: csrfToken
        });

        try {
            const response = await fetch('bookmark_action.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept': 'application/json' },
                body: formData.toString(),
                credentials: 'same-origin'
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Could not update bookmark.');

            const saved = Boolean(result.saved);
            saveButton.dataset.saved = saved ? '1' : '0';
            saveButton.setAttribute('aria-pressed', String(saved));
            saveButton.classList.toggle('is-saved', saved);
            saveButton.textContent = saved ? '✓ Saved to bookmarks' : '☆ Save bookmark';

            const article = data.find(item => Number(item.id) === Number(saveButton.dataset.articleId));
            if (article) article.is_bookmarked = saved ? 1 : 0;
        } catch (error) {
            window.alert(error.message || 'Could not update bookmark. Please try again.');
        } finally {
            saveButton.disabled = false;
        }
    });

    categoryButtons.forEach(categoryButton => {
        categoryButton.addEventListener('click', () => {
            chosen = categoryButton.dataset.category || categoryButton.textContent.trim();
            syncCategoryButtons();
            updateCategoryURL();
            page = 1;
            draw();
        });
    });

    window.addEventListener('popstate', () => { chosen = routeCategory(); page = 1; syncCategoryButtons(); draw(); });

    document.getElementById('search-input')?.addEventListener('input', () => { page = 1; draw(); });
    document.getElementById('browse-filters')?.addEventListener('submit', event => { event.preventDefault(); page = 1; draw(); });
    document.getElementById('clear-btn')?.addEventListener('click', () => {
        ['search-input', 'from-date', 'to-date'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        chosen = 'All';
        syncCategoryButtons();
        updateCategoryURL();
        page = 1;
        draw();
    });
    document.getElementById('previous-btn')?.addEventListener('click', () => { if (page > 1) page--; draw(); });
    document.getElementById('next-btn')?.addEventListener('click', () => { page++; draw(); });

    fetch('articles_api.php', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
        .then(response => {
            if (!response.ok) throw new Error('Could not load articles.');
            return response.json();
        })
        .then(result => {
            if (!result.success) throw new Error('Could not load articles.');
            data = Array.isArray(result.articles) ? result.articles : [];
            loaded = true;
            draw();
        })
        .catch(() => {
            if (container) {
                container.setAttribute('aria-busy', 'false');
                container.textContent = 'Could not load articles. Check MySQL and PHP.';
            }
        });
});

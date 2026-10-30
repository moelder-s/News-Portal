'use strict';
// Frontend-only categories page.
// To connect your DB later: set window.newsCategoriesData = [{id, name, articles}] before this script,
// or call window.updateNewsCategories(list) after fetching.
const STORE_KEY = 'nigCategories';
const defaults = ['Academic', 'Events', 'Sports', 'General'].map((name, i) => ({ id: i + 1, name, articles: 0 }));
const $ = id => document.getElementById(id);

let categories = load();

function load() {
    if (Array.isArray(window.newsCategoriesData)) return window.newsCategoriesData;
    try {
        const saved = JSON.parse(localStorage.getItem(STORE_KEY));
        if (Array.isArray(saved) && saved.length) return saved;
    } catch (e) { /* storage unavailable */ }
    return defaults.map(c => ({ ...c }));
}
function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(categories)); } catch (e) { /* ignore */ }
}

/* ---------- Render ---------- */
function render() {
    const body = $('catRows');
    body.replaceChildren();
    $('emptyMessage').hidden = categories.length > 0;
    categories.forEach(c => {
        const tr = document.createElement('tr');
        const name = document.createElement('td'); name.textContent = c.name;
        const count = document.createElement('td'); count.className = 'count'; count.textContent = Number(c.articles || 0).toLocaleString();
        const actions = document.createElement('td');
        const rename = document.createElement('button');
        rename.type = 'button'; rename.className = 'action rename'; rename.textContent = 'Rename';
        rename.addEventListener('click', () => openRename(c));
        const del = document.createElement('button');
        del.type = 'button'; del.className = 'action delete'; del.textContent = 'Delete';
        del.addEventListener('click', () => openDelete(c));
        actions.append(rename, del);
        tr.append(name, count, actions);
        body.append(tr);
    });
}

/* ---------- Modal ---------- */
let onConfirm = null;
function openModal({ title, text, input, value, okLabel, danger, confirm }) {
    $('modalTitle').textContent = title;
    $('modalText').hidden = !text; $('modalText').textContent = text || '';
    $('modalInput').hidden = !input; $('modalInput').value = value || '';
    $('modalError').hidden = true;
    $('modalOk').textContent = okLabel;
    $('modalOk').classList.toggle('danger', !!danger);
    onConfirm = confirm;
    $('modal').hidden = false;
    (input ? $('modalInput') : $('modalOk')).focus();
}
function closeModal() { $('modal').hidden = true; onConfirm = null; }
function showError(msg) { $('modalError').textContent = msg; $('modalError').hidden = false; }
function nameTaken(n, exceptId) { return categories.some(c => c.id !== exceptId && c.name.toLowerCase() === n.toLowerCase()); }

function openNew() {
    openModal({
        title: 'New category', input: true, okLabel: 'Add',
        confirm: () => {
            const n = $('modalInput').value.trim();
            if (!n) return showError('Please enter a name.');
            if (nameTaken(n)) return showError('That category already exists.');
            categories.push({ id: Date.now(), name: n, articles: 0 });
            save(); render(); closeModal();
        }
    });
}
function openRename(c) {
    openModal({
        title: 'Rename category', input: true, value: c.name, okLabel: 'Save',
        confirm: () => {
            const n = $('modalInput').value.trim();
            if (!n) return showError('Please enter a name.');
            if (nameTaken(n, c.id)) return showError('That category already exists.');
            c.name = n; save(); render(); closeModal();
        }
    });
}
function openDelete(c) {
    openModal({
        title: 'Delete category', okLabel: 'Delete', danger: true,
        text: `Delete “${c.name}”?` + (Number(c.articles) ? ` It has ${c.articles} article(s).` : ''),
        confirm: () => { categories = categories.filter(x => x.id !== c.id); save(); render(); closeModal(); }
    });
}

$('newBtn').addEventListener('click', openNew);
$('modalCancel').addEventListener('click', closeModal);
$('modalOk').addEventListener('click', () => onConfirm && onConfirm());
$('modalInput').addEventListener('keydown', e => { if (e.key === 'Enter') onConfirm && onConfirm(); });
$('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('modal').hidden) closeModal(); });

/* ---------- Theme: Day is always the default ---------- */
document.body.classList.remove('night');
document.body.classList.add('day');
$('themeToggle').addEventListener('click', () => {
    const night = document.body.classList.toggle('night');
    document.body.classList.toggle('day', !night);
    $('themeLabel').textContent = night ? 'Night' : 'Day';
    $('themeToggle').setAttribute('aria-pressed', String(night));
});

document.querySelectorAll('[data-placeholder]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    alert('Connect this link to your project route later.');
}));

$('year').textContent = new Date().getFullYear();

window.updateNewsCategories = list => { categories = Array.isArray(list) ? list : categories; render(); };
render();
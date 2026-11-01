'use strict';
// Categories page connected to PHP + MySQL (admin/api/categories.php)
const API = 'api/categories.php';
const $ = id => document.getElementById(id);

let categories = [];

/* ---------- API helper ---------- */
async function api(method, url, body) {
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
    });
    let data = {};
    try { data = await res.json(); } catch (e) { /* empty response */ }
    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
}

async function loadCategories() {
    try {
        const list = await api('GET', API);
        categories = list.map(c => ({ id: Number(c.id), name: c.name, articles: Number(c.articles || 0) }));
    } catch (e) {
        categories = [];
        alert('Could not load categories. Is Apache + MySQL running?');
    }
    render();
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
        confirm: async () => {
            const n = $('modalInput').value.trim();
            if (!n) return showError('Please enter a name.');
            if (nameTaken(n)) return showError('That category already exists.');
            try {
                await api('POST', API, { name: n });
                await loadCategories();
                closeModal();
            } catch (e) { showError(e.message); }
        }
    });
}
function openRename(c) {
    openModal({
        title: 'Rename category', input: true, value: c.name, okLabel: 'Save',
        confirm: async () => {
            const n = $('modalInput').value.trim();
            if (!n) return showError('Please enter a name.');
            if (nameTaken(n, c.id)) return showError('That category already exists.');
            try {
                await api('PUT', API + '?id=' + c.id, { name: n });
                await loadCategories();
                closeModal();
            } catch (e) { showError(e.message); }
        }
    });
}
function openDelete(c) {
    openModal({
        title: 'Delete category', okLabel: 'Delete', danger: true,
        text: `Delete “${c.name}”?` + (Number(c.articles) ? ` It has ${c.articles} article(s).` : ''),
        confirm: async () => {
            try {
                await api('DELETE', API + '?id=' + c.id);
                await loadCategories();
                closeModal();
            } catch (e) { showError(e.message); }
        }
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

loadCategories();
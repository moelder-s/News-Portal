'use strict';
// Frontend-only. Set window.newsAnnouncementsData = [{id,title,type,category}] before this script,
// or call window.updateNewsAnnouncements(array) after fetching your PHP/API response.
// When a new item is published, a "announcement:create" event is fired with the item in event.detail.
const sampleData = [
  {id:1,title:'NSBM Green University Expands Sustainability Initiatives',type:'Featured',category:'Academic'},
  {id:2,title:'Annual Tech Fest 2026 — Registration Now Open',type:'Breaking',category:'Events'},
  {id:3,title:'NSBM Sports Day Highlights',type:'Featured',category:'Sports'},
  {id:4,title:'Campus Closed Tomorrow Due to Weather',type:'Breaking',category:'General'}
];
let liveData = Array.isArray(window.newsAnnouncementsData) ? [...window.newsAnnouncementsData] : [];
const $ = id => document.getElementById(id);
let nextId = 1000;

function currentData() { return $('demoToggle').checked ? sampleData : liveData; }

function filtered() {
  const q = $('annSearch').value.trim().toLowerCase();
  const type = $('typeFilter').value;
  return currentData().filter(a =>
    (type === 'all' || a.type === type) &&
    `${a.title} ${a.type} ${a.category}`.toLowerCase().includes(q));
}

function pill(text, cls) {
  const s = document.createElement('span');
  s.className = 'category-pill ' + String(cls || '').toLowerCase();
  s.textContent = text;
  return s;
}

function render() {
  const demo = $('demoToggle').checked;
  $('demoNotice').hidden = !demo;
  const all = filtered();
  const rows = $('annRows');
  rows.replaceChildren();
  all.forEach(a => {
    const tr = document.createElement('tr');
    const t = document.createElement('td'); t.className = 'article-title'; t.textContent = a.title;
    const ty = document.createElement('td'); ty.append(pill(a.type, 'type-' + a.type));
    const c = document.createElement('td'); c.append(pill(a.category, a.category));
    const act = document.createElement('td');
    if (!demo) {
      const del = document.createElement('button');
      del.type = 'button'; del.className = 'view-link danger'; del.textContent = '✕ Remove';
      del.addEventListener('click', () => {
        liveData = liveData.filter(x => x.id !== a.id);
        document.dispatchEvent(new CustomEvent('announcement:delete', {detail: a}));
        render();
      });
      act.append(del);
    } else act.textContent = '—';
    tr.append(t, ty, c, act);
    rows.append(tr);
  });
  const total = currentData().length;
  $('emptyMessage').hidden = all.length > 0;
  $('emptyMessage').textContent = total ? 'No announcements match your search.' : 'No featured or breaking items right now.';
  $('countNote').textContent = total ? `${total} item${total === 1 ? '' : 's'} published` : 'No items yet';
}

function openModal() { $('modal').hidden = false; $('fTitle').focus(); }
function closeModal() { $('modal').hidden = true; $('annForm').reset(); }

$('newBtn').addEventListener('click', () => {
  if ($('demoToggle').checked) { $('demoToggle').checked = false; render(); }
  openModal();
});
$('cancelBtn').addEventListener('click', closeModal);
$('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('modal').hidden) closeModal(); });
$('annForm').addEventListener('submit', e => {
  e.preventDefault();
  const item = {id: nextId++, title: $('fTitle').value.trim(), type: $('fType').value, category: $('fCategory').value};
  if (!item.title) return;
  liveData.unshift(item);
  document.dispatchEvent(new CustomEvent('announcement:create', {detail: item}));
  closeModal(); render();
});
$('demoToggle').addEventListener('change', render);
$('annSearch').addEventListener('input', render);
$('typeFilter').addEventListener('change', render);

// Theme toggle + placeholder links (same behaviour as the reports page)
$('year').textContent = new Date().getFullYear();
$('themeToggle').addEventListener('click', () => {
  const night = document.body.classList.toggle('night');
  $('themeLabel').textContent = night ? 'Night' : 'Day';
  $('themeToggle').setAttribute('aria-pressed', String(night));
});
document.querySelectorAll('[data-placeholder]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault(); alert('Connect this link to your project route later.');
}));
window.updateNewsAnnouncements = function (data) { liveData = Array.isArray(data) ? [...data] : []; if (!$('demoToggle').checked) render(); };
render();
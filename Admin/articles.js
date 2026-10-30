'use strict';
const storageKey = 'news-in-green-articles-v1';
const rows = document.getElementById('articleRows');
const dialog = document.getElementById('articleDialog');
const form = document.getElementById('articleForm');
const notice = document.getElementById('notice');
let articles = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) articles = saved.filter(a => a && typeof a.title === 'string' && typeof a.author === 'string' && typeof a.category === 'string' && ['Draft', 'Published'].includes(a.status) && Number.isFinite(a.created));
} catch { notice.textContent = 'Browser storage is unavailable. New articles will last for this session only.'; }
function renderArticles() {
  rows.replaceChildren();
  if (!articles.length) {
    const row = rows.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.className = 'empty';
    cell.textContent = 'No articles yet — create the first one.';
    return;
  }
  articles.forEach(article => {
    const row = rows.insertRow();
    [article.title, article.category, article.author, article.status, new Date(article.created).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })].forEach((value, index) => {
      const cell = row.insertCell();
      if (index === 3) {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = value;
        cell.append(badge);
      } else cell.textContent = value;
    });
  });
}
document.getElementById('newArticle').addEventListener('click', () => dialog.showModal());
for (const id of ['closeDialog', 'cancelDialog']) document.getElementById(id).addEventListener('click', () => dialog.close());
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const title = data.get('title').trim();
  const author = data.get('author').trim();
  const content = data.get('content').trim();
  if (!title || !author || !content) {
    notice.textContent = 'Please enter a title, author, and article content.';
    return;
  }
  articles.unshift({ title, author, content, category:data.get('category'), status:data.get('status'), created:Date.now() });
  try {
    localStorage.setItem(storageKey, JSON.stringify(articles));
    notice.textContent = 'Article saved in this browser.';
  } catch { notice.textContent = 'Article added for this session. Browser storage could not save it.'; }
  renderArticles();
  form.reset();
  dialog.close();
});
const toggle = document.getElementById('themeToggle');
function setTheme(light) {
  document.body.classList.toggle('light', light);
  toggle.setAttribute('aria-checked', String(!light));
  document.getElementById('themeLabel').textContent = light ? 'Day' : 'Night';
}
try { setTheme(localStorage.getItem('news-in-green-theme') === 'light'); } catch { setTheme(false); }
toggle.addEventListener('click', () => {
  const light = !document.body.classList.contains('light');
  setTheme(light);
  try { localStorage.setItem('news-in-green-theme', light ? 'light' : 'dark'); } catch { /* Theme still works without storage. */ }
});
// Seeded star positions keep the background stable when resizing.
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
function drawStars() {
  if (!ctx) return;
  const width = window.innerWidth, height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let seed = 57;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 310; i++) {
    const x = random() * width, y = random() * height;
    const radius = .35 + random() * 1.1;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,232,230,${.15 + random() * .55})`;
    ctx.fill();
  }
}
window.addEventListener('resize', drawStars);
drawStars();
renderArticles();

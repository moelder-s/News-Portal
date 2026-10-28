/* =====================================================
   1) THEME TOGGLE (Day / Night) — saved in localStorage
   ===================================================== */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeLabel.textContent = theme === 'dark' ? 'Night' : 'Day';
  try { localStorage.setItem('nig-theme', theme); } catch (e) {}
}

applyTheme(root.getAttribute('data-theme') || 'dark');

themeToggle.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});


/* =====================================================
   2) BACKGROUND ANIMATION
      Dark  -> twinkling stars
      Light -> floating green dust
   ===================================================== */
(() => {
  const canvas = document.getElementById('bg-fx');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  const isDark = () => root.getAttribute('data-theme') === 'dark';

  const makeParticle = () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.4,
    speed: Math.random() * 0.3 + 0.05,
    phase: Math.random() * Math.PI * 2
  });

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.floor((w * h) / 9000);   // bigger number = fewer particles
    particles = Array.from({ length: count }, makeParticle);
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const dark = isDark();

    for (const p of particles) {
      p.phase += 0.02;
      const alpha = 0.35 + 0.35 * Math.sin(p.phase);

      if (dark) {
        // stars: slow drift + twinkle
        p.x += p.speed * 0.2;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      } else {
        // green dust: floats upward, gentle sway
        p.y -= p.speed;
        p.x += Math.sin(p.phase) * 0.15;
        ctx.fillStyle = `rgba(30,140,90,${alpha * 0.6})`;
      }

      if (p.x > w) p.x = 0;
      if (p.x < 0) p.x = w;
      if (p.y < 0) { p.y = h; p.x = Math.random() * w; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  resize();

  // no animation for users who prefer reduced motion
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    requestAnimationFrame(frame);
  }
})();


/* =====================================================
   3) CATEGORIES (add / rename / delete) — localStorage
   ===================================================== */
const STORE_KEY = 'nig-categories';
const defaultCategories = [
  { id: 1, name: 'Academic', articles: 0 },
  { id: 2, name: 'Events',   articles: 0 },
  { id: 3, name: 'Sports',   articles: 0 },
  { id: 4, name: 'General',  articles: 0 }
];

let categories;
try {
  categories = JSON.parse(localStorage.getItem(STORE_KEY)) || defaultCategories;
} catch (e) {
  categories = defaultCategories;
}

const save = () => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(categories)); } catch (e) {}
};

const body = document.getElementById('catBody');
const emptyMsg = document.getElementById('emptyMsg');
const dialog = document.getElementById('catDialog');
const form = document.getElementById('catForm');
const input = document.getElementById('catInput');
const errorEl = document.getElementById('catError');
const dialogTitle = document.getElementById('dialogTitle');
let editingId = null;   // null = adding new

function render() {
  body.innerHTML = '';
  emptyMsg.hidden = categories.length > 0;

  categories.forEach(cat => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = cat.name;

    const tdCount = document.createElement('td');
    tdCount.className = 'count';
    tdCount.textContent = cat.articles;

    const tdActions = document.createElement('td');
    tdActions.className = 'row-actions';

    const renameBtn = document.createElement('button');
    renameBtn.className = 'btn-rename';
    renameBtn.textContent = 'Rename';
    renameBtn.addEventListener('click', () => openDialog(cat.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => removeCategory(cat.id));

    tdActions.append(renameBtn, deleteBtn);
    tr.append(tdName, tdCount, tdActions);
    body.appendChild(tr);
  });
}

function openDialog(id = null) {
  editingId = id;
  errorEl.hidden = true;
  if (id === null) {
    dialogTitle.textContent = 'New category';
    input.value = '';
  } else {
    dialogTitle.textContent = 'Rename category';
    input.value = categories.find(c => c.id === id).name;
  }
  dialog.showModal();
  input.focus();
  input.select();
}

function removeCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;
  if (confirm(`Delete category "${cat.name}"?`)) {
    categories = categories.filter(c => c.id !== id);
    save();
    render();
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return;

  const duplicate = categories.some(
    c => c.name.toLowerCase() === name.toLowerCase() && c.id !== editingId
  );
  if (duplicate) {
    errorEl.textContent = 'That category already exists.';
    errorEl.hidden = false;
    return;
  }

  if (editingId === null) {
    const nextId = categories.reduce((m, c) => Math.max(m, c.id), 0) + 1;
    categories.push({ id: nextId, name, articles: 0 });
  } else {
    categories.find(c => c.id === editingId).name = name;
  }

  save();
  render();
  dialog.close();
});

document.getElementById('newCategoryBtn').addEventListener('click', () => openDialog());
document.getElementById('cancelBtn').addEventListener('click', () => dialog.close());

// Log out button (connect to your real logout later)
document.getElementById('logoutBtn').addEventListener('click', () => {
  window.location.href = 'admin-login.html';
});

render();
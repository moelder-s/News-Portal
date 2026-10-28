/* =========================================================
   1. TWINKLING STARS (canvas)
   ========================================================= */
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let W, H, stars = [], shooters = [];

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;

    const count = Math.floor((W * H) / 7000);
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + 0.3,
            drift: Math.random() * 0.12 + 0.02,
            phase: Math.random() * Math.PI * 2,
            speed: Math.random() * 0.025 + 0.008
        });
    }
}

function spawnShooter() {
    shooters.push({
        x: Math.random() * W * 0.7 + W * 0.3,
        y: Math.random() * H * 0.35,
        vx: -(Math.random() * 6 + 8),
        vy: Math.random() * 3 + 4,
        life: 0,
        max: 40 + Math.random() * 20
    });
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
        s.phase += s.speed;
        const a = 0.25 + (Math.sin(s.phase) + 1) * 0.35;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(230, 255, 245, " + a + ")";
        ctx.fill();

        if (!reduceMotion) {
            s.y += s.drift;
            s.x -= s.drift * 0.4;
            if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
            if (s.x < 0) s.x = W;
        }
    }

    for (let i = shooters.length - 1; i >= 0; i--) {
        const m = shooters[i];
        const fade = 1 - m.life / m.max;

        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 6, m.y - m.vy * 6);
        g.addColorStop(0, "rgba(255,255,255," + fade + ")");
        g.addColorStop(1, "rgba(120,220,170,0)");

        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 6, m.y - m.vy * 6);
        ctx.stroke();

        m.x += m.vx;
        m.y += m.vy;
        m.life++;
        if (m.life > m.max) shooters.splice(i, 1);
    }

    if (!reduceMotion) {
        if (Math.random() < 0.003) spawnShooter();
        requestAnimationFrame(draw);
    }
}

window.addEventListener("resize", resize);
resize();
draw();

/* =========================================================
   2. DAY / NIGHT TOGGLE
   Day = default (screenshot look)
   ========================================================= */
const body = document.body;
const themeBtn = document.getElementById("theme-toggle");
const themeLabel = themeBtn.querySelector(".theme-label");

function applyTheme(mode) {
    const night = mode === "night";
    body.classList.toggle("night", night);
    themeLabel.textContent = night ? "Night" : "Day";
    themeBtn.setAttribute("aria-pressed", String(!night));
    themeBtn.setAttribute("aria-label", night ? "Switch to day mode" : "Switch to night mode");
}

applyTheme(localStorage.getItem("nig-admin-theme") || "day");

themeBtn.addEventListener("click", () => {
    const next = body.classList.contains("night") ? "day" : "night";
    localStorage.setItem("nig-admin-theme", next);
    applyTheme(next);
});

/* =========================================================
   3. ANNOUNCEMENTS (add / edit / delete -> localStorage)
   ========================================================= */
const KEY = "nig-announcements";

function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
}

function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
}

let items = load();
let editingId = null;

const rowsEl = document.getElementById("rows");
const emptyEl = document.getElementById("empty-msg");
const modal = document.getElementById("modal");
const form = document.getElementById("ann-form");
const fTitle = document.getElementById("f-title");
const fType = document.getElementById("f-type");
const fCat = document.getElementById("f-cat");

function render() {
    rowsEl.innerHTML = "";

    items.forEach((item, i) => {
        const tr = document.createElement("tr");
        tr.style.animationDelay = (i * 60) + "ms";

        const tdTitle = document.createElement("td");
        tdTitle.textContent = item.title;

        const tdType = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "badge " + item.type.toLowerCase();
        badge.textContent = item.type;
        tdType.appendChild(badge);

        const tdCat = document.createElement("td");
        tdCat.textContent = item.category;

        const tdAct = document.createElement("td");
        const box = document.createElement("div");
        box.className = "actions";

        const editBtn = document.createElement("button");
        editBtn.className = "mini-btn";
        editBtn.type = "button";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => openModal(item.id));

        const delBtn = document.createElement("button");
        delBtn.className = "mini-btn danger";
        delBtn.type = "button";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => removeItem(item.id));

        box.append(editBtn, delBtn);
        tdAct.appendChild(box);

        tr.append(tdTitle, tdType, tdCat, tdAct);
        rowsEl.appendChild(tr);
    });

    emptyEl.style.display = items.length ? "none" : "block";
}

function openModal(id) {
    editingId = id || null;
    document.getElementById("modal-title").textContent =
        id ? "Edit announcement" : "New announcement";

    if (id) {
        const it = items.find(x => x.id === id);
        fTitle.value = it.title;
        fType.value = it.type;
        fCat.value = it.category;
    } else {
        form.reset();
    }

    modal.hidden = false;
    fTitle.focus();
}

function closeModal() {
    modal.hidden = true;
    editingId = null;
}

function removeItem(id) {
    if (!confirm("Delete this announcement?")) return;
    items = items.filter(x => x.id !== id);
    save(items);
    render();
}

form.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
        title: fTitle.value.trim(),
        type: fType.value,
        category: fCat.value
    };
    if (!data.title) return;

    if (editingId) {
        items = items.map(x => x.id === editingId ? { ...x, ...data } : x);
    } else {
        items.unshift({ id: Date.now(), ...data });
    }

    save(items);
    render();
    closeModal();
});

document.getElementById("new-btn").addEventListener("click", () => openModal());
document.getElementById("cancel-btn").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
});

render();
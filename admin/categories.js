/* ================= STARS ANIMATION ================= */
var canvas = document.getElementById("sky");
var ctx = canvas.getContext("2d");
var stars = [];
var shooting = null;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var count = Math.floor(canvas.width * canvas.height / 9000);
  stars = [];
  for (var i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.006,
      drift: Math.random() * 0.07 + 0.01
    });
  }
}

setInterval(function () {
  if (!shooting) {
    shooting = {
      x: Math.random() * canvas.width * 0.7,
      y: Math.random() * canvas.height * 0.3,
      vx: 7, vy: 3.5, life: 1
    };
  }
}, 6000);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < stars.length; i++) {
    var s = stars[i];
    s.phase += s.speed;
    s.y -= s.drift;
    if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
    var a = 0.3 + 0.7 * Math.abs(Math.sin(s.phase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255," + a + ")";
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(255,255,255,0.8)";
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  if (shooting) {
    var tx = shooting.x - shooting.vx * 12;
    var ty = shooting.y - shooting.vy * 12;
    var g = ctx.createLinearGradient(shooting.x, shooting.y, tx, ty);
    g.addColorStop(0, "rgba(255,255,255," + shooting.life + ")");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shooting.x, shooting.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    shooting.x += shooting.vx;
    shooting.y += shooting.vy;
    shooting.life -= 0.012;
    if (shooting.life <= 0) shooting = null;
  }
  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
resize();
draw();

/* ================= DAY / NIGHT ================= */
var toggle = document.getElementById("themeToggle");
var label = document.getElementById("themeLabel");

function applyTheme(mode) {
  document.body.classList.toggle("night", mode === "night");
  label.textContent = (mode === "night") ? "Night" : "Day";
  try { localStorage.setItem("nig-theme", mode); } catch (e) {}
}

toggle.addEventListener("click", function () {
  applyTheme(document.body.classList.contains("night") ? "day" : "night");
});

var saved = "day";
try { saved = localStorage.getItem("nig-theme") || "day"; } catch (e) {}
applyTheme(saved);

/* ================= CATEGORIES TABLE ================= */
var categories = [
  { name: "Academic", articles: 0 },
  { name: "Events",   articles: 0 },
  { name: "Sports",   articles: 0 },
  { name: "General",  articles: 0 }
];

var tbody = document.getElementById("catBody");

function render() {
  tbody.innerHTML = "";
  categories.forEach(function (c, i) {
    var tr = document.createElement("tr");
    tr.style.animationDelay = (i * 0.08) + "s";
    tr.innerHTML =
      "<td>" + c.name + "</td>" +
      "<td class='count'>" + c.articles + "</td>" +
      "<td class='btns'>" +
        "<button class='btn-sm rename' data-i='" + i + "'>Rename</button>" +
        "<button class='btn-sm delete' data-i='" + i + "'>Delete</button>" +
      "</td>";
    tbody.appendChild(tr);
  });
}

tbody.addEventListener("click", function (e) {
  var i = e.target.getAttribute("data-i");
  if (i === null) return;
  if (e.target.classList.contains("rename")) {
    var n = prompt("New name:", categories[i].name);
    if (n && n.trim()) { categories[i].name = n.trim(); render(); }
  } else if (e.target.classList.contains("delete")) {
    if (confirm('Delete "' + categories[i].name + '"?')) {
      categories.splice(i, 1);
      render();
    }
  }
});

document.getElementById("addBtn").addEventListener("click", function () {
  var n = prompt("Category name:");
  if (n && n.trim()) {
    categories.push({ name: n.trim(), articles: 0 });
    render();
  }
});

render();
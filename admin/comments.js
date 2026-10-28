// Frontend-only demo. Replace the sample data and handlers with PHP/API integration later.
const comments = [];
// To preview action buttons, temporarily add an item like:
// comments.push({id:1, commenter:"Demo User", comment:"Great article!", article:"Green Energy", date:"2026-10-28"});
const rows = document.getElementById("commentRows");

const empty = document.getElementById("emptyMessage");

function renderComments() {

  rows.replaceChildren();
  empty.hidden = comments.length > 0;

  comments.forEach(item => {
    const tr = document.createElement("tr");

    [item.commenter, item.comment, item.article, item.date].forEach(value => {
      
      const td = document.createElement("td");
      td.textContent = value ?? "";
      tr.append(td);
    });

    const actions = document.createElement("td");

    for (const decision of ["Approve", "Reject"]) {

      const button = document.createElement("button");
      button.type = "button";
      button.className = "action " + decision.toLowerCase();
      button.textContent = decision;

      button.addEventListener("click", () => {
        // Demo only: remove from pending list; no database update occurs.
        const index = comments.findIndex(c => c.id === item.id);
        if (index !== -1) comments.splice(index, 1);
        renderComments();
      });

      actions.append(button);
    }
    tr.append(actions);

    rows.append(tr);
  });
}

// Always start in Day mode on every page load or refresh.
document.body.classList.remove("night");

const toggle = document.getElementById("themeToggle");

const themeLabel = document.getElementById("themeLabel");

themeLabel.textContent = "Day";

toggle.setAttribute("aria-pressed", "false");

toggle.addEventListener("click", () => {

  const night = document.body.classList.toggle("night");
  themeLabel.textContent = night ? "Night" : "Day";
  toggle.setAttribute("aria-pressed", String(night));
});

document.querySelectorAll("[data-placeholder]").forEach(a => a.addEventListener("click", e => {

  e.preventDefault();
  alert("Connect this link to your project's route later.");
}));

renderComments();

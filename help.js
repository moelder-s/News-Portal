function toggleTheme() {
    const body = document.body;
    const label = document.getElementById("toggle-label");

    if (body.classList.contains("light-mode")) {
        body.classList.remove("light-mode");
        body.classList.add("dark-mode");
        label.textContent = "Night";
    } else {
        body.classList.remove("dark-mode");
        body.classList.add("light-mode");
        label.textContent = "Day";
    }
}
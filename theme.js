document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const themeLabel = themeToggle.querySelector('.toggle-label');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-pressed', 'true');
        if (themeLabel) themeLabel.textContent = 'Night';
    } else {
        if (themeLabel) themeLabel.textContent = 'Day';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-pressed', 'false');
            if (themeLabel) themeLabel.textContent = 'Day';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.setAttribute('aria-pressed', 'true');
            if (themeLabel) themeLabel.textContent = 'Night';
        }
    });
});

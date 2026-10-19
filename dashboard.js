document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = themeToggle.querySelector('.toggle-label');

    // 1. Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Apply saved theme on page load
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.setAttribute('aria-pressed', 'true');
        themeLabel.textContent = 'Day';
    }

    // 2. Listen for toggle clicks
    themeToggle.addEventListener('click', () => {
        // Get current theme
        const currentTheme = document.documentElement.getAttribute('data-theme');
        
        if (currentTheme === 'light') {
            // Switch to Dark
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            themeToggle.setAttribute('aria-pressed', 'false');
            themeLabel.textContent = 'Night';
        } else {
            // Switch to Light
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-pressed', 'true');
            themeLabel.textContent = 'Day';
        }
    });
});

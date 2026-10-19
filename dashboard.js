document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = themeToggle.querySelector('.toggle-label');

    // 1. Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    // Apply dark theme on load if it was saved
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.setAttribute('aria-pressed', 'true');
        themeLabel.textContent = 'Night';
    } else {
        themeLabel.textContent = 'Day';
    }

    // 2. Listen for toggle clicks
    themeToggle.addEventListener('click', () => {
        // Check if dark mode is currently active
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            // Turn off Dark Mode (Switch to Light)
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-pressed', 'false');
            themeLabel.textContent = 'Day';
        } else {
            // Turn on Dark Mode
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.setAttribute('aria-pressed', 'true');
            themeLabel.textContent = 'Night';
        }
    });
});

// Theme Management - Set theme immediately to prevent flash
(function() {
    // Apply theme ASAP, even before DOM loads
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = document.querySelector('.theme-icon');
        this.html = document.documentElement;
        this.init();
    }

    init() {
        // Load saved theme (already applied above, but update UI)
        const currentTheme = localStorage.getItem('theme') || 'light';
        this.updateUI(currentTheme);

        // Setup event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        this.html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateUI(theme);
    }

    updateUI(theme) {
        if (this.themeIcon) {
            this.themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
        }
    }

    toggleTheme() {
        const currentTheme = this.html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    getTheme() {
        return this.html.getAttribute('data-theme');
    }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ThemeManager());
} else {
    new ThemeManager();
}

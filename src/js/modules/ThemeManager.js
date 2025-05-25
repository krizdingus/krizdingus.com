/**
 * ThemeManager handles switching between light and dark themes
 * with system preference sync and local storage persistence
 */
export class ThemeManager {
    /**
     * Creates a new ThemeManager instance
     * @param {HTMLElement} themeToggle - The theme toggle button element
     */
    constructor(themeToggle) {
        this.themeToggle = themeToggle;
        this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
        
        this.init();
    }
    
    /**
     * Initializes the theme manager
     * Sets initial theme and adds event listeners
     */
    init() {
        this.applyTheme(this.currentTheme);
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
        this.watchSystemTheme();
    }
    
    /**
     * Gets the stored theme preference from localStorage
     * @returns {string|null} The stored theme or null if not found
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('krizdingus-theme');
        } catch (e) {
            console.warn('localStorage not available');
            return null;
        }
    }
    
    /**
     * Gets the system preferred theme
     * @returns {string} 'dark' or 'light'
     */
    getPreferredTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    /**
     * Applies the specified theme
     * @param {string} theme - The theme to apply ('dark' or 'light')
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        try {
            localStorage.setItem('krizdingus-theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference');
        }
    }
    
    /**
     * Toggles between light and dark themes
     * Adds a subtle animation feedback
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Add animation feedback
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 150);
    }
    
    /**
     * Watches for system theme changes
     * Only auto-switches if user hasn't manually set a preference
     */
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
            }
        });
    }
} 
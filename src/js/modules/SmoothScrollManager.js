/**
 * SmoothScrollManager handles smooth scrolling behavior
 * Respects user's motion preferences
 */
export class SmoothScrollManager {
    /**
     * Creates a new SmoothScrollManager instance
     */
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }
    
    /**
     * Initializes the smooth scroll manager
     */
    init() {
        // Add click handlers to all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleClick(e));
        });
        
        // Listen for changes in motion preferences
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
        });
    }
    
    /**
     * Handles click events on anchor links
     * @param {Event} e - The click event
     */
    handleClick(e) {
        const href = e.currentTarget.getAttribute('href');
        if (!href || href === '#') return;
        
        e.preventDefault();
        
        const targetElement = document.querySelector(href);
        if (!targetElement) return;
        
        if (this.prefersReducedMotion) {
            // Instant scroll for users who prefer reduced motion
            targetElement.scrollIntoView();
        } else {
            // Smooth scroll for others
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // Update URL without page jump
        history.pushState(null, null, href);
    }
    
    /**
     * Cleans up resources
     */
    cleanup() {
        // Remove event listeners
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.removeEventListener('click', this.handleClick);
        });
    }
} 
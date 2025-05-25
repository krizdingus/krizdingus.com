/**
 * LazyImageLoader handles lazy loading of images with fade effects
 * Uses Intersection Observer API for efficient loading
 */
export class LazyImageLoader {
    /**
     * Creates a new LazyImageLoader instance
     */
    constructor() {
        this.observer = null;
        this.init();
    }
    
    /**
     * Initializes the lazy image loader
     */
    init() {
        this.implementObserver();
        
        // Load any images that are already in view
        document.querySelectorAll('img[data-src]').forEach(img => {
            if (this.isInViewport(img)) {
                this.loadImage(img);
            }
        });
    }
    
    /**
     * Implements the Intersection Observer
     */
    implementObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    this.observer.unobserve(img);
                }
            });
        }, options);
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img);
        });
    }
    
    /**
     * Loads an image and applies fade effect
     * @param {HTMLImageElement} img - The image element to load
     */
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        img.onload = () => this.handleImageLoad(img);
        img.onerror = () => this.handleImageError(img);
        img.src = src;
    }
    
    /**
     * Handles successful image load
     * @param {HTMLImageElement} img - The loaded image element
     */
    handleImageLoad(img) {
        img.classList.add('fade-in');
        img.removeAttribute('data-src');
        
        // Remove fade-in class after animation
        setTimeout(() => {
            img.classList.remove('fade-in');
        }, 1000);
    }
    
    /**
     * Handles image load error
     * @param {HTMLImageElement} img - The failed image element
     */
    handleImageError(img) {
        console.warn(`Failed to load image: ${img.getAttribute('data-src')}`);
        img.classList.add('load-error');
        
        // Set a placeholder or error state
        img.src = 'assets/images/placeholder.png';
    }
    
    /**
     * Checks if an element is in the viewport
     * @param {HTMLElement} element - The element to check
     * @returns {boolean} True if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Cleans up resources
     */
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
} 
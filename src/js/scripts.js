/*
KRIZDINGUS.com JavaScript
Features: Dark/light mode toggle, hero scan-line animation, lazy image loading
Design: Minimal, progressive enhancement, respects user preferences
Storage: localStorage for theme persistence across visits
*/

// ===== THEME MANAGEMENT =====
class ThemeManager {
    constructor() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.applyTheme(this.currentTheme);
        
        // Add event listener
        this.themeToggle?.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        this.watchSystemTheme();
    }
    
    getStoredTheme() {
        try {
            return localStorage.getItem('krizdingus-theme');
        } catch (e) {
            console.warn('localStorage not available');
            return null;
        }
    }
    
    getPreferredTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Store preference
        try {
            localStorage.setItem('krizdingus-theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference');
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Add a subtle animation feedback
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 150);
    }
    
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!this.getStoredTheme()) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
            }
        });
    }
}

// ===== HERO ANIMATION MANAGER =====
class HeroAnimationManager {
    constructor() {
        this.scanLines = document.querySelector('.scan-lines');
        this.heroTitle = document.querySelector('.hero-title');
        this.hero = document.querySelector('.hero');
        this.init();
    }
    
    init() {
        this.setupScanLines();
        this.setupTitleAnimation();
        this.addInteractiveStatic();
    }
    
    setupScanLines() {
        if (!this.scanLines) return;
    }
    
    setupTitleAnimation() {
        if (!this.heroTitle) return;
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.hero.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        observer.observe(this.hero);
    }
    
    addInteractiveStatic() {
        if (!this.hero) return;
        // Click for static burst
        this.hero.addEventListener('click', () => {
            this.triggerStaticBurst();
        });
        // Random static spikes
        this.addRandomStaticSpikes();
    }
    
    triggerStaticBurst() {
        this.hero.classList.add('glitch-burst');
        setTimeout(() => {
            this.hero.classList.remove('glitch-burst');
        }, 300);
    }
    
    addRandomStaticSpikes() {
        const scheduleSpike = () => {
            const delay = 4000 + Math.random() * 6000; // 4-10 seconds
            setTimeout(() => {
                if (Math.random() < 0.6) { // 60% chance
                    const currentIntensity = parseFloat(getComputedStyle(this.hero).getPropertyValue('--static-intensity')) || 0.4;
                    this.hero.style.setProperty('--static-intensity', currentIntensity + 0.3);
                    
                    setTimeout(() => {
                        this.hero.style.removeProperty('--static-intensity');
                    }, 200);
                }
                scheduleSpike();
            }, delay);
        };
        scheduleSpike();
    }
}

// ===== LAZY IMAGE LOADING =====
class LazyImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }
    
    init() {
        // Use native lazy loading if supported, otherwise implement observer
        if ('loading' in HTMLImageElement.prototype) {
            this.images.forEach(img => {
                img.addEventListener('load', () => this.handleImageLoad(img));
                img.addEventListener('error', () => this.handleImageError(img));
            });
        } else {
            this.implementObserver();
        }
    }
    
    implementObserver() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        this.images.forEach(img => imageObserver.observe(img));
    }
    
    loadImage(img) {
        img.addEventListener('load', () => this.handleImageLoad(img));
        img.addEventListener('error', () => this.handleImageError(img));
        img.src = img.dataset.src || img.src;
    }
    
    handleImageLoad(img) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        requestAnimationFrame(() => {
            img.style.opacity = '1';
        });
        
        img.classList.add('loaded');
    }
    
    handleImageError(img) {
        // Provide fallback for broken images
        img.style.background = 'var(--bg-tertiary)';
        img.style.color = 'var(--text-secondary)';
        img.alt = 'Image not available';
        img.classList.add('error');
    }
}

// ===== SMOOTH SCROLLING ENHANCEMENT =====
class SmoothScrollManager {
    constructor() {
        this.init();
    }
    
    init() {
        // Enhanced smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    // Calculate header offset for sticky navigation
                    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update focus for accessibility
                    setTimeout(() => {
                        targetElement.focus({ preventScroll: true });
                    }, 500);
                }
            });
        });
    }
}

// ===== PROJECT CARD ENHANCEMENTS =====
class ProjectCardManager {
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }
    
    init() {
        this.addHoverEffects();
        this.addKeyboardNavigation();
    }
    
    addHoverEffects() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Add subtle tilt effect
                if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    const randomTilt = (Math.random() - 0.5) * 2; // -1 to 1 degree
                    card.style.transform = `translateY(-4px) rotate(${randomTilt}deg)`;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
    
    addKeyboardNavigation() {
        this.cards.forEach(card => {
            const link = card.querySelector('a');
            if (!link) return;
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }
            });
            
            // Make cards focusable
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
        });
    }
}

// ===== PERFORMANCE MONITORING =====
class PerformanceMonitor {
    constructor() {
        this.init();
    }
    
    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            if ('performance' in window) {
                // Report Core Web Vitals if available
                this.reportWebVitals();
            }
        });
    }
    
    reportWebVitals() {
        // Simple performance tracking
        try {
            const perfEntries = performance.getEntriesByType('navigation')[0];
            if (perfEntries) {
                const metrics = {
                    domContentLoaded: Math.round(perfEntries.domContentLoadedEventEnd - perfEntries.domContentLoadedEventStart),
                    loadComplete: Math.round(perfEntries.loadEventEnd - perfEntries.loadEventStart)
                };
            }
        } catch (e) {
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    new ThemeManager();
    new HeroAnimationManager();
    new LazyImageLoader();
    new SmoothScrollManager();
    new ProjectCardManager();
    // new PerformanceMonitor(); // Disabled for now
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('🚨 JavaScript error:', e.error);
    // Could send to analytics service in production
});
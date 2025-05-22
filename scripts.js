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
        this.toggleIcon = document.querySelector('.toggle-icon');
        this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.applyTheme(this.currentTheme);
        this.updateToggleIcon();
        
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
        this.updateToggleIcon();
        
        // Add a subtle animation feedback
        this.themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 150);
    }
    
    updateToggleIcon() {
        if (this.toggleIcon) {
            this.toggleIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
        
        // Update aria-label for accessibility
        const label = this.currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
        this.themeToggle?.setAttribute('aria-label', label);
    }
    
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!this.getStoredTheme()) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(newTheme);
                this.updateToggleIcon();
            }
        });
    }
}

// ===== HERO ANIMATION MANAGER =====
class HeroAnimationManager {
    constructor() {
        this.scanLines = document.querySelector('.scan-lines');
        this.heroTitle = document.querySelector('.hero-title');
        this.init();
    }
    
    init() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        // Add entrance animations when hero comes into view
        this.observeHero();
        
        // Add interactive scan line effect
        this.addInteractiveScanLines();
    }
    
    observeHero() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateHeroEntrance();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(hero);
    }
    
    animateHeroEntrance() {
        // Stagger the entrance of hero elements
        const elements = [
            document.querySelector('.hero-title'),
            document.querySelector('.hero-tagline'),
            document.querySelector('.cta-button')
        ].filter(Boolean);
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200 + 300);
        });
    }
    
    addInteractiveScanLines() {
        const hero = document.querySelector('.hero');
        if (!hero || !this.scanLines) return;
        
        let isAnimating = false;
        
        hero.addEventListener('mouseenter', () => {
            if (isAnimating) return;
            isAnimating = true;
            
            this.scanLines.style.animationDuration = '0.5s';
            setTimeout(() => {
                this.scanLines.style.animationDuration = '2s';
                isAnimating = false;
            }, 500);
        });
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
                const loadTime = performance.now();
                console.log(`🚀 Krizdingus loaded in ${Math.round(loadTime)}ms`);
                
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
                
                console.log('📊 Performance metrics:', metrics);
            }
        } catch (e) {
            console.log('Performance monitoring not available');
        }
    }
}

// ===== EASTER EGG =====
class EasterEgg {
    constructor() {
        this.sequence = [];
        this.targetSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => {
            this.sequence.push(e.code);
            
            // Keep only the last 10 keystrokes
            if (this.sequence.length > this.targetSequence.length) {
                this.sequence.shift();
            }
            
            // Check if sequence matches
            if (this.sequence.length === this.targetSequence.length &&
                this.sequence.every((key, index) => key === this.targetSequence[index])) {
                this.triggerEasterEgg();
                this.sequence = []; // Reset
            }
        });
    }
    
    triggerEasterEgg() {
        // Add a fun Game Boy-style transformation
        const body = document.body;
        body.style.filter = 'sepia(1) hue-rotate(80deg) saturate(2)';
        body.style.transform = 'scale(1.02)';
        
        // Show a message
        const message = document.createElement('div');
        message.textContent = '🎮 KONAMI CODE ACTIVATED! 30 LIVES ADDED!';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--accent-primary);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-family: var(--font-pixel);
            font-size: 1.2rem;
            z-index: 9999;
            animation: bounce 0.5s ease;
        `;
        
        document.body.appendChild(message);
        
        // Clean up after 3 seconds
        setTimeout(() => {
            body.style.filter = '';
            body.style.transform = '';
            message.remove();
        }, 3000);
        
        console.log('🎮 Konami Code activated! You found the easter egg!');
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Initializing Krizdingus...');
    
    // Initialize all managers
    new ThemeManager();
    new HeroAnimationManager();
    new LazyImageLoader();
    new SmoothScrollManager();
    new ProjectCardManager();
    new PerformanceMonitor();
    new EasterEgg();
    
    console.log('✅ Krizdingus fully loaded and ready!');
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('🚨 JavaScript error:', e.error);
    // Could send to analytics service in production
});

// ===== SERVICE WORKER REGISTRATION (Future Enhancement) =====
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('SW registered:', reg))
        //     .catch(err => console.log('SW registration failed:', err));
    });
}
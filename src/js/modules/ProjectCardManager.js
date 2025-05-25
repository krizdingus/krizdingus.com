/**
 * ProjectCardManager handles project card interactions and effects
 * Adds hover effects and keyboard navigation
 */
export class ProjectCardManager {
    /**
     * Creates a new ProjectCardManager instance
     */
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }
    
    /**
     * Initializes the project card manager
     */
    init() {
        this.addHoverEffects();
        this.addKeyboardNavigation();
    }
    
    /**
     * Adds hover effects to project cards
     */
    addHoverEffects() {
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('hover');
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hover');
            });
        });
    }
    
    /**
     * Adds keyboard navigation to project cards
     */
    addKeyboardNavigation() {
        this.cards.forEach(card => {
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        const link = card.querySelector('a');
                        if (link) {
                            link.click();
                        }
                        break;
                        
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextCard = card.nextElementSibling;
                        if (nextCard && nextCard.classList.contains('project-card')) {
                            nextCard.focus();
                        }
                        break;
                        
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevCard = card.previousElementSibling;
                        if (prevCard && prevCard.classList.contains('project-card')) {
                            prevCard.focus();
                        }
                        break;
                }
            });
        });
    }
    
    /**
     * Cleans up resources
     */
    cleanup() {
        this.cards.forEach(card => {
            card.removeEventListener('mouseenter', this.handleMouseEnter);
            card.removeEventListener('mouseleave', this.handleMouseLeave);
            card.removeEventListener('keydown', this.handleKeydown);
        });
    }
} 
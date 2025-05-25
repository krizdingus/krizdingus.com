/**
 * RandomProjectEffects manages random visual effects on project cards
 * Creates glitch and retro effects for enhanced aesthetics
 */
export class RandomProjectEffects {
    /**
     * Creates a new RandomProjectEffects instance
     */
    constructor() {
        this.effects = [
            'colorShift',
            'pixelCorruption',
            'quickGlitch',
            'borderFlicker',
            'chromaBleed'
        ];
        
        this.elements = {
            cards: document.querySelectorAll('.project-card'),
            container: document.querySelector('.projects-grid')
        };
        
        this.isEnabled = true;
        this.effectTimer = null;
        this.init();
    }
    
    /**
     * Initializes the random effects
     */
    init() {
        if (!this.elements.container || !this.elements.cards.length) return;
        
        // Add effect toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'effects-toggle';
        toggleButton.textContent = 'Toggle Effects';
        toggleButton.addEventListener('click', () => this.toggleEffects());
        
        this.elements.container.appendChild(toggleButton);
        
        // Start random effects
        this.scheduleRandomEffects();
    }
    
    /**
     * Schedules random effects
     */
    scheduleRandomEffects() {
        if (!this.isEnabled) return;
        
        this.effectTimer = setTimeout(() => {
            this.triggerRandomEffect();
            this.scheduleRandomEffects();
        }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds
    }
    
    /**
     * Triggers a random effect on a random card
     */
    triggerRandomEffect() {
        if (!this.isEnabled || !this.elements.cards.length) return;
        
        const randomCard = this.elements.cards[Math.floor(Math.random() * this.elements.cards.length)];
        const randomEffect = this.effects[Math.floor(Math.random() * this.effects.length)];
        
        this.triggerSpecificEffect(randomEffect, Array.from(this.elements.cards).indexOf(randomCard));
    }
    
    /**
     * Applies color shift effect
     * @param {HTMLElement} card - Card element to affect
     */
    colorShift(card) {
        if (!card) return;
        
        const originalColors = {
            background: card.style.backgroundColor,
            color: card.style.color
        };
        
        card.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
        card.style.color = `hsl(${Math.random() * 360}, 70%, 20%)`;
        
        setTimeout(() => {
            card.style.backgroundColor = originalColors.background;
            card.style.color = originalColors.color;
        }, 500);
    }
    
    /**
     * Applies pixel corruption effect
     * @param {HTMLElement} card - Card element to affect
     */
    pixelCorruption(card) {
        if (!card) return;
        
        const image = card.querySelector('img');
        if (!image) return;
        
        image.style.filter = 'contrast(150%) brightness(120%)';
        image.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
            image.style.filter = '';
            image.style.transform = '';
        }, 300);
    }
    
    /**
     * Applies quick glitch effect
     * @param {HTMLElement} card - Card element to affect
     */
    quickGlitch(card) {
        if (!card) return;
        
        card.classList.add('glitch');
        setTimeout(() => card.classList.remove('glitch'), 200);
    }
    
    /**
     * Applies border flicker effect
     * @param {HTMLElement} card - Card element to affect
     */
    borderFlicker(card) {
        if (!card) return;
        
        const flicker = () => {
            card.style.borderColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        };
        
        const interval = setInterval(flicker, 50);
        setTimeout(() => {
            clearInterval(interval);
            card.style.borderColor = '';
        }, 300);
    }
    
    /**
     * Applies chroma bleed effect
     * @param {HTMLElement} card - Card element to affect
     */
    chromaBleed(card) {
        if (!card) return;
        
        card.style.filter = 'blur(0.5px)';
        setTimeout(() => {
            card.style.filter = '';
        }, 400);
    }
    
    /**
     * Triggers a specific effect on a specific card
     * @param {string} effectName - Name of effect to trigger
     * @param {number} [cardIndex] - Optional specific card index
     */
    triggerSpecificEffect(effectName, cardIndex = null) {
        const targetCard = cardIndex !== null ? 
            this.elements.cards[cardIndex] : 
            this.elements.cards[Math.floor(Math.random() * this.elements.cards.length)];
            
        if (this[effectName] && targetCard) {
            this[effectName](targetCard);
        }
    }
    
    /**
     * Toggles effects on/off
     */
    toggleEffects() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.scheduleRandomEffects();
        } else {
            clearTimeout(this.effectTimer);
            this.effectTimer = null;
        }
    }
    
    /**
     * Cleans up resources
     */
    cleanup() {
        clearTimeout(this.effectTimer);
        this.effectTimer = null;
        
        // Remove toggle button
        const toggleButton = this.elements.container.querySelector('.effects-toggle');
        if (toggleButton) {
            toggleButton.remove();
        }
    }
} 
/**
 * ConsoleHero manages the retro console boot sequence
 * Displays random startup messages with typing effects
 * Transitions to main content with CRT effects
 */
export class ConsoleHero {
    /**
     * Creates a new ConsoleHero instance
     */
    constructor() {
        this.state = 'booting';
        this.currentBootIndex = 0;
        this.currentLineIndex = 0;
        this.idleTimer = null;
        this.currentAsciiIndex = 0;
        
        // Background images for variety
        this.bgImages = [
            'assets/images/console-title-bg_generic.png',
            'assets/images/console-title-bg_xp.png',
            'assets/images/console-title-bg_dedust.png',
            'assets/images/console-title-bg_tulips.png',
            'assets/images/console-title-bg_canyons.png',
        ];
        
        // Cache DOM elements
        this.elements = {
            hero: document.getElementById('consoleHero'),
            bootSequence: document.getElementById('bootSequence'),
            readyState: document.getElementById('readyState'),
            titleBg: document.querySelector('#readyState .console-title-bg'),
        };
        
        this.init();
    }
    
    /**
     * Initializes the console hero
     */
    init() {
        this.startBootSequence();
        this.setupEventListeners();
    }
    
    /**
     * Gets available boot sequences
     * @returns {Array} Array of boot sequence objects
     */
    getBootSequences() {
        return [
            {
                name: "Enhanced Chrono Terminal",
                lines: [
                    { text: "KRIZDINGUS.EXE v∞.01", type: "system", delay: 400 },
                    { text: "Loading Temporal Shell", type: "system", delay: 300 },
                    { text: "POST: Memory scan... 1994 located", type: "success", delay: 200 },
                    { text: "POST: Ego containment... STABLE", type: "success", delay: 150 },
                    { text: "Launching TimeCore bootloader", type: "loading", delay: 400, dots: true },
                    { text: "Verifying VHS integrity", type: "loading", delay: 500, dots: true },
                    { text: "Authenticating through save battery", type: "loading", delay: 500, dots: true },
                    { text: "Mount /mnt/nostalgia... OK", type: "success", delay: 250 },
                    { text: "Mount /mnt/zyn... OK", type: "success", delay: 250 },
                    { text: "Synchronizing flavor crystals", type: "loading", delay: 500, dots: true },
                    { text: "Engaging minor chaos engine", type: "loading", delay: 700, progress: true },
                    { text: "Username: krizdingus", type: "system", delay: 800, typing: true },
                    { text: "Password: ********", type: "system", delay: 600, typing: true },
                    { text: "Login accepted, for reasons unclear", type: "success", delay: 300 },
                    { text: "Loading preferences from garage wall", type: "loading", delay: 500, progress: true },
                    { text: "Initializing craft-core OS", type: "loading", delay: 400, dots: true },
                    { text: "Importing workshop humidity profile", type: "loading", delay: 300, dots: true },
                    { text: "Spray glue: NEUTRALIZED", type: "success", delay: 200 },
                    { text: "You may proceed with ritual tinkering", type: "system", delay: 400 },
                    { text: "Checking Crystal Pepsi reserves", type: "loading", delay: 500, dots: true },
                ]
            },
            // ... other boot sequences ...
        ];
    }
    
    /**
     * Starts the boot sequence
     * Randomly selects a sequence and begins typing
     */
    startBootSequence() {
        const sequences = this.getBootSequences();
        this.currentBootIndex = Math.floor(Math.random() * sequences.length);
        const sequence = sequences[this.currentBootIndex];
        
        this.typeBootSequence(sequence.lines, 0);
    }
    
    /**
     * Types out the boot sequence line by line
     * @param {Array} lines - Array of line objects to type
     * @param {number} index - Current line index
     */
    typeBootSequence(lines, index) {
        if (index >= lines.length) {
            this.showReadyState();
            return;
        }
        
        const line = lines[index];
        const lineElement = document.createElement('div');
        lineElement.className = `boot-line ${line.type}`;
        this.elements.bootSequence.appendChild(lineElement);
        
        if (line.typing) {
            animateTyping(lineElement, line.text, () => {
                setTimeout(() => this.typeBootSequence(lines, index + 1), line.delay);
            });
        } else if (line.dots) {
            lineElement.textContent = line.text;
            animateDots(lineElement, line.text, line.delay, () => {
                this.typeBootSequence(lines, index + 1);
            });
        } else if (line.progress) {
            lineElement.textContent = line.text;
            const progressSpan = document.createElement('span');
            progressSpan.className = 'progress';
            lineElement.appendChild(progressSpan);
            animateAsciiProgress(progressSpan, line.delay);
            setTimeout(() => this.typeBootSequence(lines, index + 1), line.delay);
        } else {
            lineElement.textContent = line.text;
            setTimeout(() => this.typeBootSequence(lines, index + 1), line.delay);
        }
    }
    
    /**
     * Shows the ready state with CRT transition
     */
    showReadyState() {
        this.elements.bootSequence.style.display = 'none';
        this.elements.readyState.style.display = 'block';
        this.setRandomTitleBg();
        this.triggerCRTTransition();
        this.startIdleTimer();
    }
    
    /**
     * Sets a random background image
     */
    setRandomTitleBg() {
        const randomIndex = Math.floor(Math.random() * this.bgImages.length);
        this.elements.titleBg.style.backgroundImage = `url(${this.bgImages[randomIndex]})`;
    }
    
    /**
     * Triggers the CRT transition effect
     */
    triggerCRTTransition() {
        this.elements.hero.classList.add('crt-transition');
        setTimeout(() => {
            this.elements.hero.classList.remove('crt-transition');
        }, 1000);
    }
    
    /**
     * Starts the idle timer for reset
     */
    startIdleTimer() {
        this.idleTimer = setTimeout(() => this.resetToReady(), 30000);
    }
    
    /**
     * Resets the console to ready state
     */
    resetToReady() {
        this.elements.bootSequence.innerHTML = '';
        this.elements.bootSequence.style.display = 'block';
        this.elements.readyState.style.display = 'none';
        this.startBootSequence();
    }
    
    /**
     * Sets up event listeners
     */
    setupEventListeners() {
        // Add click handler to reset sequence
        this.elements.hero.addEventListener('click', () => {
            this.clearTimers();
            this.resetToReady();
        });
        
        // Add keyboard handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearTimers();
                this.resetToReady();
            }
        });
    }
    
    /**
     * Clears all timers
     */
    clearTimers() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }
    
    /**
     * Cleans up resources
     */
    cleanup() {
        this.clearTimers();
        // Remove event listeners
        this.elements.hero.removeEventListener('click', this.resetToReady);
        document.removeEventListener('keydown', this.handleKeydown);
    }
}

/**
 * Animates ASCII progress bar
 * @param {HTMLElement} progressSpan - The span element to animate
 * @param {number} duration - Animation duration in ms
 */
function animateAsciiProgress(progressSpan, duration) {
    const chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let start = Date.now();
    
    function update() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const index = Math.floor(progress * chars.length);
        progressSpan.textContent = chars[index];
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Animates typing effect
 * @param {HTMLElement} element - Element to type into
 * @param {string} text - Text to type
 * @param {Function} onComplete - Callback when complete
 */
function animateTyping(element, text, onComplete) {
    let index = 0;
    
    function typeNextChar() {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
            setTimeout(typeNextChar, Math.random() * 50 + 30);
        } else if (onComplete) {
            onComplete();
        }
    }
    
    typeNextChar();
}

/**
 * Animates dots loading effect
 * @param {HTMLElement} element - Element to animate
 * @param {string} baseText - Base text without dots
 * @param {number} duration - Animation duration in ms
 * @param {Function} onComplete - Callback when complete
 */
function animateDots(element, baseText, duration, onComplete) {
    const dots = ['.', '..', '...'];
    let start = Date.now();
    
    function updateDots() {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const dotIndex = Math.floor(progress * dots.length);
        element.textContent = baseText + dots[dotIndex];
        
        if (progress < 1) {
            requestAnimationFrame(updateDots);
        } else if (onComplete) {
            onComplete();
        }
    }
    
    requestAnimationFrame(updateDots);
} 
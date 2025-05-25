/**
 * FeaturedProjectRotator manages the featured project carousel
 * Handles automatic rotation and user interactions
 */
export class FeaturedProjectRotator {
    /**
     * Creates a new FeaturedProjectRotator instance
     */
    constructor() {
        this.currentIndex = 0;
        this.autoRotateTimer = null;
        this.rotationInterval = 45000; // 45 seconds
        this.isHovering = false;
        
        this.elements = {
            container: document.querySelector('.featured-projects'),
            projects: document.querySelectorAll('.featured-project'),
            indicators: document.querySelectorAll('.project-indicator')
        };
        
        this.init();
    }
    
    /**
     * Forces rotation to a specific project
     * @param {number} index - Index of project to show
     */
    forceRotation(index) {
        this.rotateToNext(index);
    }
    
    /**
     * Initializes the project rotator
     */
    init() {
        if (!this.elements.container || !this.elements.projects.length) return;
        
        // Add hover handlers
        this.elements.container.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.elements.container.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // Add click handlers to indicators
        this.elements.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.forceRotation(index));
        });
        
        // Start auto-rotation
        this.startAutoRotation();
    }
    
    /**
     * Handles mouse enter event
     */
    handleMouseEnter() {
        this.isHovering = true;
        this.clearAutoTimers();
    }
    
    /**
     * Handles mouse leave event
     */
    handleMouseLeave() {
        this.isHovering = false;
        this.startAutoRotation();
    }
    
    /**
     * Starts automatic rotation
     */
    startAutoRotation() {
        if (this.isHovering) return;
        
        this.clearAutoTimers();
        this.autoRotateTimer = setInterval(() => {
            this.rotateToNext();
        }, this.rotationInterval);
    }
    
    /**
     * Clears auto-rotation timers
     */
    clearAutoTimers() {
        if (this.autoRotateTimer) {
            clearInterval(this.autoRotateTimer);
            this.autoRotateTimer = null;
        }
    }
    
    /**
     * Rotates to the next project
     * @param {number} [specificIndex] - Optional specific index to rotate to
     */
    rotateToNext(specificIndex) {
        const nextIndex = specificIndex !== undefined ? specificIndex : (this.currentIndex + 1) % this.elements.projects.length;
        
        // Trigger glitch effect on current project
        this.triggerGlitchTransition(this.elements.projects[this.currentIndex]);
        
        // Update current index
        this.currentIndex = nextIndex;
        
        // Update project display
        this.updateProjectDisplay(this.elements.projects[nextIndex]);
        
        // Update indicators
        this.elements.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === nextIndex);
        });
    }
    
    /**
     * Triggers glitch transition effect
     * @param {HTMLElement} project - Project element to glitch
     */
    triggerGlitchTransition(project) {
        if (!project) return;
        
        project.classList.add('glitch');
        setTimeout(() => {
            project.classList.remove('glitch');
        }, 800);
    }
    
    /**
     * Shows glitch warning message
     */
    showGlitchWarning() {
        const warning = document.createElement('div');
        warning.className = 'glitch-warning';
        warning.textContent = 'WARNING: Temporal instability detected';
        
        this.elements.container.appendChild(warning);
        
        setTimeout(() => {
            warning.classList.add('fade-out');
            setTimeout(() => {
                warning.remove();
            }, 1000);
        }, 2000);
    }
    
    /**
     * Updates project display
     * @param {HTMLElement} project - Project element to update
     */
    updateProjectDisplay(project) {
        if (!project) return;
        
        // Hide all projects
        this.elements.projects.forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active');
        });
        
        // Show selected project
        project.style.display = 'block';
        project.classList.add('active');
        
        // Trigger entrance animation
        project.classList.add('entering');
        setTimeout(() => {
            project.classList.remove('entering');
        }, 1000);
    }
    
    /**
     * Builds projects from HTML
     * @returns {Array} Array of project objects
     */
    buildProjectsFromHTML() {
        return Array.from(this.elements.projects).map(project => {
            return this.extractProjectFromCard(project);
        });
    }
    
    /**
     * Extracts project data from card element
     * @param {HTMLElement} card - Project card element
     * @returns {Object} Project data object
     */
    extractProjectFromCard(card) {
        const title = card.querySelector('.project-title')?.textContent || '';
        const description = card.querySelector('.project-description')?.textContent || '';
        const image = card.querySelector('.project-image')?.src || '';
        const link = card.querySelector('.project-link')?.href || '';
        
        return {
            title,
            description,
            image,
            link
        };
    }
    
    /**
     * Cleans up resources
     */
    cleanup() {
        this.clearAutoTimers();
        
        // Remove event listeners
        this.elements.container.removeEventListener('mouseenter', this.handleMouseEnter);
        this.elements.container.removeEventListener('mouseleave', this.handleMouseLeave);
        
        this.elements.indicators.forEach(indicator => {
            indicator.removeEventListener('click', this.handleIndicatorClick);
        });
    }
} 
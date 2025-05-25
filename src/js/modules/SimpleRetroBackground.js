/**
 * SimpleRetroBackground creates a retro-style animated background
 * Uses canvas for performance and includes scan lines and static effects
 */
export class SimpleRetroBackground {
    /**
     * Creates a new SimpleRetroBackground instance
     * @param {HTMLElement} element - The container element
     */
    constructor(element) {
        this.element = element;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.particles = [];
        this.scanLines = [];
        this.isAnimating = false;
        
        // Configuration
        this.config = {
            particleCount: 50,
            scanLineCount: 20,
            particleSpeed: 0.5,
            scanLineSpeed: 1,
            staticIntensity: 0.1
        };
        
        this.setup();
    }
    
    /**
     * Sets up the canvas and initializes effects
     */
    setup() {
        // Set canvas size
        this.resize();
        
        // Add canvas to container
        this.element.appendChild(this.canvas);
        
        // Initialize particles
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * this.config.particleSpeed,
                speedY: (Math.random() - 0.5) * this.config.particleSpeed
            });
        }
        
        // Initialize scan lines
        for (let i = 0; i < this.config.scanLineCount; i++) {
            this.scanLines.push({
                y: Math.random() * this.canvas.height,
                speed: Math.random() * this.config.scanLineSpeed + 0.5
            });
        }
        
        // Start animation
        this.isAnimating = true;
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }
    
    /**
     * Resizes the canvas to match container
     */
    resize() {
        this.canvas.width = this.element.offsetWidth;
        this.canvas.height = this.element.offsetHeight;
    }
    
    /**
     * Updates colors based on theme
     */
    updateColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        this.colors = {
            background: isDark ? '#000000' : '#ffffff',
            particle: isDark ? '#00ff00' : '#000000',
            scanLine: isDark ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            static: isDark ? 'rgba(0, 255, 0, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        };
    }
    
    /**
     * Initializes visual effects
     */
    initializeEffects() {
        // Add static noise
        this.addStaticNoise();
        
        // Add scan lines
        this.addScanLines();
        
        // Add particles
        this.addParticles();
    }
    
    /**
     * Adds static noise effect
     */
    addStaticNoise() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * this.config.staticIntensity;
            data[i] = noise * 255;
            data[i + 1] = noise * 255;
            data[i + 2] = noise * 255;
            data[i + 3] = 255;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Adds scan line effect
     */
    addScanLines() {
        this.ctx.fillStyle = this.colors.scanLine;
        
        this.scanLines.forEach(line => {
            this.ctx.fillRect(0, line.y, this.canvas.width, 2);
            
            // Update position
            line.y += line.speed;
            if (line.y > this.canvas.height) {
                line.y = 0;
            }
        });
    }
    
    /**
     * Adds particle effect
     */
    addParticles() {
        this.ctx.fillStyle = this.colors.particle;
        
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });
    }
    
    /**
     * Main animation loop
     */
    animate() {
        if (!this.isAnimating) return;
        
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update colors if theme changed
        this.updateColors();
        
        // Draw effects
        this.initializeEffects();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Draws the current frame
     */
    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw effects
        this.initializeEffects();
    }
    
    /**
     * Destroys the background and cleans up
     */
    destroy() {
        this.isAnimating = false;
        this.canvas.remove();
        window.removeEventListener('resize', this.resize);
    }
} 
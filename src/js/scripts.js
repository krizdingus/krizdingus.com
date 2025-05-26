/*
KRIZDINGUS.com JavaScript
Theme: Game Boy nostalgia meets 90s web aesthetic
Features:
  - Dark/light mode toggle with system preference sync
  - Retro console boot sequence with random messages
  - Lazy image loading with fade effects
  - Project card glitch animations
  - Featured project rotation
  - Scan lines and static effects
  - Smooth scrolling with motion preferences
  - OS window controls (minimize/maximize/close)
  - Menu system with dropdowns
Storage: localStorage for theme persistence across visits

Notes:
- Boot sequences are randomly selected on page load
- Window state persists until page refresh
- Error handling is intentionally minimal to maintain the retro feel
*/

// ===== THEME MANAGEMENT =====
/**
 * Handles switching between light and dark themes
 * Remembers your choice and syncs with system preferences
 */
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

// ===== CONSOLE HERO =====
/**
 * Shows the retro console boot sequence
 * Displays random startup messages with typing effects
 * Transitions to the main content with a CRT effect
 */
class ConsoleHero {
    constructor() {
        this.state = 'booting';
        this.currentBootIndex = 0;
        this.currentLineIndex = 0;
        this.idleTimer = null;
        this.currentAsciiIndex = 0;
        this.bgImages = [
            'assets/images/console-title-bg_generic.png',
            'assets/images/console-title-bg_xp.png',
            'assets/images/console-title-bg_dedust.png',
            'assets/images/console-title-bg_tulips.png',
            'assets/images/console-title-bg_canyons.png',
        ];
        this.elements = {
            hero: document.getElementById('consoleHero'),
            bootSequence: document.getElementById('bootSequence'),
            readyState: document.getElementById('readyState'),
            titleBg: document.querySelector('#readyState .console-title-bg'),
        };
        
        this.init();
    }
    
    init() {
        this.startBootSequence();
        this.setupEventListeners();
    }
    
    // Multiple boot sequences for variety
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
              {
                name: "Enhanced BambuOS Boot",
                lines: [
                  { text: "KRIZFABRICATOR v9.5", type: "system", delay: 400 },
                  { text: "Booting: BambuOS (fan firmware updated again)", type: "system", delay: 300 },
                  { text: "Spooling MakerWorld API", type: "loading", delay: 500, dots: true },
                  { text: "AMS1: UNKNOWN FILAMENT, HOPE ANYWAY", type: "warning", delay: 600, progress: true },
                  { text: "P1S Bed Adhesion: IMAGINED", type: "success", delay: 200 },
                  { text: "Nozzle temp: OBEDIENT, CONCERNING", type: "success", delay: 200 },
                  { text: "Wi-Fi handshake: POLITE", type: "success", delay: 200 },
                  { text: "Evaluating ambient gremlin factor", type: "loading", delay: 400, dots: true },
                  { text: "Gremlin detected: APPROACHING TOOLHEAD", type: "warning", delay: 200 },
                  { text: "Workshop scent: BURNT PLA + DETERMINATION", type: "success", delay: 250 },
                  { text: "Filament left: JUST ENOUGH TO RISK IT", type: "warning", delay: 250 },
                  { text: "Username: @krizdingus", type: "system", delay: 700, typing: true },
                  { text: "Password: ********", type: "system", delay: 600, typing: true },
                  { text: "Authorized for light mayhem", type: "success", delay: 300 },
                  { text: "Loading: STLs, ideas, mild resentment", type: "loading", delay: 600, progress: true },
                  { text: "Resin envy: CONTAINED", type: "success", delay: 400 },
                  { text: "Hotend: LOUD AND READY", type: "success", delay: 300 },
                  { text: "Ready to commit crimes against tolerances", type: "system", delay: 400 },
                  { text: "Nearby resin printer: SMUG", type: "success", delay: 400 },
                ]
              },
              {
                name: "Enhanced Terminal Crimewave",
                lines: [
                  { text: "K-SHELL v39", type: "system", delay: 400 },
                  { text: "Loading: Dev stack + miscellaneous regret", type: "system", delay: 300 },
                  { text: "make coffee: BUILD SUCCESSFUL", type: "success", delay: 200 },
                  { text: "npm install: questionable plugin accepted", type: "loading", delay: 700, progress: true },
                  { text: "Anime.js: ACTIVATED", type: "success", delay: 200 },
                  { text: "git status: It's fine. You're fine.", type: "success", delay: 300 },
                  { text: "Slack: MUTED FOR HEALTH", type: "success", delay: 300 },
                  { text: "Launching VS Code extensions: 17 detected", type: "loading", delay: 400, dots: true },
                  { text: "Autocompletion: OFFENDED", type: "warning", delay: 500, dots: true },
                  { text: "Running test suite... SOMEHOW GREEN", type: "success", delay: 300 },
                  { text: "API handshake: GENTLE", type: "success", delay: 400 },
                  { text: "Username: krizdev", type: "system", delay: 700, typing: true },
                  { text: "Password: ********", type: "system", delay: 600, typing: true },
                  { text: "Welcome, Code Creature", type: "success", delay: 300 },
                  { text: "Linting... mostly decorative", type: "loading", delay: 600, progress: true },
                  { text: "Sass variables emotionally loaded", type: "success", delay: 400 },
                  { text: "Emmet mode: RITUAL BEGUN", type: "success", delay: 300 },
                  { text: "Dev environment stabilized under duress", type: "system", delay: 400 }
                ]
              },
              {
                name: "Enhanced Bootleg Hero Mode",
                lines: [
                  { text: "KRIZGAME SYSTEM vX.199X", type: "system", delay: 400 },
                  { text: "ZELDOS.EXE is not licensed by anyone", type: "system", delay: 300 },
                  { text: "Blow into cartridge to continue", type: "loading", delay: 800, progress: true },
                  { text: "Bootleg detected: AUTHENTIC", type: "success", delay: 300 },
                  { text: "Scan: Hair physics exceeding engine limits", type: "warning", delay: 600, dots: true },
                  { text: "Power level: YES", type: "success", delay: 200 },
                  { text: "Save battery: LEAKING HISTORY", type: "warning", delay: 200 },
                  { text: "Scope Creep has appeared!", type: "error", delay: 300 },
                  { text: "Cheat code enabled: UNLIMITED CRAFTING MATERIALS", type: "success", delay: 250 },
                  { text: "Debug Mode: VISIBLE TO ENEMIES", type: "warning", delay: 250 },
                  { text: "High Score: UNVERIFIED, BUT LEGENDARY", type: "success", delay: 200 },
                  { text: "You are now playing as: Spider-Man (wrong franchise)", type: "system", delay: 400 },
                  { text: "Traffic density: HIGH", type: "warning", delay: 300 },
                  { text: "Inventory: Hookshot, vape, unpaid invoice", type: "success", delay: 250 },
                  { text: "Game state: AUTO-SAVED AGAINST YOUR WILL", type: "success", delay: 200 },
                  { text: "Start button detected: DO NOT PRESS", type: "warning", delay: 300 },
                  { text: "Engaging Hero Mode: GOOD LUCK I GUESS", type: "system", delay: 400 }
                ]
              },
              {
                name: "Enhanced MultimediOS '98 Boot",
                lines: [
                  { text: "KRIZDINGUS MULTIMEDIOS v2.66", type: "system", delay: 400 },
                  { text: "Detecting 56K modem... SCREAMING", type: "system", delay: 300 },
                  { text: "POST: CD tray... EJECTING FOR NO REASON", type: "warning", delay: 200 },
                  { text: "POST: ZIP drive... WHY", type: "warning", delay: 150 },
                  { text: "Boot sector secured with AOL 1000 Hour Trial", type: "loading", delay: 400, dots: true },
                  { text: "Launching Clippy containment shell", type: "loading", delay: 500, dots: true },
                  { text: "Authenticating through Encarta '95", type: "loading", delay: 500, dots: true },
                  { text: "Mount /mnt/gundam_wing_fanvids... OK", type: "success", delay: 250 },
                  { text: "Mount /mnt/milkdrop_presets... OK", type: "success", delay: 250 },
                  { text: "Synchronizing Winamp skins", type: "loading", delay: 500, dots: true },
                  { text: "Launching GeoCities compatibility layer", type: "loading", delay: 700, progress: true },
                  { text: "Username: krizdude_2000", type: "system", delay: 800, typing: true },
                  { text: "Password: ******** (rhymes with butt)", type: "system", delay: 600, typing: true },
                  { text: "Login successful. Your buddy list is empty.", type: "success", delay: 300 },
                  { text: "Initializing ICQ ghost process", type: "loading", delay: 500, progress: true },
                  { text: "Fetching Yahoo! news from 2001...", type: "loading", delay: 400, dots: true },
                  { text: "George W. Bush codec missing, defaulting to GIF", type: "warning", delay: 300, dots: true },
                  { text: "SPYWARE.EXE: sleeping but alert", type: "success", delay: 200 },
                  { text: "System warmed up. Ready to burn 1 song per CD.", type: "system", delay: 400 }
                ]
              },
              {
                name: "Enhanced LAN Party Boot",
                lines: [
                  { text: "KRIZNET v1.6c (TeamSpeak Compatible)", type: "system", delay: 400 },
                  { text: "Detecting CRT glow... GREENISH", type: "system", delay: 300 },
                  { text: "POST: Surge protector... STICKY BUT FUNCTIONAL", type: "warning", delay: 200 },
                  { text: "POST: Ethernet handshake... BRO'D", type: "success", delay: 150 },
                  { text: "Spooling up dial-up fallback modem", type: "loading", delay: 400, dots: true },
                  { text: "Launching HL1.exe with questionable flags", type: "loading", delay: 500, dots: true },
                  { text: "Pinging host... 999ms, PERFECT", type: "success", delay: 500 },
                  { text: "Mount /mnt/shared: SUSPICIOUSLY OPEN", type: "success", delay: 250 },
                  { text: "Mount /mnt/porn: DENIED BY MOM", type: "error", delay: 250 },
                  { text: "Synchronizing Energy Drink Logs", type: "loading", delay: 500, dots: true },
                  { text: "No-CD Crack detected: LEGENDARY", type: "success", delay: 700, progress: true },
                  { text: "Username: ][_KrizZz_][", type: "system", delay: 800, typing: true },
                  { text: "Password: ******** (written on desk)", type: "system", delay: 600, typing: true },
                  { text: "Connected to lobby: 'clan-killzone420'", type: "success", delay: 300 },
                  { text: "Winamp playlist: 92 tracks, no skips (allegedly)", type: "loading", delay: 500, progress: true },
                  { text: "USB fan: WHIRRING VIOLENTLY", type: "success", delay: 400 },
                  { text: "Voice chat: DEAFENING BREATHING", type: "warning", delay: 300 },
                  { text: "All systems go. Somebody ordered pizza, right?", type: "success", delay: 200 },
                  { text: "Press any key to drop into Dust2", type: "system", delay: 400 }
                ]
              }              
        ];
    }
    
    startBootSequence() {
        const sequences = this.getBootSequences();
        const randomIndex = Math.floor(Math.random() * sequences.length);
        const selectedSequence = sequences[randomIndex];
        
        this.currentBootIndex = 0;
        this.currentLineIndex = 0;
        
        // Clear any existing content
        this.elements.bootSequence.innerHTML = '';
        
        // Start typing the selected sequence
        this.typeBootSequence(selectedSequence.lines, 0);
    }
    
    typeBootSequence(lines, index) {
        if (index >= lines.length) {
            // Add title card loading sequence before showing ready state
            const titleCardElement = document.createElement('div');
            titleCardElement.className = 'boot-line loading';
            titleCardElement.textContent = 'Loading Krizdingus.exe';
            this.elements.bootSequence.appendChild(titleCardElement);
            this.elements.bootSequence.scrollTop = this.elements.bootSequence.scrollHeight;

            // Animate dots for title card loading
            animateDots(titleCardElement, 'Loading Krizdingus.exe', 1200, () => {
                setTimeout(() => {
                    titleCardElement.className = 'boot-line success';
                    titleCardElement.textContent = 'Krizdingus.exe loaded successfully';
                    this.elements.bootSequence.scrollTop = this.elements.bootSequence.scrollHeight;
                    
                    // Add a small delay before showing ready state
                    setTimeout(() => this.showReadyState(), 800);
                }, 200);
            });
            return;
        }
        
        const line = lines[index];
        const lineElement = document.createElement('div');
        lineElement.className = `boot-line ${line.type}`;
        
        if (line.typing) {
            this.elements.bootSequence.appendChild(lineElement);
            this.elements.bootSequence.scrollTop = this.elements.bootSequence.scrollHeight;
            animateTyping(lineElement, line.text, () => {
                setTimeout(() => {
                    this.typeBootSequence(lines, index + 1);
                }, 200); // Small pause after typing
            });
        } else if (line.dots) {
            this.elements.bootSequence.appendChild(lineElement);
            this.elements.bootSequence.scrollTop = this.elements.bootSequence.scrollHeight;
            animateDots(lineElement, line.text, line.delay, () => {
                setTimeout(() => {
                    this.typeBootSequence(lines, index + 1);
                }, 200);
            });
        } else if (line.progress) {
            lineElement.innerHTML = line.text + ' <span class="ascii-progress"></span>';
            this.elements.bootSequence.appendChild(lineElement);
            this.elements.bootSequence.scrollTop = this.elements.bootSequence.scrollHeight;
            const progressSpan = lineElement.querySelector('.ascii-progress');
            const fillDuration = Math.max(200, line.delay - 100);
            animateAsciiProgress(progressSpan, fillDuration);
            setTimeout(() => {
                this.typeBootSequence(lines, index + 1);
            }, line.delay);
        } else {
            lineElement.textContent = line.text;
            this.elements.bootSequence.appendChild(lineElement);
            this.elements.bootSequence.scrollTop = this.elements.bootSequence.scrollHeight;
            setTimeout(() => {
                this.typeBootSequence(lines, index + 1);
            }, line.delay);
        }
        
        // Animate line appearance
        setTimeout(() => {
            lineElement.style.animationDelay = '0s';
        }, 50);
    }
    
    showReadyState() {
        this.state = 'transitioning';
        // Set random background image for title card
        this.setRandomTitleBg();
        setTimeout(() => {
            this.triggerCRTTransition();
        }, 600);
    }
    
    setRandomTitleBg() {
        if (!this.elements.titleBg) return;
        const images = this.bgImages.filter(src => src.includes('console-title-bg_'));
        if (images.length === 0) {
            this.elements.titleBg.style.backgroundImage = '';
            this.elements.hero.classList.remove('ready-bg-visible');
            return;
        }
        const randomImg = images[Math.floor(Math.random() * images.length)];
        this.elements.titleBg.style.backgroundImage = `url('${randomImg}')`;
        // Only show when ready state is visible
        this.elements.hero.classList.add('ready-bg-visible');
    }
    
    triggerCRTTransition() {
        const hero = this.elements.hero;
        hero.classList.remove('ready-bg-visible'); // Hide background during transition
        
        // Start glitchy CRT effect
        hero.classList.add('crt-bootup');
        
        // Hide boot sequence after brief glitch
        setTimeout(() => {
            this.elements.bootSequence.style.transition = 'opacity 0.3s ease';
            this.elements.bootSequence.style.opacity = '0';
        }, 300);
        
        // Show ready state during the glitch
        setTimeout(() => {
            this.elements.bootSequence.style.display = 'none';
            this.elements.readyState.style.display = 'flex';
            this.elements.readyState.style.opacity = '0';
            
            // Fade in ready state
            requestAnimationFrame(() => {
                this.elements.readyState.style.transition = 'opacity 0.4s ease';
                this.elements.readyState.style.opacity = '1';
            });
            
            this.elements.hero.classList.add('is-visible');
            // Show background now that ready state is visible
            this.elements.hero.classList.add('ready-bg-visible');
        }, 600);
        
        // Clean up effect
        setTimeout(() => {
            hero.classList.remove('crt-bootup');
            this.state = 'ready';
            this.startIdleTimer();
        }, 900);
    }
    
    startIdleTimer() {
        this.clearTimers();
        this.idleTimer = setTimeout(() => {
            // Idle state handling
        }, 8000); // 8 seconds of idle before state change
    }
    
    resetToReady() {
        if (this.state !== 'ready') {
            this.state = 'ready';
            this.clearTimers();
            this.elements.readyState.style.display = 'flex';
            this.setRandomTitleBg();
            this.startIdleTimer();
        }
    }
    
    setupEventListeners() {
        // Reset to ready state on any interaction, but only if already in ready state
        ['click', 'mousemove', 'keydown', 'touchstart'].forEach(event => {
            this.elements.hero.addEventListener(
                event,
                () => {
                    if (this.state === 'ready') {
                        this.resetToReady();
                    }
                },
                event === 'touchstart' ? { passive: true } : false
            );
        });
        
        // Prevent event bubbling on the console button
        const button = this.elements.hero.querySelector('.console-button');
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }
    
    clearTimers() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }

    cleanup() {
        this.clearTimers();
        
        // Remove event listeners
        this.elements.hero?.removeEventListener('mouseenter', this.handleMouseEnter);
        this.elements.hero?.removeEventListener('mouseleave', this.handleMouseLeave);
        
        // Clear any ongoing animations
        this.elements.bootSequence.innerHTML = '';
        this.elements.readyState.style.display = 'none';
        
        // Reset state
        this.state = 'booting';
        this.currentBootIndex = 0;
        this.currentLineIndex = 0;
    }
}

// ===== IMAGE LOADING =====
/**
 * Handles image fade-in effects and error fallbacks
 */
class LazyImageLoader {
    constructor() {
        this.images = document.querySelectorAll('img[loading="lazy"]');
        this.init();
    }
    
    init() {
        this.images.forEach(img => {
            img.addEventListener('load', () => this.handleImageLoad(img));
            img.addEventListener('error', () => this.handleImageError(img));
        });
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
        img.style.background = 'var(--bg-tertiary)';
        img.style.color = 'var(--text-secondary)';
        img.alt = 'Image not available';
        img.classList.add('error');
    }
}

// ===== PROJECT CARDS =====
/**
 * Handles keyboard navigation for project cards
 */
class ProjectCardManager {
    constructor() {
        this.cards = document.querySelectorAll('.project-card');
        this.init();
    }
    
    init() {
        this.addKeyboardNavigation();
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

// ===== FEATURED PROJECT =====
/**
 * Rotates featured projects automatically
 * Shows cool glitch effects during transitions
 */
class FeaturedProjectRotator {
    constructor() {
        this.featuredSection = document.querySelector('#featured');
        this.projectCard = document.querySelector('.project-card.featured');
        this.currentIndex = 0;
        this.rotateInterval = 20000; // 20 seconds
        this.autoRotateTimer = null;
        this.hoverDelayTimer = null;
        this.isHovered = false;
        this.intervalExpiredWhileHovered = false;
        this.projects = [];
        this.init();
    }
    forceRotation() {
        if (this.projects.length > 1) {
            this.rotateToNext();
        }
    }
    init() {
        if (!this.featuredSection || !this.projectCard) {
            return;
        }
        this.buildProjectsFromHTML();
        if (this.projects.length <= 1) {
            return;
        }
        this.startAutoRotation();
        this.featuredSection.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.featuredSection.addEventListener('mouseleave', () => this.handleMouseLeave());
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.clearAutoTimers();
            } else {
                this.startAutoRotation();
            }
        });
    }
    handleMouseEnter() {
        this.isHovered = true;
        if (this.hoverDelayTimer) {
            clearTimeout(this.hoverDelayTimer);
            this.hoverDelayTimer = null;
        }
    }
    handleMouseLeave() {
        this.isHovered = false;
        if (this.intervalExpiredWhileHovered) {
            this.hoverDelayTimer = setTimeout(() => {
                if (!this.isHovered) {
                    this.rotateToNext();
                    this.intervalExpiredWhileHovered = false;
                }
            }, 3000);
        }
    }
    startAutoRotation() {
        this.clearAutoTimers();
        this.autoRotateTimer = setTimeout(() => {
            if (this.isHovered) {
                this.intervalExpiredWhileHovered = true;
            } else {
                this.rotateToNext();
            }
        }, this.rotateInterval);
    }
    clearAutoTimers() {
        if (this.autoRotateTimer) {
            clearTimeout(this.autoRotateTimer);
            this.autoRotateTimer = null;
        }
        if (this.hoverDelayTimer) {
            clearTimeout(this.hoverDelayTimer);
            this.hoverDelayTimer = null;
        }
    }
    rotateToNext() {
        this.clearAutoTimers();
        this.intervalExpiredWhileHovered = false;
        const oldIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex + 1) % this.projects.length;
        const nextProject = this.projects[this.currentIndex];
        this.triggerGlitchTransition(nextProject);
        this.startAutoRotation();
    }
    triggerGlitchTransition(project) {
        this.featuredSection.classList.add('glitch-burst', 'extreme-glitch');
        this.showGlitchWarning();
        this.featuredSection.classList.add('section-shake');
        setTimeout(() => {
            this.updateProjectDisplay(project);
        }, 400);
        setTimeout(() => {
            this.featuredSection.classList.remove('extreme-glitch');
        }, 600);
        setTimeout(() => {
            this.featuredSection.classList.remove('glitch-burst');
            this.featuredSection.classList.remove('section-shake');
        }, 800);
    }
    showGlitchWarning() {
        const warnings = [
            "◊ CARTRIDGE READ FAILURE ◊",
            "◊ GAME PAK CORRUPTED ◊",
            "◊ SAVE BATTERY LOW ◊",
            "◊ LINK CABLE UNSTABLE ◊",
            "◊ WILY PROTOCOL BREACHED ◊",
            "◊ BUSTER OVERHEAT DETECTED ◊",
            "◊ SRAM DETECTS CHAOS ENERGY ◊",
            "◊ DINGUS MODULE OUT OF RANGE ◊"
        ];
        const subWarnings = [
            "BLOWING INTO SLOT... PLEASE WAIT",
            "RELOADING FROM LAST GOOD EEPROM...",
            "INITIALIZING BACKUP ROBOT MASTER...",
            "RESETTING CLOCK TO 1999...",
            "RESEATING GAME PAK IN SLOT A...",
            "REBUILDING FROM ZERO CHIP...",
            "CHECKING REGION LOCK CIRCUMVENTION...",
            "REESTABLISHING GAME LINK CONNECTION..."
        ];
        const warning = document.createElement('div');
        warning.className = 'glitch-warning';
        warning.innerHTML = `
            <div class="pixel-text">${warnings[Math.floor(Math.random() * warnings.length)]}</div>
            <div>${subWarnings[Math.floor(Math.random() * subWarnings.length)]}</div>
        `;
        const projectCard = this.featuredSection.querySelector('.project-card.featured');
        if (projectCard) {
            projectCard.style.position = 'relative';
            projectCard.appendChild(warning);
        } else {
            const container = this.featuredSection.querySelector('.container');
            if (container) {
                container.style.position = 'relative';
                container.appendChild(warning);
            } else {
                this.featuredSection.style.position = 'relative';
                this.featuredSection.appendChild(warning);
            }
        }
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 1800);
    }
    updateProjectDisplay(project) {
        try {
            const img = this.projectCard.querySelector('.project-image img');
            if (img) {
                if (project.image) {
                    img.src = project.image;
                    img.alt = project.imageAlt || project.title;
                    img.style.display = 'block';
                    img.style.opacity = '1';
                    img.onerror = () => {
                        img.style.display = 'none';
                    };
                } else {
                    img.style.display = 'none';
                }
            }
            const title = this.projectCard.querySelector('.project-info h3, h3[itemprop="name"], h3');
            if (title) {
                title.textContent = project.title;
            }
            const description = this.projectCard.querySelector('.project-info .project-hook, .project-info p[itemprop="description"], .project-hook');
            if (description) {
                description.textContent = project.description;
            }
            const tagsList = this.projectCard.querySelector('.project-info .tech-tags, .tech-tags');
            if (tagsList && project.tags.length > 0) {
                tagsList.innerHTML = project.tags.map(tag => `<span>${tag}</span>`).join('');
            }
            let projectLink = this.projectCard.querySelector('.project-info .project-link');
            if (!projectLink) {
                projectLink = document.createElement('a');
                projectLink.className = 'project-link';
                projectLink.target = '_blank';
                projectLink.rel = 'noopener';
                projectLink.itemProp = 'url';
                this.projectCard.querySelector('.project-info').appendChild(projectLink);
            }
            projectLink.href = project.url;
            projectLink.textContent = 'View Project';
            projectLink.setAttribute('aria-label', `View ${project.title} project (opens in new tab)`);
        } catch (error) {
            // Error handling
        }
    }
    buildProjectsFromHTML() {
        const projectCards = document.querySelectorAll('.projects-grid .project-card[data-featured="true"]');
        projectCards.forEach((card, index) => {
            const project = this.extractProjectFromCard(card);
            if (project) {
                this.projects.push(project);
            }
        });
        if (this.projects.length > 0) {
            this.updateProjectDisplay(this.projects[0]);
        }
    }
    extractProjectFromCard(card) {
        try {
            const link = card.querySelector('a[href]');
            const title = card.querySelector('h3[itemprop="name"], h3');
            const description = card.querySelector('p[itemprop="description"], .project-hook');
            const tags = card.querySelectorAll('.tech-tags li, .tech-tags span');
            if (!link || !title) {
                return null;
            }
            if (link.href === '#' || link.href.endsWith('#')) {
                return null;
            }
            let image = null;
            let imageAlt = '';
            if (card.dataset.image) {
                image = card.dataset.image;
                imageAlt = card.dataset.imageAlt || '';
            } else {
                const img = card.querySelector('img');
                if (img) {
                    image = img.src;
                    imageAlt = img.alt || '';
                }
            }
            const project = {
                title: title.textContent.trim(),
                description: description ? description.textContent.trim() : '',
                image: image,
                imageAlt: imageAlt,
                url: link.href,
                tags: Array.from(tags).map(tag => tag.textContent.trim())
            };
            return project;
        } catch (error) {
            return null;
        }
    }
}

// ===== OS WINDOW MENU SYSTEM =====
class OSMenuSystem {
    constructor() {
        this.menuBar = document.querySelector('.menu-bar');
        this.windowChrome = document.querySelector('.window-chrome');
        this.consoleHero = document.getElementById('consoleHero');
        this.readyState = document.querySelector('.ready-state');
        this.activeMenu = null;
        this.currentWallpaper = null;
        this.isMinimized = false;
        this.isMaximized = false;
        this.menuData = this.buildMenuData();
        
        this.init();
    }
    
    init() {
        if (!this.menuBar) return;
        
        this.renderMenus();
        this.setupEventListeners();
        this.setupWindowControls();
        this.detectCurrentWallpaper();
    }
    
    buildMenuData() {
        return {
            'File': {
                items: [
                    {
                        label: 'Open',
                        hasSubmenu: true,
                        getSubmenu: () => this.getBootSequenceMenu()
                    },
                    { label: 'separator' },
                    {
                        label: 'Print',
                        action: 'print',
                        disabled: true
                    },
                    { label: 'separator' },
                    {
                        label: 'Close',
                        action: 'rebootRandom'
                    }
                ]
            },
            'Edit': {
                items: [
                    {
                        label: 'Theme',
                        hasSubmenu: true,
                        submenu: [
                            {
                                label: 'Light Mode',
                                action: 'setTheme',
                                params: 'light'
                            },
                            {
                                label: 'Dark Mode',
                                action: 'setTheme',
                                params: 'dark'
                            }
                        ]
                    },
                    { label: 'separator' },
                    {
                        label: 'Desktop',
                        hasSubmenu: true,
                        getSubmenu: () => this.getDesktopBackgroundMenu()
                    }
                ]
            },
            'View': {
                items: [
                    {
                        label: 'Projects',
                        hasSubmenu: true,
                        getSubmenu: () => this.getProjectsMenu()
                    },
                    { label: 'separator' },
                    {
                        label: 'Instagram',
                        action: 'openExternal',
                        params: 'https://www.instagram.com/krizdingus/'
                    },
                    {
                        label: 'GitHub',
                        action: 'openExternal',
                        params: 'https://github.com/krizdingus'
                    },
                    {
                        label: 'MakerWorld',
                        action: 'openExternal',
                        params: 'https://makerworld.com/en/@krizdingus'
                    },
                    {
                        label: 'Portfolio',
                        action: 'openExternal',
                        params: 'https://kwilliams.me'
                    }
                ]
            },
            'Help': {
                items: [
                    {
                        label: 'About',
                        action: 'scrollTo',
                        params: '#about'
                    },
                    {
                        label: 'README',
                        action: 'openExternal',
                        params: 'https://github.com/krizdingus/krizdingus.github.io/blob/main/README.md'
                    }
                ]
            }
        };
    }
    
    setupWindowControls() {
        const minimizeBtn = document.querySelector('.minimize-btn');
        const closeBtn = document.querySelector('.close-btn');
        const maximizeBtn = document.querySelector('.maximize-btn');
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimizeWindow();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.rebootConsole();
            });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMaximize();
            });
        }
    }
    
    minimizeWindow() {
        if (!this.windowChrome || !this.readyState) return;
        
        this.isMinimized = true;
        
        // Remove any existing classes
        this.readyState.classList.remove('restoring');
        this.windowChrome.classList.remove('restoring', 'maximized');
        this.isMaximized = false;
        
        // Add minimized class
        this.windowChrome.classList.add('minimized');
        
        // Setup click handler on title bar for restore
        const titleBar = this.windowChrome.querySelector('.title-bar');
        if (titleBar) {
            // Remove any existing restore handler
            titleBar.removeEventListener('click', this.titleBarRestoreHandler);
            
            // Create new handler
            this.titleBarRestoreHandler = (e) => {
                // Don't restore if clicking on window controls
                if (e.target.closest('.window-controls')) {
                    return;
                }
                e.stopPropagation();
                this.restoreWindow();
            };
            
            titleBar.addEventListener('click', this.titleBarRestoreHandler);
            titleBar.style.cursor = 'pointer';
        }
    }
    
    restoreWindow() {
        if (!this.windowChrome || !this.readyState || !this.isMinimized) return;
        
        this.isMinimized = false;
        
        // Remove minimized class
        this.windowChrome.classList.remove('minimized');
        
        // Add restoring animation to the window chrome
        this.windowChrome.classList.add('restoring');
        
        // Remove title bar click handler
        const titleBar = this.windowChrome.querySelector('.title-bar');
        if (titleBar && this.titleBarRestoreHandler) {
            titleBar.removeEventListener('click', this.titleBarRestoreHandler);
            titleBar.style.cursor = '';
            this.titleBarRestoreHandler = null;
        }
        
        // Clean up animation class after completion
        setTimeout(() => {
            this.windowChrome.classList.remove('restoring');
        }, 100); // Match animation duration (0.1s)
    }
    
    toggleMaximize() {
        if (!this.windowChrome) return;
        
        // If minimized, restore first
        if (this.isMinimized) {
            this.restoreWindow();
            return;
        }
        
        // Toggle maximized state
        this.isMaximized = !this.isMaximized;
        
        if (this.isMaximized) {
            this.windowChrome.classList.add('maximized');
        } else {
            this.windowChrome.classList.remove('maximized');
        }
    }
    
    rebootConsole() {
        const consoleHero = window.consoleHeroInstance;
        if (!consoleHero) return;
        
        // Always restore window to normal size before reboot
        if (this.isMinimized) {
            this.restoreWindow();
        }
        
        // Remove maximized state
        if (this.isMaximized) {
            this.windowChrome.classList.remove('maximized');
            this.isMaximized = false;
        }
        
        // Close all menus
        this.closeAllMenus();
        
        // Add CRT power-off animation
        consoleHero.elements.hero.classList.add('crt-poweroff');
        
        // Wait for power-off animation to complete
        setTimeout(() => {
            // Reset console state
            consoleHero.state = 'booting';
            consoleHero.currentBootIndex = 0;
            consoleHero.currentLineIndex = 0;
            
            // Hide ready state
            consoleHero.elements.readyState.style.display = 'none';
            consoleHero.elements.bootSequence.style.display = 'block';
            consoleHero.elements.bootSequence.style.opacity = '1';
            consoleHero.elements.bootSequence.innerHTML = '';
            
            // Remove power-off class
            consoleHero.elements.hero.classList.remove('crt-poweroff');
            
            // Start random boot sequence after a longer delay
            setTimeout(() => {
                consoleHero.startBootSequence();
            }, 1500); // Increased from 200ms to 1500ms (1.5 seconds)
        }, 600); // Match the power-off animation duration
    }
    
    rebootConsoleSpecific(sequenceIndex) {
        const consoleHero = window.consoleHeroInstance;
        if (!consoleHero) return;
        
        // Always restore window to normal size before reboot
        if (this.isMinimized) {
            this.restoreWindow();
        }
        
        // Remove maximized state
        if (this.isMaximized) {
            this.windowChrome.classList.remove('maximized');
            this.isMaximized = false;
        }
        
        // Close all menus
        this.closeAllMenus();
        
        // Add CRT power-off animation
        consoleHero.elements.hero.classList.add('crt-poweroff');
        
        // Wait for power-off animation to complete
        setTimeout(() => {
            // Reset console state
            consoleHero.state = 'booting';
            consoleHero.currentBootIndex = 0;
            consoleHero.currentLineIndex = 0;
            
            // Hide ready state
            consoleHero.elements.readyState.style.display = 'none';
            consoleHero.elements.bootSequence.style.display = 'block';
            consoleHero.elements.bootSequence.style.opacity = '1';
            consoleHero.elements.bootSequence.innerHTML = '';
            
            // Remove power-off class
            consoleHero.elements.hero.classList.remove('crt-poweroff');
            
            // Start specific boot sequence after a longer delay
            setTimeout(() => {
                const sequences = consoleHero.getBootSequences();
                const selectedSequence = sequences[sequenceIndex];
                if (selectedSequence) {
                    consoleHero.typeBootSequence(selectedSequence.lines, 0);
                }
            }, 1500); // Increased from 200ms to 1500ms (1.5 seconds)
        }, 600); // Match the power-off animation duration
    }
    
    detectCurrentWallpaper() {
        const consoleHero = window.consoleHeroInstance;
        if (!consoleHero || !consoleHero.elements.titleBg) return;
        
        const bgStyle = consoleHero.elements.titleBg.style.backgroundImage;
        if (bgStyle) {
            const match = bgStyle.match(/url\(['"]?([^'")]+)['"]?\)/);
            if (match) {
                this.currentWallpaper = match[1];
            }
        }
    }
    
    // Menu action handlers
    executeAction(action, params) {
        switch (action) {
            case 'rebootRandom':
                this.rebootConsole();
                break;
            case 'rebootSpecific':
                this.rebootConsoleSpecific(params);
                break;
            case 'print':
                window.print();
                break;
            case 'setTheme':
                this.setTheme(params);
                break;
            case 'setBackground':
                this.setBackground(params);
                break;
            case 'scrollTo':
                this.smoothScrollTo(params);
                break;
            case 'openExternal':
                window.open(params, '_blank', 'noopener');
                break;
            case 'openProject':
                window.open(params, '_blank', 'noopener');
                break;
        }
        
        this.closeAllMenus();
    }
    
    renderMenus() {
        this.menuBar.innerHTML = '';
        
        Object.keys(this.menuData).forEach(menuName => {
            const menuItem = document.createElement('span');
            menuItem.className = 'menu-item';
            menuItem.textContent = menuName;
            menuItem.dataset.menu = menuName;
            
            this.menuBar.appendChild(menuItem);
        });
    }
    
    setupEventListeners() {
        this.menuBar.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (!menuItem) return;
            
            e.stopPropagation();
            this.toggleMenu(menuItem);
        });
        
        document.addEventListener('click', (e) => {
            if (!this.menuBar.contains(e.target)) {
                this.closeAllMenus();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllMenus();
            }
        });
    }
    
    toggleMenu(menuItem) {
        const menuName = menuItem.dataset.menu;
        
        if (this.activeMenu === menuName) {
            this.closeAllMenus();
        } else {
            this.closeAllMenus();
            this.openMenu(menuItem, menuName);
        }
    }
    
    openMenu(menuItem, menuName) {
        menuItem.classList.add('active');
        this.activeMenu = menuName;
        
        const dropdown = this.createDropdown(this.menuData[menuName].items);
        dropdown.classList.add('show');
        menuItem.appendChild(dropdown);
    }
    
    closeAllMenus() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            const dropdown = item.querySelector('.dropdown-menu');
            if (dropdown) dropdown.remove();
        });
        this.activeMenu = null;
    }
    
    createDropdown(items) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu';
        
        items.forEach(item => {
            if (item.label === 'separator') {
                const separator = document.createElement('div');
                separator.className = 'dropdown-separator';
                dropdown.appendChild(separator);
            } else {
                const dropdownItem = this.createDropdownItem(item);
                dropdown.appendChild(dropdownItem);
            }
        });
        
        return dropdown;
    }
    
    createDropdownItem(item) {
        const dropdownItem = document.createElement('div');
        dropdownItem.className = 'dropdown-item';
        
        if (item.disabled) {
            dropdownItem.classList.add('disabled');
        }
        
        if (item.hasSubmenu) {
            dropdownItem.classList.add('has-submenu');
        }
        
        if (item.action === 'setBackground' && item.params === this.currentWallpaper) {
            dropdownItem.classList.add('disabled', 'current-wallpaper');
        }
        
        dropdownItem.textContent = item.label;
        
        if (!item.disabled && !(item.action === 'setBackground' && item.params === this.currentWallpaper)) {
            dropdownItem.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.action) {
                    this.executeAction(item.action, item.params);
                }
            });
        }
        
        if (item.hasSubmenu) {
            dropdownItem.addEventListener('mouseenter', () => {
                const submenuItems = item.getSubmenu ? item.getSubmenu() : item.submenu;
                const submenu = this.createSubmenu(submenuItems);
                dropdownItem.appendChild(submenu);
            });
            
            dropdownItem.addEventListener('mouseleave', () => {
                const submenu = dropdownItem.querySelector('.dropdown-submenu');
                if (submenu) submenu.remove();
            });
        }
        
        return dropdownItem;
    }
    
    createSubmenu(items) {
        const submenu = document.createElement('div');
        submenu.className = 'dropdown-submenu';
        
        items.forEach(item => {
            const dropdownItem = this.createDropdownItem(item);
            submenu.appendChild(dropdownItem);
        });
        
        return submenu;
    }
    
    getBootSequenceMenu() {
        const consoleHero = window.consoleHeroInstance;
        if (!consoleHero) return [];
        
        const sequences = consoleHero.getBootSequences();
        return sequences.map((seq, index) => ({
            label: seq.name,
            action: 'rebootSpecific',
            params: index
        }));
    }
    
    getDesktopBackgroundMenu() {
        const consoleHero = window.consoleHeroInstance;
        if (!consoleHero) return [];
        
        this.detectCurrentWallpaper();
        
        return consoleHero.bgImages.map(img => ({
            label: this.formatBackgroundName(img),
            action: 'setBackground',
            params: img
        }));
    }
    
    getProjectsMenu() {
        const projects = document.querySelectorAll('.projects-grid .project-card');
        const menuItems = [];
        
        projects.forEach(card => {
            const link = card.querySelector('a[href]');
            const title = card.querySelector('h3');
            
            if (link && title) {
                menuItems.push({
                    label: title.textContent.trim(),
                    action: 'openProject',
                    params: link.href
                });
            }
        });
        
        return menuItems;
    }
    
    formatBackgroundName(imagePath) {
        const filename = imagePath.split('/').pop();
        const name = filename.replace('console-title-bg_', '').replace('.png', '');
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
    
    setTheme(theme) {
        const themeManager = window.themeManagerInstance;
        if (themeManager) {
            themeManager.applyTheme(theme);
        }
    }
    
    setBackground(imagePath) {
        const consoleHero = window.consoleHeroInstance;
        if (!consoleHero) return;
        
        const titleBg = consoleHero.elements.titleBg;
        if (titleBg) {
            // Add extreme glitch class
            titleBg.classList.add('extreme-change');
            
            // Change image at the midpoint of the animation
            setTimeout(() => {
                titleBg.style.backgroundImage = `url('${imagePath}')`;
                consoleHero.elements.hero.classList.add('ready-bg-visible');
                this.currentWallpaper = imagePath;
            }, 600); // Midpoint of 1.2s animation
            
            // Remove animation class after completion
            setTimeout(() => {
                titleBg.classList.remove('extreme-change');
            }, 1200); // Match animation duration
        }
    }
    
    smoothScrollTo(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ===== RANDOM EFFECTS =====
/**
 * Adds random glitch effects to project cards
 * Includes color shifts, pixel corruption, and more
 */
class RandomProjectEffects {
    constructor() {
        this.projectCards = document.querySelectorAll('.projects-grid .project-card');
        this.isActive = true;
        this.effectQueue = [];
        this.lastEffectTime = 0;
        this.minEffectInterval = 3000;
        this.maxEffectInterval = 5000;
        this.respectsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }
    init() {
        if (this.respectsReducedMotion || this.projectCards.length === 0) {
            return;
        }
        this.scheduleRandomEffects();
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
            if (this.isActive) {
                this.scheduleRandomEffects();
            }
        });
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.respectsReducedMotion = e.matches;
            if (this.respectsReducedMotion) {
                this.isActive = false;
            }
        });
    }
    scheduleRandomEffects() {
        if (!this.isActive || this.respectsReducedMotion) return;
        const now = Date.now();
        const timeSinceLastEffect = now - this.lastEffectTime;
        const minDelay = Math.max(0, this.minEffectInterval - timeSinceLastEffect);
        const randomDelay = minDelay + Math.random() * (this.maxEffectInterval - this.minEffectInterval);
        setTimeout(() => {
            if (this.isActive && !this.respectsReducedMotion) {
                this.triggerRandomEffect();
                this.scheduleRandomEffects();
            }
        }, randomDelay);
    }
    triggerRandomEffect() {
        const hoveredCard = document.querySelector('.project-card:hover');
        if (hoveredCard) {
            return;
        }
        const randomCard = this.projectCards[Math.floor(Math.random() * this.projectCards.length)];
        const effects = [
            'colorShift',
            'pixelCorruption',
            'quickGlitch',
            'borderFlicker',
            'chromaBleed'
        ];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        this[randomEffect](randomCard);
        this.lastEffectTime = Date.now();
    }
    colorShift(card) {
        const originalFilter = card.style.filter;
        const colorShifts = [
            'hue-rotate(90deg) saturate(1.5)',
            'hue-rotate(180deg) saturate(1.2)',
            'hue-rotate(270deg) saturate(1.3)',
            'sepia(0.8) hue-rotate(45deg)',
            'invert(0.1) hue-rotate(120deg)'
        ];
        const randomShift = colorShifts[Math.floor(Math.random() * colorShifts.length)];
        card.style.filter = randomShift;
        card.style.transition = 'filter 0.2s ease';
        setTimeout(() => {
            card.style.filter = originalFilter;
            setTimeout(() => {
                card.style.transition = '';
            }, 200);
        }, 1200);
    }
    pixelCorruption(card) {
        const corruptionMask = document.createElement('div');
        corruptionMask.className = 'pixel-corruption';
        card.style.position = 'relative';
        card.appendChild(corruptionMask);
        card.classList.add('corrupted');
        setTimeout(() => {
            card.classList.remove('corrupted');
            if (corruptionMask.parentNode) {
                corruptionMask.parentNode.removeChild(corruptionMask);
            }
        }, 600);
    }
    quickGlitch(card) {
        card.classList.add('quick-glitch');
        setTimeout(() => {
            card.classList.remove('quick-glitch');
        }, 300);
    }
    borderFlicker(card) {
        const originalBorder = card.style.border;
        const originalBoxShadow = card.style.boxShadow;
        let flickerCount = 0;
        const maxFlickers = 6;
        const flicker = () => {
            if (flickerCount >= maxFlickers) return;
            const isOn = flickerCount % 2 === 0;
            if (isOn) {
                card.style.border = '3px solid var(--accent-tertiary)';
                card.style.boxShadow = '0 0 20px var(--accent-tertiary)';
            } else {
                card.style.border = originalBorder;
                card.style.boxShadow = originalBoxShadow;
            }
            flickerCount++;
            setTimeout(flicker, 100);
        };
        flicker();
    }
    chromaBleed(card) {
        card.classList.add('chroma-bleed');
        setTimeout(() => {
            card.classList.remove('chroma-bleed');
        }, 1500);
    }
    triggerSpecificEffect(effectName, cardIndex = null) {
        if (!this.isActive || this.respectsReducedMotion) return;
        const card = cardIndex !== null 
            ? this.projectCards[cardIndex] 
            : this.projectCards[Math.floor(Math.random() * this.projectCards.length)];
        if (card && this[effectName]) {
            this[effectName](card);
        }
    }
    toggleEffects() {
        this.isActive = !this.isActive;
        if (this.isActive) {
            this.scheduleRandomEffects();
        }
    }
}

// ===== RETRO BACKGROUND =====
/**
 * Creates a retro-style background with scan lines
 * Adds subtle static and glitch effects
 */
class SimpleRetroBackground {
    constructor(element) {
        this.element = element;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.scanlines = [];
        this.time = 0;
        this.animationId = null;
        
        this.setup();
        this.initializeEffects();
        this.animate();
    }
    
    setup() {
        // Set up canvas styling for overlay retro effect
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.4;
            mix-blend-mode: overlay;
        `;
        
        // Ensure parent positioning
        if (getComputedStyle(this.element).position === 'static') {
            this.element.style.position = 'relative';
        }
        
        this.element.appendChild(this.canvas);
        this.resize();
        
        // Event listeners
        window.addEventListener('resize', () => this.resize());
        
        // Theme awareness
        this.updateColors();
        new MutationObserver(() => this.updateColors()).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    resize() {
        const rect = this.element.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.initializeEffects(); // Recalculate dot density for new size
    }
    
    updateColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.colors = {
            primary: isDark ? '#ff6b9d' : '#9a2257',
            accent: isDark ? '#a4f09d' : '#84d07d',
            dotColor: isDark ? '#a4f09d' : '#494786', // Dot color for static effect
            text: isDark ? '#c4bebb' : '#272929',
            // Scanline color palette
            scanlineColors: isDark ? 
                ['#ff6b9d', '#a4f09d', '#7b7bc9', '#ff9f6b'] : 
                ['#9a2257', '#494786', '#84d07d', '#b85c00']
        };
        
        // Set dot density and intensity for static effect
        this.isDark = isDark;
        this.dotDensity = isDark ? 0.0015 : 0.002; // Controls number of static dots
        this.dotIntensity = isDark ? 0.8 : 1.0; // Controls opacity of static dots
        
        // Adjust opacity and blend mode for theme
        this.canvas.style.opacity = isDark ? '0.4' : '0.6';
        this.canvas.style.mixBlendMode = isDark ? 'screen' : 'multiply';
    }
    
    initializeEffects() {
        // Set dot density and intensity for static effect
        this.dotDensity = this.isDark ? 0.0015 : 0.002;
        this.dotIntensity = this.isDark ? 0.8 : 1.0;
        
        // Create scanlines with properties for animation
        this.scanlines = [
            { 
                y: -15, 
                speed: 1.0, 
                baseOpacity: 0.15, 
                width: 2, 
                colorIndex: 0,
                pulse: Math.random() * Math.PI,
                glitchChance: 0.002
            },
            { 
                y: -35, 
                speed: 0.7, 
                baseOpacity: 0.12, 
                width: 1, 
                colorIndex: 1,
                pulse: Math.random() * Math.PI,
                glitchChance: 0.001
            }
        ];
    }
    
    animate() {
        this.time += 0.08; // For scanline animation only
        
        // Update scanlines for animation
        this.scanlines.forEach(scanline => {
            scanline.y += scanline.speed;
            scanline.pulse += 0.05; // Pulse animation
            
            if (scanline.y > this.canvas.height + 20) {
                scanline.y = -20 - Math.random() * 40; // Reset to random starting position
                // Occasionally randomize properties for variety
                if (Math.random() < 0.15) {
                    scanline.baseOpacity = 0.08 + Math.random() * 0.12;
                    scanline.speed = 0.4 + Math.random() * 1.0;
                    scanline.colorIndex = Math.floor(Math.random() * this.colors.scanlineColors.length);
                }
            }
        });
        
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw random static dots each frame
        this.ctx.fillStyle = this.colors.dotColor;
        const totalPixels = this.canvas.width * this.canvas.height;
        const numDots = Math.floor(totalPixels * this.dotDensity);
        
        for (let i = 0; i < numDots; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const opacity = Math.random() * this.dotIntensity;
            const size = 1.5 + Math.random() * 1; // Dot size varies for effect
            
            this.ctx.globalAlpha = opacity;
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Draw animated scan lines
        this.scanlines.forEach(scanline => {
            const pulseEffect = Math.sin(scanline.pulse) * 0.05; // Subtle pulse
            const currentOpacity = scanline.baseOpacity + pulseEffect;
            const currentColor = this.colors.scanlineColors[scanline.colorIndex];
            
            // Occasional glitch effect - make scanline thicker and brighter
            const isGlitching = Math.random() < scanline.glitchChance;
            const glitchMultiplier = isGlitching ? 2.5 : 1;
            const glitchWidth = isGlitching ? scanline.width * 2 : scanline.width;
            
            // Main scanline
            this.ctx.globalAlpha = currentOpacity * glitchMultiplier;
            this.ctx.fillStyle = currentColor;
            this.ctx.fillRect(0, scanline.y, this.canvas.width, glitchWidth);
            
            // Subtle glow effect
            this.ctx.globalAlpha = currentOpacity * 0.3;
            this.ctx.fillRect(0, scanline.y - 1, this.canvas.width, glitchWidth + 2);
            
            // If glitching, add horizontal noise bars
            if (isGlitching) {
                this.ctx.globalAlpha = 0.15;
                this.ctx.fillStyle = currentColor;
                for (let i = 0; i < 3; i++) {
                    const noiseY = scanline.y + (Math.random() - 0.5) * 20;
                    const noiseWidth = 50 + Math.random() * (this.canvas.width - 50);
                    const noiseX = Math.random() * (this.canvas.width - noiseWidth);
                    this.ctx.fillRect(noiseX, noiseY, noiseWidth, 1);
                }
            }
        });
        
        // Draw static horizontal lines
        this.ctx.globalAlpha = 0.15;
        this.ctx.fillStyle = this.colors.text;
        for (let y = 0; y < this.canvas.height; y += 6) {
            this.ctx.fillRect(0, y, this.canvas.width, 0.5);
        }
        
        // Occasional glitch effect
        if (Math.random() < 0.001) {
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillStyle = this.colors.primary;
            const glitchY = Math.random() * this.canvas.height;
            this.ctx.fillRect(0, glitchY, this.canvas.width, 3);
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// ===== UTILITY FUNCTIONS =====
/**
 * Shows a progress bar using ASCII characters
 * @param {HTMLElement} progressSpan - Where to show the progress
 * @param {number} duration - How long the animation should take
 */
function animateAsciiProgress(progressSpan, duration) {
    // Randomize steps between 4 and 25
    const steps = Math.floor(Math.random() * (25 - 4 + 1)) + 4;
    const chars = { filled: '▓', empty: '▒' };
    let current = 0;
    const interval = duration / steps;

    function update() {
        current++;
        const filled = chars.filled.repeat(current);
        const empty = chars.empty.repeat(steps - current);
        // Calculate percent, round to nearest 5%
        const percent = Math.round((current / steps) * 100 / 5) * 5;
        progressSpan.textContent = `[${filled}${empty}] ${percent}%`;
        if (current < steps) {
            setTimeout(update, interval);
        }
    }
    // Start with empty bar and 0%
    progressSpan.textContent = `[${chars.empty.repeat(steps)}] 0%`;
    setTimeout(update, interval);
}

/**
 * Types text out character by character
 * @param {HTMLElement} element - Where to type the text
 * @param {string} text - What to type
 * @param {Function} onComplete - What to do when done typing
 */
function animateTyping(element, text, onComplete) {
    let currentIndex = 0;
    const typingSpeed = 50 + Math.random() * 30; // 50-80ms per character
    
    function typeNextChar() {
        if (currentIndex < text.length) {
            element.textContent = text.slice(0, currentIndex + 1);
            currentIndex++;
            setTimeout(typeNextChar, typingSpeed);
        } else if (onComplete) {
            onComplete();
        }
    }
    
    typeNextChar();
}

/**
 * Shows loading dots animation
 * @param {HTMLElement} element - Where to show the dots
 * @param {string} baseText - The text before the dots
 * @param {number} duration - How long to animate
 * @param {Function} onComplete - What to do when done
 */
function animateDots(element, baseText, duration, onComplete) {
    const maxDots = 5;
    let currentDots = 0;
    const interval = duration / (maxDots + 1);
    
    function updateDots() {
        if (currentDots < maxDots) {
            currentDots++;
            element.textContent = baseText + '.'.repeat(currentDots);
            setTimeout(updateDots, interval);
        } else if (onComplete) {
            onComplete();
        }
    }
    
    element.textContent = baseText;
    setTimeout(updateDots, interval);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    window.themeManagerInstance = new ThemeManager();
    window.consoleHeroInstance = new ConsoleHero();
    new LazyImageLoader();
    new ProjectCardManager();
    new FeaturedProjectRotator();
    new OSMenuSystem();
    new RandomProjectEffects();

    // Smooth scroll to top for site title link
    const siteTitleLink = document.querySelector('.site-title a');
    if (siteTitleLink) {
        siteTitleLink.addEventListener('click', function(e) {
            if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.hostname === 'localhost') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const main = document.getElementById('main');
                if (main) {
                    setTimeout(() => main.focus && main.focus({ preventScroll: true }), 500);
                }
            }
        });
    }

    // Initialize retro backgrounds
    document.querySelectorAll('.retro-bg').forEach(element => {
        new SimpleRetroBackground(element);
    });
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    // Log errors but don't break the retro feel
    console.error('JavaScript error:', e.error);
});

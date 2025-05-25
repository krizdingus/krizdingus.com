/**
 * KRIZDINGUS.com JavaScript
 * Features:
 * - Retro OS-style boot sequence with random messages and ASCII art
 * - Theme toggle with system preference sync and localStorage persistence
 * - Lazy image loading with fade effects and intersection observer
 * - Project card animations: glitch effects, pixel corruption, chroma bleed
 * - Featured project rotation with extreme glitch transitions
 * - CRT effects: scan lines, static noise, power-on animations
 * - Smooth scrolling with reduced motion support
 * - Retro background with dynamic theme-aware effects
 * 
 * Design: Game Boy nostalgia meets 90s web aesthetic
 * Storage: localStorage for theme persistence
 * 
 */

/**
 * Main entry point for the application
 * Initializes all modules and handles cleanup
 */
import { ThemeManager } from './modules/ThemeManager.js';
import { ConsoleHero } from './modules/ConsoleHero.js';
import { LazyImageLoader } from './modules/LazyImageLoader.js';
import { SmoothScrollManager } from './modules/SmoothScrollManager.js';
import { ProjectCardManager } from './modules/ProjectCardManager.js';
import { FeaturedProjectRotator } from './modules/FeaturedProjectRotator.js';
import { RandomProjectEffects } from './modules/RandomProjectEffects.js';
import { SimpleRetroBackground } from './modules/SimpleRetroBackground.js';

// Initialize all modules
const themeManager = new ThemeManager(document.querySelector('.theme-toggle'));
const consoleHero = new ConsoleHero();
const lazyImageLoader = new LazyImageLoader();
const smoothScrollManager = new SmoothScrollManager();
const projectCardManager = new ProjectCardManager();
const featuredProjectRotator = new FeaturedProjectRotator();
const randomProjectEffects = new RandomProjectEffects();
const retroBackground = new SimpleRetroBackground(document.querySelector('.retro-background'));

// Handle page unload
window.addEventListener('beforeunload', () => {
    // Cleanup all modules
    themeManager.cleanup();
    consoleHero.cleanup();
    lazyImageLoader.cleanup();
    smoothScrollManager.cleanup();
    projectCardManager.cleanup();
    featuredProjectRotator.cleanup();
    randomProjectEffects.cleanup();
    retroBackground.destroy();
}); 
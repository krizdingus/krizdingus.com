// src/data/index.ts
// Barrel re-export for the browser-safe src/data/ modules. git.ts is
// build-time only (node:child_process) and is deliberately left out.

export * from './_types';
export * from './marquee';
export * from './directory';
export * from './workshop';
export * from './footer-strip';
export * from './home-images';
export * from './social';
export * from './site-nav';

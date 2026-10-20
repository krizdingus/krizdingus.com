// src/themes/kicker.ts
// Builds the synchronous <head> script that runs before first paint. It:
//   1. applies the stored light/dark color scheme (or the system one) and
//      points <meta name="theme-color"> at that scheme's surface, and
//   2. if a theme is wanted (stored choice, or a route lock via
//      <html data-theme-lock="<id>">) AND that theme's availability query
//      matches, marks <html data-skin-pending="<id>">. runtime.css hides the
//      body while a theme is pending, so normal mode never flashes before the
//      theme mounts. A CSS failsafe un-hides it after a few seconds if the
//      theme never arrives (offline, blocked script).
// With JavaScript off none of this runs, and the page is plain normal mode.
import type { ThemeManifest } from './types';

export const COLOR_STORAGE_KEY = 'krizdingus-theme';

/** Browser-chrome color per color scheme: normal mode's page surface. */
export const THEME_COLORS = { light: '#fbf5e8', dark: '#191225' } as const;

export function buildKicker(manifests: ThemeManifest[], skinKey: string): string {
  const themes = JSON.stringify(manifests.map((m) => [m.id, m.availability]));
  return (
    '(function(){var d=document.documentElement;' +
    'try{var c=localStorage.getItem(' + JSON.stringify(COLOR_STORAGE_KEY) + ');' +
    "c=c==='light'||c==='dark'?c:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');" +
    "d.setAttribute('data-theme',c);var C=" + JSON.stringify(THEME_COLORS) + ";" +
    "var M=document.querySelectorAll('meta[name=\"theme-color\"]');for(var j=0;j<M.length;j++)M[j].setAttribute('content',C[c]);}catch(e){}" +
    "var w=d.getAttribute('data-theme-lock');" +
    'if(!w){try{w=localStorage.getItem(' + JSON.stringify(skinKey) + ');}catch(e){}}' +
    'if(!w)return;var T=' + themes + ';' +
    "try{for(var i=0;i<T.length;i++){if(T[i][0]===w&&matchMedia(T[i][1]).matches){d.setAttribute('data-skin-pending',w);break;}}}catch(e){}" +
    '})();'
  );
}

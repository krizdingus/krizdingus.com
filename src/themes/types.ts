// src/themes/types.ts
// The contract between the theme framework (runtime.ts) and a theme package
// (src/themes/<id>/). See src/themes/README.md for the full write-up.

/** Static facts about a theme. Lives in src/themes/<id>/manifest.ts. Must stay
 *  tiny and side-effect free: the build inlines it into every page's head. */
export interface ThemeManifest {
  /** URL- and attribute-safe id. Becomes <html data-skin="<id>"> and the stored choice. */
  id: string;
  /** Human name, used in labels ("XP/OS mode"). */
  name: string;
  /** One-line description. */
  description: string;
  /** Media query. The theme is offered, restored and kept mounted only while it matches. */
  availability: string;
  /** Optional word that switches to this theme when typed in normal mode
   *  (no field focused). The easter-egg way in. */
  egg?: string;
  /** Text of the quiet switch in the normal-mode header ("XP mode").
   *  Defaults to `name`. Every theme gets its own switch, built from its manifest. */
  label?: string;
  /** Optional longer invitation for the normal-mode footer. No footer link without it. */
  invite?: string;
  /** The app routes (/apps/*, BaseLayout `forcePlainChrome`) open in this
   *  theme wherever it is available. At most one theme sets it. */
  appRoutes?: boolean;
  /** What the theme is drawn on top of. 'normal' (the default): normal
   *  mode's own styles (pro.css, scoped `:root:not([data-skin-base=none])`)
   *  stay on, and the theme's CSS layers over them. 'none': they switch off
   *  while the theme is mounted (<html data-skin-base="none">), for a theme
   *  that replaces the whole look, as XP does. */
  base?: 'normal' | 'none';
  /** Plain words for what `availability` asks of the device, for the notice
   *  a locked route (/apps/*) shows where the theme can't run. */
  needs?: string;
  /** Page markup that belongs to this theme: CSS selectors that are hidden
   *  unless this theme is mounted (as `data-skin-only="<id>"` is). For page
   *  components that predate `data-skin-only`. */
  owns?: string[];
  /** Inline SVG for the header switch's icon (decorative: the runtime and
   *  layout add aria-hidden). Omit it for a text-only switch. */
  glyph?: string;
  /** How the swap into and out of this theme animates inside the View
   *  Transition. Omitted: the browser's plain crossfade. 'none': no View
   *  Transition at all (an instant swap). Under prefers-reduced-motion
   *  nothing animates whatever this says. */
  transition?: ThemeTransition | 'none';
}

/** Web Animations keyframes for the two View Transition snapshots. `old`
 *  animates ::view-transition-old(root) (the page being left), `new`
 *  animates ::view-transition-new(root) (the page arriving). The entering
 *  theme's transition plays on the way in, the leaving theme's on the way
 *  out (and the target's when going from one theme straight to another). */
export interface ThemeTransition {
  old: Keyframe[];
  new: Keyframe[];
  oldTiming?: KeyframeAnimationOptions;
  newTiming?: KeyframeAnimationOptions;
}

export type MountReason =
  /** Page load with a stored choice (or a route lock). No transition plays. */
  | 'restore'
  /** The visitor switched themes on this page. */
  | 'switch';

export interface ThemeContext {
  manifest: ThemeManifest;
  reason: MountReason;
  /** prefers-reduced-motion: reduce, read at mount time. */
  reducedMotion: boolean;
  /** Aborted right before unmount(). Pass it to every addEventListener. */
  signal: AbortSignal;
  /** Register teardown (timers, observers, injected nodes). Runs after unmount(), last-in first-out. */
  onCleanup(fn: () => void): void;
  /** Ask the framework to leave this theme (back to normal mode, persisted). */
  exit(): void;
}

/** What src/themes/<id>/<id>.theme.ts exports. Loaded lazily, only when needed. */
export interface ThemeModule {
  /** Stylesheet URLs (import them with `?url`). The runtime adds them before
   *  mount() and removes them after unmount(), so theme CSS needs no scoping. */
  styles?: string[];
  /** Transform the page. Called after styles have loaded and after
   *  <html data-skin="<id>"> is set. Must not await long work (the view
   *  transition holds the screen until it returns). */
  mount(ctx: ThemeContext): void | Promise<void>;
  /** Put every node you moved back where it was. Listeners on ctx.signal and
   *  ctx.onCleanup callbacks are handled for you. */
  unmount(ctx: ThemeContext): void | Promise<void>;
}

export interface ThemeEntry {
  manifest: ThemeManifest;
  load: () => Promise<ThemeModule>;
}

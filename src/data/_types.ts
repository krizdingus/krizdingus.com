// src/data/_types.ts
// Shared types for src/data/ modules. Kept thin — only multi-module shapes go here.

/**
 * A status row used by both the workshop sidebar (KzDir) and the footer pings
 * (KzFootStrip). Both render as: status LED + key label + value text.
 * `value` allows inline HTML (e.g. <code>fix(home): killed the hero</code>).
 */
export interface StatusRow {
  status: 'ok' | 'warn' | 'err';
  key: string;
  /** HTML allowed. */
  value: string;
}

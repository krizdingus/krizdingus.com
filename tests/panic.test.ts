import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { STEPS, STEP_MS, isRestartKey, barText, initPanic } from '../src/scripts/panic';

const MARKUP = `
  <p><span data-panic-bar></span> <span data-panic-count>0</span>% complete</p>
  <a href="/" data-panic-home>Restart now</a>
  <button type="button" data-panic-stop>Stop the countdown</button>
  <p role="status" data-panic-status></p>`;

describe('panic.ts', () => {
  beforeEach(() => {
    document.body.innerHTML = MARKUP;
    document.documentElement.className = '';
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('steps climb from 0 to 100 and never go backwards', () => {
    expect(STEPS[0]).toBe(0);
    expect(STEPS[STEPS.length - 1]).toBe(100);
    for (let i = 1; i < STEPS.length; i++) expect(STEPS[i]).toBeGreaterThanOrEqual(STEPS[i - 1]);
    // Long enough to read, short enough to be a gag: 10–25 s.
    const total = (STEPS.length - 1) * STEP_MS;
    expect(total).toBeGreaterThanOrEqual(10_000);
    expect(total).toBeLessThanOrEqual(25_000);
  });

  it('any key restarts, except Tab, lone modifiers, shortcuts and Enter/Space on a control', () => {
    const btn = document.querySelector('button')!;
    expect(isRestartKey({ key: 'x' })).toBe(true);
    expect(isRestartKey({ key: 'Escape' })).toBe(true);
    expect(isRestartKey({ key: 'Enter' })).toBe(true);
    expect(isRestartKey({ key: 'Tab' })).toBe(false);
    expect(isRestartKey({ key: 'Shift' })).toBe(false);
    expect(isRestartKey({ key: 'r', metaKey: true })).toBe(false);
    expect(isRestartKey({ key: 'r', ctrlKey: true })).toBe(false);
    expect(isRestartKey({ key: 'x', repeat: true })).toBe(false);
    expect(isRestartKey({ key: 'Enter' }, btn)).toBe(false);
    expect(isRestartKey({ key: ' ' }, btn)).toBe(false);
    expect(isRestartKey({ key: 'x' }, btn)).toBe(true);
  });

  it('barText fills proportionally', () => {
    expect(barText(0, 10)).toBe('░'.repeat(10));
    expect(barText(50, 10)).toBe('█'.repeat(5) + '░'.repeat(5));
    expect(barText(100, 10)).toBe('█'.repeat(10));
  });

  it('counts up and restarts home at 100%', () => {
    const go = vi.fn();
    const h = initPanic(document, go)!;
    expect(document.querySelector('[data-panic-count]')!.textContent).toBe('0');
    vi.advanceTimersByTime(STEP_MS * 3);
    expect(h.percent).toBe(STEPS[3]);
    vi.advanceTimersByTime(STEP_MS * STEPS.length + 1000);
    expect(go).toHaveBeenCalledWith('/');
    expect(go).toHaveBeenCalledTimes(1);
  });

  it('a key restarts; in XP mode the boot flag is cleared so home boots again', () => {
    localStorage.setItem('krizdingus-skin', 'xp');
    localStorage.setItem('krizdingus-xp-booted', '1');
    const go = vi.fn();
    initPanic(document, go);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true }));
    vi.advanceTimersByTime(1000);
    expect(go).toHaveBeenCalledWith('/');
    expect(localStorage.getItem('krizdingus-xp-booted')).toBeNull();
  });

  it('normal mode keeps the XP boot flag alone', () => {
    localStorage.setItem('krizdingus-xp-booted', '1');
    const go = vi.fn();
    initPanic(document, go);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true }));
    expect(localStorage.getItem('krizdingus-xp-booted')).toBe('1');
  });

  it('stop holds the counter, says so, and never restarts', () => {
    const go = vi.fn();
    const h = initPanic(document, go)!;
    vi.advanceTimersByTime(STEP_MS * 2);
    (document.querySelector('[data-panic-stop]') as HTMLButtonElement).click();
    const held = h.percent;
    vi.advanceTimersByTime(60_000);
    expect(h.percent).toBe(held);
    expect(h.stopped).toBe(true);
    expect(go).not.toHaveBeenCalled();
    expect(document.querySelector('[data-panic-status]')!.textContent).toContain(`${held}%`);
    expect(document.activeElement).toBe(document.querySelector('[data-panic-home]'));
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';

const STRIP =
  '<div data-share-strip><button data-share-copy>Copy link</button>' +
  '<span role="status" data-share-status></span></div>';

describe('share.ts', () => {
  beforeEach(() => {
    document.body.innerHTML = STRIP;
    vi.resetModules();
    vi.useFakeTimers();
  });

  const status = () => document.querySelector<HTMLElement>('[data-share-status]')!;
  const btn = () => document.querySelector<HTMLButtonElement>('[data-share-copy]')!;

  it('clicking the button calls clipboard.writeText with location.href', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { installShareCopy } = await import('../src/scripts/share');
    installShareCopy();
    btn().click();
    expect(writeText).toHaveBeenCalledWith(location.href);
  });

  it('button text flashes to "Copied!" then reverts after 2s', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { installShareCopy } = await import('../src/scripts/share');
    installShareCopy();
    btn().click();
    await vi.advanceTimersByTimeAsync(0);
    expect(btn().textContent).toBe('Copied!');
    await vi.advanceTimersByTimeAsync(2000);
    expect(btn().textContent).toBe('Copy link');
  });

  it('announces "Link copied" in the status span, clears it, and re-announces on a second click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { installShareCopy } = await import('../src/scripts/share');
    installShareCopy();
    btn().click();
    await vi.advanceTimersByTimeAsync(100);
    expect(status().textContent).toBe('Link copied');
    await vi.advanceTimersByTimeAsync(2000);
    expect(status().textContent).toBe('');
    btn().click();
    await vi.advanceTimersByTimeAsync(100);
    expect(status().textContent).toBe('Link copied');
  });

  it('on failure, no alert: the button says so and the status span keeps the URL', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
    const { installShareCopy } = await import('../src/scripts/share');
    installShareCopy();
    btn().click();
    await vi.advanceTimersByTimeAsync(100);
    expect(alertSpy).not.toHaveBeenCalled();
    expect(btn().textContent).toBe('Couldn’t copy');
    expect(status().textContent).toBe(`Couldn’t copy the link. It’s ${location.href}`);
    await vi.advanceTimersByTimeAsync(2000);
    expect(btn().textContent).toBe('Copy link');
    expect(status().textContent).toContain(location.href);
    vi.unstubAllGlobals();
  });

  it('works without a status span', async () => {
    document.body.innerHTML = '<button data-share-copy>Copy link</button>';
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { installShareCopy } = await import('../src/scripts/share');
    installShareCopy();
    btn().click();
    await vi.advanceTimersByTimeAsync(100);
    expect(btn().textContent).toBe('Copied!');
  });

  it('no-op when no [data-share-copy] is present', async () => {
    document.body.innerHTML = '';
    const { installShareCopy } = await import('../src/scripts/share');
    expect(() => installShareCopy()).not.toThrow();
  });
});

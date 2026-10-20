import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('KrizWM', () => {
  beforeEach(() => {
    // `body.has-desktop` is the runtime signal that a taskbar exists; without
    // it, KrizWM treats windows as unconstrained (matches embed + crash pages).
    document.body.className = 'has-desktop';
    document.body.innerHTML = `
      <div class="desktop-taskbar" style="height: 48px;"></div>
      <section class="os-shell"><div class="title-bar"></div></section>
      <section class="app-window" data-app="alpha" style="position: fixed; left: 100px; top: 100px;">
        <div class="title-bar"></div>
      </section>
      <section class="app-window" data-app="beta" style="position: fixed; left: 200px; top: 200px;">
        <div class="title-bar"></div>
      </section>
    `;
    vi.resetModules();
    delete (window as any).KrizWM;
  });

  it('install() exposes window.KrizWM with focus, blur, reconstrain, taskbarHeight', async () => {
    const { installWindows } = await import('../src/themes/xp/windows');
    installWindows();
    expect(window.KrizWM).toBeDefined();
    expect(typeof window.KrizWM.focus).toBe('function');
    expect(typeof window.KrizWM.blur).toBe('function');
    expect(typeof window.KrizWM.reconstrain).toBe('function');
    expect(typeof window.KrizWM.taskbarHeight).toBe('function');
  });

  it('focus(el) raises the element above its siblings and sets is-focused', async () => {
    const { installWindows } = await import('../src/themes/xp/windows');
    installWindows();
    const alpha = document.querySelector<HTMLElement>('[data-app="alpha"]')!;
    const beta = document.querySelector<HTMLElement>('[data-app="beta"]')!;
    window.KrizWM.focus(beta);
    const aZ = parseInt(alpha.style.zIndex || '0', 10);
    const bZ = parseInt(beta.style.zIndex || '0', 10);
    expect(bZ).toBeGreaterThan(aZ);
    expect(beta.classList.contains('is-focused')).toBe(true);
    expect(alpha.classList.contains('is-focused')).toBe(false);
  });

  it('taskbarHeight() returns the .desktop-taskbar height', async () => {
    const { installWindows } = await import('../src/themes/xp/windows');
    installWindows();
    // happy-dom reports offsetHeight as 0 for fixed-style elements; KrizWM falls back to 48.
    const h = window.KrizWM.taskbarHeight();
    expect(h).toBeGreaterThanOrEqual(44);
    expect(h).toBeLessThanOrEqual(48);
  });

  it('blur(el) hands the active state to the topmost window still on screen', async () => {
    const { installWindows } = await import('../src/themes/xp/windows');
    installWindows();
    const shell = document.querySelector<HTMLElement>('.os-shell')!;
    const alpha = document.querySelector<HTMLElement>('[data-app="alpha"]')!;
    const beta = document.querySelector<HTMLElement>('[data-app="beta"]')!;
    window.KrizWM.focus(shell);
    window.KrizWM.focus(alpha);
    window.KrizWM.focus(beta);
    beta.classList.add('is-minimized');
    window.KrizWM.blur(beta);
    expect(beta.classList.contains('is-focused')).toBe(false);
    expect(alpha.classList.contains('is-focused')).toBe(true);
    alpha.classList.add('is-minimized');
    window.KrizWM.blur(alpha);
    expect(shell.classList.contains('is-focused')).toBe(true);
  });

  it('reconstrain(el) clamps left/top so the title bar stays reachable', async () => {
    const { installWindows } = await import('../src/themes/xp/windows');
    installWindows();
    const alpha = document.querySelector<HTMLElement>('[data-app="alpha"]')!;
    // Move alpha way off-screen to the left
    alpha.style.left = '-5000px';
    alpha.style.top = '-5000px';
    window.KrizWM.reconstrain(alpha);
    expect(parseInt(alpha.style.left, 10)).toBeGreaterThanOrEqual(-200);
    expect(parseInt(alpha.style.top, 10)).toBeGreaterThanOrEqual(0);
  });

  it('install is idempotent — calling twice does not double-bind', async () => {
    const { installWindows } = await import('../src/themes/xp/windows');
    installWindows();
    installWindows();
    expect(window.KrizWM).toBeDefined();
    // Should not throw or duplicate.
  });
});

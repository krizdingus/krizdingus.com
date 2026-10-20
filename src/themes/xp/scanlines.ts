// Animated scanline overlay — viewport-fixed canvas that draws 1px lines
// every 3px with a slow vertical drift (sub-pixel-per-frame, reads as a
// gentle creep) plus a subtle brightness "breath" (±0.02). The blend mode
// + z-index are set in xp.theme.css via #scanlines-canvas + the
// [data-theme="dark"] override (multiply in light, screen in dark — so the
// phosphor color lifts on dark instead of cancelling out).

let installed = false;
let canvas: HTMLCanvasElement | null = null;
let raf: number | null = null;

export function installScanlines(signal?: AbortSignal): void {
  if (installed) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  installed = true;
  signal?.addEventListener('abort', stopScanlines);
  // Reduced motion switched on mid-session stops the rAF loop too.
  window.matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener?.('change', (e) => { if (e.matches) stopScanlines(); }, { signal });

  canvas = document.createElement('canvas');
  canvas.id = 'scanlines-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const t0 = performance.now();

  function resize(): void {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { signal });

  function frame(now: number): void {
    if (!canvas || !ctx) return;
    const cs = getComputedStyle(document.documentElement);
    const rgb = cs.getPropertyValue('--scanline-rgb').trim() || '0,0,0';
    const baseI = parseFloat(cs.getPropertyValue('--scanline-intensity').trim() || '0.08');
    const phase = (now - t0) / 1000;
    // ±0.02 brightness breath + slow vertical drift (0, 1, 2 — wraps every 3px)
    const beat = Math.sin(phase * 1.2) * 0.02;
    const drift = Math.floor(phase * 18) % 3;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(' + rgb + ',' + (baseI + beat) + ')';
    for (let y = -3 + drift; y < canvas.height; y += 3) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

export function stopScanlines(): void {
  if (raf !== null) cancelAnimationFrame(raf);
  raf = null;
  canvas?.remove();
  canvas = null;
  installed = false;
}

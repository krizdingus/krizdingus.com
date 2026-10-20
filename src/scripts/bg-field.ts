// src/scripts/bg-field.ts
// Background pixels, normal mode only. Small squares in the section palette
// fade in and out either side of the page column, in three depth layers that
// trail the scroll: 4px far (0.08 of the scroll), 6px mid (0.18) and 8px near
// (0.3). The layers ease after the scroll (about 10% of the gap per 60 Hz
// frame) and the faint 24px dot grid is the farthest layer (0.05).
//
// Two fixed canvases, one per gutter, at CSS-pixel resolution and scaled with
// image-rendering: pixelated, so they stay crisp at any devicePixelRatio
// (moving the window to another screen needs nothing). The dot grid is their
// CSS background and the colours are CSS tokens (--bg-px on .site, pro.css),
// so the script only clears and fills small rects.
//
// Resizing never resets the field. A square's place is measured outward from
// the column edge (x) and in a fixed field HF tall that wraps (y), and each
// canvas is pinned to its column edge, so a resize moves the canvases, not the
// squares. Canvases only ever grow, in steps; a new size clears the bitmap,
// but every frame is drawn from state and one is drawn straight away. Newly
// revealed gutter fills in with ordinary fade-ins, there and not over the
// squares already in place, and squares the window edge passes are dropped.
// It runs while both gutters are at least `minGutter` px wide, fading in and
// out as that changes, and stops whenever a UI theme is mounted or pending.
// Reduced motion: one still scatter, no timer, no scroll lag. Hidden tab:
// nothing runs. The canvases are aria-hidden and take no pointer events.

interface Px {
  /** lattice key (gutter, layer, cell) */
  k: number;
  /** layer 0-2 (far to near) and gutter (0 left, 1 right) */
  l: number;
  r: number;
  /** size in px, place in the gutter (from the column edge) and in the field */
  s: number;
  x: number;
  y: number;
  /** colour index into --bg-px */
  c: number;
  /** start on the pixels' clock, fade-in and fade-out times, total life */
  t: number;
  fi: number;
  fx: number;
  e: number;
  /** peak opacity factor */
  m: number;
}

/** Lattice cell, px. */
const C = 12;
/** Height of the field that wraps, px (a multiple of C and of the 24px grid). */
const HF = 2304;
/** Scroll factor per layer. */
const F = [0.08, 0.18, 0.3];
/** Attributes that start, stop or recolour the field. */
const WATCH = ['data-skin', 'data-skin-pending', 'data-theme'];

export function bgField(minGutter = 160): void {
  const W = window;
  const D = document;
  const R = D.documentElement;
  const M = Math;
  const mq = W.matchMedia('(prefers-reduced-motion: reduce)');

  let cs: HTMLCanvasElement[] = [];
  let x: CanvasRenderingContext2D[] = [];
  // canvas size (only grows), window height, gutter widths (left, right)
  let cw = 0;
  let ch = 0;
  let h = 0;
  let G: number[] = [];
  // how many cells out the gutters reached before they last widened
  let lo = 0;
  let cols: string[] = [];
  let dark = false;
  // alpha cap, in 40ths
  let K = 32;
  // target population
  let n = 0;
  let ps: Px[] = [];
  const occ = new Set<number>();
  let tm = 0;
  let rf = 0;
  let rz = 0;
  let fo = 0;
  let on = false;
  // T: the pixels' own clock; it only runs while frames are drawn, so a
  // hidden tab or reduced motion simply freezes it.
  let T = 0;
  let last = 0;
  // E: the eased scroll offset chasing the real one, Y (read only in a
  // frame, never in the scroll handler).
  let E = 0;
  let Y = 0;
  let sc = false;
  let gy = NaN;

  const rnd = (a: number, b: number) => a + M.random() * (b - a);
  const fl = (a: number, b: number) => rnd(a, b) | 0;
  const now = () => performance.now();
  const smooth = (v: number) => v * v * (3 - 2 * v);

  // one square; by night a two-step pixel glow (one step round a 2px one)
  const paint = (g: CanvasRenderingContext2D, X: number, y: number, s: number, c: number, al: number) => {
    g.fillStyle = cols[c];
    if (dark) {
      if (s > 2) {
        g.globalAlpha = al * 0.12;
        g.fillRect(X - 3, y - 3, s + 6, s + 6);
      }
      g.globalAlpha = al * 0.25;
      g.fillRect(X - 1, y - 1, s + 2, s + 2);
    }
    g.globalAlpha = al;
    g.fillRect(X, y, s, s);
  };

  // Add up to q squares, each starting its fade-in within sp ms (sp < 0:
  // already -sp ms in, for a still scatter). Each owns a lattice cell (i
  // cells out from the column edge, never the one touching it; cy down the
  // field) plus a one-cell gap all round within its layer. Past lo is the
  // band last revealed: a square goes there while the band holds less than
  // its share of n, and inside it otherwise, so a band fills without
  // crowding the squares already in place.
  const cells = (g: number) => ((g / C) | 0) - 1;
  const spawn = (q: number, sp: number) => {
    const N = G.map(cells);
    let nb = ps.filter((p) => p.x > (lo + 1) * C).length;
    while (ps.length < n && q--) {
      const B = nb < n * (1 - lo / N[0]);
      const S = N.map((v) => (B ? v - lo : lo));
      const r = rnd(0, S[0] + S[1]) < S[1] ? 1 : 0;
      const i = 1 + (B ? fl(lo, N[r]) : fl(0, lo));
      const cy = fl(0, HF / C);
      const l = fl(0, 3);
      const s = 4 + 2 * l;
      const j = rnd(0.8, 1.4);
      const fi = 2200 * j;
      const fx = 2600 * j;
      const k = r * 1e8 + l * 1e7 + i * 1e4 + cy;
      let taken = false;
      for (const a of [-1e4, 0, 1e4]) for (let b = -1; b < 2; b++) taken ||= occ.has(k + a + b);
      if (taken) continue;
      occ.add(k);
      nb += +B;
      // fade in fi (1.8-3.1s), hold (1.8-5.4s), fade out fx (2.1-3.6s), done at e
      ps.push({
        k, l, r, s,
        x: i * C + ((C - s) >> 1),
        y: cy * C + (C - s) / 2,
        c: M.random() < 0.4 ? 5 : fl(0, 5),
        t: T + (sp < 0 ? sp : rnd(0, sp)),
        fi, fx,
        e: fi + fx + 3000 * rnd(0.6, 1.8),
        m: rnd(0.55, 1) * (0.8 + 0.1 * l),
      });
    }
  };

  // Redraw every square at its layer's offset (the right canvas starts at the
  // column edge, the left one ends there); drop the finished ones.
  const frame = () => {
    for (const g of x) g.clearRect(0, 0, cw, h); // rows below the window are never seen
    const O = F.map((f) => M.round(f * E));
    ps = ps.filter((p) => {
      const e = T - p.t;
      const al = M.round(smooth(M.max(0, M.min(1, e / p.fi, (p.e - e) / p.fx))) * p.m * K) / 40;
      if (al) {
        for (let y = (((p.y - O[p.l]) % HF) + HF) % HF - C; y < h; y += HF) {
          paint(x[p.r], p.r ? p.x : cw - p.x - p.s, y, p.s, p.c, al);
        }
      }
      if (e < p.e && p.x < G[p.r]) return true;
      occ.delete(p.k);
      return false;
    });
  };

  const tick = () => {
    tm = rf = 0;
    if (!on || D.hidden) return;
    const t = now();
    const dt = M.min(t - last, 200);
    const g = -M.round(0.05 * E) % 24;
    T += dt;
    last = t;
    if (sc) {
      Y = W.scrollY;
      sc = false;
    }
    E = M.abs(Y - E) < 0.5 ? Y : E + (Y - E) * (1 - M.pow(0.9, dt / 16.7));
    if (g !== gy) {
      gy = g;
      for (const c of cs) c.style.backgroundPositionY = g + 'px';
    }
    // keep the population topped up (a big gap slowly, like the first load)
    spawn(9, ps.length < n * 0.8 ? 7800 : 2200);
    frame();
    // while the background is catching up with the scroll: every display
    // frame; then 10 fps
    if (E !== Y) rf = requestAnimationFrame(tick);
    else tm = W.setTimeout(tick, 100);
  };

  const halt = () => {
    clearTimeout(tm);
    cancelAnimationFrame(rf);
    tm = rf = 0;
  };
  const stop = () => {
    on = false;
    halt();
    clearTimeout(fo);
    fo = 0;
    for (const c of cs) c.hidden = true;
  };

  // On start, resize, theme and skin changes: measure, and carry on from the
  // current state.
  const fit = () => {
    rz = 0;
    const site = D.querySelector<HTMLElement>('.site');
    if (!site || R.hasAttribute(WATCH[0]) || R.hasAttribute(WATCH[1])) return stop();
    const b = site.getBoundingClientRect();
    const l = M.round(b.left);
    const r = M.round(b.right);
    const P = G;
    h = R.clientHeight;
    G = [l, R.clientWidth - r];
    // After widening, the new band is everything past the old width (n is
    // still the last count: none while fading out, so a fresh start fills
    // evenly); the column is centred, so one width serves both. Narrowing to
    // within the band forgets it.
    lo = !n ? 0 : G[0] > P[0] ? cells(P[0]) : lo < cells(G[0]) ? lo : 0;
    const ok = M.min(...G) >= minGutter; // too little surround to bother
    if (ok) {
      clearTimeout(fo);
      fo = 0;
      if (!cs[0]) {
        cs = [0, 1].map(() => {
          const c = D.createElement('canvas');
          c.className = 'kz-bg';
          c.setAttribute('aria-hidden', 'true');
          D.body.prepend(c);
          return c;
        });
        x = cs.map((c) => c.getContext('2d')!);
      }
      for (const c of cs) {
        c.hidden = false;
        c.style.opacity = '';
      }
    } else if (!cs[0] || cs[0].hidden) {
      return stop();
    } else if (!fo) {
      // fade out (CSS), then stop
      fo = W.setTimeout(stop, 2000);
      for (const c of cs) c.style.opacity = '0';
    }
    // The canvases only grow: in whole dot-grid tiles across (so the grid
    // lines up with the column edge) and in 240px steps down, so a drag
    // reallocates only now and then.
    const nw = M.max(cw, M.ceil(M.max(...G) / 24) * 24);
    const nh = M.max(ch, M.ceil(h / 240) * 240);
    if (nw > cw || nh > ch) {
      cw = nw;
      ch = nh;
      for (const c of cs) {
        c.width = cw;
        c.height = ch;
      }
    }
    cs[0].style.left = l - cw + 'px';
    cs[1].style.left = r + 'px';
    // Colours come from CSS (--bg-px on .site): lit fills by night, fills
    // mixed toward their inks by day. Alpha cap K/40: .9 by night, .8 by
    // day; by night about 25% more squares (none while fading out).
    dark = R.dataset.theme === 'dark';
    K = dark ? 36 : 32;
    cols = getComputedStyle(site).getPropertyValue('--bg-px').match(/\S+/g) ?? [];
    n = ok ? M.round(((G[0] + G[1]) * HF) / (dark ? 16e3 : 2e4)) : 0;
    if (mq.matches) {
      // reduced motion: one still scatter (new squares mid-hold), no timer,
      // no scroll lag: it stays put
      halt();
      on = false;
      spawn(n * 3, -3080);
      frame();
    } else if (!on) {
      on = true;
      E = Y = W.scrollY;
      last = now();
      spawn(n * 3, 7800);
      halt();
      tick();
    } else {
      frame(); // redraw now (a new canvas size has cleared it); time moves on in tick
    }
  };

  // window resizes, plus the page's own width (a classic scrollbar coming or
  // going), once per frame
  const queue = () => {
    if (!rz) rz = requestAnimationFrame(fit);
  };
  W.addEventListener('resize', queue);
  // the scroll handler only notes the scroll and asks for a frame
  W.addEventListener('scroll', () => {
    sc = true;
    if (on && !rf) {
      halt();
      rf = requestAnimationFrame(tick);
    }
  }, { passive: true });
  mq.addEventListener('change', fit);
  D.addEventListener('visibilitychange', () => {
    last = now();
    if (on && !tm && !rf) tick();
  });
  new MutationObserver(fit).observe(R, { attributes: true, attributeFilter: WATCH });
  fit();
  new ResizeObserver(queue).observe(R);
}

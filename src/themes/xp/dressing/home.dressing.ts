// src/themes/xp/dressing/home.dressing.ts
// XP-only set dressing for the home page. Normal mode ships none of it; this
// builds it at mount and hands every added node back so unmount removes it:
// - mini-window title bars on the Now Featuring cards and the post cards;
// - LEDs on the workshop rows and the spotlight status strip, plus a
//   "workshop.exe" status line;
// - the KRIZ-WIRE ticker (data/marquee.ts: only facts the page doesn't
//   already print);
// - the footer strip: visitor counter, webring and fuel ping (all obvious
//   jokes; the real last commit lives in the workshop panel, not here).
// Styles live in src/styles/home.css, which only the home page loads.
import type { ThemeContext } from '../../types';
import { marqueeItems } from '../../../data/marquee';
import { fuelPing, RANDOM_HREF, visitorCounter, webring, type FooterPing } from '../../../data/footer-strip';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function hidden<T extends HTMLElement>(n: T): T {
  n.setAttribute('aria-hidden', 'true');
  return n;
}

const FEAT_BARS: Record<string, { icon: string; label: string; tone: 'mag' | 'pur' | 'grn' }> = {
  project: { icon: '◇', label: 'PROJECT.EXE', tone: 'mag' },
  post: { icon: '▤', label: 'BLOG.MD', tone: 'pur' },
  // The newest build, not necessarily a new one (NEW means 90 days).
  build: { icon: '⌘', label: 'LATEST.EXE', tone: 'grn' },
  about: { icon: '☻', label: 'README.TXT', tone: 'pur' },
};

function bar(cls: string, icon: string, label: string): HTMLElement {
  const b = hidden(el('div', cls));
  const l = el('span', 'kz-feat__bar-l');
  l.append(el('span', 'kz-feat__bar-icon', icon), ` ${label}`);
  b.append(l);
  return b;
}

function led(cls: string): HTMLElement {
  return hidden(el('span', cls));
}

function cardBars(home: Element, added: HTMLElement[]): void {
  home.querySelectorAll<HTMLElement>('[data-feat]').forEach((card) => {
    const spec = FEAT_BARS[card.dataset.feat ?? ''];
    if (!spec) return;
    const b = bar(`kz-feat__bar kz-feat__bar--${spec.tone}`, spec.icon, spec.label);
    // Small cards are one link: the bar goes inside it, so it stays clickable.
    (card.querySelector('.kz-feat__sm-link') ?? card).prepend(b);
    added.push(b);
  });
  const status = home.querySelector('.kz-feat__big-status');
  if (status) {
    const l = led('kz-pick__led');
    status.prepend(l);
    added.push(l);
  }
  home.querySelectorAll<HTMLElement>('.kz-post[data-slug]').forEach((post) => {
    const b = hidden(el('div', 'kz-post__bar', `${post.dataset.slug}.md`));
    post.prepend(b);
    added.push(b);
  });
}

function workshop(home: Element, added: HTMLElement[]): void {
  const pick = home.querySelector('.kz-pick');
  if (!pick) return;
  pick.querySelectorAll<HTMLElement>('.kz-status__row').forEach((row) => {
    const dt = row.querySelector('dt');
    if (!dt) return;
    const icon = led(`kz-status__icon kz-status__icon--${row.dataset.status === 'warn' ? 'warn' : 'ok'}`);
    dt.prepend(icon);
    added.push(icon);
  });
  const line = hidden(el('div', 'kz-pick__status'));
  line.append(led('kz-pick__led'), el('span', undefined, 'online'), el('span', 'kz-pick__status-r', 'workshop.exe'));
  pick.append(line);
  added.push(line);
}

function marquee(slot: Element): HTMLElement {
  const items = marqueeItems;

  const root = el('div', 'kz-marquee');
  root.setAttribute('role', 'marquee');
  root.setAttribute('aria-label', 'KRIZ-WIRE');
  root.append(hidden(el('span', 'kz-marquee__chip', '◊ KRIZ-WIRE')));
  // WCAG 2.2.2: anything that scrolls for more than 5s gets a pause control.
  // (Reduced motion never scrolls, and the CSS hides this button there.)
  // Its name is its visible verb, so it flips Pause/Play rather than
  // using aria-pressed (a pressed "Pause" that reads "Play" is a mismatch).
  const toggle = el('button', 'kz-marquee__toggle', 'Pause');
  toggle.type = 'button';
  toggle.addEventListener('click', () => {
    const paused = root.classList.toggle('is-paused');
    toggle.textContent = paused ? 'Play' : 'Pause';
  });
  root.append(toggle);
  const viewport = el('div', 'kz-marquee__viewport');
  const track = el('div', 'kz-marquee__track');
  // Two copies for a seamless loop; the second is invisible to AT and Tab,
  // and (.is-dup) hidden outright under reduced motion, where nothing loops.
  for (const dup of [false, true]) {
    for (const item of items) {
      const span = el('span', `kz-marquee__item${dup ? ' is-dup' : ''}`);
      if (dup) hidden(span);
      span.append(el('b', `kz-marquee__tag${item.hot ? ' kz-marquee__tag--hot' : ''}`, item.tag), ' ');
      if (item.href) {
        const a = el('a', undefined, item.text);
        a.href = item.href;
        if (dup) a.tabIndex = -1;
        span.append(a);
      } else {
        span.append(item.text);
      }
      track.append(span, hidden(el('span', `kz-marquee__sep${dup ? ' is-dup' : ''}`, '◊')));
    }
  }
  viewport.append(track);
  root.append(viewport);
  // Focus stops the track at 0 (home.css) so the browser can scroll the
  // focused link into view; put the scroll back once focus leaves.
  // Chrome's own focus scroll can leave a long item half outside, so line
  // the focused link up with the viewport's left edge when it doesn't fit.
  root.addEventListener('focusin', (e) => {
    const a = e.target as HTMLElement;
    if (!track.contains(a)) return;
    requestAnimationFrame(() => {
      const v = viewport.getBoundingClientRect();
      const b = a.getBoundingClientRect();
      const item = (a.closest('.kz-marquee__item') ?? a).getBoundingClientRect();
      if (b.left < v.left || b.right > v.right) viewport.scrollLeft += item.left - v.left;
    });
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) viewport.scrollLeft = 0;
  });
  slot.append(root);
  return root;
}

function footStrip(home: Element, slot: Element): HTMLElement {
  const strip = el('section', 'kz-foot-strip');
  strip.setAttribute('aria-label', 'Visitor counter, webring and status');

  const counter = el('div', 'kz-counter');
  const digits = el('span', 'kz-counter__digits');
  digits.setAttribute('role', 'img');
  digits.setAttribute('aria-label', visitorCounter.digits.join(''));
  visitorCounter.digits.forEach((d) => digits.append(hidden(el('span', undefined, d))));
  counter.append(
    el('span', 'kz-counter__label', 'VISITORS'),
    digits,
    el('span', 'kz-counter__sub', visitorCounter.sub),
  );

  const ring = el('nav', 'kz-webring');
  ring.setAttribute('aria-label', 'Webring');
  ring.append(el('span', 'kz-webring__label', `◊ ${webring.label}`));
  const pool = [...home.querySelectorAll<HTMLAnchorElement>('.kz-dir__list a[href^="/projects/"]')]
    .map((a) => a.getAttribute('href'))
    .filter((h): h is string => !!h);
  for (const link of webring.links) {
    const a = el('a', undefined, link.label);
    a.href = link.href === RANDOM_HREF ? pool[Math.floor(Math.random() * pool.length)] ?? '/projects/' : link.href;
    ring.append(a);
  }
  ring.append(el('span', 'kz-webring__count', webring.size));

  const pings: FooterPing[] = [fuelPing];
  const list = el('ul', 'kz-pings');
  list.setAttribute('aria-label', 'Status');
  for (const p of pings) {
    const li = el('li');
    li.append(led(`kz-ping kz-ping--${p.status}`), `${p.key} · ${p.value}`);
    list.append(li);
  }

  strip.append(counter, ring, list);
  slot.append(strip);
  return strip;
}

export function mount(_ctx: ThemeContext): HTMLElement[] {
  const home = document.querySelector('.kz-home');
  if (!home) return [];
  const added: HTMLElement[] = [];
  cardBars(home, added);
  workshop(home, added);
  const tickerSlot = home.querySelector('[data-xp-slot="marquee"]');
  if (tickerSlot) added.push(marquee(tickerSlot));
  const footSlot = home.querySelector('[data-xp-slot="foot-strip"]');
  if (footSlot) added.push(footStrip(home, footSlot));
  return added;
}

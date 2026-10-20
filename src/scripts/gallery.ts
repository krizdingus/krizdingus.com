// src/scripts/gallery.ts — the picture viewer on project pages.
// Thumbnails are real links to the full image, so with JS off they still
// open the picture. Prev/Next only work with JS, so they ship hidden and are
// shown here. With JS on they swap the main image in place, along with
// its responsive srcsets (data-srcset-avif / data-srcset-webp on the thumb).
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

interface GalleryState {
  thumbs: HTMLAnchorElement[];
  main: HTMLImageElement;
  counter: HTMLElement | null;
  desc: HTMLElement | null;
  index: number;
}

function show(state: GalleryState, next: number): void {
  const total = state.thumbs.length;
  const idx = ((next % total) + total) % total;
  const thumb = state.thumbs[idx];
  const full = thumb.dataset.full ?? thumb.getAttribute('href') ?? '';
  const { w, h } = thumb.dataset;
  if (w && h) {
    state.main.width = Number(w);
    state.main.height = Number(h);
  } else {
    state.main.removeAttribute('width');
    state.main.removeAttribute('height');
  }
  const picture = state.main.parentElement?.tagName === 'PICTURE' ? state.main.parentElement : null;
  const avif = thumb.dataset.srcsetAvif ?? '';
  const webp = thumb.dataset.srcsetWebp ?? '';
  picture?.querySelector('source[type="image/avif"]')?.setAttribute('srcset', avif || full);
  picture?.querySelector('source[type="image/webp"]')?.setAttribute('srcset', webp || full);
  if (webp) state.main.srcset = webp;
  else state.main.removeAttribute('srcset');
  state.main.src = full;
  state.main.alt = thumb.dataset.alt ?? '';
  // Long alt text is split: the rest lives in a hidden description.
  const desc = thumb.dataset.desc ?? '';
  if (state.desc) state.desc.textContent = desc;
  if (desc && state.desc?.id) state.main.setAttribute('aria-describedby', state.desc.id);
  else state.main.removeAttribute('aria-describedby');
  if (state.counter) state.counter.textContent = `${pad2(idx + 1)} / ${pad2(total)}`;
  state.thumbs.forEach((t, i) => {
    if (i === idx) t.setAttribute('aria-current', 'true');
    else t.removeAttribute('aria-current');
  });
  state.index = idx;
}

export function installGallery(): void {
  const root = document.querySelector<HTMLElement>('[data-gallery-root]');
  if (!root) return;
  const main = root.querySelector<HTMLImageElement>('[data-gallery-main]');
  if (!main) return;
  const thumbs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-gallery-thumb]'));
  if (thumbs.length === 0) return;
  const counter = root.querySelector<HTMLElement>('[data-gallery-counter]');
  const desc = root.querySelector<HTMLElement>('[data-gallery-desc]');
  const state: GalleryState = { thumbs, main, counter, desc, index: 0 };

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let "open in new tab" work
      e.preventDefault();
      show(state, i);
    });
  });

  root.querySelector<HTMLElement>('[data-gallery-ctrls]')?.removeAttribute('hidden');
  root.querySelector<HTMLButtonElement>('[data-gallery="prev"]')?.addEventListener('click', () => show(state, state.index - 1));
  root.querySelector<HTMLButtonElement>('[data-gallery="next"]')?.addEventListener('click', () => show(state, state.index + 1));

  // Arrow keys step through pictures only while focus is inside the viewer.
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(state, state.index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(state, state.index - 1); }
  });
}

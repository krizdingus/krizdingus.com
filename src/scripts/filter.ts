// src/scripts/filter.ts — the /projects/ search + tag filter.
// The filter UI ships with `hidden` and is revealed here, so with JS off the
// page is just the full list.
// Titles and summaries use curly apostrophes; people type straight ones.
const fold = (s: string): string => s.toLowerCase().replace(/[\u2018\u2019]/g, "'");

function matchesSearch(item: HTMLElement, q: string): boolean {
  if (!q) return true;
  const needle = fold(q);
  const title = fold(item.dataset.title ?? '');
  const hook = fold(item.dataset.hook ?? '');
  const tags = fold(item.dataset.tags ?? '');
  return title.includes(needle) || hook.includes(needle) || tags.includes(needle);
}

function matchesTag(item: HTMLElement, tag: string): boolean {
  if (!tag) return true;
  const tags = (item.dataset.tags ?? '').split('|').map((t) => t.trim()).filter(Boolean);
  return tags.includes(tag);
}

interface Outputs {
  count: HTMLElement | null;
  empty: HTMLElement | null;
  /** The column header row: hidden with the list when nothing matches, so its
   *  rule doesn't sit there over an empty space. */
  head: HTMLElement | null;
  grid: HTMLElement;
  /** role="status" region: the one thing screen readers hear on each change. */
  status: HTMLElement | null;
}

/** "Showing 8 of 15 projects", plus the empty-state line when nothing's left. */
export function statusText(visible: number, total: number, emptyLine: string): string {
  const base = `Showing ${visible} of ${total} project${total === 1 ? '' : 's'}.`;
  return visible === 0 && emptyLine ? `${base} ${emptyLine}` : base;
}

function apply(items: HTMLElement[], search: HTMLInputElement, select: HTMLSelectElement,
               { count, empty, head, grid, status }: Outputs, announce: boolean): void {
  const q = search.value.trim();
  const t = select.value.trim();
  let visible = 0;
  for (const item of items) {
    const match = matchesSearch(item, q) && matchesTag(item, t);
    item.hidden = !match;
    if (match) visible++;
  }
  if (count) count.textContent = `${visible}/${items.length}`;
  if (empty) empty.hidden = visible !== 0;
  if (head) head.hidden = visible === 0;
  grid.hidden = visible === 0;
  if (status && announce) {
    const line = empty?.querySelector('[data-filter-empty-text]')?.textContent?.trim() ?? '';
    status.textContent = statusText(visible, items.length, line);
  }
}

export function installProjectFilter(): void {
  const grid = document.querySelector<HTMLElement>('[data-filter-grid]');
  if (!grid) return;
  const search = document.querySelector<HTMLInputElement>('[data-filter-search]');
  const select = document.querySelector<HTMLSelectElement>('[data-filter-tag]');
  if (!search || !select) return;
  const ui = document.querySelector<HTMLElement>('[data-filter-ui]');
  const count = document.querySelector<HTMLElement>('[data-filter-count]');
  const empty = document.querySelector<HTMLElement>('[data-filter-empty]');
  const clear = document.querySelector<HTMLElement>('[data-filter-clear]');
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  const head = document.querySelector<HTMLElement>('[data-filter-head]');
  const items = Array.from(grid.querySelectorAll<HTMLElement>('[data-filter-item]'));

  if (ui) ui.hidden = false;
  const outputs: Outputs = { count, empty, head, grid, status };
  // Nothing is announced on load; only changes the visitor makes.
  const run = () => apply(items, search, select, outputs, true);
  apply(items, search, select, outputs, false);
  search.addEventListener('input', run);
  select.addEventListener('change', run);
  // Enter in the search box shouldn't do anything surprising.
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });
  clear?.addEventListener('click', (e) => {
    e.preventDefault();
    search.value = '';
    select.value = '';
    run();
    search.focus();
  });
}

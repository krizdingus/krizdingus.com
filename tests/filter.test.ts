// tests/filter.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('filter.ts', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-filter-ui hidden>
      <input type="search" data-filter-search />
      <select data-filter-tag>
        <option value="">All</option>
        <option value="A">A</option>
        <option value="B">B</option>
      </select>
      <output data-filter-count></output>
      <p role="status" data-filter-status></p>
      </div>
      <div data-filter-empty hidden>
        <span data-filter-empty-text>Nothing in here matches that.</span>
        <button type="button" data-filter-clear>clear</button>
      </div>
      <div data-filter-head></div>
      <ol data-filter-grid>
        <li data-filter-item data-title="Alpha thing" data-hook="useful" data-tags="A|B"></li>
        <li data-filter-item data-title="Beta tool" data-hook="weird" data-tags="A"></li>
        <li data-filter-item data-title="Gamma kit" data-hook="useful" data-tags="B"></li>
      </ol>
    `;
    vi.resetModules();
  });

  it('counts total on install when no filters are set', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    expect(document.querySelector('[data-filter-count]')?.textContent).toBe('3/3');
    expect(document.querySelector<HTMLElement>('[data-filter-empty]')?.hidden).toBe(true);
  });

  it('search input narrows by data-title/data-hook substring match (case-insensitive)', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const input = document.querySelector<HTMLInputElement>('[data-filter-search]')!;
    input.value = 'BeT';
    input.dispatchEvent(new Event('input'));
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-filter-item]'));
    expect(cards[0].hidden).toBe(true);
    expect(cards[1].hidden).toBe(false);
    expect(cards[2].hidden).toBe(true);
    expect(document.querySelector('[data-filter-count]')?.textContent).toBe('1/3');
  });

  it('tag select narrows by exact tag membership', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const sel = document.querySelector<HTMLSelectElement>('[data-filter-tag]')!;
    sel.value = 'B';
    sel.dispatchEvent(new Event('change'));
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-filter-item]'));
    expect(cards[0].hidden).toBe(false);  // tags A|B
    expect(cards[1].hidden).toBe(true);   // tags A
    expect(cards[2].hidden).toBe(false);  // tags B
    expect(document.querySelector('[data-filter-count]')?.textContent).toBe('2/3');
  });

  it('shows empty state when no cards match', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const input = document.querySelector<HTMLInputElement>('[data-filter-search]')!;
    input.value = 'nothingthereisnomatch';
    input.dispatchEvent(new Event('input'));
    expect(document.querySelector<HTMLElement>('[data-filter-empty]')?.hidden).toBe(false);
    expect(document.querySelector('[data-filter-count]')?.textContent).toBe('0/3');
  });

  it('hides the column header and the empty list while nothing matches', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const head = document.querySelector<HTMLElement>('[data-filter-head]')!;
    const grid = document.querySelector<HTMLElement>('[data-filter-grid]')!;
    expect(head.hidden).toBe(false);
    const input = document.querySelector<HTMLInputElement>('[data-filter-search]')!;
    input.value = 'nothingthereisnomatch';
    input.dispatchEvent(new Event('input'));
    expect(head.hidden).toBe(true);
    expect(grid.hidden).toBe(true);
    document.querySelector<HTMLButtonElement>('[data-filter-clear]')!.click();
    expect(head.hidden).toBe(false);
    expect(grid.hidden).toBe(false);
  });

  it('clear link resets search + tag and hides empty state', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const input = document.querySelector<HTMLInputElement>('[data-filter-search]')!;
    const sel = document.querySelector<HTMLSelectElement>('[data-filter-tag]')!;
    input.value = 'nothingthereisnomatch';
    input.dispatchEvent(new Event('input'));
    document.querySelector<HTMLButtonElement>('[data-filter-clear]')!.click();
    expect(input.value).toBe('');
    expect(sel.value).toBe('');
    expect(document.querySelector<HTMLElement>('[data-filter-empty]')?.hidden).toBe(true);
    expect(document.querySelector('[data-filter-count]')?.textContent).toBe('3/3');
  });

  it('reveals the filter UI (hidden for no-JS) on install', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    expect(document.querySelector<HTMLElement>('[data-filter-ui]')?.hidden).toBe(false);
  });

  it('search also matches tags', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const input = document.querySelector<HTMLInputElement>('[data-filter-search]')!;
    input.value = 'b';
    input.dispatchEvent(new Event('input'));
    expect(document.querySelector('[data-filter-count]')?.textContent).toBe('3/3');
  });

  it('no-op if grid is absent', async () => {
    document.body.innerHTML = '';
    const { installProjectFilter } = await import('../src/scripts/filter');
    expect(() => installProjectFilter()).not.toThrow();
  });

  it('announces "Showing N of M projects" in the status region, with the empty line at 0', async () => {
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const status = document.querySelector<HTMLElement>('[data-filter-status]')!;
    expect(status.textContent).toBe('');
    const input = document.querySelector<HTMLInputElement>('[data-filter-search]')!;
    input.value = 'useful';
    input.dispatchEvent(new Event('input'));
    expect(status.textContent).toBe('Showing 2 of 3 projects.');
    input.value = 'nothingthereisnomatch';
    input.dispatchEvent(new Event('input'));
    expect(status.textContent).toBe('Showing 0 of 3 projects. Nothing in here matches that.');
  });

  it('search treats curly and straight apostrophes the same', async () => {
    document.querySelector<HTMLElement>('[data-filter-item]')!.dataset.title = 'Printable Poopin\u2019 Stool';
    const { installProjectFilter } = await import('../src/scripts/filter');
    installProjectFilter();
    const input = document.querySelector<HTMLInputElement>('[data-filter-search]')!;
    input.value = "poopin' st";
    input.dispatchEvent(new Event('input'));
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-filter-item]'));
    expect(cards.map((c) => c.hidden)).toEqual([false, true, true]);
  });
});

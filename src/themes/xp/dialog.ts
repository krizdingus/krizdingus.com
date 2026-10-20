// src/themes/xp/dialog.ts — small in-page XP dialogs (the Recycle Bin's fake
// crash, the shortcut cheat sheet). Modal while open: everything else in
// <body> goes inert, Tab stays inside, Esc or a button closes it, and focus
// goes back to whatever opened it.

export interface DialogButton {
  label: string;
  /** Return true to keep the dialog open. */
  onClick?: (dialog: HTMLElement) => boolean | void;
  primary?: boolean;
  /** Extra attributes, e.g. aria-expanded on a disclosure button. */
  attrs?: Record<string, string>;
}

export interface DialogOptions {
  /** Marks the dialog for tests/CSS, e.g. 'fake-error' → data-fake-error. */
  marker: string;
  title: string;
  role?: 'dialog' | 'alertdialog';
  /** Trusted markup (theme-authored strings only). */
  bodyHTML: string;
  icon?: string;
  buttons: DialogButton[];
  className?: string;
}

let current: { el: HTMLElement; close: () => void } | null = null;

export function closeDialog(): void {
  current?.close();
}

export function isDialogOpen(): boolean {
  return current !== null;
}

let seq = 0;

export function openDialog(opts: DialogOptions, signal?: AbortSignal): HTMLElement {
  closeDialog();
  const id = `xp-dlg-${++seq}`;
  const opener = document.activeElement as HTMLElement | null;

  const el = document.createElement('div');
  el.className = 'xp-dialog' + (opts.className ? ' ' + opts.className : '');
  el.setAttribute(`data-${opts.marker}`, '');
  el.setAttribute('role', opts.role ?? 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', `${id}-t`);
  el.setAttribute('aria-describedby', `${id}-b`);
  el.innerHTML =
    '<div class="title-bar">' +
      `<div class="title-label"><span id="${id}-t"></span></div>` +
      '<div class="window-controls">' +
        '<button type="button" class="window-btn window-btn-close" data-dlg-close aria-label="Close" title="Close">' +
          '<span class="win-glyph win-glyph-close" aria-hidden="true"></span></button>' +
      '</div>' +
    '</div>' +
    '<div class="xp-dialog__body">' +
      (opts.icon ? `<span class="xp-dialog__icon" aria-hidden="true">${opts.icon}</span>` : '') +
      `<div class="xp-dialog__text" id="${id}-b">${opts.bodyHTML}</div>` +
    '</div>' +
    '<div class="xp-dialog__buttons"></div>';
  el.querySelector(`#${id}-t`)!.textContent = opts.title;

  const row = el.querySelector<HTMLElement>('.xp-dialog__buttons')!;
  const buttons = opts.buttons.map((b) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'xp-dialog__btn' + (b.primary ? ' is-default' : '');
    btn.textContent = b.label;
    for (const [k, v] of Object.entries(b.attrs ?? {})) btn.setAttribute(k, v);
    btn.addEventListener('click', () => {
      if (b.onClick?.(el) === true) return;
      close();
    });
    row.appendChild(btn);
    return btn;
  });

  const scrim = document.createElement('div');
  scrim.className = 'xp-dialog-scrim';
  scrim.appendChild(el);

  const inerted: HTMLElement[] = [];
  for (const child of Array.from(document.body.children) as HTMLElement[]) {
    if (child.inert) continue;
    child.inert = true;
    inerted.push(child);
  }
  document.body.appendChild(scrim);

  const keys = new AbortController();
  function close(): void {
    if (current?.el !== el) return;
    current = null;
    keys.abort();
    scrim.remove();
    while (inerted.length) inerted.pop()!.inert = false;
    // The opener may be gone or hidden by now (a Start-menu row): fall back
    // to the Start button, then to the page's main region.
    const usable = (n: HTMLElement | null): n is HTMLElement =>
      !!n && n !== document.body && n.isConnected && !n.closest('[aria-hidden="true"], [hidden]');
    const start = document.querySelector<HTMLElement>('.desktop-taskbar .start-btn');
    const back = usable(opener) ? opener : usable(start) ? start : document.getElementById('main');
    back?.focus({ preventScroll: true });
  }
  current = { el, close };

  el.querySelector('[data-dlg-close]')?.addEventListener('click', close);
  // A click on the backdrop (or the second half of a double-click that
  // opened it) must not drop focus to <body>.
  scrim.addEventListener('mousedown', (e) => {
    if (e.target === scrim) e.preventDefault();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') {
      const focusables = Array.from(el.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]'));
      if (!focusables.length) return;
      const i = focusables.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? focusables.length - 1 : i - 1) : (i + 1) % focusables.length;
      e.preventDefault();
      focusables[next].focus();
    }
  }, { signal: keys.signal, capture: true });
  signal?.addEventListener('abort', close, { signal: keys.signal });

  (buttons.find((_, i) => opts.buttons[i].primary) ?? buttons[0])?.focus();
  return el;
}

const FLASH_TEXT = 'Copied!';
const FAIL_TEXT = 'Couldn’t copy';
const STATUS_OK = 'Link copied';
const statusFail = (url: string): string => `Couldn’t copy the link. It’s ${url}`;
const FLASH_MS = 2000;

/**
 * "Copy link" on post pages. The button text flashes for sighted users and
 * the strip's visually hidden role="status" span ([data-share-status]) says
 * the same thing to screen readers (WCAG 4.1.3). Both reset after FLASH_MS,
 * so a second click announces again; a failure keeps the URL in the span.
 */
export function installShareCopy(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-share-copy]').forEach((btn) => {
    const original = btn.textContent ?? '';
    const status =
      btn.closest('[data-share-strip]')?.querySelector<HTMLElement>('[data-share-status]') ?? null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flash = (buttonText: string, statusText: string, keepStatus = false): void => {
      clearTimeout(timer);
      btn.textContent = buttonText;
      if (status) {
        status.textContent = '';
        // Next frame-ish tick, so an identical message is still announced.
        setTimeout(() => {
          status.textContent = statusText;
        }, 50);
      }
      timer = setTimeout(() => {
        btn.textContent = original;
        if (status && !keepStatus) status.textContent = '';
      }, FLASH_MS);
    };

    btn.addEventListener('click', async () => {
      const url = location.href;
      try {
        await navigator.clipboard.writeText(url);
        flash(FLASH_TEXT, STATUS_OK);
      } catch {
        // The URL stays in the status span so it can still be read and copied by hand.
        flash(FAIL_TEXT, statusFail(url), true);
      }
    });
  });
}

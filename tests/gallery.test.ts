import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('gallery.ts', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section data-gallery-root>
        <figure><img data-gallery-main src="/a.jpg" alt="First" width="100" height="80" /></figure>
        <span data-gallery-counter>01 / 03</span>
        <button type="button" data-gallery="prev">Prev</button>
        <button type="button" data-gallery="next">Next</button>
        <ul>
          <li><a href="/a.jpg" data-gallery-thumb data-alt="First" data-w="100" data-h="80" aria-current="true"><img src="/a.jpg" alt="" /></a></li>
          <li><a href="/b.jpg" data-gallery-thumb data-alt="Second" data-w="50" data-h="90"><img src="/b.jpg" alt="" /></a></li>
          <li><a href="/c.jpg" data-gallery-thumb data-alt="Third"><img src="/c.jpg" alt="" /></a></li>
        </ul>
      </section>
      <input id="outside" />
    `;
    vi.resetModules();
  });

  const main = () => document.querySelector<HTMLImageElement>('[data-gallery-main]')!;

  it('clicking a thumb swaps main image, alt, size, counter and aria-current', async () => {
    const { installGallery } = await import('../src/scripts/gallery');
    installGallery();
    const thumbs = document.querySelectorAll<HTMLAnchorElement>('[data-gallery-thumb]');
    thumbs[1].click();
    expect(main().src).toContain('/b.jpg');
    expect(main().alt).toBe('Second');
    expect(main().getAttribute('width')).toBe('50');
    expect(main().getAttribute('height')).toBe('90');
    expect(document.querySelector('[data-gallery-counter]')!.textContent).toBe('02 / 03');
    expect(thumbs[0].hasAttribute('aria-current')).toBe(false);
    expect(thumbs[1].getAttribute('aria-current')).toBe('true');
  });

  it('swaps the picture sources and srcset with the main image', async () => {
    document.body.innerHTML = `
      <section data-gallery-root>
        <figure><picture>
          <source type="image/avif" srcset="/r/a-480.avif 480w" />
          <source type="image/webp" srcset="/r/a-480.webp 480w" />
          <img data-gallery-main src="/a.jpg" srcset="/r/a-480.webp 480w" alt="First" />
        </picture></figure>
        <ul>
          <li><a href="/a.jpg" data-gallery-thumb data-srcset-avif="/r/a-480.avif 480w" data-srcset-webp="/r/a-480.webp 480w" data-alt="First"></a></li>
          <li><a href="/b.jpg" data-gallery-thumb data-srcset-avif="/r/b-480.avif 480w" data-srcset-webp="/r/b-480.webp 480w" data-alt="Second"></a></li>
          <li><a href="/c.jpg" data-gallery-thumb data-alt="Third"></a></li>
        </ul>
      </section>`;
    const { installGallery } = await import('../src/scripts/gallery');
    installGallery();
    const thumbs = document.querySelectorAll<HTMLAnchorElement>('[data-gallery-thumb]');
    thumbs[1].click();
    expect(document.querySelector('source[type="image/avif"]')!.getAttribute('srcset')).toBe('/r/b-480.avif 480w');
    expect(document.querySelector('source[type="image/webp"]')!.getAttribute('srcset')).toBe('/r/b-480.webp 480w');
    expect(main().getAttribute('srcset')).toBe('/r/b-480.webp 480w');
    thumbs[2].click();
    expect(document.querySelector('source[type="image/avif"]')!.getAttribute('srcset')).toBe('/c.jpg');
    expect(main().hasAttribute('srcset')).toBe(false);
    expect(main().src).toContain('/c.jpg');
  });

  it('drops stale width/height when a picture has no dimensions', async () => {
    const { installGallery } = await import('../src/scripts/gallery');
    installGallery();
    document.querySelectorAll<HTMLAnchorElement>('[data-gallery-thumb]')[2].click();
    expect(main().hasAttribute('width')).toBe(false);
  });

  it('next wraps to first after last; prev wraps to last from first', async () => {
    const { installGallery } = await import('../src/scripts/gallery');
    installGallery();
    const next = document.querySelector<HTMLButtonElement>('[data-gallery="next"]')!;
    next.click(); next.click(); next.click();
    expect(main().src).toContain('/a.jpg');
    document.querySelector<HTMLButtonElement>('[data-gallery="prev"]')!.click();
    expect(main().src).toContain('/c.jpg');
  });

  it('arrow keys step only while focus is inside the viewer', async () => {
    const { installGallery } = await import('../src/scripts/gallery');
    installGallery();
    document.getElementById('outside')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(main().src).toContain('/a.jpg');
    const next = document.querySelector<HTMLButtonElement>('[data-gallery="next"]')!;
    next.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(main().src).toContain('/b.jpg');
    next.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(main().src).toContain('/a.jpg');
  });

  it('thumb click prevents navigation, but a modified click is left alone', async () => {
    const { installGallery } = await import('../src/scripts/gallery');
    installGallery();
    const thumb = document.querySelectorAll<HTMLAnchorElement>('[data-gallery-thumb]')[1];
    const plain = new MouseEvent('click', { bubbles: true, cancelable: true });
    thumb.dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(true);
    const meta = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });
    thumb.dispatchEvent(meta);
    expect(meta.defaultPrevented).toBe(false);
  });

  it('no-op without a viewer', async () => {
    document.body.innerHTML = '';
    const { installGallery } = await import('../src/scripts/gallery');
    expect(() => installGallery()).not.toThrow();
  });

  it('shows the Prev/Next controls, which ship hidden for JS-off visitors', async () => {
    document.querySelector('[data-gallery="prev"]')!.insertAdjacentHTML('beforebegin', '<div data-gallery-ctrls hidden></div>');
    const ctrls = document.querySelector<HTMLElement>('[data-gallery-ctrls]')!;
    expect(ctrls.hidden).toBe(true);
    const { installGallery } = await import('../src/scripts/gallery');
    installGallery();
    expect(ctrls.hidden).toBe(false);
  });
});

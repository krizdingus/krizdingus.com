// src/themes/xp/recycle.ts — the Recycle Bin. Opening it "crashes" with a
// fake Win9x error dialog, in the page (never /panic). Close or Esc ends it.
import { openDialog } from './dialog';

const DETAILS =
  'RECYCLE caused an invalid page fault in\n' +
  'module TRASH.DLL at 0137:BFF9A5D0.\n' +
  'Registers:\n' +
  'EAX=DEADBEEF CS=0137 EIP=BFF9A5D0 EFLGS=00010246\n' +
  'EBX=00C0FFEE SS=013F ESP=0063F2A8 EBP=0063F2D4\n' +
  'Bytes at CS:EIP:\n' +
  '8b 4d 0c 85 c9 74 05 8b 01 ff 50 08 5d c2 08 00';

export function openRecycleBin(signal?: AbortSignal): HTMLElement {
  const dlg = openDialog({
    marker: 'fake-error',
    role: 'alertdialog',
    className: 'xp-dialog--error',
    title: 'RECYCLE.EXE',
    icon: '✕',
    bodyHTML:
      '<p><b>RECYCLE.EXE has performed an illegal operation and will be shut down.</b></p>' +
      '<p>Nothing in here was ever really deleted.</p>' +
      '<p>If the problem persists, contact the program vendor.</p>' +
      '<pre class="xp-dialog__details" id="xp-recycle-details" hidden></pre>',
    buttons: [
      { label: 'Close', primary: true },
      {
        label: 'Details >>',
        attrs: { 'aria-expanded': 'false', 'aria-controls': 'xp-recycle-details' },
        onClick: (d) => {
          const pre = d.querySelector<HTMLElement>('.xp-dialog__details');
          if (!pre) return true;
          pre.textContent = DETAILS;
          pre.hidden = !pre.hidden;
          const btn = d.querySelector('[aria-controls="xp-recycle-details"]');
          btn?.setAttribute('aria-expanded', String(!pre.hidden));
          // As in the Win9x dialog: the arrows point the way the button goes.
          if (btn) btn.textContent = pre.hidden ? 'Details >>' : '<< Details';
          return true;
        },
      },
    ],
  }, signal);
  document.querySelector('.desktop-icon[data-recycle-bin]')?.classList.add('is-full');
  return dlg;
}

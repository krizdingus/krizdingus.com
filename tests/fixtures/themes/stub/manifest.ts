// tests/fixtures/themes/stub/manifest.ts — a whole second theme, as a folder.
import type { ThemeManifest } from '../../../../src/themes/types';

const manifest: ThemeManifest = {
  id: 'stub',
  name: 'Stub mode',
  description: 'A fixture theme: one folder, nothing else edited.',
  availability: '(min-width: 1px)',
  label: 'Stub',
};

export default manifest;

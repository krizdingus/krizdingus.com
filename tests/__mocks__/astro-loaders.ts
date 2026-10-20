// Mock for astro/loaders used in vitest context
export function glob(_config: unknown) {
  return { type: 'glob', ...(typeof _config === 'object' ? _config : {}) };
}

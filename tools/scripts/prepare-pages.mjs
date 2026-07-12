import {
  copyFileSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { extname, resolve } from 'node:path';

const workspaceRoot = resolve(import.meta.dirname, '../..');
const outputRoot = resolve(
  workspaceRoot,
  'dist/apps/multi-level-push-menu-example',
);
const indexPath = resolve(outputRoot, 'index.html');
const fallbackPath = resolve(outputRoot, '404.html');
const baseHref = process.env.BASE_HREF;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const collectFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? collectFiles(path) : [path];
  });

assert(
  typeof baseHref === 'string' &&
    baseHref.startsWith('/') &&
    baseHref.endsWith('/') &&
    !baseHref.includes('..'),
  'BASE_HREF must be an absolute, trailing-slash path such as /repository/.',
);
assert(
  existsSync(indexPath),
  `Missing Pages entry point at ${indexPath}. Build the demo first.`,
);

const index = readFileSync(indexPath, 'utf8');
const renderedBaseHref = index.match(/<base\s+href=["']([^"']+)["']/i)?.[1];
assert(
  renderedBaseHref === baseHref,
  `Expected the built index to use <base href="${baseHref}">, received "${renderedBaseHref ?? 'none'}".`,
);

const sourceMaps = collectFiles(outputRoot).filter(
  (file) => extname(file) === '.map',
);
assert(
  sourceMaps.length === 0,
  `Production Pages output must not contain source maps: ${sourceMaps.join(', ')}`,
);

copyFileSync(indexPath, fallbackPath);
writeFileSync(resolve(outputRoot, '.nojekyll'), '');

assert(
  existsSync(fallbackPath),
  'Failed to create the Angular Router fallback.',
);
console.log(
  `Prepared GitHub Pages artifact at ${outputRoot} with base href ${baseHref} and 404.html fallback.`,
);

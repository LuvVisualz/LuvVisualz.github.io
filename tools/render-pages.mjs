/** Regenerate prerendered page bodies after editing the existing client bundle. */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { i as reactFactory } from '../assets/framework-CXnKph_e.js';
import Portfolio from '../assets/portfolio-C92OWmAS.js';

const require = createRequire(import.meta.url);
const reactPath = require.resolve('react');
require(reactPath);
// The deployed bundle contains its own React instance. The server renderer must use it.
require.cache[reactPath].exports = reactFactory();
const { renderToString } = require('react-dom/server');

for (const [locale, file] of [['es', 'index.html'], ['en', 'en/index.html']]) {
  const page = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const start = page.indexOf('<main>');
  const end = page.indexOf('</main>', start) + '</main>'.length;
  if (start < 0 || end < 0) throw new Error(`Missing main element in ${file}`);
  const body = renderToString(reactFactory().createElement(Portfolio, { locale }));
  writeFileSync(new URL(`../${file}`, import.meta.url), page.slice(0, start) + body + page.slice(end));
  process.stdout.write(`Rendered ${file}\n`);
}

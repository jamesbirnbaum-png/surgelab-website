// Adds a short content hash to the stylesheet and script links in every page
// so browsers fetch a fresh copy when the file changes, while the files
// themselves stay cacheable for 30 days (see _headers). Run after editing
// site.css (and minifying) or site.js:  node tools/stamp-assets.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const h = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 8);
const css = h('assets/css/site.min.css'), js = h('assets/js/site.js');
for (const f of readdirSync('.').filter((n) => n.endsWith('.html'))) {
  let s = readFileSync(f, 'utf8');
  const out = s
    .replace(/\/assets\/css\/site\.min\.css(\?v=[a-f0-9]+)?/g, `/assets/css/site.min.css?v=${css}`)
    .replace(/\/assets\/js\/site\.js(\?v=[a-f0-9]+)?/g, `/assets/js/site.js?v=${js}`);
  if (out !== s) { writeFileSync(f, out); console.log('stamped', f); }
}
console.log('css', css, 'js', js);

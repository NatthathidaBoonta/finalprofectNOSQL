const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'holtel-app');

const exts = ['.js', '.jsx', '.ts', '.tsx'];

function walk(dir, files=[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules') continue;
      walk(full, files);
    } else {
      if (exts.includes(path.extname(e.name))) files.push(full);
    }
  }
  return files;
}

const files = walk(root);

const jsxPattern = /<[^>]+>[\s\S]*?\{\s*([A-Za-z_$][A-Za-z0-9_$.]*)\s*\}[\s\S]*?<\//g;
const inlinePattern = /\{\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\}/g;

const results = [];

for (const f of files) {
  try {
    const text = fs.readFileSync(f, 'utf8');
    let m;
    // Find JSX blocks containing bare expressions
    while ((m = jsxPattern.exec(text)) !== null) {
      const ident = m[1];
      // if ident contains dot, it's property access (e.g., auth.user.name) — ok
      if (!ident.includes('.')) {
        // ensure it's not inside a JSX attribute like prop={value}
        const snippet = text.slice(Math.max(0, m.index-80), Math.min(text.length, m.index+120)).replace(/\n/g, ' ');
        results.push({ file: f, match: ident, snippet });
      }
    }

    // also check generic {identifier} occurrences (outside tags)
    while ((m = inlinePattern.exec(text)) !== null) {
      const ident = m[1];
      // skip common safe identifiers (true/false/null/Number etc)
      if (['true','false','null','undefined'].includes(ident)) continue;
      // if next/prev chars suggest HTML/JSX context
      const idx = m.index;
      const before = text.slice(Math.max(0, idx-50), idx);
      const after = text.slice(idx, Math.min(text.length, idx+50));
      const inJSX = /<[^>]+>/.test(before) || /<[^>]+>/.test(after);
      if (inJSX && !ident.includes('.')) {
        results.push({ file: f, match: ident, snippet: text.slice(Math.max(0, idx-80), Math.min(text.length, idx+120)).replace(/\n/g,' ') });
      }
    }
  } catch (err) {
    // ignore
  }
}

if (results.length === 0) {
  console.log('No suspicious bare identifier JSX renders found.');
  process.exit(0);
}

console.log('Potential bare JSX renders (may be objects):');
for (const r of results) {
  console.log('\nFILE:', r.file);
  console.log('IDENTIFIER:', r.match);
  console.log('SNIPPET:', r.snippet);
}

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const directory = new URL('../dist/_astro/', import.meta.url);
const files = [];
for (const name of await readdir(directory)) {
  if (!/\.(js|css)$/.test(name)) continue;
  const bytes = await readFile(new URL(name, directory));
  files.push({ name, bytes: bytes.length, gzipBytes: gzipSync(bytes).length });
}
const sum = (extension) =>
  files
    .filter((file) => file.name.endsWith(extension))
    .reduce((total, file) => total + file.gzipBytes, 0);
const report = {
  files,
  totalJavaScriptGzip: sum('.js'),
  totalCssGzip: sum('.css'),
  budgets: { javascriptGzip: 512000, cssGzip: 30720 },
};
await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../test-results/bundle.json', import.meta.url),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report, null, 2));
if (
  report.totalJavaScriptGzip > report.budgets.javascriptGzip ||
  report.totalCssGzip > report.budgets.cssGzip
) {
  throw new Error(
    'Compressed asset budget exceeded; investigate before changing the budget',
  );
}

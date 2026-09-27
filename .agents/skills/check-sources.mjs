import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const lock = JSON.parse(await readFile(new URL('./sources.lock.json', import.meta.url), 'utf8'));
let checked = 0;
for (const source of lock.sources) {
  if (!/^[a-f0-9]{40}$/.test(source.commit)) throw new Error(`Unpinned skill: ${source.name}`);
  for (const [file, expected] of Object.entries(source.files)) {
    const bytes = await readFile(new URL(`./${source.name}/${file}`, import.meta.url));
    if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error(`Skill checksum changed: ${source.name}/${file}`);
    checked++;
  }
}
console.log(`Verified ${checked} files from ${lock.sources.length} pinned upstream skills.`);

import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const run = promisify(execFile);
const project = fileURLToPath(new URL('..', import.meta.url));
const scenes = ['cubes', 'horizon'];

/** @param {string} root @param {boolean} requireAll */
export async function checkSceneAudio(root = project, requireAll = false) {
  const data = JSON.parse(
    await readFile(join(root, 'src/content/scene-music.json'), 'utf8'),
  );
  const missing = [];
  for (const scene of scenes) {
    const track = data[scene];
    if (!track?.audioFile) {
      missing.push(scene);
      continue;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.mp3$/.test(track.audioFile))
      throw new Error(`Invalid audio filename for ${scene}`);
    const file = join(root, 'src/assets/audio', track.audioFile);
    const info = await stat(file).catch(() => null);
    if (!info?.isFile() || info.size === 0)
      throw new Error(`Missing or empty scene audio file: ${track.audioFile}`);
  }
  if (requireAll && missing.length)
    throw new Error(`Recordings not installed: ${missing.join(', ')}`);
  return { installed: scenes.length - missing.length, missing };
}

/** @param {{ cubes: string, horizon: string }} inputs @param {string} root */
export async function installSceneAudio(inputs, root = project) {
  const contentFile = join(root, 'src/content/scene-music.json');
  const original = await readFile(contentFile, 'utf8');
  const data = JSON.parse(original);
  const staging = await mkdtemp(join(tmpdir(), 'proxy-scene-audio-'));
  const contentTemporary = `${contentFile}.${randomUUID()}.tmp`;
  const prepared = [];
  try {
    for (const scene of scenes) {
      const input = inputs[/** @type {'cubes' | 'horizon'} */ (scene)];
      if (!input || !(await stat(resolve(input))).isFile())
        throw new Error(`Use a local audio file for ${scene}`);
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*$/.test(data[scene]?.id))
        throw new Error(`Invalid track ID for ${scene}`);
      const output = join(staging, `${scene}.mp3`);
      // Decode completely and emit one broadly supported browser format.
      const result = await run(
        'ffmpeg',
        [
          '-hide_banner',
          '-v',
          'error',
          '-nostdin',
          '-xerror',
          '-i',
          resolve(input),
          '-map',
          '0:a:0',
          '-vn',
          '-map_metadata',
          '-1',
          '-codec:a',
          'libmp3lame',
          '-b:a',
          '192k',
          '-ar',
          '44100',
          '-ac',
          '2',
          '-progress',
          'pipe:1',
          output,
        ],
        { timeout: 180000, maxBuffer: 1024 * 1024 },
      );
      const times = [...result.stdout.matchAll(/^out_time_us=(\d+)$/gm)];
      const duration = Number(times.at(-1)?.[1]) / 1000000;
      if (!Number.isFinite(duration) || duration < 1)
        throw new Error(`No usable decoded audio for ${scene}`);
      const bytes = await readFile(output);
      const hash = createHash('sha256').update(bytes).digest('hex');
      const filename = `${data[scene].id}.${hash.slice(0, 16)}.mp3`;
      data[scene].audioFile = filename;
      data[scene].duration = duration;
      prepared.push({ scene, output, filename, bytes: bytes.length });
    }
    // Neither scene changes unless both inputs have decoded successfully.
    if ((await readFile(contentFile, 'utf8')) !== original)
      throw new Error('Scene metadata changed during import; retry the import');
    const assets = join(root, 'src/assets/audio');
    await mkdir(assets, { recursive: true });
    for (const item of prepared)
      await copyFile(item.output, join(assets, item.filename));
    await writeFile(contentTemporary, JSON.stringify(data, null, 2) + '\n');
    await rename(contentTemporary, contentFile);
    return prepared.map(({ scene, filename, bytes }) => ({
      scene,
      filename,
      bytes,
    }));
  } finally {
    await rm(staging, { recursive: true, force: true });
    await rm(contentTemporary, { force: true });
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [command, ...args] = process.argv.slice(2);
  try {
    if (command === 'check') {
      const result = await checkSceneAudio(
        project,
        args.includes('--require-all'),
      );
      console.log(`Bundled recordings: ${result.installed}/${scenes.length}`);
      if (result.missing.length)
        console.log(`Recordings not installed: ${result.missing.join(', ')}`);
    } else if (command === 'install' && args.length === 2) {
      console.log(
        await installSceneAudio({ cubes: args[0], horizon: args[1] }),
      );
    } else {
      throw new Error(
        'Usage: node proxy/scripts/scene-audio.mjs install <cubes-file> <sanctuary-file> | check [--require-all]',
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

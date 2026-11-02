import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  cp,
  mkdtemp,
  readFile,
  writeFile,
  rm,
  readlink,
  symlink,
  rename,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { publish } from './publish.mjs';

const execute = promisify(execFile);
const image =
  'openresty/openresty:alpine@sha256:b3a6f1f432eabdbda4adcb6ec3e6461e621782eaa82dbe67154ddd1afd109569';
const scratch = await mkdtemp(join(tmpdir(), 'proxy-http-smoke-'));
const artifact = join(scratch, 'artifact');
const root = join(scratch, 'deployment');
let container;
try {
  await cp(fileURLToPath(new URL('../dist', import.meta.url)), artifact, {
    recursive: true,
  });
  const oldAsset = '_astro/previous-release.123456.js';
  await writeFile(join(artifact, oldAsset), 'export const previous = true;');
  await publish({ artifact, root, release: 'smoke-first' });
  const locations = await readFile(
    new URL('./openresty.conf.example', import.meta.url),
    'utf8',
  );
  const config = join(scratch, 'nginx.conf');
  await writeFile(
    config,
    `worker_processes 1;\nevents { worker_connections 64; }\nhttp {\ninclude /usr/local/openresty/nginx/conf/mime.types;\nserver { listen 8080;\n${locations}\n}\n}\n`,
  );
  const started = await execute('docker', [
    'run',
    '--rm',
    '-d',
    '-p',
    '127.0.0.1::8080',
    '-v',
    `${root}:/srv/royenheart-home:ro,Z`,
    '-v',
    `${config}:/usr/local/openresty/nginx/conf/nginx.conf:ro,Z`,
    image,
  ]);
  container = started.stdout.trim();
  await execute('docker', [
    'exec',
    container,
    '/usr/local/openresty/nginx/sbin/nginx',
    '-t',
  ]);
  const { stdout } = await execute('docker', ['port', container, '8080/tcp']);
  const origin = `http://${stdout.trim()}`;
  let response;
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      response = await fetch(origin);
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert(response, 'OpenResty did not start');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(response.headers.get('cache-control'), 'no-cache');
  const firstHtml = await response.text();
  const script = /\/_astro\/[^" ]+\.js/.exec(firstHtml)?.[0];
  assert(script, 'The build must contain a JavaScript entry point');
  const asset = await fetch(origin + script);
  assert.equal(asset.status, 200);
  assert.match(
    asset.headers.get('content-type'),
    /(?:application|text)\/javascript/,
  );
  assert.match(
    asset.headers.get('cache-control'),
    /max-age=31536000, immutable/,
  );
  await asset.arrayBuffer();
  for (const path of ['/_astro/does-not-exist.js', '/missing-page']) {
    const missing = await fetch(origin + path);
    assert.equal(missing.status, 404);
    assert.doesNotMatch(
      missing.headers.get('cache-control') ?? '',
      /immutable/,
    );
    await missing.text();
  }
  await rm(join(artifact, oldAsset));
  await writeFile(
    join(artifact, 'index.html'),
    firstHtml.replace('<title>', '<title>Release two: '),
  );
  await publish({ artifact, root, release: 'smoke-second' });
  assert.match(await (await fetch(origin)).text(), /Release two:/);
  const retained = await fetch(`${origin}/${oldAsset}`);
  assert.equal(retained.status, 200);
  assert.equal(await retained.text(), 'export const previous = true;');
  const previous = await readlink(join(root, 'previous'));
  await symlink(previous, join(root, 'rollback-next'));
  await rename(join(root, 'rollback-next'), join(root, 'current'));
  assert.equal(await (await fetch(origin)).text(), firstHtml);
  console.log(
    'OpenResty passed: syntax, HTML/JS MIME types, cache policy, real 404s, old chunks, atomic publication, and rollback.',
  );
} finally {
  if (container) await execute('docker', ['rm', '-f', container]);
  await rm(scratch, { recursive: true, force: true });
}

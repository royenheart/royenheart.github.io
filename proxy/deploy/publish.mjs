import {
  cp,
  mkdir,
  readFile,
  readdir,
  readlink,
  rename,
  lstat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

/** @param {string} directory @param {string} prefix @returns {Promise<string[]>} */
async function filesUnder(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(join(directory, prefix), {
    withFileTypes: true,
  })) {
    const relative = join(prefix, entry.name);
    if (entry.isSymbolicLink())
      throw new Error(`Artifact contains a symbolic link: ${relative}`);
    if (entry.isDirectory())
      files.push(...(await filesUnder(directory, relative)));
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

/** @param {string} root @param {string} name @param {string} target */
async function replaceLink(root, name, target) {
  const temporary = join(root, `.${name}-${randomUUID()}`);
  await symlink(target, temporary);
  await rename(temporary, join(root, name));
}

/** @param {{ artifact: string, root: string, release: string }} options */
export async function publish({ artifact, root, release }) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{6,63}$/.test(release))
    throw new Error(
      'Release must be a 7-64 character commit or release identifier',
    );
  artifact = resolve(artifact);
  root = resolve(root);
  if (
    root === '/' ||
    root === artifact ||
    artifact.startsWith(`${root}/`) ||
    root.startsWith(`${artifact}/`)
  )
    throw new Error('Use a separate deployment root');
  const files = await filesUnder(artifact);
  if (!files.includes('index.html') || !files.includes('404.html'))
    throw new Error('Artifact must include index.html and 404.html');
  if (
    files.some(
      (file) =>
        !/^(?:_astro\/[^/]+|optics\/(?:LICENSE|deflection\.dat|inverse-radius\.dat)|licenses\/(?:fonts\/)?[a-zA-Z0-9._-]+\.txt|favicon\.ico|index\.html|404\.html)$/.test(
          file,
        ),
    )
  )
    throw new Error('Artifact contains unexpected files');
  const index = await readFile(join(artifact, 'index.html'), 'utf8');
  for (const match of index.matchAll(/\/_astro\/([a-zA-Z0-9_.-]+)/g)) {
    if (!files.includes(`_astro/${match[1]}`))
      throw new Error(`Missing referenced asset: ${match[1]}`);
  }
  let previous;
  try {
    const current = await lstat(join(root, 'current'));
    if (!current.isSymbolicLink())
      throw new Error('Current release must be a symbolic link');
    previous = await readlink(join(root, 'current'));
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
      throw error;
  }
  await mkdir(join(root, 'releases'), { recursive: true });
  await mkdir(join(root, 'shared', '_astro'), { recursive: true });
  const destination = join(root, 'releases', release);
  try {
    await lstat(destination);
    throw new Error('Release already exists');
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT'))
      throw error;
  }
  /** @type {Record<string, string>} */
  const hashes = {};
  for (const file of files) {
    const bytes = await readFile(join(artifact, file));
    hashes[file] = createHash('sha256').update(bytes).digest('hex');
    if (file.startsWith('_astro/')) {
      const shared = join(root, 'shared', file);
      try {
        if (!(await readFile(shared)).equals(bytes))
          throw new Error(`Immutable asset collision: ${basename(file)}`);
      } catch (error) {
        if (!(
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ))
          throw error;
        await cp(join(artifact, file), shared);
      }
    }
  }
  const staging = join(root, 'releases', `.${release}-${randomUUID()}`);
  await cp(artifact, staging, { recursive: true });
  await rename(staging, destination);
  await mkdir(join(root, 'manifests'), { recursive: true });
  await writeFile(
    join(root, 'manifests', `${release}.json`),
    JSON.stringify({ release, files: hashes }, null, 2) + '\n',
  );
  if (previous) await replaceLink(root, 'previous', previous);
  await replaceLink(root, 'current', `releases/${release}`);
  return destination;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [artifact, root, release] = process.argv.slice(2);
  if (!artifact || !root || !release) {
    console.error(
      'Usage: node proxy/deploy/publish.mjs <dist-directory> <deployment-root> <release-id>',
    );
    process.exitCode = 1;
  } else {
    await publish({ artifact, root, release });
    console.log(`Published ${release} into ${resolve(root)}`);
  }
}

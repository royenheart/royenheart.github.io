/**
 * Copyright (c) 2020 Eric Bruneton
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors
 * may be used to endorse or promote products derived from this software without
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  advanceRay,
  angleUpperBound,
  clamp,
  deflectionRadiusCoordinate,
  energyFromDeflectionCoordinate,
  OPTICAL_VERSION,
  TABLE_SIZES,
} from '../src/scenes/relativity/optics.ts';

// Table parameterization and interpolation adapt Bruneton's preprocessing.
// Full BSD-3-Clause notice: ../public/optics/LICENSE. Integration uses RK4.
const output = fileURLToPath(new URL('../public/optics/', import.meta.url));
const step = 0.0002;
await mkdir(output, { recursive: true });
const files = {};
for (const kind of ['deflection', 'inverseRadius']) {
  const [width, height] = TABLE_SIZES[kind];
  const values = new Float32Array(2 * width * height);
  for (let x = 0; x < width; x++) {
    const energySquared =
      kind === 'deflection'
        ? energyFromDeflectionCoordinate(x / (width - 1))
        : (1 / clamp(x / (width - 1), 0.001, 0.999) - 1) / 6;
    const energy = Math.sqrt(energySquared);
    const upper = angleUpperBound(energySquared);
    let state = { u: 0, velocity: energy, phi: 0, time: 0 };
    let previousRow = 0,
      previousValue = 0,
      previousTime = 0,
      nextRow = 0;
    for (let iteration = 0; iteration < 200000; iteration++) {
      const terminal =
        kind === 'deflection' && (state.u >= 1 || state.velocity < 0);
      const coordinate =
        kind === 'deflection'
          ? deflectionRadiusCoordinate(energySquared, state.u)
          : state.phi / upper;
      const row = terminal ? height - 1 : coordinate * (height - 1);
      const value = terminal
        ? previousValue
        : kind === 'deflection'
          ? state.phi - Math.atan2(state.u, state.velocity)
          : state.u;
      const time = terminal ? previousTime : state.time;
      while (nextRow <= Math.min(row, height - 1)) {
        const t =
          row > previousRow
            ? clamp((nextRow - previousRow) / (row - previousRow))
            : 0;
        const offset = 2 * (x + nextRow * width);
        values[offset] = previousValue * (1 - t) + value * t;
        values[offset + 1] = previousTime * (1 - t) + time * t;
        nextRow++;
      }
      if (nextRow === height) break;
      previousRow = row;
      previousValue = value;
      previousTime = time;
      state = advanceRay(state, energy, step);
    }
    if (nextRow !== height)
      throw new Error(`Ray did not terminate: ${kind} column ${x}`);
  }
  if (!values.every(Number.isFinite)) throw new Error(`Invalid ${kind} table`);
  const bytes = Buffer.alloc((values.length + 2) * 4);
  bytes.writeFloatLE(width, 0);
  bytes.writeFloatLE(height, 4);
  values.forEach((value, i) => bytes.writeFloatLE(value, (i + 2) * 4));
  const file = kind === 'deflection' ? 'deflection.dat' : 'inverse-radius.dat';
  await writeFile(output + file, bytes);
  files[kind] = {
    file,
    width,
    height,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}
const manifest = {
  version: OPTICAL_VERSION,
  upstream:
    'ebruneton/black_hole_shader@e72b3f293409893a6fa25528b29572c96fc57f57',
  units: 'Schwarzschild radius = 1',
  format:
    'Little-endian float32 width, height, then row-major RG float32 samples',
  integrator: 'RK4',
  angularStep: step,
  files,
};
await writeFile(
  new URL('../src/scenes/relativity/manifest.json', import.meta.url),
  JSON.stringify(manifest, null, 2) + '\n',
);
process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const template = readFileSync(new URL('./template.html', import.meta.url), 'utf8');
const config = readFileSync(new URL('./config.toml', import.meta.url), 'utf8');

function includesAll(source, patterns) {
  for (const pattern of patterns) {
    assert.match(source, pattern);
  }
}

assert.match(config, /bg_color\s*=\s*"#01e8fe"/);
assert.match(config, /cube_color\s*=\s*"#56dfff"/);

includesAll(template, [
  /id="app-frame"/,
  /width:\s*100vw/,
  /height:\s*100vh/,
  /class="profile-sidebar"/,
  /class="scene-panel"/,
  /class="bottom-bar"/,
  /class="profile-avatar"/,
  /src="\/avatar\.svg"/,
  /href="\{\{LINK_BLOG\}\}"[^>]*>\s*博客\s*</,
  /href="\{\{LINK_GITHUB\}\}"[^>]*>\s*GitHub\s*</,
  /class="music-panel"/,
  /class="record-panel"/,
  /record-panel[\s\S]*flex-direction:\s*column/,
  /record-panel[\s\S]*justify-self:\s*end/,
  /id="switch-btn"[^>]*class="scene-toggle"/,
  /id="cube-field-layer"/,
  /backgroundCubeSprites/,
  /createBackgroundCubeSprites/,
  /prepareCubeSpriteBitmap/,
  /drawCachedPseudoCube/,
  /paintPseudoCubeShape/,
  /transferToImageBitmap/,
  /cubeFieldRenderScale/,
  /atmosphereCache/,
  /backgroundCloudCache/,
  /drawCachedPseudoCubeOnContext/,
  /scaleSpritesForResize/,
  /reconcileCubeSpriteCounts/,
  /webglRenderInterval/,
  /shouldRenderWebglFrame/,
  /useGpuCubeField/,
  /forceCanvasCubeField/,
  /createGpuCubeCloudScene/,
  /createGpuCubeFieldGeometry/,
  /gpuDenseCubeInstanceCount/,
  /gpuCentralClusterWeight/,
  /gpuLayerRatios/,
  /gpuVerticalDensityPower/,
  /gpuPileHoldStart/,
  /gpuPileFadeStart/,
  /gpuLightContrast/,
  /clusteredGpuX/,
  /instancePile/,
  /densityFallProgress/,
  /verticalDensityAlpha/,
  /vPileProgress/,
  /vWorldPosition/,
  /leftTopLight/,
  /bottomOcclusion/,
  /const gpuDenseCubeInstanceCount\s*=\s*720/,
  /gpuCubeVertexShader/,
  /gpuCubeFragmentShader/,
  /gpuAtmosphereFragmentShader/,
  /new THREE\.PlaneGeometry\(320,\s*190\)/,
  /InstancedBufferGeometry/,
  /InstancedBufferAttribute/,
  /instanceOffset/,
  /gpuCubeUniforms/,
  /renderMode/,
  /drawAtmosphericBackdrop/,
  /drawBackgroundCubeCloud/,
  /mistGradient/,
  /webglAvailable/,
  /WebGL unavailable/,
  /referenceCubeCloud/,
  /realCubeBudget/,
  /createCubeFieldSprites/,
  /drawCubeField/,
  /createCubeCloudScene/,
  /createCubeMesh/,
  /backgroundPlane/,
  /foregroundCubes/,
  /midgroundCubes/,
  /warmRimLight/,
  /keyLight\.position\.set\(-18,\s*24,\s*18\)/,
  /goldenAccretionPalette/,
  /eventHorizonGroup/,
  /eventHorizonGlowMaterial/,
  /directGlowBoost/,
  /continuousUpperHalo/,
  /haloArcMask/,
  /eventHorizonCoreMaterial/,
  /rimSoftBlend/,
  /horizonContactGlow/,
  /eventHorizonRimPower/,
  /eventHorizonCore/,
  /eventHorizonGlow/,
  /eventHorizonDisk/,
  /eventHorizonDiskMaterial/,
  /accretionDiskRings/,
  /foregroundDiskOcclusion/,
  /diskOcclusionAlpha/,
  /foregroundAccretionRings/,
  /nearFieldDiskBody/,
  /lowerGlowOcclusion/,
  /diskPerspective/,
  /eventHorizonDisk\.position\.set\(0,\s*-10\.6,\s*0\.08\)/,
  /eventHorizonDisk\.renderOrder\s*=\s*6/,
  /blending:\s*THREE\.NormalBlending/,
  /eventHorizonBackdrop/,
  /eventHorizonBaseScale/,
  /updateEventHorizonLayout/,
  /sceneAspectRatio/,
  /new THREE\.PlaneGeometry\(64,\s*44\)/,
  /new THREE\.PlaneGeometry\(180,\s*120\)/,
  /deepOrange/,
  /paleGold/,
  /THREE\.AdditiveBlending/,
  /scene2RenderPath/,
  /const scene2RenderPath\s*=\s*'direct'/,
  /renderer\.render\(scene,\s*camera\)/,
  /pileFadeStart/,
  /velocityY/,
  /recycleFallingElement/,
]);

assert.doesNotMatch(template, /const amount = 40/);
assert.doesNotMatch(template, /class="status-orb"/);
assert.doesNotMatch(template, /个人主页1|个人主页2|媒体账号/);
assert.doesNotMatch(template, /InstancedMesh\(geometry, material, count\)/);
assert.doesNotMatch(template, /addCubeLayer\(farCubes,\s*1[5-9]\d/);
assert.doesNotMatch(template, /addCubeLayer\(midgroundCubes,\s*1[5-9]\d/);
assert.doesNotMatch(template, /gpuCubeInstanceCount\s*=\s*220/);
assert.doesNotMatch(template, /const gpuDenseCubeInstanceCount\s*=\s*520/);
assert.doesNotMatch(template, /gpuLayerRatios\s*=\s*\{\s*far:\s*0\.52,\s*foreground:\s*0\.8\s*\}/);
assert.doesNotMatch(template, /const ringMat = new THREE\.MeshBasicMaterial\(\{\s*color:\s*0xffccaa\s*\}\)/);
assert.doesNotMatch(template, /const sunMat = new THREE\.MeshBasicMaterial\(\{\s*color:\s*0xffaa00\s*\}\)/);
assert.doesNotMatch(template, /new THREE\.SphereGeometry\(12\.15/);
assert.doesNotMatch(template, /new THREE\.TorusGeometry\(16\.05/);
assert.doesNotMatch(template, /createAccretionRingLayer/);
assert.doesNotMatch(template, /ringGlowGroup/);
assert.doesNotMatch(template, /eventHorizonCore\.scale\.set\(1\.54,\s*1\.32,\s*1\)/);
assert.doesNotMatch(template, /eventHorizonShadowMaterial/);
assert.doesNotMatch(template, /new THREE\.PlaneGeometry\(82,\s*10\)/);
assert.doesNotMatch(template, /EffectComposer/);
assert.doesNotMatch(template, /DepthOfFieldPass/);
assert.doesNotMatch(template, /composer\.render/);
assert.doesNotMatch(template, /planeEdgeFeather/);

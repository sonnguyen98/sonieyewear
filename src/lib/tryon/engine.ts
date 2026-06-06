/**
 * Virtual Try-On Engine
 * Ported from alperenuzun/basic-virtual-tryon-glasses to TypeScript + Next.js.
 * Glasses model replaced with a textured PNG/SVG plane sprite per product.
 */

import * as THREE from 'three'
import { CFG, LM, FACE_OVAL } from './constants'
import { clamp, toV, mid, eyeMid, qDelta, toPixels } from './helpers'
import { createDynamicFaceMesh } from './occluder'
import { createCamera, createVideoBackground, createLights, createRenderer, handleResize } from './scene'

// ── Private State ──────────────────────────────────────────────────────────────
let faceLandmarker: unknown = null
let glassesObj: THREE.Group | null = null
let faceObj: THREE.Mesh | null = null
let bg: THREE.Texture | null = null
let videoEl: HTMLVideoElement | null = null
let renderer: THREE.WebGLRenderer | null = null
let camera: THREE.OrthographicCamera | null = null
let scene: THREE.Scene | null = null
let animRafId = 0
let predRafId = 0
let destroyed = false

const sm = {
  ready: false,
  gPos: new THREE.Vector3(),
  gQuat: new THREE.Quaternion(),
  gScale: new THREE.Vector3(1, 1, 1),
  prev: new THREE.Vector3(),
}

// ── Glasses Sprite Factory ────────────────────────────────────────────────────
function createGlassesSprite(imageUrl: string): THREE.Group {
  const loader = new THREE.TextureLoader()
  const texture = loader.load(imageUrl)
  texture.minFilter = THREE.LinearFilter
  texture.colorSpace = THREE.SRGBColorSpace

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    alphaTest: 0.05,
  })

  // Plane sized to ~150×58 units (roughly 2.6:1 glasses aspect ratio).
  // The per-frame scale in engine.ts normalises this to the actual face width.
  const geo = new THREE.PlaneGeometry(150, 58)
  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = 3

  const group = new THREE.Group()
  group.add(mesh)
  return group
}

// ── Animation Loop ─────────────────────────────────────────────────────────────
function animate() {
  if (destroyed) return
  if (bg) bg.needsUpdate = true
  animRafId = requestAnimationFrame(animate)
  if (renderer && scene && camera) renderer.render(scene, camera)
}

// ── Public: Initialize Three.js Scene ─────────────────────────────────────────
export function initializeThreejs(
  imageUrl: string,
  video: HTMLVideoElement,
  container: HTMLElement
): void {
  videoEl = video
  destroyed = false
  sm.ready = false

  camera = createCamera(video)
  const { bg: bgTex, sprite } = createVideoBackground(video, camera)
  bg = bgTex
  renderer = createRenderer(video)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.add(sprite)

  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileCubemapShader()
  const neutralEnv = pmrem.fromScene(new THREE.Scene()).texture
  scene.environment = neutralEnv
  pmrem.dispose()

  createLights().forEach(l => scene!.add(l))

  faceObj = createDynamicFaceMesh()
  faceObj.visible = false
  scene.add(faceObj)

  glassesObj = createGlassesSprite(imageUrl)
  glassesObj.visible = false
  scene.add(glassesObj)

  window.addEventListener('resize', onResize)
  animate()
}

// ── Public: Swap Glasses Image ─────────────────────────────────────────────────
export function setGlassesImage(imageUrl: string): void {
  if (!scene || !glassesObj) return
  const wasVisible = glassesObj.visible
  scene.remove(glassesObj)

  // Dispose old material/geometry
  glassesObj.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      ;(mesh.material as THREE.MeshBasicMaterial).map?.dispose()
      ;(mesh.material as THREE.MeshBasicMaterial).dispose()
      mesh.geometry.dispose()
    }
  })

  glassesObj = createGlassesSprite(imageUrl)
  glassesObj.visible = wasVisible
  scene.add(glassesObj)
}

// ── Public: Load MediaPipe + Start Prediction Loop ────────────────────────────
export async function initializeEngine(): Promise<void> {
  // @ts-ignore — CDN dynamic import, no type declarations
  const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/vision_bundle.mjs') as {
    FilesetResolver: { forVisionTasks(base: string): Promise<unknown> }
    FaceLandmarker: { createFromOptions(fileset: unknown, opts: unknown): Promise<unknown> }
  }

  const fileset = await vision.FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm'
  )

  faceLandmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-assets/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  })

  scheduleNextPrediction()
}

// ── Public: Cleanup ────────────────────────────────────────────────────────────
export function destroyEngine(): void {
  destroyed = true
  cancelAnimationFrame(animRafId)
  cancelAnimationFrame(predRafId)

  window.removeEventListener('resize', onResize)

  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
    renderer = null
  }

  scene = null
  camera = null
  faceLandmarker = null
  glassesObj = null
  faceObj = null
  bg = null
  videoEl = null
  sm.ready = false
}

// ── Internal helpers ──────────────────────────────────────────────────────────
function onResize() {
  if (camera && renderer && videoEl) handleResize(camera, renderer, videoEl)
}

function scheduleNextPrediction() {
  if (destroyed) return
  if (!videoEl) {
    predRafId = requestAnimationFrame(scheduleNextPrediction)
    return
  }
  if (typeof videoEl.requestVideoFrameCallback === 'function') {
    videoEl.requestVideoFrameCallback(() => renderPrediction())
  } else {
    predRafId = requestAnimationFrame(renderPrediction)
  }
}

function renderPrediction() {
  if (destroyed) return
  if (!faceLandmarker || !videoEl) {
    scheduleNextPrediction()
    return
  }

  const lm = faceLandmarker as { detectForVideo(v: HTMLVideoElement, t: number): { faceLandmarks?: Array<Array<{x:number;y:number;z:number}>> } }
  const results = lm.detectForVideo(videoEl, performance.now())

  if (results.faceLandmarks?.length && glassesObj) {
    glassesObj.visible = true
    if (faceObj) faceObj.visible = true

    const pts = toPixels(results.faceLandmarks[0], videoEl)

    const lEye = eyeMid(pts, LM.leftEyeInner, LM.leftEyeOuter)
    const rEye = eyeMid(pts, LM.rightEyeInner, LM.rightEyeOuter)
    const nose = toV(pts, LM.noseBridge)
    const nTip = toV(pts, LM.noseTip)
    const fHead = toV(pts, LM.forehead)
    const chn = toV(pts, LM.chin)
    const lTmp = toV(pts, LM.leftTemple)
    const rTmp = toV(pts, LM.rightTemple)
    const lChk = toV(pts, LM.leftCheek)
    const rChk = toV(pts, LM.rightCheek)

    const eMid = mid(lEye, rEye)
    const eW = lEye.distanceTo(rEye)
    const tW = lTmp.distanceTo(rTmp)
    const cW = lChk.distanceTo(rChk)
    const fW = Math.max(eW, tW, cW)
    const fH = fHead.distanceTo(chn)

    // Orientation
    const xAxis = rEye.clone().sub(lEye).normalize()
    const yRaw  = fHead.clone().sub(chn).normalize()
    let zAxis   = xAxis.clone().cross(yRaw).normalize()
    if (zAxis.z < 0) zAxis.negate()
    const yAxis = zAxis.clone().cross(xAxis).normalize()

    const rotMat     = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
    const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMat)
    const flipZ      = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
    targetQuat.multiply(flipZ)

    // Position
    const btt    = nTip.clone().sub(nose)
    const depAdj = clamp(btt.length() * 0.1, 0, 6)
    const tGPos  = eMid.clone()
      .addScaledVector(xAxis, CFG.glassesCenterX)
      .addScaledVector(yAxis, CFG.glassesDown)
      .addScaledVector(zAxis, CFG.glassesDepth + depAdj)

    // Scale
    const wS = fW / CFG.refHeadWidth
    const hS = fH / CFG.refFaceHeight
    const bS = wS * 0.7 + hS * 0.3
    const gS = bS * CFG.glassesScale
    const tGScale = new THREE.Vector3(gS, gS, gS)

    // Adaptive smoothing
    const mov    = tGPos.distanceTo(sm.prev)
    const aDelta = qDelta(sm.gQuat, targetQuat)
    const aP = clamp(0.15 + mov * 0.015, 0.15, 0.55)
    const aR = clamp(0.20 + aDelta * 0.6, 0.20, 0.75)
    const aS = clamp(0.16 + mov * 0.010, 0.16, 0.45)

    if (!sm.ready) {
      sm.gPos.copy(tGPos); sm.gQuat.copy(targetQuat); sm.gScale.copy(tGScale)
      sm.ready = true
    } else {
      sm.gPos.lerp(tGPos, aP)
      sm.gQuat.slerp(targetQuat, aR)
      sm.gScale.lerp(tGScale, aS)
    }
    sm.prev.copy(tGPos)

    glassesObj.position.copy(sm.gPos)
    glassesObj.quaternion.copy(sm.gQuat)
    glassesObj.scale.copy(sm.gScale)
    glassesObj.updateWorldMatrix(true, true)

    // Update face occluder
    if (faceObj) {
      const posAttr = faceObj.geometry.getAttribute('position') as THREE.BufferAttribute
      let cx = 0, cy = 0, cz = 0
      for (let fi = 0; fi < FACE_OVAL.length; fi++) {
        const fv = toV(pts, FACE_OVAL[fi])
        fv.addScaledVector(zAxis, 8)
        posAttr.setXYZ(fi + 1, fv.x, fv.y, fv.z)
        cx += fv.x; cy += fv.y; cz += fv.z
      }
      cx /= FACE_OVAL.length; cy /= FACE_OVAL.length; cz /= FACE_OVAL.length
      const coneD = fW * 0.5
      posAttr.setXYZ(0,
        cx - zAxis.x * coneD,
        cy - zAxis.y * coneD,
        cz - zAxis.z * coneD
      )
      posAttr.needsUpdate = true
    }
  } else {
    if (glassesObj) glassesObj.visible = false
    if (faceObj) faceObj.visible = false
    sm.ready = false
  }

  scheduleNextPrediction()
}

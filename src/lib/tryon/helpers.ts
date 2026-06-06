import * as THREE from 'three'

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

/** Convert normalized MediaPipe landmark to negated Three.js Vector3. */
export function toV(pts: number[][], i: number): THREE.Vector3 {
  return new THREE.Vector3(-pts[i][0], -pts[i][1], -pts[i][2])
}

export function mid(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3 {
  return a.clone().add(b).multiplyScalar(0.5)
}

export function eyeMid(pts: number[][], inner: number, outer: number): THREE.Vector3 {
  return mid(toV(pts, inner), toV(pts, outer))
}

/** Angular delta between two quaternions (radians). */
export function qDelta(a: THREE.Quaternion, b: THREE.Quaternion): number {
  return 2 * Math.acos(clamp(Math.abs(a.dot(b)), 0, 1))
}

/** Convert normalized MediaPipe landmarks to pixel coordinates. */
export function toPixels(landmarks: Array<{ x: number; y: number; z: number }>, video: HTMLVideoElement): number[][] {
  const w = video.videoWidth
  const h = video.videoHeight
  return landmarks.map(l => [l.x * w, l.y * h, l.z * w])
}

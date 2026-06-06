import * as THREE from 'three'
import { FACE_OVAL } from './constants'

/**
 * Dynamic face mesh occluder (triangle-fan geometry).
 *
 * 37 vertices: 36 face-oval landmarks + 1 centroid.
 * Updated every frame from landmark world coordinates in engine.ts.
 * Renders only to the depth buffer (colorWrite = false, renderOrder = 1)
 * so temple arms disappear behind the face when the head turns.
 */
export function createDynamicFaceMesh(): THREE.Mesh {
  const nOval = FACE_OVAL.length
  const nVerts = nOval + 1

  const positions = new Float32Array(nVerts * 3)
  const indices: number[] = []

  for (let i = 0; i < nOval; i++) {
    indices.push(0, i + 1, ((i + 1) % nOval) + 1)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setIndex(indices)

  const mat = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide })

  const mesh = new THREE.Mesh(geo, mat)
  mesh.renderOrder = 1
  mesh.frustumCulled = false
  return mesh
}

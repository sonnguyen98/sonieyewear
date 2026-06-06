/** Landmark indices for key facial features (MediaPipe 468-point face mesh). */
export const LM = {
  leftEyeOuter:  33,
  rightEyeOuter: 263,
  leftEyeInner:  133,
  rightEyeInner: 362,
  leftTemple:    127,
  rightTemple:   356,
  leftCheek:     234,
  rightCheek:    454,
  forehead:      10,
  chin:          175,
  noseBridge:    168,
  noseTip:       1,
} as const

/** 36 landmarks tracing the face oval contour — used by the dynamic face occluder. */
export const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172,  58, 132,  93, 234, 127, 162,  21,  54, 103,  67, 109,
] as const

/** Calibration parameters — adjust to fine-tune glasses fit. */
export const CFG = {
  refHeadWidth:   140,   // Reference head width (px) for scale normalization
  refFaceHeight:  210,   // Reference face height (px)
  glassesDepth:    10,   // Z-offset: glasses in front of the face
  glassesDown:      2,   // Y-offset: push slightly downward
  glassesCenterX:   0,   // X-offset: horizontal fine-tuning
  glassesScale:  1.22,   // Overall scale multiplier
} as const

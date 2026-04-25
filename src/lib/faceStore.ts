// Lưu ảnh khuôn mặt + landmarks vào sessionStorage
// Chỉ thay đổi khi khách hàng chụp ảnh mới

const PHOTO_KEY = 'soni_face_photo'
const LANDMARKS_KEY = 'soni_face_landmarks'

export function saveFacePhoto(dataUrl: string) {
  try { sessionStorage.setItem(PHOTO_KEY, dataUrl) } catch {}
}

export function getFacePhoto(): string | null {
  try { return sessionStorage.getItem(PHOTO_KEY) } catch { return null }
}

export function saveFaceLandmarks(landmarks: unknown) {
  try { sessionStorage.setItem(LANDMARKS_KEY, JSON.stringify(landmarks)) } catch {}
}

export function getFaceLandmarks(): unknown[] | null {
  try {
    const raw = sessionStorage.getItem(LANDMARKS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearFaceData() {
  try {
    sessionStorage.removeItem(PHOTO_KEY)
    sessionStorage.removeItem(LANDMARKS_KEY)
  } catch {}
}

export function hasFaceData(): boolean {
  try { return !!sessionStorage.getItem(PHOTO_KEY) } catch { return false }
}

export const MAX_SOURCE_BYTES = 10 * 1024 * 1024 // 10 MB, checked before decoding
export const MAX_EDGE = 512
export const JPEG_QUALITY = 0.7

// Validates, downscales and re-encodes a selected image file entirely in the
// browser. Never throws — resolves { ok: true, dataUrl } or
// { ok: false, error: 'too_large' | 'unsupported' | 'unknown' }.
export function processImageFile(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ ok: false, error: 'unsupported' })
      return
    }

    // Size is checked first so an oversized file is rejected before any
    // decode buffer is allocated.
    if (file.size > MAX_SOURCE_BYTES) {
      resolve({ ok: false, error: 'too_large' })
      return
    }

    const reader = new FileReader()

    reader.onerror = () => resolve({ ok: false, error: 'unsupported' })

    reader.onload = () => {
      const img = new Image()

      img.onerror = () => resolve({ ok: false, error: 'unsupported' })

      img.onload = () => {
        try {
          const longEdge = Math.max(img.width, img.height)
          const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1
          const width = Math.max(1, Math.round(img.width * scale))
          const height = Math.max(1, Math.round(img.height * scale))

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve({ ok: false, error: 'unknown' })
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)

          if (!dataUrl || dataUrl === 'data:,') {
            resolve({ ok: false, error: 'unknown' })
            return
          }

          resolve({ ok: true, dataUrl })
        } catch {
          resolve({ ok: false, error: 'unknown' })
        }
      }

      img.src = reader.result
    }

    reader.readAsDataURL(file)
  })
}

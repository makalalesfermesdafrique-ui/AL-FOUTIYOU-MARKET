import { supabase } from './supabase'

export type Processed = { full: Blob; thumb: Blob; ext: 'webp' | 'jpg'; preview: string }
const OK = ['image/jpeg', 'image/png', 'image/webp']

async function enc(bmp: ImageBitmap, max: number, q: number): Promise<{ blob: Blob; ext: 'webp' | 'jpg' }> {
  const r = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  const get = (t: string) => new Promise<Blob | null>((res) => c.toBlob(res, t, q))
  const w = await get('image/webp')
  if (w && w.type === 'image/webp') return { blob: w, ext: 'webp' }
  const j = await get('image/jpeg')
  if (!j) throw new Error("Impossible de traiter cette photo.")
  return { blob: j, ext: 'jpg' }
}
export async function processImage(file: File): Promise<Processed> {
  if (!OK.includes(file.type)) throw new Error(`« ${file.name} » : format non pris en charge (JPEG, PNG ou WebP).`)
  if (file.size > 20 * 1024 * 1024) throw new Error(`« ${file.name} » : photo trop volumineuse (20 Mo maximum).`)
  let bmp: ImageBitmap
  try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }) } catch { throw new Error(`« ${file.name} » : image illisible.`) }
  const f = await enc(bmp, 1800, 0.8), t = await enc(bmp, 600, 0.75)
  bmp.close()
  return { full: f.blob, thumb: t.blob, ext: f.ext, preview: URL.createObjectURL(t.blob) }
}
export const uid = () => crypto.randomUUID()
export const pubUrl = (path: string) => supabase.storage.from('listing-images').getPublicUrl(path).data.publicUrl
export async function sha256(s: string) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('')
}
export async function upload(bucket: string, path: string, blob: Blob) {
  const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type, upsert: false, cacheControl: '31536000' })
  if (error) throw new Error('Envoi de la photo impossible : ' + error.message)
}

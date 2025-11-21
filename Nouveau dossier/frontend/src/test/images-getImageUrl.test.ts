import { getImageUrl, getProductImageUrl } from '@/lib/images'

// Ensure backend URL origin is consistent for tests
const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('getImageUrl', () => {
  it('returns placeholder for null/undefined/empty', () => {
    expect(getImageUrl(null)).toBe('/placeholder-product.svg')
    expect(getImageUrl(undefined)).toBe('/placeholder-product.svg')
    // empty string is falsy -> placeholder
    // @ts-expect-error intentionally passing empty string
    expect(getImageUrl('')).toBe('/placeholder-product.svg')
  })

  it('keeps /files path as-is', () => {
    expect(getImageUrl('/files/image.jpg')).toBe('/files/image.jpg')
  })

  it('normalizes paths starting with files/ to /files/', () => {
    expect(getImageUrl('files/image.jpg')).toBe('/files/image.jpg')
    expect(getImageUrl('files//image.jpg')).toBe('/files/image.jpg')
  })
  it('converts backend absolute URLs to relative /files paths', () => {
    expect(getImageUrl('http://localhost:3001/files/image.jpg')).toBe('/files/image.jpg')
  })

  it('strips /api/v1 prefix for backend absolute URLs', () => {
    expect(getImageUrl('http://localhost:3001/api/v1/files/image.jpg')).toBe('/files/image.jpg')
  })

  it('keeps different-origin absolute URLs intact (but normalizes)', () => {
    expect(getImageUrl('https://cdn.example.com/files/image.jpg')).toBe('https://cdn.example.com/files/image.jpg')
    expect(
      getImageUrl('https://cdn.example.com/files/files//nested/image.jpg')
    ).toBe('https://cdn.example.com/files/nested/image.jpg')
  })

  it('collapses duplicate /files segments', () => {
    expect(getImageUrl('http://localhost:3001/files/files/image.jpg')).toBe('/files/image.jpg')
    expect(getImageUrl('/files//files/image.jpg')).toBe('/files/image.jpg')
  })
  it('decodes entity-encoded paths (CSR branch)', () => {
    const encoded = '&#x2F;files&#x2F;image.jpg'
    expect(getImageUrl(encoded)).toBe('/files/image.jpg')
  })


  it('prefixes bare filenames with /files/', () => {
    expect(getImageUrl('image.jpg')).toBe('/files/image.jpg')
  })

  it('handles product helper getProductImageUrl()', () => {
    const product = { images: [{ url: '/files/p1.jpg' }] }
    expect(getProductImageUrl(product)).toBe('/files/p1.jpg')
    expect(getProductImageUrl({ images: [] })).toBe('/placeholder-product.svg')
    expect(getProductImageUrl(null)).toBe('/placeholder-product.svg')
  })
})

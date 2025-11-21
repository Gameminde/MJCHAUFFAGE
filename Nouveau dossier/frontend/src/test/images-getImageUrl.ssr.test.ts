/* @jest-environment node */
import { getImageUrl } from '@/lib/images'

// Ensure backend URL origin is consistent for tests
const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:3001'
})

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('getImageUrl (SSR fallback)', () => {
  it('decodes entity-encoded paths without window/document', () => {
    const encoded = '&#x2F;files&#x2F;ssr-image.jpg'
    // In SSR branch, we use a simple replacement for common entities
    expect(getImageUrl(encoded)).toBe('/files/ssr-image.jpg')
  })
})

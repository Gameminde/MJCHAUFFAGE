import { getImageUrl } from '../images';
import { vi } from 'vitest';

// Mock jest with vi
global.jest = vi;

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('getImageUrl', () => {
  it('returns placeholder for undefined/null input', () => {
    expect(getImageUrl(undefined)).toBe('/placeholder-product.svg');
    expect(getImageUrl(null)).toBe('/placeholder-product.svg');
    expect(getImageUrl('')).toBe('/placeholder-product.svg');
  });

  it('returns absolute URLs unchanged', () => {
    const absoluteUrl = 'https://example.com/image.jpg';
    expect(getImageUrl(absoluteUrl)).toBe(absoluteUrl);

    const httpUrl = 'http://example.com/image.jpg';
    expect(getImageUrl(httpUrl)).toBe(httpUrl);
  });

  it('handles paths starting with /files correctly', () => {
    const relativePath = '/files/image.jpg';
    expect(getImageUrl(relativePath)).toBe('/files/image.jpg');
  });

  it('converts other relative paths to /files prefixed URLs', () => {
    const relativePath = 'image.jpg';
    expect(getImageUrl(relativePath)).toBe('/files/image.jpg');

    const pathWithoutSlash = 'images/product.jpg';
    expect(getImageUrl(pathWithoutSlash)).toBe('/files/images/product.jpg');
  });

  it('handles paths that already start with /files/ correctly', () => {
    const alreadyCorrectPath = '/files/images/product.jpg';
    expect(getImageUrl(alreadyCorrectPath)).toBe('/files/images/product.jpg');
  });

  it('decodes HTML entities in image URLs', () => {
    // Test &#x2F; decoding to /
    const encodedUrl = '/files/&#x2F;images&#x2F;product.jpg';
    expect(getImageUrl(encodedUrl)).toBe('/files/images/product.jpg');

    // Test &amp; decoding to &
    const urlWithAmp = '/files/images&amp;product.jpg';
    expect(getImageUrl(urlWithAmp)).toBe('/files/images&product.jpg');
  });

  it('handles double /files/ prefixes correctly', () => {
    const doublePrefixUrl = '/files//files/images/product.jpg';
    expect(getImageUrl(doublePrefixUrl)).toBe('/files/images/product.jpg');
  });

  it('works with relative paths', () => {
    const relativePath = '/files/image.jpg';
    expect(getImageUrl(relativePath)).toBe('/files/image.jpg');
  });

  it('handles complex encoded URLs', () => {
    const complexUrl = '/files/&#x2F;products&#x2F;item&amp;name.jpg';
    expect(getImageUrl(complexUrl)).toBe('/files/products/item&name.jpg');
  });

  it('handles URLs with query parameters', () => {
    const urlWithQuery = '/files/image.jpg?w=300&h=300';
    expect(getImageUrl(urlWithQuery)).toBe('/files/image.jpg?w=300&h=300');
  });

  it('handles URLs with fragments', () => {
    const urlWithFragment = '/files/image.jpg#anchor';
    expect(getImageUrl(urlWithFragment)).toBe('/files/image.jpg#anchor');
  });

  it('handles URLs with special characters', () => {
    const urlWithSpecialChars = '/files/image with spaces.jpg';
    expect(getImageUrl(urlWithSpecialChars)).toBe('/files/image with spaces.jpg');
  });

  it('handles URLs with encoded spaces', () => {
    const urlWithEncodedSpaces = '/files/image%20with%20spaces.jpg';
    expect(getImageUrl(urlWithEncodedSpaces)).toBe('/files/image%20with%20spaces.jpg');
  });
});

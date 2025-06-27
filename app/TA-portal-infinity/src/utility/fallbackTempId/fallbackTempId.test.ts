import { describe, it, expect } from 'vitest';
import { fallbackTempId } from './fallbackTempId'; // adjust the path as needed

describe('fallbackTempId', () => {
  const FORMAT = /^tmp-[0-9a-z]+-[0-9a-z]{6}$/;

  it('generates an ID in the expected format', () => {
    const id = fallbackTempId();

    expect(typeof id).toBe('string');
    expect(id).toMatch(FORMAT);
  });

  it('returns a fresh, unique ID each time', () => {
    const ITERATIONS = 10;
    const ids = new Set<string>();

    for (let i = 0; i < ITERATIONS; i++) {
      ids.add(fallbackTempId());
    }

    expect(ids.size).toBe(ITERATIONS);
  });
});

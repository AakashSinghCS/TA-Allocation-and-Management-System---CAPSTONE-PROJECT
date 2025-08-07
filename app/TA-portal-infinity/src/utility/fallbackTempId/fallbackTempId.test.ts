import { describe, it, expect } from 'vitest';
import { fallbackTempId, toObjectWithTempId } from './fallbackTempId'; // adjust the path as needed

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

describe('toObjectWithTempId', () => {
  const FORMAT = /^tmp-[0-9a-z]+-[0-9a-z]{6}$/;

  it('adds tempId to each object in array', () => {
    const items = [
      { name: 'item1', value: 1 },
      { name: 'item2', value: 2 }
    ];

    const result = toObjectWithTempId(items);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'item1', value: 1, tempId: expect.any(String) });
    expect(result[1]).toEqual({ name: 'item2', value: 2, tempId: expect.any(String) });
    expect(result[0].tempId).toMatch(FORMAT);
    expect(result[1].tempId).toMatch(FORMAT);
  });

  it('generates unique tempIds for each item', () => {
    const items = [
      { name: 'item1' },
      { name: 'item2' },
      { name: 'item3' }
    ];

    const result = toObjectWithTempId(items);
    const tempIds = result.map(item => item.tempId);

    expect(new Set(tempIds).size).toBe(3); // All unique
  });

  it('returns empty array when input is null', () => {
    const result = toObjectWithTempId(null);

    expect(result).toEqual([]);
  });

  it('returns empty array when input is undefined', () => {
    const result = toObjectWithTempId(undefined as any);

    expect(result).toEqual([]);
  });

  it('handles empty array', () => {
    const result = toObjectWithTempId([]);

    expect(result).toEqual([]);
  });

  it('preserves original object properties', () => {
    const items = [
      { id: 1, name: 'test', nested: { value: 'deep' } }
    ];

    const result = toObjectWithTempId(items);

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('test');
    expect(result[0].nested).toEqual({ value: 'deep' });
    expect(result[0].tempId).toMatch(FORMAT);
  });
});

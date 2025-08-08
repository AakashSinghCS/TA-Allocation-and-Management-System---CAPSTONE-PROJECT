import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('updates debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update the value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should still be initial immediately after update
    expect(result.current).toBe('initial');

    // Fast forward time by delay amount
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('cancels previous timer when value changes again quickly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // First update
    rerender({ value: 'first', delay: 500 });
    
    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    expect(result.current).toBe('initial'); // Should still be initial

    // Second update before first timer completes
    rerender({ value: 'second', delay: 500 });

    // Advance time by remaining of first timer
    act(() => {
      vi.advanceTimersByTime(250);
    });
    
    expect(result.current).toBe('initial'); // Should still be initial as first timer was cancelled

    // Complete the second timer
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current).toBe('second'); // Now should be second
  });

  it('works with different data types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );

    expect(numberResult.current).toBe(0);

    numberRerender({ value: 42, delay: 300 });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(numberResult.current).toBe(42);

    // Test with object
    const initialObj = { name: 'test' };
    const updatedObj = { name: 'updated' };
    
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 200 } }
    );

    expect(objectResult.current).toBe(initialObj);

    objectRerender({ value: updatedObj, delay: 200 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(objectResult.current).toBe(updatedObj);
  });

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    rerender({ value: 'updated', delay: 1000 });

    // Should not update after short time
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial');

    // Should update after full delay
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(result.current).toBe('updated');
  });

  it('updates delay dynamically', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 100 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });
});

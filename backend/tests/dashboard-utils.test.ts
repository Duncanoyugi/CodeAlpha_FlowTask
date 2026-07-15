import { describe, expect, it } from 'vitest';
import { calculateCompletionRate, formatRelativeTime } from '../src/modules/dashboard/dashboard.utils';

describe('dashboard utils', () => {
  it('computes completion rate as a rounded percentage', () => {
    expect(calculateCompletionRate(10, 4)).toBe(40);
    expect(calculateCompletionRate(0, 0)).toBe(0);
  });

  it('formats recent timestamps into a human-readable string', () => {
    const now = new Date('2026-07-02T12:00:00.000Z');
    const then = new Date('2026-07-02T11:30:00.000Z');

    expect(formatRelativeTime(then, now)).toBe('30m ago');
  });
});

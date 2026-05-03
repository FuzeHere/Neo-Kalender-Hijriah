import { describe, it, expect } from 'vitest';
import { getHijriDateParts, getHijriMonthName, formatHijriDate } from './utils';

describe('utils.js', () => {
  it('should get correct Hijri date parts for known date', () => {
    const parts = getHijriDateParts(new Date('2024-03-12T12:00:00Z'));
    expect(parts).toHaveProperty('day');
    expect(parts).toHaveProperty('month');
    expect(parts).toHaveProperty('year');
    expect(typeof parts.day).toBe('number');
    expect(typeof parts.month).toBe('number');
    expect(typeof parts.year).toBe('number');
  });

  it('should return correct Hijri month name', () => {
    expect(getHijriMonthName(1)).toBe('Muharram');
    expect(getHijriMonthName(9)).toBe('Ramadhan');
    expect(getHijriMonthName(12)).toBe('Dzulhijjah');
    expect(getHijriMonthName(13)).toBe('');
  });

  it('should format Hijri date as a string', () => {
    const formatted = formatHijriDate(new Date('2024-03-12T12:00:00Z'));
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/\d+\s+[\w\s']+\s+\d+\s+H/);
  });
});

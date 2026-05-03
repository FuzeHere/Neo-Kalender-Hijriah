import { describe, it, expect } from 'vitest';
import { FASTS, IBADAH, isForbiddenFastingDay } from './data';

describe('data.js - Fasting Rules', () => {
  const findFast = (id) => FASTS.find(f => f.id === id);

  it('isForbiddenFastingDay returns true for Idul Fitri (1 Syawal)', () => {
    expect(isForbiddenFastingDay({ day: 1, month: 10, year: 1445 })).toBe(true);
  });

  it('isForbiddenFastingDay returns true for Idul Adha (10 Dzulhijjah)', () => {
    expect(isForbiddenFastingDay({ day: 10, month: 12, year: 1445 })).toBe(true);
  });

  it('isForbiddenFastingDay returns true for Hari Tasyrik (11-13 Dzulhijjah)', () => {
    expect(isForbiddenFastingDay({ day: 11, month: 12, year: 1445 })).toBe(true);
    expect(isForbiddenFastingDay({ day: 12, month: 12, year: 1445 })).toBe(true);
    expect(isForbiddenFastingDay({ day: 13, month: 12, year: 1445 })).toBe(true);
  });

  it('isForbiddenFastingDay returns false for regular days', () => {
    expect(isForbiddenFastingDay({ day: 5, month: 1, year: 1445 })).toBe(false);
  });

  it('Ramadhan check correctly identifies month 9', () => {
    const ramadhan = findFast('ramadhan');
    expect(ramadhan.check(new Date(), { day: 1, month: 9, year: 1445 })).toBe(true);
    expect(ramadhan.check(new Date(), { day: 1, month: 8, year: 1445 })).toBe(false);
  });

  it('Ayyamul Bidh checks 13, 14, 15 but ignores Ramadhan and forbidden days', () => {
    const ayyamulBidh = findFast('ayyamul-bidh');
    // Normal month
    expect(ayyamulBidh.check(new Date(), { day: 13, month: 1, year: 1445 })).toBe(true);
    expect(ayyamulBidh.check(new Date(), { day: 14, month: 1, year: 1445 })).toBe(true);
    expect(ayyamulBidh.check(new Date(), { day: 15, month: 1, year: 1445 })).toBe(true);
    // Ramadhan (month 9) -> shouldn't show Ayyamul Bidh as it's Wajib
    expect(ayyamulBidh.check(new Date(), { day: 13, month: 9, year: 1445 })).toBe(false);
    // Dzulhijjah (month 12) -> 13 is Tasyrik
    expect(ayyamulBidh.check(new Date(), { day: 13, month: 12, year: 1445 })).toBe(false);
    // Dzulhijjah 14 is fine
    expect(ayyamulBidh.check(new Date(), { day: 14, month: 12, year: 1445 })).toBe(true);
  });

  it('Senin-Kamis check works for Monday(1) and Thursday(4)', () => {
    const seninKamis = findFast('senin-kamis');
    // 2024-03-04 is a Monday
    const monday = new Date('2024-03-04T12:00:00Z');
    expect(seninKamis.check(monday, { day: 23, month: 8, year: 1445 })).toBe(true);
    
    // 2024-03-07 is a Thursday
    const thursday = new Date('2024-03-07T12:00:00Z');
    expect(seninKamis.check(thursday, { day: 26, month: 8, year: 1445 })).toBe(true);

    // 2024-03-06 is a Wednesday
    const wednesday = new Date('2024-03-06T12:00:00Z');
    expect(seninKamis.check(wednesday, { day: 25, month: 8, year: 1445 })).toBe(false);
  });
});

describe('data.js - Ibadah Rules', () => {
  it('Jumat check works for Fridays', () => {
    const jumat = IBADAH.find(i => i.id === 'jumat');
    // 2024-03-08 is a Friday
    expect(jumat.check(new Date('2024-03-08T12:00:00Z'))).toBe(true);
    // 2024-03-09 is a Saturday
    expect(jumat.check(new Date('2024-03-09T12:00:00Z'))).toBe(false);
  });

  it('Dhuha check is true for every day', () => {
    const dhuha = IBADAH.find(i => i.id === 'dhuha');
    expect(dhuha.check()).toBe(true);
  });
});

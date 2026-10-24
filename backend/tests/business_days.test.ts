import { describe, it, expect } from 'vitest';
import { calculateBusinessDaysSinceShipping, calculateDaysSincePurchase, ANCHOR_DATE } from '../src/utils/dateUtils.js';

describe('Unit Tests: business_days_since_shipping (Reference Date: 2026-10-24)', () => {
  it('Reference anchor date is verified as 2026-10-24', () => {
    expect(ANCHOR_DATE).toBe('2026-10-24');
  });

  it('Calculates exact business days for shipping date 2026-10-08 as of 2026-10-24 -> exactly 11 business days', () => {
    // 2026-10-08 was Thursday
    // Business days counted:
    // - Week 1: Oct 9 (Fri) -> 1
    // - Week 2: Oct 12, 13, 14, 15, 16 (Mon-Fri) -> 5
    // - Week 3: Oct 19, 20, 21, 22, 23 (Mon-Fri) -> 5
    // Oct 24 is Saturday (not counted)
    // Total = 1 + 5 + 5 = 11 business days (> 10 business days, triggers free re-ship or full refund per POL-DELIVERY-01)
    const result = calculateBusinessDaysSinceShipping('2026-10-08', '2026-10-24');
    expect(result).toBe(11);
  });

  it('Calculates exact business days for shipping date 2026-10-14 as of 2026-10-24 -> exactly 7 business days', () => {
    // 2026-10-14 was Wednesday
    // Business days counted:
    // - Week 1: Oct 15 (Thu), Oct 16 (Fri) -> 2
    // - Week 2: Oct 19, 20, 21, 22, 23 (Mon-Fri) -> 5
    // Oct 24 is Saturday (not counted)
    // Total = 2 + 5 = 7 business days (= 7 business days, triggers carrier investigation / In Progress per POL-DELIVERY-01)
    const result = calculateBusinessDaysSinceShipping('2026-10-14', '2026-10-24');
    expect(result).toBe(7);
  });

  it('Calculates calendar days since purchase for 2026-10-20 as of 2026-10-24 -> 4 calendar days', () => {
    const result = calculateDaysSincePurchase('2026-10-20', '2026-10-24');
    expect(result).toBe(4);
  });
});

export const ANCHOR_DATE = '2026-10-24';

/**
 * Calculates calendar days elapsed between purchaseDate and anchorDate (defaults to 2026-10-24).
 * Returns anchorDate - purchaseDate in integer days.
 */
export function calculateDaysSincePurchase(
  purchaseDateStr: string,
  anchorDateStr: string = ANCHOR_DATE
): number {
  const [y1, m1, d1] = purchaseDateStr.split('-').map(Number);
  const [y2, m2, d2] = anchorDateStr.split('-').map(Number);
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.floor((t2 - t1) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates business days elapsed between shippingDate and anchorDate (defaults to 2026-10-24).
 * Excludes weekends (Saturday = 6, Sunday = 0).
 * Does not count the shipping date itself (day 0); counting begins the following day up to and including anchorDate.
 *
 * For anchorDate = 2026-10-24:
 * - shippingDate = 2026-10-08 (Thu) -> 11 business days
 * - shippingDate = 2026-10-14 (Wed) -> 7 business days
 */
export function calculateBusinessDaysSinceShipping(
  shippingDateStr: string,
  anchorDateStr: string = ANCHOR_DATE
): number {
  const [y1, m1, d1] = shippingDateStr.split('-').map(Number);
  const [y2, m2, d2] = anchorDateStr.split('-').map(Number);
  const cur = new Date(Date.UTC(y1, m1 - 1, d1));
  const end = new Date(Date.UTC(y2, m2 - 1, d2));

  let businessDays = 0;
  while (cur < end) {
    cur.setUTCDate(cur.getUTCDate() + 1);
    const dayOfWeek = cur.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }

  return businessDays;
}

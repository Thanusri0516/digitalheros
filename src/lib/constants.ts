/** Amounts in INR minor units (paise). Stripe requires ~$0.50 USD equivalent; very low INR totals can fail. */
export const PRICING = {
  monthlyCents: 5000,
  yearlyCents: 29000,
};

/**
 * Each subscription payment is split for accounting: prize pool, charity, platform.
 * Prize pool share is fixed; charity share is user-chosen within bounds (remainder = platform).
 */
export const REVENUE_SPLIT = {
  prizePoolPercent: 40,
  /** Default charity slice when user has not raised it (matches minimum). */
  charityPercentDefault: 10,
} as const;

/** Voluntary charity increase (PRD: min 10%, user may give more — taken from platform slice). */
export const CHARITY_PERCENT = {
  min: 10,
  max: 40,
  default: 10,
} as const;

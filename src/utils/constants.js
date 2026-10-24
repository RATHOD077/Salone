// ─── App-wide constants (Pure Frontend - Direct Configuration) ───────────────
// No .env file required. All configuration is set directly here.

/** Google Maps review URL for Hair Craft Family Salon */
export const GOOGLE_REVIEW_URL = 'https://maps.app.goo.gl/feNbzPtZsLr6Skra6';

/** Salon Branding */
export const SALON_NAME = 'Hair Craft Family Salon';
export const SALON_TAGLINE = 'Your Style, Our Craft';

/**
 * App URL: Dynamically resolves to the current domain wherever hosted
 * (GitHub Pages, Vercel, Netlify, custom domain, or localhost)
 */
export const APP_URL =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

/**
 * Star threshold:
 * - Below 3 stars (< 3): Internal private salon feedback
 * - 3 stars or above (>= 3): Redirects to Google Reviews
 */
export const POSITIVE_THRESHOLD = 3;

/** Milliseconds before redirect actions */
export const REDIRECT_DELAY_MS = 3000;

/** Route constants */
export const ROUTES = {
  START:    '/',          // Starting page shows the Salon QR / Barcode Standee
  HOME:     '/',          // Alias
  QR:       '/',          // Barcode page
  REVIEW:   '/review',    // Customer rating and review composition (QR destination)
  FEEDBACK: '/feedback',  // Internal feedback form (< 3 stars)
  REDIRECT: '/redirect',  // Google Maps review composer (>= 3 stars)
  THANKYOU: '/thankyou',  // Thank you confirmation
  SCAN:     '/scan',      // Camera scanner tool
};

/** Rating label map */
export const RATING_LABELS = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

/** Quick compliment chips for Google review */
export const QUICK_TAGS = [
  '✂️ Great Haircut',
  '💆 Super Relaxing',
  '✨ Clean & Hygienic',
  '⭐ Friendly Staff',
  '🎨 Amazing Styling',
  '💯 Highly Recommended',
];

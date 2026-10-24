// ─── App-wide constants (Pure Frontend - Direct Configuration) ───────────────
// No .env file required. All configuration is set directly here.

/** Backend API URL (Default to deployed Render backend) */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'https://salone-1-91bd.onrender.com').replace(/\/$/, '');

/** Google Maps review URL for Hair Craft Family Salon */
export const GOOGLE_REVIEW_URL = 'https://maps.app.goo.gl/feNbzPtZsLr6Skra6';

/** Salon Branding */
export const SALON_NAME = 'Hair Craft Family Salon';
export const SALON_TAGLINE = 'Your Style, Our Craft';

/**
 * App URL: Dynamically resolves to current domain (https://salone-one.vercel.app)
 */
export const APP_URL =
  typeof window !== 'undefined' ? window.location.origin : 'https://salone-one.vercel.app';

/**
 * Star threshold:
 * - Below 3 stars (< 3): Internal private salon feedback
 * - 3 stars or above (>= 3): Redirects directly to Google Reviews
 */
export const POSITIVE_THRESHOLD = 3;

/** Milliseconds before redirect actions */
export const REDIRECT_DELAY_MS = 3000;

/** Route constants */
export const ROUTES = {
  HOME:     '/',          // Root URL directly goes to the Review page!
  REVIEW:   '/',          // Direct Review entry point
  QR:       '/qr',        // Salon counter QR standee
  FEEDBACK: '/feedback',  // Internal feedback form (< 3 stars)
  REDIRECT: '/redirect',  // Google Maps review redirect (>= 3 stars)
  THANKYOU: '/thankyou',  // Thank you confirmation
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

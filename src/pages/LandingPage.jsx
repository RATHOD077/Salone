import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';
import StarRating from '../components/StarRating';
import { useRatingRouter } from '../hooks/useRatingRouter';
import { SALON_NAME, SALON_TAGLINE, ROUTES } from '../utils/constants';

/**
 * LandingPage
 *
 * The direct Review screen that customers see when opening the link.
 * Shows the salon brand and 5-star rating interface.
 * - Below 3 stars (< 3): Lands on internal private feedback form
 * - 3 stars or above (>= 3): Redirects directly to Google Reviews
 */
export default function LandingPage() {
  const { handleRatingSelect } = useRatingRouter();

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* ── Header / Brand ─────────────────────────────────────── */}
        <header className="flex flex-col items-center gap-4">
          {/* Logo circle */}
          <div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-salon-500 to-salon-700
                       flex items-center justify-center shadow-xl shadow-salon-200"
            aria-label={`${SALON_NAME} logo`}
          >
            <Scissors size={36} className="text-white" />
          </div>

          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-gray-800 leading-tight">
              {SALON_NAME}
            </h1>
            <p className="text-salon-500 text-sm font-medium tracking-wide mt-1">
              {SALON_TAGLINE}
            </p>
          </div>
        </header>

        {/* ── Rating Card ────────────────────────────────────────── */}
        <main>
          <div className="card flex flex-col items-center gap-6 text-center">
            {/* Decorative accent */}
            <div className="w-10 h-1 rounded-full bg-gradient-to-r from-salon-300 to-salon-500" />

            <div className="flex flex-col gap-1">
              <h2 className="font-display text-xl font-semibold text-gray-800">
                How was your visit?
              </h2>
              <p className="text-gray-400 text-sm">
                Your feedback helps us serve you better
              </p>
            </div>

            {/* ⭐ Star Rating */}
            <StarRating onSelect={handleRatingSelect} />

            {/* Hint */}
            <p className="text-xs text-gray-400 mt-2">
              Tap a star to share your experience
            </p>
          </div>
        </main>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="flex flex-col items-center gap-2 text-center text-xs text-gray-400">
          <p>Powered by {SALON_NAME} ✨</p>
          <Link
            to={ROUTES.QR}
            className="text-[11px] text-gray-300 hover:text-salon-500 transition-colors"
          >
            Salon QR Standee
          </Link>
        </footer>

      </div>
    </div>
  );
}

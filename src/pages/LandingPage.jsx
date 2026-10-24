import { Link } from 'react-router-dom';
import { Scissors, Camera, QrCode } from 'lucide-react';
import StarRating from '../components/StarRating';
import { useRatingRouter } from '../hooks/useRatingRouter';
import { SALON_NAME, SALON_TAGLINE, ROUTES } from '../utils/constants';

/**
 * LandingPage
 *
 * The QR code entry point. Renders the salon brand and the star rating UI.
 * After star selection, useRatingRouter handles navigation based on threshold:
 * - Below 3 stars (< 3): Lands on internal salon feedback app
 * - 3 stars or above (>= 3): Redirects to salon's Google Maps review page
 */
export default function LandingPage() {
  const { handleRatingSelect } = useRatingRouter();

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* Barcode Standee Link */}
        <div className="flex items-center justify-end w-full px-1">
          <Link
            to={ROUTES.START}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-salon-600 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-pink-100 shadow-sm transition-all"
          >
            <QrCode size={14} className="text-salon-500" />
            View Barcode Standee
          </Link>
        </div>

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
        <footer className="text-center text-xs text-gray-400">
          Powered by {SALON_NAME} ✨
        </footer>

      </div>
    </div>
  );
}

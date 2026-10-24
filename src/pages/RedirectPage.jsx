import { useEffect } from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { GOOGLE_REVIEW_URL, SALON_NAME, RATING_LABELS } from '../utils/constants';
import { useReview } from '../context/ReviewContext';

/**
 * RedirectPage
 *
 * Shown when 3 stars or above are selected.
 * Immediately redirects the customer to the salon's Google Maps review page.
 */
export default function RedirectPage() {
  const { rating } = useReview();

  useEffect(() => {
    // Directly redirect to Google Review
    const timer = setTimeout(() => {
      window.location.href = GOOGLE_REVIEW_URL;
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const label = RATING_LABELS[rating] || 'Great';

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="card flex flex-col items-center gap-6 text-center p-6 sm:p-8">

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-100 text-white animate-bounce-star">
            <Sparkles size={32} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold text-gray-800">
              Thank You! 😊
            </h1>
            <p className="text-gray-500 text-sm">
              You rated us <strong className="text-amber-600">{label} ({rating || 5}★)</strong>.
              Redirecting you to our Google Review page...
            </p>
          </div>

          <a
            href={GOOGLE_REVIEW_URL}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            <span>Open Google Review Now</span>
          </a>

          <p className="text-xs text-gray-400">
            {SALON_NAME} ✨
          </p>

        </div>
      </div>
    </div>
  );
}

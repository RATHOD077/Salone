import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import PositiveReviewComposer from '../components/PositiveReviewComposer';
import { useReview } from '../context/ReviewContext';
import { ROUTES, SALON_NAME, RATING_LABELS } from '../utils/constants';

/**
 * RedirectPage
 *
 * Shown when the customer selects 3, 4, or 5 stars.
 * Captures the customer's review on the website and opens Google Review
 * so their review goes onto Google directly.
 */
export default function RedirectPage() {
  const navigate = useNavigate();
  const { rating } = useReview();

  // Guard: if accessed directly without rating, send back to review
  useEffect(() => {
    if (rating === null) {
      navigate(ROUTES.REVIEW, { replace: true });
    }
  }, [rating, navigate]);

  if (rating === null) return null;

  const label = RATING_LABELS[rating] || 'Great';

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto flex flex-col gap-5">

        {/* Top Back navigation */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.REVIEW)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-salon-600 transition-colors self-start"
        >
          <ArrowLeft size={14} />
          Change Rating
        </button>

        <div className="card flex flex-col items-center gap-6 p-6 sm:p-8">

          {/* Celebration Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-100 text-white animate-bounce-star">
              <Sparkles size={32} />
            </div>

            <h1 className="font-display text-2xl font-bold text-gray-800">
              Thank You! We're Thrilled! 😊
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm max-w-xs">
              You gave us a <strong className="text-amber-600">{label} ({rating}★)</strong> review.
              Share your experience on Google to help others find us!
            </p>
          </div>

          <div className="w-full border-t border-pink-50" />

          {/* Interactive Google Review Composer */}
          <PositiveReviewComposer />

          {/* Brand footer */}
          <p className="text-xs text-gray-300 text-center">
            {SALON_NAME} · We appreciate your honest review ✨
          </p>

        </div>
      </div>
    </div>
  );
}

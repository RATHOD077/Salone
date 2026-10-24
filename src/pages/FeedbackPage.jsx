import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircleWarning } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';
import { useReview } from '../context/ReviewContext';
import { ROUTES, SALON_NAME } from '../utils/constants';

/**
 * FeedbackPage
 *
 * Shown when the customer selects 1 or 2 stars.
 * Guards against direct URL access (no rating set → redirect home).
 */
export default function FeedbackPage() {
  const navigate = useNavigate();
  const { rating } = useReview();

  // ── Guard: must have arrived via star selection ─────────────────────────────
  useEffect(() => {
    if (rating === null) {
      navigate(ROUTES.REVIEW, { replace: true });
    }
  }, [rating, navigate]);

  if (rating === null) return null; // avoid flash while redirecting

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.REVIEW)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-salon-600
                     transition-colors self-start group"
          aria-label="Go back to rating"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Change rating
        </button>

        {/* Card */}
        <div className="card flex flex-col gap-6">

          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100
                         flex items-center justify-center"
            >
              <MessageCircleWarning size={28} className="text-orange-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gray-800">
                We're Sorry to Hear That
              </h1>
              <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                Help <strong className="text-gray-600">{SALON_NAME}</strong> improve.
                Your honest words matter to us.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-pink-50" />

          {/* Form */}
          <FeedbackForm />
        </div>

      </div>
    </div>
  );
}

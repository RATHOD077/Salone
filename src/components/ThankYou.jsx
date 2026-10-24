import { useNavigate } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';
import { ROUTES, SALON_NAME } from '../utils/constants';
import { useReview } from '../context/ReviewContext';

/**
 * ThankYou
 *
 * Final screen shown after a customer submits negative feedback.
 * Empathetic, warm messaging. Allows returning to home.
 */
export default function ThankYou() {
  const navigate = useNavigate();
  const { resetReview } = useReview();

  function handleReturnHome() {
    resetReview();
    navigate(ROUTES.HOME);
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Animated heart */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-salon-100 to-pink-200
                      flex items-center justify-center shadow-lg shadow-salon-100">
        <Heart
          size={40}
          className="text-salon-500 animate-pulse-soft"
          fill="#ec4899"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl font-bold text-gray-800">
          Thank You for Sharing
        </h2>
        <p className="text-gray-500 text-base leading-relaxed max-w-xs mx-auto">
          We're truly sorry your experience wasn't perfect.
          Your feedback has been received and a team member
          from <strong>{SALON_NAME}</strong> will reach out to make it right.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-pink-100" />

      <div className="flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={handleReturnHome}
          className="btn-secondary"
        >
          <Home size={18} />
          Back to Home
        </button>
      </div>
    </div>
  );
}

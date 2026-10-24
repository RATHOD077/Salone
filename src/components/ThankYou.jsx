import { useNavigate } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';
import { SALON_NAME } from '../utils/constants';
import { useReview } from '../context/ReviewContext';

/**
 * ThankYou
 *
 * Screen shown after a customer submits private feedback.
 * Clicking "Back to Home" resets review state and navigates to the home barcode page.
 */
export default function ThankYou() {
  const navigate = useNavigate();
  const { resetReview } = useReview();

  function handleReturnHome() {
    resetReview();
    navigate('/', { replace: true });
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
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          We're truly sorry your experience wasn't perfect.
          Your feedback has been received privately and our team
          from <strong className="text-gray-700">{SALON_NAME}</strong> will take action to make it right.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-pink-100" />

      <div className="flex flex-col gap-3 w-full">
        <button
          type="button"
          onClick={handleReturnHome}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Home size={18} />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}

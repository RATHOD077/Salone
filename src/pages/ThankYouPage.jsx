import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThankYou from '../components/ThankYou';
import { useReview } from '../context/ReviewContext';
import { ROUTES } from '../utils/constants';

/**
 * ThankYouPage
 *
 * Shown after feedback form submission. Guards against direct URL access.
 */
export default function ThankYouPage() {
  const navigate = useNavigate();
  const { rating } = useReview();

  // Guard: must have gone through the feedback flow
  useEffect(() => {
    if (rating === null) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [rating, navigate]);

  if (rating === null) return null;

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm mx-auto">
        <div className="card">
          <ThankYou />
        </div>
      </div>
    </div>
  );
}

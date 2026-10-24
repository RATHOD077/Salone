import { useNavigate } from 'react-router-dom';
import { useReview } from '../context/ReviewContext';
import { POSITIVE_THRESHOLD, ROUTES } from '../utils/constants';

/**
 * useRatingRouter
 *
 * Encapsulates the core business rule:
 *   rating < POSITIVE_THRESHOLD  → navigate to /feedback (capture complaint)
 *   rating >= POSITIVE_THRESHOLD → navigate to /redirect (send to Google)
 *
 * Returns:
 *   handleRatingSelect(starValue: number) — call this when user taps a star
 */
export function useRatingRouter() {
  const navigate = useNavigate();
  const { setRating } = useReview();

  function handleRatingSelect(starValue) {
    // Persist rating in context so downstream pages can read it
    setRating(starValue);

    if (starValue < POSITIVE_THRESHOLD) {
      // Negative / neutral experience → internal feedback form
      navigate(ROUTES.FEEDBACK, { state: { rating: starValue } });
    } else {
      // Positive experience → Google Maps review page
      navigate(ROUTES.REDIRECT, { state: { rating: starValue } });
    }
  }

  return { handleRatingSelect };
}

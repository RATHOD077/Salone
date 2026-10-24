import { useNavigate } from 'react-router-dom';
import { useReview } from '../context/ReviewContext';
import { POSITIVE_THRESHOLD, ROUTES, GOOGLE_REVIEW_URL } from '../utils/constants';

/**
 * useRatingRouter
 *
 * Direct Review Routing Rule:
 * - 1 or 2 stars (< 3): Lands directly on her app (private internal feedback form).
 *   Never goes to Google, protecting the salon's public rating.
 * - 3, 4, or 5 stars (>= 3): Redirects DIRECTLY to the salon's Google Maps review page!
 */
export function useRatingRouter() {
  const navigate = useNavigate();
  const { setRating } = useReview();

  function handleRatingSelect(starValue) {
    setRating(starValue);

    if (starValue < POSITIVE_THRESHOLD) {
      // 1 or 2 Stars -> Private feedback on her app
      navigate(ROUTES.FEEDBACK, { state: { rating: starValue } });
    } else {
      // 3, 4, or 5 Stars -> DIRECTLY redirect to Google Reviews!
      window.location.href = GOOGLE_REVIEW_URL;
    }
  }

  return { handleRatingSelect };
}

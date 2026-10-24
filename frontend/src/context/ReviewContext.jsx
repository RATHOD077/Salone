import { createContext, useContext, useState, useEffect } from 'react';

// ─── Context Definition ───────────────────────────────────────────────────────
const ReviewContext = createContext(null);

const STORAGE_KEY = 'salon_customer_reviews';

/**
 * ReviewProvider — wraps the app and provides shared review state.
 *
 * State:
 *   rating          : number | null   — selected star (1–5)
 *   feedback        : object          — { name, phone, message }
 *   positiveComment : string          — customer review for Google
 *   positiveTags    : string[]        — selected compliment tags
 *   savedReviews    : array           — local log of all reviews captured on the site
 */
export function ReviewProvider({ children }) {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState({ name: '', phone: '', message: '' });
  const [positiveComment, setPositiveComment] = useState('');
  const [positiveTags, setPositiveTags] = useState([]);
  const [savedReviews, setSavedReviews] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist reviews locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedReviews));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, [savedReviews]);

  function logReview(newReview) {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...newReview,
    };
    setSavedReviews((prev) => [entry, ...prev]);
  }

  function resetReview() {
    setRating(null);
    setFeedback({ name: '', phone: '', message: '' });
    setPositiveComment('');
    setPositiveTags([]);
  }

  const value = {
    rating,
    setRating,
    feedback,
    setFeedback,
    positiveComment,
    setPositiveComment,
    positiveTags,
    setPositiveTags,
    savedReviews,
    logReview,
    resetReview,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
}

/**
 * useReview — consume the ReviewContext.
 */
export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error('useReview must be used inside <ReviewProvider>');
  }
  return ctx;
}

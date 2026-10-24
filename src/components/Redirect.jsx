import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { GOOGLE_REVIEW_URL, REDIRECT_DELAY_MS } from '../utils/constants';

/**
 * Redirect
 *
 * Shows a countdown timer, then auto-redirects to Google Maps review page.
 * Also provides a manual "Review Now" button for users who don't wait.
 *
 * Props:
 *   onRedirect?: () => void  — optional callback after redirect fires
 */
export default function Redirect({ onRedirect }) {
  const totalSeconds = Math.round(REDIRECT_DELAY_MS / 1000);
  const [seconds, setSeconds] = useState(totalSeconds);
  const timerRef = useRef(null);

  // ── Auto-redirect logic ─────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          handleRedirect();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleRedirect() {
    clearInterval(timerRef.current);
    onRedirect?.();
    window.location.href = GOOGLE_REVIEW_URL;
  }

  // ── SVG countdown ring ──────────────────────────────────────────────────────
  const RADIUS = 36;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress = seconds / totalSeconds;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* Countdown SVG ring */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 88 88"
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx="44" cy="44" r={RADIUS}
            fill="none"
            stroke="#fce7f3"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="44" cy="44" r={RADIUS}
            fill="none"
            stroke="#ec4899"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        {/* Number in center */}
        <span
          className="text-3xl font-bold text-salon-600 tabular-nums"
          aria-live="polite"
          aria-label={`Redirecting in ${seconds} seconds`}
        >
          {seconds}
        </span>
      </div>

      <p className="text-gray-500 text-sm font-medium">
        Redirecting you to Google Reviews…
      </p>

      {/* Manual fallback */}
      <button
        type="button"
        onClick={handleRedirect}
        className="btn-primary"
      >
        <ExternalLink size={18} />
        Review Now
      </button>

      <p className="text-xs text-gray-400">
        If the page doesn't open automatically, tap the button above.
      </p>
    </div>
  );
}

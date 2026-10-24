import { useState } from 'react';
import { Star } from 'lucide-react';
import { RATING_LABELS } from '../utils/constants';

/**
 * StarRating
 *
 * Props:
 *   onSelect(rating: number) — fires when user clicks a star
 *   size?   : number  — px size of each star (default 52)
 *   disabled?: boolean
 */
export default function StarRating({ onSelect, size = 52, disabled = false }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);

  function handleClick(value) {
    if (disabled) return;
    setSelected(value);
    // Small delay so user sees the selection before navigation
    setTimeout(() => onSelect(value), 200);
  }

  const active = hovered || selected;
  const label = active ? RATING_LABELS[active] : 'Tap to rate';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stars Row */}
      <div
        className="flex items-center gap-2"
        role="radiogroup"
        aria-label="Star rating"
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= active;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected === value}
              aria-label={`${value} star${value > 1 ? 's' : ''} — ${RATING_LABELS[value]}`}
              className={`
                star-btn p-1 rounded-full focus:outline-none focus:ring-4 focus:ring-gold-400/40
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ width: size + 16, height: size + 16 }}
              onClick={() => handleClick(value)}
              onMouseEnter={() => !disabled && setHovered(value)}
              onMouseLeave={() => !disabled && setHovered(0)}
              disabled={disabled}
            >
              <Star
                size={size}
                className="transition-colors duration-100"
                fill={isFilled ? '#f59e0b' : 'transparent'}
                stroke={isFilled ? '#f59e0b' : '#d1d5db'}
                strokeWidth={isFilled ? 1.5 : 1.5}
              />
            </button>
          );
        })}
      </div>

      {/* Rating label */}
      <p
        className={`
          text-base font-semibold tracking-wide transition-all duration-200
          ${active ? 'text-salon-600 opacity-100' : 'text-gray-400 opacity-70'}
        `}
        aria-live="polite"
      >
        {label}
      </p>
    </div>
  );
}

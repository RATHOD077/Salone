import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Phone, MessageSquare, AlertCircle, Star } from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import { ROUTES } from '../utils/constants';

/**
 * FeedbackForm
 *
 * Collects name (optional), phone (optional), and a required message
 * from customers who gave < 3 stars.
 * On submit → navigates to /thankyou
 */
export default function FeedbackForm() {
  const navigate = useNavigate();
  const { rating, feedback, setFeedback, logReview } = useReview();

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!feedback.message.trim()) {
      errs.message = 'Please share what went wrong so we can improve.';
    }
    if (feedback.phone && !/^\+?[\d\s\-()]{7,15}$/.test(feedback.phone)) {
      errs.phone = 'Enter a valid phone number.';
    }
    return errs;
  }

  // ── Submit handler ──────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    const privateFeedback = {
      rating: rating || 1,
      type: 'negative_feedback',
      name: feedback.name.trim() || 'Anonymous',
      phone: feedback.phone.trim() || '',
      comment: feedback.message.trim(),
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(privateFeedback),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to send feedback.');
      logReview(privateFeedback);
    } catch (error) {
      console.error('[FeedbackForm] Could not store private feedback:', error);
      setErrors({ submit: 'We could not send your feedback. Please try again.' });
      setSubmitting(false);
      return;
    }

    await new Promise((r) => setTimeout(r, 600));

    setSubmitting(false);
    navigate(ROUTES.THANKYOU);
  }

  function handleChange(field, value) {
    setFeedback((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* Rating summary pill */}
      {rating && (
        <div className="flex items-center gap-2 self-start
                        bg-orange-50 border border-orange-200
                        px-3 py-1.5 rounded-full">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} size={14} fill="#f59e0b" stroke="#f59e0b" />
          ))}
          <span className="text-xs font-semibold text-orange-700">
            {rating} star{rating > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Name (optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <User size={14} />
            Your Name
            <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </span>
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Priya Sharma"
          value={feedback.name}
          onChange={(e) => handleChange('name', e.target.value)}
          maxLength={80}
        />
      </div>

      {/* Phone (optional) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Phone size={14} />
            Mobile Number
            <span className="text-gray-400 font-normal text-xs">(optional)</span>
          </span>
        </label>
        <input
          type="tel"
          className={`form-input ${errors.phone ? 'border-red-400' : ''}`}
          placeholder="+91 98765 43210"
          value={feedback.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          maxLength={20}
        />
        {errors.phone && <FieldError message={errors.phone} />}
      </div>

      {/* Message (required) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <MessageSquare size={14} />
            What could we do better?
            <span className="text-red-400 text-xs">*</span>
          </span>
        </label>
        <textarea
          className={`form-input resize-none h-28 ${errors.message ? 'border-red-400' : ''}`}
          placeholder="Tell us what went wrong — we genuinely want to make it right..."
          value={feedback.message}
          onChange={(e) => handleChange('message', e.target.value)}
          maxLength={500}
          rows={4}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.message
            ? <FieldError message={errors.message} />
            : <span />
          }
          <span className="text-xs text-gray-400 ml-auto">
            {feedback.message.length}/500
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn-primary mt-2"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Spinner />
            Sending…
          </>
        ) : (
          <>
            <Send size={18} />
            Send Feedback
          </>
        )}
      </button>
      {errors.submit && <p className="text-center text-sm text-red-500">{errors.submit}</p>}
    </form>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ message }) {
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

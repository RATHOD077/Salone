import { useState } from 'react';
import { ExternalLink, Copy, Check, Sparkles, Send, Star } from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import { GOOGLE_REVIEW_URL, SALON_NAME, QUICK_TAGS, RATING_LABELS } from '../utils/constants';

export default function PositiveReviewComposer() {
  const { rating, positiveComment, setPositiveComment, logReview } = useReview();
  const [copied, setCopied] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Default suggested comment based on rating
  const defaultText = `Had an amazing experience at ${SALON_NAME}! The stylists are extremely skilled, courteous, and attentive. Clean and welcoming ambience. Highly recommended! ⭐⭐⭐⭐⭐`;

  const currentComment = positiveComment || '';

  const handleTagToggle = (tag) => {
    let newTags;
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter((t) => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);

    // Append tag to review text if not already present
    const cleanTag = tag.replace(/^[^\w\s]+/, '').trim();
    if (!currentComment.includes(cleanTag)) {
      const updated = currentComment
        ? `${currentComment} · ${tag}`
        : `${tag}! Great service at ${SALON_NAME}.`;
      setPositiveComment(updated);
    }
  };

  const handleUseSuggested = () => {
    setPositiveComment(defaultText);
  };

  const handleSubmitToGoogle = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    const finalComment = currentComment.trim() || defaultText;

    // 1. Log review into website storage (so salon captures a record of the review on this site)
    logReview({
      rating: rating || 5,
      type: 'positive',
      name: customerName.trim() || 'Happy Customer',
      comment: finalComment,
      tags: selectedTags,
    });

    // 2. Automatically copy text to user's clipboard for instant paste on Google
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(finalComment);
      } else {
        const input = document.createElement('textarea');
        input.value = finalComment;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    // 3. Open Google Review URL in new tab / redirect
    setTimeout(() => {
      window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer') || (window.location.href = GOOGLE_REVIEW_URL);
      setIsSubmitting(false);
    }, 700);
  };

  return (
    <div className="w-full flex flex-col gap-5 text-left">
      {/* Rating Header */}
      <div className="flex items-center justify-between bg-gold-400/10 border border-gold-400/20 px-3.5 py-2 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <Star size={18} fill="#f59e0b" stroke="#f59e0b" />
          <span className="text-xs font-bold text-gray-800">
            {rating ? `${rating}-Star Rating` : '5-Star Rating'}
          </span>
          <span className="text-xs text-gold-500 font-semibold">
            ({RATING_LABELS[rating] || 'Excellent'})
          </span>
        </div>
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          ✓ Verified Visit
        </span>
      </div>

      {/* Compliments Quick Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Tap compliments to include in your Google review:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-salon-500 text-white border-salon-500 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-salon-300'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Text Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-700">
            Your Review Message:
          </label>
          <button
            type="button"
            onClick={handleUseSuggested}
            className="text-[11px] font-semibold text-salon-600 hover:text-salon-700 underline"
          >
            Use template
          </button>
        </div>
        <textarea
          rows={3}
          value={currentComment}
          onChange={(e) => setPositiveComment(e.target.value)}
          placeholder={`Write your experience with ${SALON_NAME} here...`}
          className="form-input text-sm resize-none"
        />
      </div>

      {/* Optional Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Your Name <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Rahul Sharma"
          className="form-input text-sm py-2"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleSubmitToGoogle}
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base shadow-lg shadow-pink-200"
        >
          {isSubmitting ? (
            <>
              <Sparkles size={18} className="animate-spin" />
              <span>Opening Google Reviews...</span>
            </>
          ) : copied ? (
            <>
              <Check size={18} className="text-green-300" />
              <span>Review Copied! Opening Google...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Post Review on Google</span>
            </>
          )}
        </button>

        <a
          href={GOOGLE_REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs font-medium text-gray-400 hover:text-salon-600 flex items-center justify-center gap-1.5 py-1"
        >
          <ExternalLink size={13} />
          Skip & open Google Maps directly
        </a>
      </div>

      {/* Helper guide */}
      <div className="bg-pink-50/70 border border-pink-100 rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
        <p className="font-semibold text-salon-700 mb-0.5 flex items-center gap-1">
          <Sparkles size={13} /> How it works:
        </p>
        Your review is recorded on this website and copied to your clipboard so you can paste and post it on Google with one tap!
      </div>
    </div>
  );
}

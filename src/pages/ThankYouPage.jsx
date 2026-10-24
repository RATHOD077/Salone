import ThankYou from '../components/ThankYou';

/**
 * ThankYouPage
 *
 * Shown after feedback form submission.
 * Always renders cleanly with zero blank screens.
 */
export default function ThankYouPage() {
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

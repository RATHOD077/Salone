import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReviewProvider } from './context/ReviewContext';
import ScannerPage    from './pages/ScannerPage';
import LandingPage    from './pages/LandingPage';
import FeedbackPage   from './pages/FeedbackPage';
import RedirectPage   from './pages/RedirectPage';
import ThankYouPage   from './pages/ThankYouPage';
import QRPage         from './pages/QRPage';
import { ROUTES }     from './utils/constants';

/**
 * App
 *
 * Senior Developer Flow:
 * 1. App starts at `/` with the live Camera QR Scanner.
 * 2. When the salon QR code is scanned (or customer taps "Give Review Directly"),
 *    it advances seamlessly to `/review` (the Star Rating screen).
 * 3. If rating is < 3 stars:
 *    Routes to `/feedback` (private complaint form, saved internally on site, never sent to Google).
 * 4. If rating is >= 3 stars:
 *    Routes to `/redirect` (Google Review composer, saves review on site, auto-copies to clipboard,
 *    and opens Google Maps review page for instant 1-tap submission).
 * 5. `/qr` displays and exports the high-resolution Salon QR Standee for print.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ReviewProvider>
        <Routes>
          {/* Starting screen: Scanner */}
          <Route path={ROUTES.START}     element={<ScannerPage />} />
          <Route path="/scan"            element={<ScannerPage />} />

          {/* Customer Rating & Review */}
          <Route path={ROUTES.REVIEW}    element={<LandingPage />} />
          <Route path="/rate"            element={<LandingPage />} />

          {/* < 3 Stars: Internal Private Feedback */}
          <Route path={ROUTES.FEEDBACK}  element={<FeedbackPage />} />

          {/* >= 3 Stars: Positive Google Review Composer & Redirect */}
          <Route path={ROUTES.REDIRECT}  element={<RedirectPage />} />

          {/* Confirmation Screen */}
          <Route path={ROUTES.THANKYOU}  element={<ThankYouPage />} />

          {/* Salon Counter QR Standee */}
          <Route path={ROUTES.QR}        element={<QRPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.START} replace />} />
        </Routes>
      </ReviewProvider>
    </BrowserRouter>
  );
}

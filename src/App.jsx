import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReviewProvider } from './context/ReviewContext';
import QRPage         from './pages/QRPage';
import LandingPage    from './pages/LandingPage';
import FeedbackPage   from './pages/FeedbackPage';
import RedirectPage   from './pages/RedirectPage';
import ThankYouPage   from './pages/ThankYouPage';
import ScannerPage    from './pages/ScannerPage';
import { ROUTES }     from './utils/constants';

/**
 * App Routing Architecture:
 * 1. `/` (First Screen): Shows ONLY the Salon QR Code / Barcode Standee!
 *    - Customers scan it with their phone camera to open `/review`.
 *    - Has a prominent "Rate Directly on this Device" button.
 * 2. `/review`: The Star Rating interface (1 to 5 stars).
 * 3. `< 3 Stars`: Lands on `/feedback` (Internal private form).
 * 4. `≥ 3 Stars`: Lands on `/redirect` (Auto-copies review and redirects to Google Maps).
 * 5. `/scan`: Optional live camera scanner tool.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ReviewProvider>
        <Routes>
          {/* Main Starting Screen: Barcode / QR Standee */}
          <Route path="/"                element={<QRPage />} />
          <Route path="/qr"              element={<QRPage />} />

          {/* Customer Rating & Review Page (QR scan destination) */}
          <Route path={ROUTES.REVIEW}    element={<LandingPage />} />
          <Route path="/rate"            element={<LandingPage />} />

          {/* < 3 Stars: Internal Private Feedback */}
          <Route path={ROUTES.FEEDBACK}  element={<FeedbackPage />} />

          {/* >= 3 Stars: Positive Review Composer & Google Redirect */}
          <Route path={ROUTES.REDIRECT}  element={<RedirectPage />} />

          {/* Confirmation Screen */}
          <Route path={ROUTES.THANKYOU}  element={<ThankYouPage />} />

          {/* Camera Scanner Tool */}
          <Route path="/scan"            element={<ScannerPage />} />

          {/* Fallback */}
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Routes>
      </ReviewProvider>
    </BrowserRouter>
  );
}

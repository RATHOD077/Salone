import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ReviewProvider } from './context/ReviewContext';
import LandingPage    from './pages/LandingPage';
import FeedbackPage   from './pages/FeedbackPage';
import RedirectPage   from './pages/RedirectPage';
import ThankYouPage   from './pages/ThankYouPage';
import QRPage         from './pages/QRPage';
import { ROUTES }     from './utils/constants';

/**
 * App Routing Architecture:
 * 1. `/` (Main Link): Direct Review & Rating page for customers!
 *    When the salon owner shares https://salone-one.vercel.app/ with her customer,
 *    it opens DIRECTLY to the 5-star review screen.
 * 2. `/review`: Alias for direct review.
 * 3. `< 3 Stars`: Lands on `/feedback` (Internal private form on her app).
 * 4. `≥ 3 Stars`: Redirects directly to Google Maps review page.
 * 5. `/qr`: Salon QR standee page for counter/mirror.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ReviewProvider>
        <Routes>
          {/* Main Direct Entry: Customer Review Screen */}
          <Route path="/"                element={<LandingPage />} />
          <Route path="/review"          element={<LandingPage />} />
          <Route path="/rate"            element={<LandingPage />} />

          {/* Salon Counter QR Standee */}
          <Route path={ROUTES.QR}        element={<QRPage />} />

          {/* < 3 Stars: Internal Private Feedback */}
          <Route path={ROUTES.FEEDBACK}  element={<FeedbackPage />} />

          {/* >= 3 Stars: Google Maps Direct Redirect */}
          <Route path={ROUTES.REDIRECT}  element={<RedirectPage />} />

          {/* Confirmation Screen */}
          <Route path={ROUTES.THANKYOU}  element={<ThankYouPage />} />

          {/* Fallback */}
          <Route path="*"                element={<Navigate to="/" replace />} />
        </Routes>
      </ReviewProvider>
    </BrowserRouter>
  );
}

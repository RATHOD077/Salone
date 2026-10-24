import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Check, Smartphone, Star, ArrowLeft } from 'lucide-react';
import { APP_URL, SALON_NAME, SALON_TAGLINE, ROUTES } from '../utils/constants';

/**
 * QRPage (/qr)
 *
 * Displays the Salon QR code standee with official logo.
 * The primary button writes only "Review us" and leads directly to the review screen.
 */
export default function QRPage() {
  const navigate = useNavigate();
  const [downloaded, setDownloaded] = useState(false);
  const qrRef = useRef(null);

  // The review URL encoded inside the QR code
  const reviewUrl = `${APP_URL.replace(/\/$/, '')}${ROUTES.REVIEW}`;

  // ── Download high-res PNG for salon counter print ────────────────────────────
  function handleDownload() {
    const SIZE = 1024;
    const PADDING = 64;
    const canvas = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SIZE, SIZE);

    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img     = new Image();
    const blob    = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url     = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, PADDING, PADDING, SIZE - PADDING * 2, SIZE - PADDING * 2);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(pngBlob);
        a.download = `${SALON_NAME.replace(/\s+/g, '_')}_Review_QR.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2500);
      }, 'image/png');
    };
    img.src = url;
  }

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* Top Back navigation */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.REVIEW)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-salon-600 transition-colors self-start"
        >
          <ArrowLeft size={14} />
          Back to Review
        </button>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col items-center gap-3 text-center">
          <img
            src="/logo.png"
            alt={SALON_NAME}
            className="w-20 h-20 rounded-full object-cover shadow-xl shadow-pink-100 border-2 border-white ring-2 ring-pink-100 bg-black"
          />
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-800">
              {SALON_NAME}
            </h1>
            <p className="text-salon-500 text-sm font-medium mt-0.5">
              {SALON_TAGLINE}
            </p>
          </div>
        </header>

        {/* ── Barcode Card ────────────────────────────────────────── */}
        <div className="card flex flex-col items-center gap-6">

          {/* Badge */}
          <div className="flex items-center gap-2 bg-salon-50 border border-salon-100
                          px-4 py-2 rounded-full">
            <Smartphone size={15} className="text-salon-500" />
            <span className="text-xs font-semibold text-salon-600">
              Scan with your phone camera
            </span>
          </div>

          {/* Barcode / QR Code with Centered Official Logo */}
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-2xl border-2 border-pink-100
                       shadow-xl shadow-pink-50 flex items-center justify-center"
          >
            <QRCodeSVG
              value={reviewUrl}
              size={220}
              level="H"
              includeMargin={false}
              fgColor="#111827"
              bgColor="#ffffff"
              imageSettings={{
                src: '/logo.png',
                height: 46,
                width: 46,
                excavate: true,
              }}
            />
          </div>

          {/* Primary Action Button: "Review us" */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.REVIEW)}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3.5 shadow-lg shadow-pink-200"
          >
            <Star size={18} fill="currentColor" />
            <span>Review us</span>
          </button>

          {/* Download Standee button */}
          <button
            type="button"
            onClick={handleDownload}
            className="text-xs font-semibold text-gray-400 hover:text-salon-600 flex items-center justify-center gap-1.5 py-1 transition-colors"
          >
            {downloaded ? (
              <><Check size={14} className="text-green-600" /> Standee Downloaded!</>
            ) : (
              <><Download size={14} /> Download QR Standee</>
            )}
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          {SALON_NAME} ✨
        </p>

      </div>
    </div>
  );
}

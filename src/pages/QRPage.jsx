import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, Scissors, Smartphone, Star, ChevronRight, QrCode } from 'lucide-react';
import { APP_URL, SALON_NAME, SALON_TAGLINE, ROUTES } from '../utils/constants';

/**
 * QRPage (Main Starting Screen at /)
 *
 * Displays ONLY the salon's official QR / Barcode for customers to scan.
 * No camera scanner.
 */
export default function QRPage() {
  const navigate = useNavigate();
  const [copied, setCopied]         = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const qrRef = useRef(null);

  // QR encodes the /review path so scanning lands directly on the star review page
  const reviewUrl = `${APP_URL.replace(/\/$/, '')}${ROUTES.REVIEW}`;

  // ── Copy review link ─────────────────────────────────────────────────────────
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('input');
      el.value = reviewUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

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

        {/* ── Top Bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-center w-full">
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-pink-100 shadow-sm">
            <QrCode size={14} className="text-salon-500" />
            <span className="text-xs font-bold text-gray-700 tracking-wider uppercase">
              Official Review Barcode
            </span>
          </div>
        </div>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-salon-500 to-salon-700
                          flex items-center justify-center shadow-xl shadow-salon-200">
            <Scissors size={30} className="text-white" />
          </div>
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

          {/* Barcode / QR Code */}
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
            />
          </div>

          {/* Direct Rating Button */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.REVIEW)}
            className="btn-primary w-full flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
          >
            <Star size={18} fill="currentColor" />
            <span>Rate on this Device</span>
            <ChevronRight size={18} />
          </button>

          {/* How it works */}
          <div className="w-full bg-gradient-to-r from-salon-50 to-pink-50
                          rounded-xl p-4 border border-salon-100 text-left">
            <p className="text-xs font-semibold text-salon-700 mb-2">
              ✨ Review Routing
            </p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-salon-400 font-bold mt-0.5">1.</span>
                <span>Customer scans this barcode with their phone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">↓</span>
                <span><strong>Below 3 Stars:</strong> Private salon feedback (internal)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">↑</span>
                <span><strong>3 Stars & Above:</strong> Redirects to Google Reviews ⭐</span>
              </li>
            </ul>
          </div>

          {/* Standee Actions */}
          <div className="flex flex-col gap-2.5 w-full">
            <button
              type="button"
              onClick={handleDownload}
              className="btn-secondary w-full"
            >
              {downloaded ? (
                <><Check size={18} className="text-green-600" /> Downloaded Standee PNG!</>
              ) : (
                <><Download size={18} /> Download Standee (Printable)</>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-semibold text-gray-400 hover:text-salon-600 flex items-center justify-center gap-1.5 py-1"
            >
              {copied ? (
                <><Check size={14} className="text-green-500" /> Copied Review Link!</>
              ) : (
                <><Copy size={14} /> Copy Review Link</>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          {SALON_NAME} Review Barcode ✨
        </p>

      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, Scissors, Smartphone, ExternalLink, Camera, ArrowLeft } from 'lucide-react';
import { APP_URL, SALON_NAME, SALON_TAGLINE, ROUTES } from '../utils/constants';

/**
 * QRPage
 *
 * Generates a scannable QR code that points to this app's landing page (/).
 * Customers scan it → land on the star rating screen.
 */
export default function QRPage() {
  const navigate = useNavigate();
  const [copied, setCopied]     = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const qrRef = useRef(null);

  // QR encodes the /review path so customers scanning it go straight to rating!
  const reviewUrl = `${APP_URL.replace(/\/$/, '')}${ROUTES.REVIEW}`;

  // ── Copy link ───────────────────────────────────────────────────────────────
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-HTTPS / unsupported browsers
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

  // ── Download as PNG ─────────────────────────────────────────────────────────
  function handleDownload() {
    // Create an off-screen canvas at high resolution
    const SIZE = 1024;
    const PADDING = 64;
    const canvas = document.createElement('canvas');
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Render QR SVG → image
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* Top Navigation */}
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => navigate(ROUTES.HOME)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-salon-600 bg-white/80 px-3 py-1.5 rounded-full border border-pink-100 shadow-sm transition-all"
          >
            <ArrowLeft size={14} />
            Reviews
          </button>
          
          <button
            type="button"
            onClick={() => navigate(ROUTES.SCAN)}
            className="flex items-center gap-1.5 text-xs font-semibold text-salon-600 hover:text-salon-700 bg-salon-50 px-3 py-1.5 rounded-full border border-salon-200 transition-all"
          >
            <Camera size={14} />
            Test Scanner
          </button>
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

        {/* ── QR Card ────────────────────────────────────────────── */}
        <div className="card flex flex-col items-center gap-6">

          {/* Instruction badge */}
          <div className="flex items-center gap-2 bg-salon-50 border border-salon-100
                          px-4 py-2 rounded-full">
            <Smartphone size={15} className="text-salon-500" />
            <span className="text-xs font-semibold text-salon-600">
              Scan to Rate Your Experience
            </span>
          </div>

          {/* QR Code */}
          <div
            ref={qrRef}
            className="p-4 bg-white rounded-2xl border-2 border-pink-100
                       shadow-lg shadow-pink-50 flex items-center justify-center"
          >
            <QRCodeSVG
              value={reviewUrl}
              size={220}
              level="H"                  /* High error correction — works even if partially covered */
              includeMargin={false}
              imageSettings={{
                src: '',                 /* No logo overlay — keeps scan reliability high */
                excavate: false,
              }}
              fgColor="#1f2937"          /* Dark grey — prints well in B&W */
              bgColor="#ffffff"
            />
          </div>

          {/* Encoded URL */}
          <div className="w-full bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1">Encoded URL</p>
            <p className="text-xs text-gray-700 font-mono break-all leading-relaxed">
              {reviewUrl}
            </p>
          </div>

          {/* How it works */}
          <div className="w-full bg-gradient-to-r from-salon-50 to-pink-50
                          rounded-xl p-4 border border-salon-100">
            <p className="text-xs font-semibold text-salon-700 mb-2">
              ✨ How it works
            </p>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-salon-400 font-bold mt-0.5">1.</span>
                Customer scans the QR code
              </li>
              <li className="flex items-start gap-2">
                <span className="text-salon-400 font-bold mt-0.5">2.</span>
                They rate their experience (1–5 stars)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">↓</span>
                <span><strong>1–2 stars:</strong> Private feedback form (you see it, not Google)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">↑</span>
                <span><strong>3–5 stars:</strong> Direct to Google Reviews ⭐</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={handleDownload}
              className="btn-primary"
            >
              {downloaded ? (
                <><Check size={18} /> Downloaded!</>
              ) : (
                <><Download size={18} /> Download QR Code</>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary"
            >
              {copied ? (
                <><Check size={18} className="text-green-500" /> Link Copied!</>
              ) : (
                <><Copy size={16} /> Copy Review Link</>
              )}
            </button>
          </div>

        </div>

        {/* ── Test link ──────────────────────────────────────────── */}
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5
                     text-sm text-gray-400 hover:text-salon-500
                     transition-colors"
        >
          <ExternalLink size={13} />
          Preview what customers see
        </a>

      </div>
    </div>
  );
}

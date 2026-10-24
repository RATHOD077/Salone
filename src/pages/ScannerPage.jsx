import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  Upload, 
  SwitchCamera, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  QrCode,
  Star,
  ChevronRight
} from 'lucide-react';
import { ROUTES, SALON_NAME, SALON_TAGLINE } from '../utils/constants';

export default function ScannerPage() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraFacing, setCameraFacing] = useState('environment'); // back camera
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'file'
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize and start camera
  const startCamera = async (facingMode = cameraFacing) => {
    setErrorMessage('');
    try {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } else {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader', {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Frame search
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setIsScanning(false);
      setErrorMessage(
        'Camera access not available. You can upload a QR image or tap "Rate Directly" below.'
      );
    }
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
  };

  useEffect(() => {
    if (scanMode === 'camera' && !scanResult) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode, cameraFacing]);

  // Handle successful detection
  const handleScanSuccess = async (decodedText) => {
    await stopCamera();
    setScanResult(decodedText);

    if (navigator.vibrate) {
      navigator.vibrate(120);
    }

    // Auto transition to the review page after brief confirmation
    setTimeout(() => {
      navigate(ROUTES.REVIEW);
    }, 1500);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setErrorMessage('');
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader', {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }
      const result = await html5QrCodeRef.current.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      setErrorMessage('No readable QR code found in this image. Try another photo or rate directly.');
    }
  };

  const toggleCameraFacing = async () => {
    const nextMode = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextMode);
    await stopCamera();
    startCamera(nextMode);
  };

  const resetScanner = () => {
    setScanResult(null);
    setErrorMessage('');
    if (scanMode === 'camera') {
      startCamera(cameraFacing);
    }
  };

  return (
    <div className="page-enter min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">

        {/* Top Header & Bar */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
              QR Scanner Ready
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.QR)}
            className="flex items-center gap-1.5 text-xs font-semibold text-salon-600 hover:text-salon-700 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-pink-200 shadow-sm transition-all"
          >
            <QrCode size={13} className="text-salon-500" />
            Salon QR Standee
          </button>
        </div>

        {/* Card Container */}
        <div className="card flex flex-col items-center text-center p-6 sm:p-8">

          {/* Salon Branding */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-salon-500 to-salon-700 flex items-center justify-center shadow-lg shadow-salon-200 text-white">
              <Camera size={32} />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-800">
              {SALON_NAME}
            </h1>
            <p className="text-salon-500 text-xs font-medium uppercase tracking-wider">
              {SALON_TAGLINE}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Scan our salon QR code to submit your review
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-5 w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                setScanMode('camera');
                setScanResult(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                scanMode === 'camera'
                  ? 'bg-white text-salon-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Camera size={14} />
              Live Camera
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setScanMode('file');
                setScanResult(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                scanMode === 'file'
                  ? 'bg-white text-salon-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload size={14} />
              Upload Image
            </button>
          </div>

          {/* Detected Result */}
          {scanResult ? (
            <div className="w-full flex flex-col items-center gap-4 py-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center shadow-md animate-bounce-star">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-gray-800">
                  QR Code Verified!
                </h3>
                <p className="text-xs text-gray-400 mt-1">Opening review page...</p>
              </div>

              <div className="w-full bg-salon-50 border border-salon-200 rounded-2xl p-3 text-xs text-salon-700 font-medium flex items-center gap-2">
                <Sparkles size={16} className="text-salon-500 shrink-0" />
                <span>Taking you to {SALON_NAME}'s review form</span>
              </div>

              <button
                type="button"
                onClick={() => navigate(ROUTES.REVIEW)}
                className="btn-primary w-full mt-2"
              >
                <span>Continue to Rate</span>
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={resetScanner}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1"
              >
                <RefreshCw size={13} />
                Scan again
              </button>
            </div>
          ) : (
            /* Active Scanner Area */
            <div className="w-full flex flex-col items-center">
              {scanMode === 'camera' ? (
                <div className="relative w-full max-w-[270px] sm:max-w-[300px] aspect-square rounded-2xl overflow-hidden bg-black shadow-inner border-2 border-salon-200">
                  <div id="qr-reader" className="w-full h-full" />

                  {/* Viewfinder Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-52 h-52 border-2 border-dashed border-salon-400/80 rounded-2xl relative">
                      <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-salon-500 rounded-tl-md" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-salon-500 rounded-tr-md" />
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-salon-500 rounded-bl-md" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-salon-500 rounded-br-md" />
                      
                      {/* Laser Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-salon-400 to-transparent shadow-sm shadow-salon-400 animate-pulse mt-24" />
                    </div>
                  </div>

                  {/* Camera Flip */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    title="Switch Camera"
                    className="absolute bottom-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow text-gray-700 hover:text-salon-600 transition-all"
                  >
                    <SwitchCamera size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-[270px] sm:max-w-[300px] aspect-square rounded-2xl border-2 border-dashed border-salon-300 bg-salon-50/50 hover:bg-salon-50 cursor-pointer flex flex-col items-center justify-center p-6 transition-all"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-salon-500 mb-3 border border-pink-100">
                    <Upload size={26} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Select QR Code Image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Direct Skip / Manual Button */}
              <div className="w-full pt-6 mt-6 border-t border-gray-100 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.REVIEW)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Star size={18} fill="currentColor" />
                  <span>Give Review Directly</span>
                </button>
                <p className="text-[11px] text-gray-400">
                  Already scanned or using direct link? Tap above to rate
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          Google Review Assistant for {SALON_NAME}
        </div>

      </div>
    </div>
  );
}

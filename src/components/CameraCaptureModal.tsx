import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  Check,
  RefreshCw,
  AlertCircle,
  Upload,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (photoDataUrl: string) => void;
  onFallbackToGallery: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  onFallbackToGallery,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isShutterActive, setIsShutterActive] = useState(false);

  // Stop current active media stream tracks
  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      setStream(null);
    }
  }, [stream]);

  // Check if multiple camera devices exist
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        if (videoInputs.length > 1) {
          setHasMultipleCameras(true);
        }
      })
      .catch(() => {
        // ignore device listing error
      });
  }, []);

  // Start the camera video stream
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsLoading(true);
      setCameraError(null);
      stopTracks();

      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        setCameraError(
          'Your browser does not support live camera access. Please use "Upload from Gallery" instead.'
        );
        setIsLoading(false);
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {
              // autoplay might need interaction
            });
            setIsLoading(false);
          };
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        setIsLoading(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Please allow camera access in your browser or choose "Upload from Gallery" instead.'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError(
            'No camera found on this device. Please choose "Upload from Gallery" instead.'
          );
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError(
            'Your camera is currently in use by another application. Please close other camera apps or choose "Upload from Gallery".'
          );
        } else {
          setCameraError(
            err.message || 'Could not start camera. Please try "Upload from Gallery" instead.'
          );
        }
      }
    },
    [stopTracks]
  );

  // Initialize or teardown when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopTracks();
    }

    return () => {
      stopTracks();
    };
  }, [isOpen, facingMode, startCamera, stopTracks]);

  // Handle capture shutter click
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual shutter flash
    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user (front) camera, mirror it horizontally so it feels natural like a mirror
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Compress to sharp high quality JPEG data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(photoDataUrl);

    // Stop camera stream while user reviews the shot
    stopTracks();
  };

  // Retake photo: clear captured image and restart camera stream
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Confirm photo: pass to parent and close
  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
      onClose();
    }
  };

  // Toggle front / back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    setCapturedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
      className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#140D11] border border-[#BE123C]/40 rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh]">
        {/* Shutter Flash Animation */}
        {isShutterActive && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#1A0E15]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#BE123C] to-[#E11D48] text-white flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.4)]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="camera-modal-title" className="text-sm sm:text-base font-bold text-white font-display">
                {capturedImage ? 'Review Captured Photo' : 'Take Daily Streak Photo'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {capturedImage ? 'Make sure your photo looks sharp and clear' : 'Live Camera Viewfinder'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center border border-white/10"
            aria-label="Close Camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder or Preview Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-black flex items-center justify-center overflow-hidden">
          {/* STATE A: Camera Error Banner */}
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#2B0813] border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white">Camera Unavailable</h4>
                <p className="text-xs text-stone-300 leading-relaxed">{cameraError}</p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onFallbackToGallery();
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload from Gallery Instead</span>
                </button>
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Camera</span>
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            /* STATE B: Review captured photo */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured check-in preview"
                className="max-h-[55vh] w-full object-contain"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Captured</span>
              </div>
            </div>
          ) : (
            /* STATE C: Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              {isLoading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 space-y-3">
                  <div className="w-10 h-10 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-stone-300 font-medium">Starting camera...</p>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`max-h-[55vh] w-full object-contain ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Target Frame Guide */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-[#E11D48]" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#E11D48]" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-[#E11D48]" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-[#E11D48]" />
                </div>
              </div>

              {/* Camera Mode Indicator */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-stone-300 flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}</span>
              </div>

              {/* Flip Camera Button (if multiple cameras available) */}
              {hasMultipleCameras && !isLoading && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="absolute top-3 right-3 p-2.5 rounded-full bg-black/75 hover:bg-black text-stone-200 hover:text-white border border-white/20 transition-all flex items-center gap-1 text-xs cursor-pointer shadow-lg min-h-[40px]"
                  title="Switch Front/Back Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-[10px] hidden sm:inline">Flip</span>
                </button>
              )}
            </div>
          )}

          {/* Hidden Canvas used to grab frame */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Controls / Bottom Action Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#160D12] flex items-center justify-between gap-3">
          {capturedImage ? (
            /* Review Buttons */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] border border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs hover:from-[#E11D48] hover:to-[#BE123C] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.4)] min-h-[44px]"
              >
                <Check className="w-4 h-4" />
                <span>Use This Photo</span>
              </button>
            </div>
          ) : !cameraError ? (
            /* Capture Controls */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFallbackToGallery();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden min-[360px]:inline">Or Gallery</span>
              </button>

              {/* Prominent Shutter Button */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={isLoading}
                className="relative group p-1 rounded-full bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FDA4AF] shadow-[0_0_30px_rgba(225,29,72,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                aria-label="Capture Photo"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-4 border-[#140D11]">
                  <div className="w-10 h-10 rounded-full bg-[#E11D48] group-hover:bg-[#BE123C] transition-colors" />
                </div>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-200 text-xs font-medium transition-colors min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          ) : (
            /* Error Fallback Cancel */
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 text-stone-300 text-xs font-medium min-h-[40px]"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

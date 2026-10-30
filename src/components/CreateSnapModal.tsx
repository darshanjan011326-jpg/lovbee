import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Image as ImageIcon,
  X,
  RotateCcw,
  Check,
  RefreshCw,
  AlertCircle,
  Upload,
  Sparkles,
  ShieldAlert,
  Flame,
  Send,
  Loader2,
} from 'lucide-react';
import { store, StreakStats } from '../services/store';
import { Profile, Checkin } from '../types';

interface CreateSnapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile;
  onSuccess: (checkin: Checkin, stats: StreakStats) => void;
}

/**
 * Resizes and compresses an image client-side to ensure sharp, high-res photos
 * without blowing browser localStorage or network payload limits.
 */
async function compressImageFile(file: File, maxDimension = 1280, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const CreateSnapModal: React.FC<CreateSnapModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Flow step: 'capture' (camera/gallery picker) or 'preview' (review photo + caption + publish)
  const [step, setStep] = useState<'capture' | 'preview'>('capture');

  // Stream & Camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isShutterActive, setIsShutterActive] = useState(false);

  // Photo & Caption state
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoSource, setPhotoSource] = useState<'camera' | 'gallery'>('camera');
  const [caption, setCaption] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const focusHobby =
    currentUser.challenge?.focusHobbyName ||
    currentUser.hobbies[0]?.name ||
    'Wheel-thrown Ceramics';

  // Stop camera tracks helper
  const stopCameraStream = useCallback(() => {
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

  // Check for multiple cameras (e.g. mobile front/back)
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

  // Start live camera
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsCameraLoading(true);
      setCameraError(null);
      stopCameraStream();

      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        setCameraError(
          'Camera access is not supported on this browser. You can still select photos from your Gallery.'
        );
        setIsCameraLoading(false);
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
            videoRef.current?.play().catch(() => {});
            setIsCameraLoading(false);
          };
        } else {
          setIsCameraLoading(false);
        }
      } catch (err: any) {
        setIsCameraLoading(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Tap "Open Gallery" below or enable camera in your browser settings.'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. You can select a photo from your gallery.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError('Camera is in use by another app. Please choose from gallery or close other apps.');
        } else {
          setCameraError(err.message || 'Could not start camera. Please choose from gallery.');
        }
      }
    },
    [stopCameraStream]
  );

  // Manage camera lifecycle based on modal open state and step
  useEffect(() => {
    if (isOpen && step === 'capture') {
      startCamera(facingMode);
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, step, facingMode, startCamera, stopCameraStream]);

  // Reset modal state when closed
  const handleClose = () => {
    stopCameraStream();
    setSelectedPhoto(null);
    setCaption('');
    setStep('capture');
    setSubmitError(null);
    onClose();
  };

  // Capture photo from video stream
  const handleShutterClick = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setIsShutterActive(true);
    setTimeout(() => setIsShutterActive(false), 200);

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);

    stopCameraStream();
    setSelectedPhoto(photoDataUrl);
    setPhotoSource('camera');
    setStep('preview');
    setSubmitError(null);
  };

  // Gallery button click
  const handleOpenGallery = () => {
    galleryInputRef.current?.click();
  };

  // Gallery file selected
  const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSubmitError('Please select a valid image file (JPEG, PNG, WEBP, or HEIC).');
      return;
    }

    setIsProcessing(true);
    setSubmitError(null);

    try {
      const compressedDataUrl = await compressImageFile(file);
      stopCameraStream();
      setSelectedPhoto(compressedDataUrl);
      setPhotoSource('gallery');
      setStep('preview');
    } catch (err: any) {
      setSubmitError(err?.message || 'Could not process selected image. Please try again.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Flip camera between front and back
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Retake or change photo: return to capture step
  const handleRetake = () => {
    setSelectedPhoto(null);
    setSubmitError(null);
    setStep('capture');
  };

  // Publish Snap & Submit Check-in
  const handlePublishSnap = async () => {
    if (isPublishing || !selectedPhoto) return;

    const canCheckin = store.canCheckinToday();
    if (!canCheckin.allowed) {
      setSubmitError(canCheckin.reason || 'You have already checked in today! See you tomorrow.');
      return;
    }

    setIsPublishing(true);
    setSubmitError(null);

    try {
      const cleanCaption = caption.trim().slice(0, 150);
      const res = await store.submitCheckin({
        hobbyName: focusHobby,
        caption: cleanCaption || undefined,
        reflectionNote: cleanCaption || undefined,
        photoUrl: selectedPhoto,
        activitySummary: cleanCaption || `Completed daily snap for ${focusHobby}`,
        durationMinutes: 30,
      });

      setIsPublishing(false);

      if (res.success && res.checkin && res.stats) {
        onSuccess(res.checkin, res.stats);
        handleClose();
      } else {
        setSubmitError(res.error || 'Failed to publish snap. Please try again.');
      }
    } catch (err: any) {
      setIsPublishing(false);
      setSubmitError(err?.message || 'Could not publish snap.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-snap-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#140D11] border border-[#BE123C]/40 rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[94vh]">
        {/* Shutter visual flash animation */}
        {isShutterActive && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
        )}

        {/* Hidden Gallery Input */}
        <input
          type="file"
          ref={galleryInputRef}
          accept="image/*"
          onChange={handleGalleryFileChange}
          className="hidden"
          aria-label="Upload photo from gallery"
        />

        {/* Hidden Canvas for Frame Grab */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#1A0E15]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#BE123C] to-[#E11D48] text-white flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.4)]">
              {step === 'capture' ? <Camera className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-[#FDA4AF]" />}
            </div>
            <div>
              <h3 id="create-snap-title" className="text-sm sm:text-base font-bold text-white font-display">
                {step === 'capture' ? 'Create Snap' : 'Review & Publish Snap'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {step === 'capture'
                  ? `Document your daily 30m · ${focusHobby}`
                  : 'Add an optional note and complete your check-in'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center border border-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Body */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-black flex flex-col justify-center overflow-y-auto">
          {/* STEP 1: CAPTURE STAGE (Live Viewfinder + Gallery Access) */}
          {step === 'capture' && (
            <div className="relative w-full h-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center bg-black overflow-hidden">
              {/* Camera Error / Permission Denied State */}
              {cameraError ? (
                <div className="p-6 text-center space-y-4 max-w-sm mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#2B0813] border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white">Camera Access</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">{cameraError}</p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                    <button
                      type="button"
                      onClick={handleOpenGallery}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.4)] min-h-[44px]"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Select from Gallery</span>
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
              ) : (
                /* Live Camera Stream */
                <div className="relative w-full h-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center bg-black">
                  {isCameraLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 space-y-3">
                      <div className="w-10 h-10 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-stone-300 font-medium">Opening camera...</p>
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

                  {/* Viewfinder Target Framing Guide */}
                  <div className="absolute inset-6 sm:inset-10 border-2 border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-[#E11D48]" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-[#E11D48]" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-[#E11D48]" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-[#E11D48]" />
                    </div>
                  </div>

                  {/* Live Status Pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-stone-300 flex items-center gap-1.5 pointer-events-none">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{facingMode === 'environment' ? 'Rear Camera' : 'Front Camera'}</span>
                  </div>

                  {/* Flip Camera Button */}
                  {hasMultipleCameras && !isCameraLoading && (
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-black/75 hover:bg-black text-stone-200 hover:text-white border border-white/20 transition-all flex items-center gap-1 text-xs cursor-pointer shadow-lg min-h-[40px]"
                      title="Switch Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-[10px] hidden sm:inline">Flip</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREVIEW STAGE (Photo Preview + Caption Input) */}
          {step === 'preview' && selectedPhoto && (
            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Full Photo Preview with Source Badge */}
              <div className="relative rounded-2xl overflow-hidden border border-[#BE123C]/40 bg-black shadow-lg">
                <div className="max-h-72 sm:max-h-80 w-full flex items-center justify-center bg-black overflow-hidden">
                  <img
                    src={selectedPhoto}
                    alt="Snap preview"
                    className="w-full max-h-72 sm:max-h-80 object-contain"
                  />
                </div>

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white flex items-center gap-1.5">
                  {photoSource === 'camera' ? (
                    <>
                      <Camera className="w-3.5 h-3.5 text-[#F5D061]" />
                      <span>Captured with Camera</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5 text-[#FB7185]" />
                      <span>Selected from Gallery</span>
                    </>
                  )}
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="p-2 rounded-xl bg-black/80 hover:bg-black text-stone-200 hover:text-white border border-white/20 transition-all flex items-center gap-1 text-xs cursor-pointer shadow-md min-h-[36px]"
                    title="Retake or choose another photo"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#FDA4AF]" />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    className="p-2 rounded-xl bg-black/80 hover:bg-black text-stone-200 hover:text-white border border-white/20 transition-all flex items-center gap-1 text-xs cursor-pointer shadow-md min-h-[36px]"
                    title="Choose from Gallery"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#FB7185]" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                </div>
              </div>

              {/* Caption Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="snap-caption" className="text-stone-300 font-semibold flex items-center gap-1.5">
                    <span>Optional Caption & Reflection</span>
                  </label>
                  <span
                    className={`font-mono text-[11px] ${
                      caption.length >= 140 ? 'text-[#FDA4AF] font-bold' : 'text-stone-400'
                    }`}
                  >
                    {caption.length}/150
                  </span>
                </div>
                <textarea
                  id="snap-caption"
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, 150))}
                  placeholder={`What did you work on during today's 30-minute ${focusHobby} practice?`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1216] border border-[#BE123C]/30 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-[#E11D48] transition-colors resize-none"
                />
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-3 rounded-xl bg-[#2B0813] border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar Controls */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#160D12] flex items-center justify-between gap-3">
          {step === 'capture' ? (
            /* CAPTURE STAGE CONTROLS */
            <div className="w-full flex items-center justify-between gap-3">
              {/* Gallery Thumbnail Button */}
              <button
                type="button"
                onClick={handleOpenGallery}
                disabled={isProcessing}
                className="group flex items-center gap-2 py-2.5 px-3.5 sm:px-4 rounded-2xl bg-[#1C1216] border border-[#BE123C]/40 hover:border-[#E11D48] text-stone-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm min-h-[48px]"
                title="Select photo from device gallery"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2B0813] border border-[#BE123C]/30 text-[#FDA4AF] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">Gallery</span>
              </button>

              {/* Unified Shutter Capture Button */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleShutterClick}
                  disabled={isCameraLoading || Boolean(cameraError)}
                  className="relative group p-1 rounded-full bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#FDA4AF] shadow-[0_0_30px_rgba(225,29,72,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Capture Photo"
                >
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-4 border-[#140D11]">
                    <div className="w-10 h-10 rounded-full bg-[#E11D48] group-hover:bg-[#BE123C] transition-colors" />
                  </div>
                </button>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white text-xs font-medium transition-colors cursor-pointer min-h-[48px] flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          ) : (
            /* PREVIEW STAGE CONTROLS: Retake or Publish Snap */
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isPublishing}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] border border-white/10"
              >
                <RotateCcw className="w-4 h-4 text-stone-400" />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={handlePublishSnap}
                disabled={isPublishing}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#BE123C] via-[#E11D48] to-[#881337] text-white font-semibold text-xs hover:from-[#E11D48] hover:to-[#BE123C] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.5)] min-h-[44px] disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing Snap...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-[#FDA4AF]" />
                    <span>Publish Snap & Check In</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

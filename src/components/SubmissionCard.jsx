import React, { useState, useEffect, useRef } from 'react';

export default function SubmissionCard({ onCancel }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const pasteAreaRef = useRef(null);

  // Extract image from paste items
  const processPasteItems = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const file = new File([blob], `screenshot_${Date.now()}.png`, { type: blob.type });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          return true;
        }
      }
    }
    return false;
  };

  // Handle global and targeted paste events (Ctrl+V or Right-Click -> Paste)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items && processPasteItems(items)) {
        e.preventDefault();
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Button-triggered paste via Async Clipboard API
  const handleClipboardRead = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `screenshot_${Date.now()}.png`, { type: imageType });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          return;
        }
      }
      alert('No image found on clipboard. Press PrtScn first!');
    } catch (err) {
      alert('To paste, tap inside the dashed box or press Ctrl+V / Cmd+V.');
    }
  };

  // Method 2: Screen Capture API (getDisplayMedia)
  const handleScreenCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      
      // Use Video element fallback if ImageCapture isn't present
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      track.stop(); // Stop sharing screen immediately after capture

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `screen_capture_${Date.now()}.png`, { type: 'image/png' });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
        }
      }, 'image/png');
    } catch (err) {
      console.warn('Screen capture cancelled:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const handleSubmit = () => {
    if (!imageFile) return;
    alert(`Screenshot "${imageFile.name}" ready for submission!`);
    // Pass imageFile to your backend / state handler here
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📋</span> Screenshot Submissions
        </h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
          Testing Mode
        </span>
      </div>

      {!imagePreview ? (
        <div className="space-y-4">
          {/* Paste Zone supporting right-click / two-finger press and keyboard shortcuts */}
          <div
            ref={pasteAreaRef}
            contentEditable
            suppressContentEditableWarning
            className="border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg p-6 text-center bg-blue-50/50 dark:bg-gray-900/50 hover:bg-blue-50 dark:hover:bg-gray-900 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
            style={{ caretColor: 'transparent' }}
          >
            <div className="pointer-events-none">
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Method 1: PrintScreen + Paste
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                1. Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">PrtScn</kbd> on your keyboard.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                2. Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + V</kbd> or <strong>Right-Click / Two-Finger Tap</strong> here and select <em>Paste</em>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
            <hr className="w-full border-gray-200 dark:border-gray-700" />
            <span>OR</span>
            <hr className="w-full border-gray-200 dark:border-gray-700" />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClipboardRead}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>📋</span> Paste From Clipboard
            </button>

            <button
              type="button"
              onClick={handleScreenCapture}
              disabled={isCapturing}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>📸</span> {isCapturing ? 'Capturing...' : 'Method 2: Capture Screen'}
            </button>
          </div>
        </div>
      ) : (
        /* Image Preview & Confirmation */
        <div className="space-y-4">
          <div className="relative border dark:border-gray-700 rounded-lg overflow-hidden bg-black/5 flex justify-center items-center max-h-72 p-2">
            <img
              src={imagePreview}
              alt="Screenshot Preview"
              className="max-h-64 w-auto object-contain rounded"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="w-1/3 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium text-sm rounded-lg transition-colors"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-2/3 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
            >
              Submit Screenshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

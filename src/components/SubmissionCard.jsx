import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase'; // Adjusts to existing firebase export
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SubmissionCard({ studentName = "Student", section = "General" }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [touchStatus, setTouchStatus] = useState('');
  const pasteAreaRef = useRef(null);
  const touchTimerRef = useRef(null);

  // Extract image from paste items
  const processPasteItems = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const file = new File([blob], `screenshot_${Date.now()}.png`, { type: blob.type });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          setTouchStatus('');
          return true;
        }
      }
    }
    return false;
  };

  // Global paste event listener
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

  // Async Clipboard API handler
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
          setTouchStatus('');
          return;
        }
      }
      alert('No image found on clipboard. Take a screenshot first!');
    } catch (err) {
      alert('To paste, long-press inside the box or press Ctrl+V / Cmd+V.');
    }
  };

  // Touch Long-Press Handlers
  const handleTouchStart = () => {
    setTouchStatus('Hold to trigger paste...');
    touchTimerRef.current = setTimeout(() => {
      setTouchStatus('Attempting clipboard paste...');
      handleClipboardRead();
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    setTimeout(() => setTouchStatus(''), 1500);
  };

  // Method 2: Screen Capture API
  const handleScreenCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      track.stop();

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

  // Convert File to Base64 (Fallback if Storage bucket is restricted)
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload to Firebase Storage + Store Metadata in Firestore
  const handleSubmit = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    setUploadProgress('Preparing upload...');

    try {
      let downloadURL = '';

      // Try uploading to Firebase Storage first
      if (storage) {
        try {
          setUploadProgress('Uploading image file...');
          const storagePath = `submissions/${section}/${Date.now()}_${imageFile.name}`;
          const storageRef = ref(storage, storagePath);
          const snapshot = await uploadBytes(storageRef, imageFile);
          downloadURL = await getDownloadURL(snapshot.ref);
        } catch (storageErr) {
          console.warn('Firebase Storage upload failed, falling back to compressed Base64 inline store:', storageErr);
        }
      }

      // Fallback: If Storage failed or isn't set up, convert to Base64
      if (!downloadURL) {
        setUploadProgress('Encoding image payload...');
        downloadURL = await fileToBase64(imageFile);
      }

      // Record entry in Firestore
      setUploadProgress('Saving submission entry...');
      await addDoc(collection(db, 'student_submissions'), {
        studentName,
        section,
        imageUrl: downloadURL,
        fileName: imageFile.name,
        fileType: imageFile.type,
        submittedAt: serverTimestamp(),
        createdAtISO: new Date().toISOString(),
        status: 'submitted',
      });

      alert(`✅ Screenshot submitted successfully for ${studentName} (${section})!`);
      handleReset();
    } catch (err) {
      console.error('Error submitting screenshot:', err);
      alert(`Submission error: ${err.message || 'Failed to connect to database'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageFile(null);
    setTouchStatus('');
    setUploadProgress('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📋</span> Screenshot Submissions
        </h3>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2.5 py-1 rounded-full font-semibold">
          Ready for Submission
        </span>
      </div>

      {!imagePreview ? (
        <div className="space-y-4">
          <div
            ref={pasteAreaRef}
            contentEditable
            suppressContentEditableWarning
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="border-2 border-dashed border-blue-400 dark:border-blue-500 rounded-lg p-5 text-center bg-blue-50/50 dark:bg-gray-900/50 hover:bg-blue-50 dark:hover:bg-gray-900 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500 select-none"
            style={{ caretColor: 'transparent' }}
          >
            <div className="pointer-events-none">
              <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                Method 1: PrintScreen + Paste
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                1. Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">PrtScn</kbd> on keyboard.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                2. Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + V</kbd>, <strong>Right-Click</strong>, or <strong>Long-Press (Touch)</strong> here to Paste.
              </p>
              {touchStatus && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 animate-pulse">
                  {touchStatus}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
            <hr className="w-full border-gray-200 dark:border-gray-700" />
            <span>OR</span>
            <hr className="w-full border-gray-200 dark:border-gray-700" />
          </div>

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
        <div className="space-y-4">
          <div className="relative border dark:border-gray-700 rounded-lg overflow-hidden bg-black/5 flex justify-center items-center max-h-72 p-2">
            <img
              src={imagePreview}
              alt="Screenshot Preview"
              className="max-h-64 w-auto object-contain rounded"
            />
          </div>

          {isUploading && (
            <p className="text-xs text-center text-blue-600 dark:text-blue-400 font-medium animate-pulse">
              {uploadProgress}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={isUploading}
              className="w-1/3 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading}
              className="w-2/3 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin text-xs">🌀</span> Submitting...
                </>
              ) : (
                'Submit Screenshot'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

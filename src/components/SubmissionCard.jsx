import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function SubmissionCard({ studentName = "Student", section = "General" }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [touchStatus, setTouchStatus] = useState('');
  
  // Submission history states
  const [todaySubmissions, setTodaySubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeModalImage, setActiveModalImage] = useState(null);

  // Pin override states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlockedByTeacher, setUnlockedByTeacher] = useState(false);

  const pasteAreaRef = useRef(null);
  const touchTimerRef = useRef(null);

  const TEACHER_BYPASS_PIN = "1234";

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const todayKey = getTodayDateString();

  const fetchStudentSubmissions = async () => {
    try {
      if (!db) return;
      const q = query(
        collection(db, 'student_submissions'),
        where('studentName', '==', studentName),
        where('section', '==', section)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      docs.sort((a, b) => new Date(b.createdAtISO || 0) - new Date(a.createdAtISO || 0));

      setAllSubmissions(docs);
      setTodaySubmissions(docs.filter(d => d.submissionDate === todayKey));
    } catch (err) {
      console.warn('Error fetching student submissions:', err);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      await fetchStudentSubmissions();
    })();
    return () => {
      active = false;
    };
  }, [studentName, section]);

  const processPasteItems = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const file = new File([blob], `screenshot_${todayKey}_${Date.now()}.png`, { type: blob.type });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(blob));
          setTouchStatus('');
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    if (todaySubmissions.length > 0 && !unlockedByTeacher) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (items && processPasteItems(items)) {
        e.preventDefault();
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [todaySubmissions, unlockedByTeacher]);

  const handleClipboardRead = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `screenshot_${todayKey}_${Date.now()}.png`, { type: imageType });
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

  const handleTouchStart = () => {
    setTouchStatus('Hold to trigger paste...');
    touchTimerRef.current = setTimeout(() => {
      setTouchStatus('Attempting clipboard paste...');
      handleClipboardRead();
    }, 600);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setTimeout(() => setTouchStatus(''), 1500);
  };

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
          const file = new File([blob], `screen_capture_${todayKey}_${Date.now()}.png`, { type: 'image/png' });
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

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  
  const compressImage = (file, maxWidth = 1200, quality = 0.65) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

    const handleSubmit = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    setUploadProgress("Compressing screenshot...");

    try {
      const downloadURL = await compressImage(imageFile, 1200, 0.65);

      setUploadProgress("Saving submission...");
      await addDoc(collection(db, "student_submissions"), {
        studentName: studentName || "Student",
        section: section || "General",
        submissionDate: todayKey,
        imageUrl: downloadURL,
        fileName: imageFile.name || "screenshot_upload.jpg",
        fileType: "image/jpeg",
        submittedAt: serverTimestamp(),
        createdAtISO: new Date().toISOString(),
        unlockedOverride: unlockedByTeacher,
        status: "submitted",
      });

      alert(`✅ Screenshot submitted for ${todayKey}!`);
      handleReset();
      setUnlockedByTeacher(false);
      fetchStudentSubmissions();
    } catch (err) {
      console.error("Error submitting screenshot:", err);
      alert(`Submission error: ${err.message || "Failed to submit"}`);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput === TEACHER_BYPASS_PIN) {
      setUnlockedByTeacher(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect Teacher Code. Ask your teacher!');
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageFile(null);
    setTouchStatus('');
    setUploadProgress('');
  };

  const isCutoffReached = todaySubmissions.length > 0 && !unlockedByTeacher;
  const latestSubmission = todaySubmissions[0];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-all relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Daily Work Submissions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Date: <span className="font-semibold text-gray-700 dark:text-gray-300">{todayKey}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allSubmissions.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-full font-medium transition-colors"
            >
              {showHistory ? '✕ Close History' : `📜 My History (${allSubmissions.length})`}
            </button>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            isCutoffReached 
              ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200' 
              : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
          }`}>
            {isCutoffReached ? '🔒 Completed Today' : 'Ready for Submission'}
          </span>
        </div>
      </div>

      {showHistory ? (
        <div className="space-y-3 mb-4 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-lg border dark:border-gray-700 max-h-80 overflow-y-auto">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">Your Past Submissions</h4>
          {allSubmissions.length === 0 ? (
            <p className="text-xs text-gray-400">No previous submissions found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setActiveModalImage(sub)}
                  className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-2 cursor-pointer hover:shadow-md transition-shadow text-center"
                >
                  <img
                    src={sub.imageUrl}
                    alt={sub.submissionDate}
                    className="h-24 w-full object-contain rounded bg-black/5"
                  />
                  <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 mt-1">{sub.submissionDate}</p>
                  <p className="text-[10px] text-gray-400">
                    {sub.createdAtISO ? new Date(sub.createdAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isCutoffReached ? (
        <div className="space-y-4 text-center py-2">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              ✅ You have submitted your screenshot for today!
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Click on your screenshot below to inspect full size.
            </p>
          </div>

          {latestSubmission?.imageUrl && (
            <div
              onClick={() => setActiveModalImage(latestSubmission)}
              className="border dark:border-gray-700 rounded-lg overflow-hidden bg-black/5 p-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                Submitted Today at {latestSubmission.createdAtISO ? new Date(latestSubmission.createdAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} (Click to view full screen)
              </p>
              <img
                src={latestSubmission.imageUrl}
                alt="Today's Submission"
                className="max-h-52 mx-auto object-contain rounded"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPinModal(true)}
            className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium text-xs rounded-lg transition-colors border border-gray-300 dark:border-gray-600 flex items-center justify-center gap-1.5"
          >
            🔑 Need to re-submit? Enter Teacher Code
          </button>
        </div>
      ) : (
        <>
          {unlockedByTeacher && (
            <div className="mb-3 p-2.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300 flex justify-between items-center">
              <span>🔓 Resubmission unlocked by Teacher Override.</span>
              <button 
                type="button" 
                onClick={() => setUnlockedByTeacher(false)}
                className="underline font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

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
        </>
      )}

      {activeModalImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-5 shadow-2xl border dark:border-gray-700 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  Submission for {activeModalImage.submissionDate}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted at {activeModalImage.createdAtISO ? new Date(activeModalImage.createdAtISO).toLocaleTimeString() : ''}
                </p>
              </div>
              <button
                onClick={() => setActiveModalImage(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex justify-center items-center bg-black/10 rounded-lg p-2">
              <img
                src={activeModalImage.imageUrl}
                alt="Full Submission Preview"
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-xs w-full p-5 shadow-2xl border dark:border-gray-700">
            <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🔐</span> Teacher Unlock Code
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ask your teacher to enter the code to allow a new screenshot submission today.
            </p>

            <form onSubmit={handleVerifyPin} className="mt-4 space-y-3">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                autoFocus
                className="w-full text-center tracking-widest text-lg font-mono py-2 px-3 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />

              {pinError && (
                <p className="text-xs text-red-500 text-center font-medium">
                  {pinError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }}
                  className="w-1/2 py-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

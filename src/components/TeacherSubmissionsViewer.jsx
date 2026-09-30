import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function TeacherSubmissionsViewer() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [activeModalImage, setActiveModalImage] = useState(null);

  const sections = ['ALL', '4A', '4B', '4C', '4D', '4E', '5B'];

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      if (!db) return;
      let q;
      if (selectedSection === 'ALL') {
        q = query(
          collection(db, 'student_submissions'),
          where('submissionDate', '==', selectedDate)
        );
      } else {
        q = query(
          collection(db, 'student_submissions'),
          where('submissionDate', '==', selectedDate),
          where('section', '==', selectedSection)
        );
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort manually by submittedAt/createdAtISO descending
      docs.sort((a, b) => new Date(b.createdAtISO || 0) - new Date(a.createdAtISO || 0));
      setSubmissions(docs);
    } catch (err) {
      console.error('Error fetching student submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedSection, selectedDate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-all">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🖼️</span> Student Screenshot Submissions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review submitted work from PrtScn and Screen Captures
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="py-1.5 px-3 border dark:border-gray-600 rounded-lg text-xs bg-gray-50 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="py-1.5 px-3 border dark:border-gray-600 rounded-lg text-xs bg-gray-50 dark:bg-gray-900 dark:text-white"
            >
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec === 'ALL' ? 'All Sections' : `Section ${sec}`}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchSubmissions}
            className="mt-5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          No submissions found for <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedDate}</span> {selectedSection !== 'ALL' && `in Section ${selectedSection}`}.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900/50 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setActiveModalImage(sub)}
            >
              <div className="h-40 bg-black/5 flex justify-center items-center overflow-hidden border-b dark:border-gray-800 relative">
                <img
                  src={sub.imageUrl}
                  alt={sub.studentName}
                  className="w-full h-full object-cover"
                />
                {sub.unlockedOverride && (
                  <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Re-submitted
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {sub.studentName}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded font-mono text-[10px]">
                    {sub.section}
                  </span>
                  <span>
                    {sub.createdAtISO ? new Date(sub.createdAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Fullscreen Image View */}
      {activeModalImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full p-5 shadow-2xl border dark:border-gray-700 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                  {activeModalImage.studentName} ({activeModalImage.section})
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted at {activeModalImage.createdAtISO ? new Date(activeModalImage.createdAtISO).toLocaleString() : ''}
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
                alt="Full Submission"
                className="max-h-[70vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

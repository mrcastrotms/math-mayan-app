import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function TeacherSubmissionsViewer() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [activeModalImage, setActiveModalImage] = useState(null);

  const sectionsOrder = ['4A', '4B', '4C', '4D', '4E', '5B'];

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

      // Strict Sorting Hierarchy:
      // 1. Date (Descending - newest ISO timestamp)
      // 2. Section (Predefined section order: 4A -> 4B -> 4C -> 4D -> 4E -> 5B)
      // 3. Student Name (Alphabetical)
      docs.sort((a, b) => {
        // Date sort
        const dateA = new Date(a.createdAtISO || 0);
        const dateB = new Date(b.createdAtISO || 0);
        if (dateB - dateA !== 0) return dateB - dateA;

        // Section sort
        const secIndexA = sectionsOrder.indexOf(a.section);
        const secIndexB = sectionsOrder.indexOf(b.section);
        if (secIndexA !== secIndexB) {
          if (secIndexA === -1) return 1;
          if (secIndexB === -1) return -1;
          return secIndexA - secIndexB;
        }

        // Student Name sort
        return (a.studentName || '').localeCompare(b.studentName || '');
      });

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

  // Group submissions by section for scannable layout when viewing ALL
  const groupedSubmissions = sectionsOrder.reduce((acc, sec) => {
    const items = submissions.filter(s => s.section === sec);
    if (items.length > 0) acc[sec] = items;
    return acc;
  }, {});

  // Collect any sections outside the standard array
  const otherItems = submissions.filter(s => !sectionsOrder.includes(s.section));
  if (otherItems.length > 0) groupedSubmissions['Other'] = otherItems;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-all">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🖼️</span> Student Screenshot Submissions
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sorted by Date, Section, and Student Name
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
              <option value="ALL">All Sections</option>
              {sectionsOrder.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
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

      {loading ? (
        <div className="py-12 text-center text-gray-400 text-sm">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          No submissions found for <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedDate}</span> {selectedSection !== 'ALL' && `in Section ${selectedSection}`}.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedSubmissions).map(sec => (
            <div key={sec} className="space-y-3">
              <div className="flex items-center gap-2 border-b dark:border-gray-700 pb-1">
                <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded font-mono">
                  Section {sec}
                </span>
                <span className="text-xs text-gray-400">({groupedSubmissions[sec].length} submitted)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupedSubmissions[sec].map((sub) => (
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
                        <span className="font-mono text-[10px] text-gray-400">
                          {sub.submissionDate}
                        </span>
                        <span>
                          {sub.createdAtISO ? new Date(sub.createdAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
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
                  {activeModalImage.studentName} (Section {activeModalImage.section})
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Submitted: {activeModalImage.submissionDate} at {activeModalImage.createdAtISO ? new Date(activeModalImage.createdAtISO).toLocaleTimeString() : ''}
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

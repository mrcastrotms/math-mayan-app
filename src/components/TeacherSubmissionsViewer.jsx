import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, deleteDoc, writeBatch } from 'firebase/firestore';

export default function TeacherSubmissionsViewer({ selectedSection: propSection }) {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSection, setSelectedSection] = useState(
    propSection && propSection !== 'All' ? propSection.toUpperCase() : 'ALL'
  );
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
      // 1. Date (Descending - newest timestamp)
      // 2. Section (4A -> 4B -> 4C -> 4D -> 4E -> 5B)
      // 3. Student Name (Alphabetical)
      docs.sort((a, b) => {
        const dateA = new Date(a.createdAtISO || (a.submittedAt?.seconds ? a.submittedAt.seconds * 1000 : 0));
        const dateB = new Date(b.createdAtISO || (b.submittedAt?.seconds ? b.submittedAt.seconds * 1000 : 0));
        if (dateB - dateA !== 0) return dateB - dateA;

        const secIndexA = sectionsOrder.indexOf(a.section) !== -1 ? sectionsOrder.indexOf(a.section) : 99;
        const secIndexB = sectionsOrder.indexOf(b.section) !== -1 ? sectionsOrder.indexOf(b.section) : 99;
        if (secIndexA !== secIndexB) return secIndexA - secIndexB;

        return (a.studentName || '').localeCompare(b.studentName || '');
      });

      setSubmissions(docs);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedSection, selectedDate]);

  // Delete a single submission
  const handleDeleteSubmission = async (e, id, studentName) => {
    e.stopPropagation();
    if (!window.confirm(`Delete submission for "${studentName}"?`)) return;

    try {
      await deleteDoc(doc(db, 'student_submissions', id));
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert(`Failed to delete submission: ${err.message}`);
    }
  };

  // Purge all currently visible submissions
  const handlePurge = async () => {
    const count = submissions.length;
    if (count === 0) return;

    const secLabel = selectedSection === 'ALL' ? 'all sections' : `Section ${selectedSection}`;
    if (!window.confirm(`⚠️ Permanently purge ${count} submission(s) for ${selectedDate} in ${secLabel}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const batch = writeBatch(db);
      submissions.forEach(sub => {
        batch.delete(doc(db, 'student_submissions', sub.id));
      });
      await batch.commit();
      setSubmissions([]);
      alert(`Purged ${count} submission(s) successfully.`);
    } catch (err) {
      console.error('Error purging submissions:', err);
      alert(`Failed to purge submissions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Group submissions by section
  const groupedSubmissions = sectionsOrder.reduce((acc, sec) => {
    acc[sec] = submissions.filter(s => s.section === sec);
    return acc;
  }, {});

  // Collect any sections outside the default list
  const otherSections = [...new Set(submissions.map(s => s.section))].filter(
    sec => !sectionsOrder.includes(sec)
  );
  otherSections.forEach(sec => {
    groupedSubmissions[sec] = submissions.filter(s => s.section === sec);
  });

  const displaySections = selectedSection === 'ALL'
    ? Object.keys(groupedSubmissions).filter(sec => groupedSubmissions[sec].length > 0)
    : [selectedSection];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🖼️</span> Student Screenshot Submissions
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Sorted by Date, Section, and Student Name
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Sections</option>
              {sectionsOrder.map((sec) => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          <div className="self-end flex gap-2">
            <button
              onClick={fetchSubmissions}
              disabled={loading}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>

            {submissions.length > 0 && (
              <button
                onClick={handlePurge}
                disabled={loading}
                className="text-sm px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-medium transition-colors disabled:opacity-50"
                title="Purge all matching submissions"
              >
                🗑️ Purge ({submissions.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submissions Feed */}
      {submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No submissions found for <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedDate}</span> {selectedSection !== 'ALL' && `in Section ${selectedSection}`}.
        </div>
      ) : (
        <div className="space-y-8">
          {displaySections.map((sec) => {
            const list = groupedSubmissions[sec] || [];
            if (list.length === 0) return null;

            return (
              <div key={sec} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-md font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Section {sec}
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      ({list.length} submitted)
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {list.map((sub) => {
                    const timeString = sub.createdAtISO
                      ? new Date(sub.createdAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : sub.submittedAt?.seconds
                        ? new Date(sub.submittedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                    return (
                      <div
                        key={sub.id}
                        className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
                        onClick={() => setActiveModalImage(sub.imageUrl)}
                      >
                        {/* Card Header with Delete button */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="truncate pr-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate" title={sub.studentName}>
                              {sub.studentName || 'Student'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {sub.submissionDate} {timeString && `• ${timeString}`}
                            </p>
                          </div>

                          <button
                            onClick={(e) => handleDeleteSubmission(e, sub.id, sub.studentName)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                            title="Delete this submission"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Thumbnail Image */}
                        <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-900 rounded overflow-hidden relative border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                          {sub.imageUrl ? (
                            <img
                              src={sub.imageUrl}
                              alt={`Submission by ${sub.studentName}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                          )}
                        </div>

                        {/* Card Footer badges */}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                          <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium border border-emerald-200 dark:border-emerald-800/40">
                            Submitted
                          </span>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                            Click to expand 🔍
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Full-Resolution Submission Preview
              </span>
              <button
                onClick={() => setActiveModalImage(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg px-2 py-0.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="overflow-auto p-2 flex items-center justify-center bg-gray-950">
              <img
                src={activeModalImage}
                alt="Enlarged screenshot"
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

const VIDEO_DATABASE = [
  {
    id: "AmFMJC45f1Q",
    title: "Classroom Feature Video",
    tags: ["class", "featured", "math"],
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Fun Intermission / Music",
    tags: ["music", "fun", "classic"],
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Despacito (Music Video)",
    tags: ["music", "dog videos", "popular", "songs"],
  },
  {
    id: "jNQXAC9IVRw",
    title: "Me at the zoo (First YouTube Video)",
    tags: ["zoo", "animals", "dog videos", "history"],
  },
  {
    id: "9bZkp7q19f0",
    title: "PSY - GANGNAM STYLE",
    tags: ["gangnam", "dance", "music", "dog videos"],
  },
];

export default function YouTubeHubView({ onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState({
    id: "jNQXAC9IVRw",
    title: "Me at the zoo (First YouTube Video)",
  });

  const filteredVideos = VIDEO_DATABASE.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl w-full p-6 md:p-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
        >
          ← Back to Menu
        </button>
        <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-100 text-center mt-4">
          YouTube Video Hub
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-center mb-6 text-sm">
          Search and watch educational and fun videos right inside the app.
        </p>
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube videos (e.g., dog videos, math, music)..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg px-1">
              {activeVideo.title}
            </h3>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 max-h-[360px] overflow-y-auto space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              Search Results
            </h4>
            {filteredVideos.map((vid) => (
              <button
                key={vid.id}
                onClick={() => setActiveVideo(vid)}
                className={`w-full text-left p-3 rounded-lg transition-all text-xs font-medium flex items-center justify-between ${
                  activeVideo.id === vid.id
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <span className="truncate pr-2">{vid.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    activeVideo.id === vid.id
                      ? "bg-red-700 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  Play
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

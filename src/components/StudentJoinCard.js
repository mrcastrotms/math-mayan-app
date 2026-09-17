// src/components/StudentJoinCard.js
import React from "react";
import { START_SCREEN_COPY } from "../utils/themeStyles";

export default function StudentJoinCard({
  styles,
  name,
  setName,
  examCode,
  setExamCode,
  selectedSection,
  setSelectedSection,
  availableSections,
  isLoading,
  loading,
  error,
  onSubmit,
}) {
  return (
    <div
      className={`w-full max-w-xl rounded-2xl shadow-xl p-8 border mt-16 transition-colors duration-200 ${styles.card}`}
    >
      <h1 className={styles.title}>{START_SCREEN_COPY.title}</h1>
      <p className={styles.subtitle}>{START_SCREEN_COPY.subtitle}</p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className={styles.labelCenter}>
            {START_SCREEN_COPY.sectionLabel}
          </label>
          <div className="flex flex-wrap justify-center gap-3">
            {isLoading
              ? [1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className={styles.skeletonBtn} />
                ))
              : availableSections.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSection(sec)}
                    className={
                      selectedSection === sec
                        ? styles.activeSectionBtn
                        : styles.sectionBtn
                    }
                  >
                    {sec}
                  </button>
                ))}
          </div>
        </div>

        <div>
          <label className={styles.labelDefault}>
            {START_SCREEN_COPY.nameLabel}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            className={styles.input}
            placeholder={START_SCREEN_COPY.namePlaceholder}
          />
        </div>

        <div>
          <label className={styles.labelDefault}>
            {START_SCREEN_COPY.codeLabel}
          </label>
          <input
            type="text"
            value={examCode}
            onChange={(e) => setExamCode(e.target.value)}
            autoComplete="off"
            className={`${styles.input} uppercase font-mono tracking-widest text-center`}
            placeholder={START_SCREEN_COPY.codePlaceholder}
          />
        </div>

        {error && <p className={styles.errorBanner}>{error}</p>}

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading
            ? START_SCREEN_COPY.submitLoading
            : START_SCREEN_COPY.submitIdle}
        </button>
      </form>
    </div>
  );
}

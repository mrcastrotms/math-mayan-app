import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { appText as fallbackText } from "../data/content";
import {
  fetchLiveContent,
  initializeFirebaseContent,
} from "../services/contentService";
import { fetchLiveQuestions } from "../services/questionService";

const STORAGE_KEYS = {
  SECTIONS: "math_app_sections",
  QUESTIONS: "math_app_cached_questions",
};

const DEFAULT_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

export function useAppConfig() {
  const [appText, setAppText] = useState(fallbackText);

  // Instant cache read for questions to eliminate layout flicker
  const [examQuestions, setExamQuestions] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEYS.QUESTIONS);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Instant cache read for sections
  const [availableSections, setAvailableSections] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SECTIONS);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SECTIONS;
  });

  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    const initializeAppConfig = async () => {
      try {
        await initializeFirebaseContent();

        // Parallel resolution: content, questions, and section settings
        const [contentResult, questionsResult, classesSnapResult] =
          await Promise.allSettled([
            fetchLiveContent(),
            fetchLiveQuestions(),
            getDoc(doc(db, "settings", "classes")),
          ]);

        // 1. App Text
        if (contentResult.status === "fulfilled" && contentResult.value) {
          setAppText(contentResult.value);
        }

        // 2. Exam Questions (Update state + sessionStorage)
        if (
          questionsResult.status === "fulfilled" &&
          questionsResult.value?.length > 0
        ) {
          setExamQuestions(questionsResult.value);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              STORAGE_KEYS.QUESTIONS,
              JSON.stringify(questionsResult.value),
            );
          }
        }

        // 3. Class Sections (Update state + localStorage)
        if (classesSnapResult.status === "fulfilled") {
          const docSnap = classesSnapResult.value;
          if (docSnap?.exists() && docSnap.data().list) {
            const fetchedSections = docSnap.data().list;
            setAvailableSections(fetchedSections);
            if (typeof window !== "undefined") {
              localStorage.setItem(
                STORAGE_KEYS.SECTIONS,
                JSON.stringify(fetchedSections),
              );
            }
          }
        }
      } catch (e) {
        console.error("Error initializing app config:", e);
      } finally {
        setIsLoadingConfig(false);
      }
    };

    initializeAppConfig();
  }, []);

  return {
    appText,
    setAppText,
    examQuestions,
    setExamQuestions,
    availableSections,
    setAvailableSections,
    isLoadingConfig,
  };
}

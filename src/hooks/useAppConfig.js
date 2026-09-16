import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { appText as fallbackText } from "../data/content";
import {
  fetchLiveContent,
  initializeFirebaseContent,
} from "../services/contentService";
import { fetchLiveQuestions } from "../services/questionService";

export function useAppConfig() {
  const [appText, setAppText] = useState(fallbackText);
  const [examQuestions, setExamQuestions] = useState([]);

  // 1. Synchronously grab from cache BEFORE the first render to prevent the blink
  const [availableSections, setAvailableSections] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("math_app_sections");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return ["4A", "4B", "4C", "4D", "4E", "5B"]; // Safe fallback
  });

  useEffect(() => {
    const initializeAppConfig = async () => {
      try {
        await initializeFirebaseContent();
        const liveCopy = await fetchLiveContent();
        setAppText(liveCopy);

        const liveQuestions = await fetchLiveQuestions();
        setExamQuestions(liveQuestions);

        const docSnap = await getDoc(doc(db, "settings", "classes"));
        if (docSnap.exists() && docSnap.data().list) {
          const fetchedSections = docSnap.data().list;

          // 2. Set the state and instantly update the cache for next time
          setAvailableSections(fetchedSections);
          localStorage.setItem(
            "math_app_sections",
            JSON.stringify(fetchedSections),
          );
        }
      } catch (e) {
        console.error("Error initializing app config:", e);
      }
    };

    initializeAppConfig();
  }, []);

  return {
    appText,
    setAppText,
    examQuestions,
    availableSections,
    setAvailableSections,
  };
}

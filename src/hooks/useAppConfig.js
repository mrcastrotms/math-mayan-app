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
  const [availableSections, setAvailableSections] = useState([
    "4A",
    "4B",
    "5A",
    "5B",
  ]);

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
          setAvailableSections(docSnap.data().list);
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

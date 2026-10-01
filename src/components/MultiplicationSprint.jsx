import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const generateFacts = () => {
  const facts = [];
  for (let i = 0; i < 5; i++) {
    const a = Math.floor(Math.random() * 10) + 3; // 3 to 12
    const b = Math.floor(Math.random() * 10) + 3;
    facts.push({ id: i, a, b, answer: a * b, attempts: 0, solved: false });
  }
  return facts;
};

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function MultiplicationSprint({ student, section = "4B" }) {
  const [facts, setFacts] = useState(() => generateFacts());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [stats, setStats] = useState({ totalAnswers: 0, totalCorrect: 0, firstTryCorrect: 0 });

  const [hasCompletedToday, setHasCompletedToday] = useState(null);
  const [pastSprintData, setPastSprintData] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const checkDailyLimit = async () => {
      const studentName = student?.name;
      if (!studentName) {
        if (isMounted) setHasCompletedToday(false);
        return;
      }

      const q = query(
        collection(db, 'exam_results'),
        where('studentName', '==', studentName),
        where('activityType', '==', 'classwork'),
        where('dateString', '==', getTodayStr())
      );

      try {
        const snapshot = await getDocs(q);
        const sprintDoc = snapshot.docs.find(d => d.data().assignmentTitle?.includes('Multiplication Sprint'));

        if (!isMounted) return;

        if (sprintDoc) {
          setPastSprintData(sprintDoc.data());
          setHasCompletedToday(true);
        } else {
          setHasCompletedToday(false);
        }
      } catch (error) {
        console.error("Error checking daily limit:", error);
        if (isMounted) setHasCompletedToday(false);
      }
    };

    checkDailyLimit();

    return () => {
      isMounted = false;
    };
  }, [student, section]);

  const submitToGradebook = useCallback(async () => {
    setIsSubmitting(true);

    const uniqueSolved = facts.filter(f => f.solved).length;
    const firstTryCorrect = facts.filter(f => f.solved && f.attempts === 1).length;
    const totalAttempted = facts.reduce((acc, f) => acc + f.attempts, 0);
    const fullSweep = firstTryCorrect === 5;
    const duration = 60 - timeLeft;

    const mappedAnswers = facts.map((f, i) => ({
      questionId: `fact_${i}`,
      prompt: `${f.a} × ${f.b}`,
      studentAnswer: f.solved ? String(f.answer) : (f.attempts > 0 ? "Tried, unsolved" : "Blank"),
      correctAnswer: String(f.answer),
      isCorrect: f.solved,
      points: f.solved ? 1 : 0
    }));

    const sprintRecord = {
      uid: student?.uid || student?.id || 'unknown',
      studentId: student?.id || student?.uid || 'unknown',
      name: student?.name || 'Unknown Student',
      studentName: student?.name || 'Unknown Student',
      section: section,
      sectionId: section,

      activityType: 'classwork',
      activity: 'classwork',

      assignmentTitle: `Multiplication Sprint (${totalAttempted} attempts in ${duration}s)`,

      correctAnswers: uniqueSolved,
      totalQuestions: 5,
      score: uniqueSolved,
      answers: mappedAnswers,

      createdAt: serverTimestamp(),
      timestamp: Date.now(),
      startedAt: startedAt,
      endedAt: new Date().toISOString(),
      dateString: getTodayStr(),
      date: getTodayStr(),

      durationSeconds: duration,
      fullSweep: fullSweep,
      firstTryCorrect: firstTryCorrect,
      totalAttempted: totalAttempted,
      totalCorrect: stats.totalCorrect,
      factsData: facts
    };

    try {
      await addDoc(collection(db, 'exam_results'), sprintRecord);
      setPastSprintData(sprintRecord);
      setHasCompletedToday(true);
    } catch (error) {
      console.error("Error writing document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [facts, timeLeft, student, section, startedAt, stats.totalCorrect]);

  const submitRef = useRef(submitToGradebook);
  useEffect(() => {
    submitRef.current = submitToGradebook;
  }, [submitToGradebook]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsActive(false);
          submitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (isActive && inputRef.current) inputRef.current.focus();
  }, [isActive, currentIndex]);

  const startSprint = () => {
    setIsActive(true);
    setStartedAt(new Date().toISOString());
  };

  const handleInput = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setInputValue(val);

    const currentFact = facts[currentIndex];
    const expectedLength = currentFact.answer.toString().length;

    if (val.length === expectedLength) {
      const isCorrect = parseInt(val, 10) === currentFact.answer;

      setStats(prev => ({
        ...prev,
        totalAnswers: prev.totalAnswers + 1,
        totalCorrect: isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect,
        firstTryCorrect: (isCorrect && currentFact.attempts === 0)
            ? prev.firstTryCorrect + 1
            : prev.firstTryCorrect
      }));

      const updatedFacts = [...facts];
      updatedFacts[currentIndex].attempts += 1;
      if (isCorrect) {
        updatedFacts[currentIndex].solved = true;
      }

      setFacts(updatedFacts);
      setInputValue("");

      setCurrentIndex((prev) => (prev + 1) % 5);
    }
  };

  if (hasCompletedToday === null) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasCompletedToday === true && pastSprintData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl shadow-md max-w-md mx-auto mt-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sprint Complete 🏁</h2>
        <p className="text-gray-600 mb-6">You have completed your Multiplication Sprint for today.</p>

        <div className="bg-white border border-gray-200 rounded-lg p-6 w-full shadow-sm text-left">
          <h3 className="text-lg font-bold text-blue-800 border-b pb-2 mb-4">Today&apos;s Report</h3>

          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-600">Total Answers Submitted:</span>
            <span className="font-bold text-xl text-gray-900">{pastSprintData.totalAttempted}</span>
          </div>

          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-600">Total Correct:</span>
            <span className="font-bold text-xl text-emerald-600">{pastSprintData.totalCorrect}</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-600">Perfect First-Tries:</span>
            <span className="font-bold text-xl text-blue-600">{pastSprintData.firstTryCorrect} / 5</span>
          </div>

          {pastSprintData.fullSweep && (
            <div className="mt-4 bg-emerald-100 text-emerald-800 p-3 rounded-md text-center font-bold animate-pulse">
              🌟 Full Sweep Achieved! 🌟
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 font-bold mt-6">Check back tomorrow for your next sprint.</p>
      </div>
    );
  }

  const numSolved = facts.filter(f => f.solved).length;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl shadow-md max-w-md mx-auto mt-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Multiplication Sprint</h2>

      {!isActive && timeLeft === 60 ? (
        <button
          onClick={startSprint}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Start 60-Second Sprint
        </button>
      ) : (
        <div className="text-center w-full">
          <div className="flex justify-between items-center mb-6 w-full px-4">
            <span className="text-xl font-mono font-bold text-red-600">
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
            <span className="text-sm font-semibold text-gray-500">
              Progress: {numSolved}/5
            </span>
          </div>

          {timeLeft > 0 && !isSubmitting ? (
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold tracking-widest text-gray-900 mb-8">
                {facts[currentIndex].a} × {facts[currentIndex].b}
              </div>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInput}
                className="text-center text-4xl border-b-4 border-gray-300 focus:border-blue-500 outline-none w-32 bg-transparent pb-2"
                disabled={timeLeft === 0}
              />
            </div>
          ) : (
            <div className="text-blue-600 font-bold text-2xl animate-pulse">
              Saving Report...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

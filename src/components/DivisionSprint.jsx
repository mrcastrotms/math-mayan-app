import React, { useState, useEffect, useRef } from 'react';

const generateProblem = (difficulty) => {
  let divisor, quotient;
  if (difficulty === 1) {
    divisor = Math.floor(Math.random() * 9) + 2;
    quotient = Math.floor(Math.random() * 9) + 2;
  } else if (difficulty === 2) {
    divisor = Math.floor(Math.random() * 8) + 3;
    quotient = Math.floor(Math.random() * 6) + 11;
  } else {
    divisor = Math.floor(Math.random() * 9) + 4;
    quotient = Math.floor(Math.random() * 11) + 15;
  }
  return { dividend: divisor * quotient, divisor, quotient };
};

export default function DivisionSprint({ onBack }) {
  const SPRINT_DURATION_MS = 100000;

  const [gameState, setGameState] = useState('playing');
  const [timeLeftMs, setTimeLeftMs] = useState(SPRINT_DURATION_MS);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [history, setHistory] = useState([]);

  const inputRef = useRef(null);
  const endTimeRef = useRef(null);
  const animFrameRef = useRef(null);
  const hesitationTimerRef = useRef(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    endTimeRef.current = Date.now() + SPRINT_DURATION_MS;

    const updateTimer = () => {
      const remaining = Math.max(0, endTimeRef.current - Date.now());
      setTimeLeftMs(remaining);

      if (remaining > 0) {
        animFrameRef.current = requestAnimationFrame(updateTimer);
      } else {
        setGameState('report');
      }
    };

    animFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, problem, feedback]);

  const evaluateAnswer = (valStr) => {
    if (isTransitioningRef.current || feedback !== null || timeLeftMs <= 0) return;
    if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);

    const parsedInput = parseInt(valStr.trim(), 10);
    if (isNaN(parsedInput)) return;

    isTransitioningRef.current = true;
    const isCorrect = parsedInput === problem.quotient;

    const record = {
      problemStr: `${problem.dividend} / ${problem.divisor}`,
      userAns: parsedInput,
      correctAns: problem.quotient,
      isCorrect,
    };

    setHistory((prev) => [record, ...prev]);
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      setFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      let newDiff = difficulty;
      if (newStreak >= 7) newDiff = 3;
      else if (newStreak >= 3) newDiff = 2;
      setDifficulty(newDiff);

      setTimeout(() => {
        setUserAnswer('');
        setProblem(generateProblem(newDiff));
        setFeedback(null);
        isTransitioningRef.current = false;
      }, 250);
    } else {
      setFeedback('incorrect');
      setStreak(0);
      const newDiff = Math.max(1, difficulty - 1);
      setDifficulty(newDiff);

      setTimeout(() => {
        setUserAnswer('');
        setProblem(generateProblem(newDiff));
        setFeedback(null);
        isTransitioningRef.current = false;
      }, 700);
    }
  };

  const handleInputChange = (e) => {
    if (isTransitioningRef.current) return;
    const val = e.target.value.replace(/\D/g, '');
    setUserAnswer(val);

    if (hesitationTimerRef.current) {
      clearTimeout(hesitationTimerRef.current);
    }

    const targetLen = String(problem.quotient).length;

    if (val.length >= targetLen) {
      evaluateAnswer(val);
    } else if (val.length > 0) {
      hesitationTimerRef.current = setTimeout(() => {
        evaluateAnswer(val);
      }, 1000);
    }
  };

  const restartSprint = () => {
    if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);
    isTransitioningRef.current = false;
    setTimeLeftMs(SPRINT_DURATION_MS);
    setStreak(0);
    setMaxStreak(0);
    setDifficulty(1);
    setStats({ correct: 0, total: 0 });
    setHistory([]);
    setFeedback(null);
    setUserAnswer('');
    setProblem(generateProblem(1));
    setGameState('playing');
    endTimeRef.current = Date.now() + SPRINT_DURATION_MS;
  };

  if (gameState === 'report') {
    const accuracy =
      stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    return (
      <div className="p-6 max-w-2xl mx-auto my-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              Division Sprint Complete
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              100-second session summary
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl text-center border border-blue-100 dark:border-blue-900/50">
              <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">
                Attempted
              </div>
              <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                {stats.total}
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl text-center border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">
                Correct
              </div>
              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                {stats.correct}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/40 p-4 rounded-2xl text-center border border-purple-100 dark:border-purple-900/50">
              <div className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">
                Accuracy
              </div>
              <div className="text-3xl font-black text-purple-700 dark:text-purple-300">
                {accuracy}%
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl text-center border border-amber-100 dark:border-amber-900/50">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
                Max Streak
              </div>
              <div className="text-3xl font-black text-amber-700 dark:text-amber-300">
                {maxStreak}
              </div>
            </div>
          </div>

          {history.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Question History
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm font-mono font-bold ${
                      item.isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300'
                        : 'bg-rose-50/50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300'
                    }`}
                  >
                    <span>{item.problemStr} = {item.correctAns}</span>
                    <span className="text-xs">
                      {item.isCorrect ? 'Correct' : `Said ${item.userAns || 'blank'}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={restartSprint}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98]"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-6 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold py-3.5 rounded-xl transition-all"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto my-6">
      <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
        <button
          onClick={() => {
            if (hesitationTimerRef.current) clearTimeout(hesitationTimerRef.current);
            setGameState('report');
          }}
          className="px-3.5 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 dark:text-gray-400 rounded-lg hover:bg-gray-200 transition-colors"
        >
          &larr; Finish Early
        </button>

        <div className="text-center font-mono">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
            {(timeLeftMs / 1000).toFixed(2)}s
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Time Left
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-black text-amber-500 uppercase tracking-wider">
            Streak: {streak}
          </div>
          <div className="text-[10px] font-bold text-gray-400">
            Level {difficulty}
          </div>
        </div>
      </div>

      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-10 text-center border-4 transition-all duration-200 ${
          feedback === 'correct'
            ? 'border-emerald-400 shadow-emerald-100 dark:shadow-none'
            : feedback === 'incorrect'
            ? 'border-rose-400 shadow-rose-100 dark:shadow-none'
            : 'border-transparent'
        }`}
      >
        <div className="text-6xl sm:text-7xl font-black text-gray-800 dark:text-white mb-8 tracking-wider font-mono">
          {problem.dividend} &divide; {problem.divisor}
        </div>

        <div className="flex flex-col items-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={userAnswer}
            onChange={handleInputChange}
            disabled={feedback !== null}
            className={`text-center text-5xl font-black w-48 border-b-4 focus:outline-none mb-6 pb-2 transition-colors bg-transparent font-mono ${
              feedback === 'correct'
                ? 'text-emerald-500 border-emerald-500'
                : feedback === 'incorrect'
                ? 'text-rose-500 border-rose-500'
                : 'text-gray-900 dark:text-white border-gray-300 dark:border-slate-700 focus:border-indigo-500'
            }`}
            placeholder="?"
            autoComplete="off"
          />
        </div>

        <div className="h-8 flex items-center justify-center">
          {feedback === 'correct' && (
            <span className="text-emerald-500 font-bold text-xl">
              Correct
            </span>
          )}
          {feedback === 'incorrect' && (
            <span className="text-rose-500 font-bold text-lg">
              Ans: {problem.quotient}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

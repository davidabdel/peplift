/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Timer, 
  Dumbbell, 
  Trophy,
  ArrowLeft,
  Info
} from 'lucide-react';
import { WORKOUT_DATA, Circuit, Exercise, Set } from './constants';

export default function App() {
  const [allCircuits, setAllCircuits] = useState<Circuit[]>(() => {
    const saved = localStorage.getItem('peplift_workouts');
    return saved ? JSON.parse(saved) : WORKOUT_DATA;
  });
  const [activeCircuit, setActiveCircuit] = useState<Circuit | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showFullPlan, setShowFullPlan] = useState<number | null>(null); // Index of the circuit
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('peplift_workouts', JSON.stringify(allCircuits));
  }, [allCircuits]);

  // PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTime > 0) {
      interval = setInterval(() => {
        setRestTime((prev) => prev - 1);
      }, 1000);
    } else if (restTime === 0) {
      setIsResting(false);
    }
    return () => clearInterval(interval);
  }, [isResting, restTime]);

  const startWorkout = (circuit: Circuit) => {
    setActiveCircuit(JSON.parse(JSON.stringify(circuit)));
    setWorkoutStarted(true);
    setCurrentExerciseIndex(0);
    setCurrentRound(1);
    setCompletedSets({});
    setWorkoutComplete(false);
    setShowExerciseList(false);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    if (!activeCircuit) return;
    
    // Update active circuit
    const newActive = { ...activeCircuit };
    const newExercises = [...newActive.exercises];
    const newSets = [...newExercises[exerciseIndex].sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    newExercises[exerciseIndex] = { ...newExercises[exerciseIndex], sets: newSets };
    newActive.exercises = newExercises;
    setActiveCircuit(newActive);

    // Also update the source plan in allCircuits
    setAllCircuits(prev => {
      const index = prev.findIndex(c => c.name === activeCircuit.name);
      if (index === -1) return prev;
      const next = [...prev];
      next[index] = JSON.parse(JSON.stringify(newActive)); // Sync current state back to plan
      return next;
    });
  };

  const updatePlanSet = (circuitIndex: number, exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setAllCircuits(prev => {
      const next = [...prev];
      const circuit = { ...next[circuitIndex] };
      const exercises = [...circuit.exercises];
      const exercise = { ...exercises[exerciseIndex] };
      const sets = [...exercise.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      exercise.sets = sets;
      exercises[exerciseIndex] = exercise;
      circuit.exercises = exercises;
      next[circuitIndex] = circuit;
      return next;
    });
  };

  const toggleSet = (exerciseIndex: number, setIndex: number) => {
    const key = `${currentRound}-${exerciseIndex}-${setIndex}`;
    setCompletedSets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    // If completing a set, maybe trigger a short rest?
    if (!completedSets[key]) {
      // Optional: auto-start rest timer
    }
  };

  const nextExercise = () => {
    if (!activeCircuit) return;

    if (currentExerciseIndex < activeCircuit.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      // End of circuit exercises, check rounds
      if (currentRound < activeCircuit.rounds) {
        setCurrentRound(prev => prev + 1);
        setCurrentExerciseIndex(0);
        startRest(90); // Longer rest between rounds
      } else {
        setWorkoutComplete(true);
      }
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const startRest = (seconds: number) => {
    setRestTime(seconds);
    setIsResting(true);
  };

  const resetWorkout = () => {
    setWorkoutStarted(false);
    setActiveCircuit(null);
    setWorkoutComplete(false);
  };

  if (workoutComplete) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-zinc-200 p-10 rounded-3xl shadow-xl max-w-md w-full"
        >
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200">
            <Trophy className="text-emerald-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-zinc-900">Workout Complete!</h1>
          <p className="text-zinc-500 mb-8">You crushed {activeCircuit?.name}. Great job staying consistent!</p>
          
          <button 
            onClick={resetWorkout}
            className="w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (!workoutStarted) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-12 font-sans">
        <header className="max-w-4xl mx-auto mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="text-5xl font-black tracking-tighter mb-2 italic text-zinc-900">PEPLIFT</h1>
            <p className="text-zinc-500 font-medium tracking-wide uppercase text-xs">Full Body Circuit Training</p>
          </motion.div>

          <AnimatePresence>
            {showInstallBanner && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-8 bg-zinc-900 text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
              >
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-1">Install PepLift</h3>
                  <p className="text-zinc-400 text-sm">Add PepLift to your home screen for quick access and offline training.</p>
                </div>
                <div className="flex gap-3 relative z-10 shrink-0">
                  <button 
                    onClick={() => setShowInstallBanner(false)}
                    className="px-6 py-3 rounded-xl font-bold bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    Not now
                  </button>
                  <button 
                    onClick={handleInstall}
                    className="px-8 py-3 rounded-xl font-bold bg-white text-zinc-900 hover:bg-zinc-100 transition-colors flex items-center gap-2"
                  >
                    Install App
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="max-w-6xl mx-auto relative px-6 md:px-12">
          {/* Subtle Full Screen Background Image */}
          <div 
            className="fixed inset-0 pointer-events-none opacity-[0.35] z-0 transition-opacity duration-1000"
            style={{ 
              backgroundImage: "url('/hero-models.jpg')",
              backgroundPosition: 'center 20%',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          />

          <div className="grid gap-8 md:grid-cols-3 relative z-10 py-12">
          {allCircuits.map((circuit, idx) => (
            <motion.div
              key={circuit.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              className="group bg-white border border-zinc-200 p-6 rounded-3xl hover:border-zinc-300 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full"
              onClick={() => startWorkout(circuit)}
            >
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="bg-zinc-100 p-3 rounded-2xl group-hover:bg-zinc-200 transition-colors">
                    <Dumbbell className="text-zinc-900" size={24} />
                  </div>
                  <span className="text-[10px] font-black bg-zinc-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                    {circuit.rounds} Rounds
                  </span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullPlan(idx);
                  }}
                  className="text-xs font-bold bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl text-zinc-600 uppercase tracking-widest transition-colors whitespace-nowrap text-center border border-zinc-200/50"
                >
                  View/Edit Plan
                </button>
              </div>
              
              <h2 className="text-2xl font-bold mb-2 text-zinc-900">{circuit.name}</h2>
              <div className="flex-grow">
                <p className="text-zinc-500 text-sm mb-4">
                  {circuit.exercises.length} exercises targeting major muscle groups.
                </p>
                <ul className="space-y-1 mb-6">
                  {circuit.exercises.slice(0, 5).map((ex) => (
                    <li key={ex.name} className="text-xs text-zinc-600 flex items-center gap-2">
                      <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                      {ex.name}
                    </li>
                  ))}
                  {circuit.exercises.length > 5 && (
                    <li className="text-xs text-zinc-400 italic">
                      + {circuit.exercises.length - 5} more...
                    </li>
                  )}
                </ul>
              </div>

              <button className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors">
                <Play size={18} fill="currentColor" />
                Start Session
              </button>
            </motion.div>
          ))}
          </div>
        </main>

        <footer className="max-w-4xl mx-auto mt-20 text-center text-zinc-400 text-sm">
          <p>© 2026 PepLift • Built for performance</p>
        </footer>

        {/* Full Plan Modal */}
        <AnimatePresence>
          {showFullPlan !== null && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowFullPlan(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white border border-zinc-200 w-full max-w-lg max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-zinc-900">{allCircuits[showFullPlan].name} Overview</h2>
                  <button onClick={() => setShowFullPlan(null)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                    Close
                  </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                  {allCircuits[showFullPlan].exercises.map((ex, exIdx) => (
                    <div key={ex.name} className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-300 font-mono text-xs">{String(exIdx + 1).padStart(2, '0')}</span>
                        <h4 className="font-bold text-zinc-900">{ex.name}</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2 ml-8">
                        {ex.sets.map((set, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100 text-xs text-zinc-600">
                            <span className="w-4">S{sIdx + 1}</span>
                            <input 
                              type="number" 
                              value={set.weight} 
                              onChange={(e) => updatePlanSet(showFullPlan!, exIdx, sIdx, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-14 bg-white border border-zinc-200 rounded-md px-2 py-0.5 font-bold text-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all" 
                            />
                            <span className="opacity-60">kg</span>
                            <span className="mx-1 opacity-20">×</span>
                            <input 
                              type="number" 
                              value={set.reps} 
                              onChange={(e) => updatePlanSet(showFullPlan!, exIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                              className="w-14 bg-white border border-zinc-200 rounded-md px-2 py-0.5 font-bold text-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all" 
                            />
                            <span className="opacity-60">reps</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-zinc-100">
                  <button 
                    onClick={() => {
                      startWorkout(allCircuits[showFullPlan!]);
                      setShowFullPlan(null);
                    }}
                    className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    Start This Circuit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const currentExercise = activeCircuit!.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + (currentRound - 1) * activeCircuit!.exercises.length) / (activeCircuit!.exercises.length * activeCircuit!.rounds)) * 100;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <header className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button 
          onClick={resetWorkout}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-lg text-zinc-900">{activeCircuit?.name}</h2>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Round {currentRound} of {activeCircuit?.rounds}</p>
        </div>
        <button 
          onClick={() => setShowExerciseList(!showExerciseList)}
          className={`p-2 rounded-full transition-colors ${showExerciseList ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100 text-zinc-400'}`}
        >
          <Info size={24} />
        </button>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-zinc-100 w-full">
        <motion.div 
          className="h-full bg-zinc-900" 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-2xl mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {showExerciseList ? (
            <motion.div
              key="exercise-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Circuit Overview</h3>
              {activeCircuit?.exercises.map((ex, idx) => (
                <div 
                  key={ex.name}
                  onClick={() => {
                    setCurrentExerciseIndex(idx);
                    setShowExerciseList(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    idx === currentExerciseIndex 
                      ? 'bg-zinc-900 text-white border-zinc-900' 
                      : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs opacity-50">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="font-bold">{ex.name}</span>
                  </div>
                  {idx < currentExerciseIndex && <CheckCircle2 size={18} className="text-zinc-400" />}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`${currentRound}-${currentExerciseIndex}`}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
            <section>
              <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight text-zinc-900">
                {currentExercise.name}
              </h1>
              {currentExercise.notes && (
                <div className="flex items-start gap-2 bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-zinc-500 text-sm italic">
                  <Info size={18} className="shrink-0 mt-0.5 text-zinc-400" />
                  <p>{currentExercise.notes}</p>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Sets & Reps</h3>
              {currentExercise.sets.map((set, sIdx) => {
                const isCompleted = completedSets[`${currentRound}-${currentExerciseIndex}-${sIdx}`];
                return (
                  <motion.div
                    key={sIdx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSet(currentExerciseIndex, sIdx)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                        : 'bg-zinc-50 border-zinc-100 hover:border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-500'
                      }`}>
                        {sIdx + 1}
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex items-center bg-white/50 px-2 py-1 rounded-xl border border-transparent focus-within:border-zinc-200 transition-all">
                          <input
                            type="number"
                            step="0.5"
                            value={set.weight}
                            onChange={(e) => updateSet(currentExerciseIndex, sIdx, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-14 text-xl font-bold bg-transparent outline-none text-center tabular-nums"
                          />
                          <span className="text-zinc-400 ml-0.5 text-xs font-bold uppercase tracking-tighter">kg</span>
                        </div>
                        <span className="mx-1 text-zinc-200">/</span>
                        <div className="relative flex items-center bg-white/50 px-2 py-1 rounded-xl border border-transparent focus-within:border-zinc-200 transition-all">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => updateSet(currentExerciseIndex, sIdx, 'reps', parseInt(e.target.value) || 0)}
                            className="w-14 text-xl font-bold bg-transparent outline-none text-center tabular-nums"
                          />
                          <span className="text-zinc-400 ml-0.5 text-xs font-bold uppercase tracking-tighter">reps</span>
                        </div>
                      </div>
                    </div>
                    {isCompleted && <CheckCircle2 className="text-emerald-500" size={24} />}
                  </motion.div>
                );
              })}
            </section>
          </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <footer className="p-6 border-t border-zinc-100 bg-white/80 backdrop-blur-md sticky bottom-0">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={prevExercise}
            disabled={currentExerciseIndex === 0 && currentRound === 1}
            className="p-4 bg-zinc-100 rounded-2xl disabled:opacity-30 transition-opacity hover:bg-zinc-200 text-zinc-600"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={() => startRest(60)}
            className="flex-grow bg-zinc-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors text-zinc-900"
          >
            <Timer size={20} />
            Rest 60s
          </button>

          <button 
            onClick={nextExercise}
            className="p-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </footer>

      {/* Rest Overlay */}
      <AnimatePresence>
        {isResting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="text-center">
              <p className="text-zinc-400 font-bold uppercase tracking-widest mb-4">Rest Period</p>
              <motion.h2 
                key={restTime}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-9xl font-black tabular-nums mb-12 text-zinc-900"
              >
                {restTime}
              </motion.h2>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setRestTime(prev => prev + 15)}
                  className="bg-zinc-100 px-6 py-3 rounded-xl font-bold border border-zinc-200 text-zinc-900 hover:bg-zinc-200 transition-colors"
                >
                  +15s
                </button>
                <button 
                  onClick={() => setIsResting(false)}
                  className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

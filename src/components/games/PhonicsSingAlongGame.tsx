import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

const PHONICS = [
  { letter: 'A', sound: 'aaa', word: 'Apple', emoji: '🍎', color: 'bg-red-400' },
  { letter: 'B', sound: 'buh', word: 'Ball', emoji: '⚽', color: 'bg-blue-400' },
  { letter: 'C', sound: 'cuh', word: 'Cat', emoji: '🐱', color: 'bg-orange-400' },
  { letter: 'D', sound: 'duh', word: 'Dog', emoji: '🐶', color: 'bg-yellow-400' },
  { letter: 'E', sound: 'ehh', word: 'Egg', emoji: '🥚', color: 'bg-green-400' },
  { letter: 'F', sound: 'fff', word: 'Fish', emoji: '🐟', color: 'bg-cyan-400' },
  { letter: 'G', sound: 'guh', word: 'Goat', emoji: '🐐', color: 'bg-purple-400' },
  { letter: 'H', sound: 'huh', word: 'Hat', emoji: '🎩', color: 'bg-pink-400' },
  { letter: 'I', sound: 'ihh', word: 'Ice', emoji: '🧊', color: 'bg-blue-300' },
  { letter: 'J', sound: 'juh', word: 'Jar', emoji: '🫙', color: 'bg-amber-400' },
  { letter: 'K', sound: 'kuh', word: 'Kite', emoji: '🪁', color: 'bg-teal-400' },
  { letter: 'L', sound: 'lll', word: 'Lion', emoji: '🦁', color: 'bg-yellow-500' },
  { letter: 'M', sound: 'mmm', word: 'Moon', emoji: '🌙', color: 'bg-indigo-400' },
  { letter: 'N', sound: 'nnn', word: 'Nest', emoji: '🪺', color: 'bg-lime-500' },
  { letter: 'O', sound: 'ohh', word: 'Owl', emoji: '🦉', color: 'bg-orange-300' },
  { letter: 'P', sound: 'puh', word: 'Pig', emoji: '🐷', color: 'bg-pink-300' },
];

export default function PhonicsSingAlongGame({ kid, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tapped, setTapped] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const current = PHONICS[currentIndex];

  const speak = (text: string, rate = 0.7) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate; utt.pitch = 1.4; utt.volume = 1;
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const playPhonic = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTapped(true);
    speak(`${current.letter} says ${current.sound}, ${current.sound}, ${current.word}!`, 0.65);
    soundManager.playPop();
    setTimeout(() => {
      setIsAnimating(false);
      if (!completed.includes(currentIndex)) {
        const newCompleted = [...completed, currentIndex];
        setCompleted(newCompleted);
        if (newCompleted.length >= 5) { handleFinish(); }
      }
    }, 2000);
  };

  const handleFinish = () => {
    soundManager.playSuccess();
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    onComplete(8);
  };

  const nextLetter = () => {
    setTapped(false); setIsAnimating(false);
    const next = (currentIndex + 1) % PHONICS.length;
    setCurrentIndex(next);
    const item = PHONICS[next];
    setTimeout(() => speak(`${item.letter}! ${item.word}`, 0.7), 300);
  };

  const reset = () => {
    setCurrentIndex(0); setTapped(false); setCompleted([]); setShowIntro(true);
    window.speechSynthesis?.cancel();
  };

  const startGame = () => {
    setShowIntro(false);
    speak(`Let's learn our letters! ${current.letter}! ${current.word}`, 0.7);
  };

  useEffect(() => { return () => { window.speechSynthesis?.cancel(); }; }, []);

  const progress = Math.min(completed.length, 5);

  if (showIntro) {
    return (
      <div className="space-y-4 sm:space-y-8 text-center">
        <div className="flex items-center justify-between">
          <Link to="/" className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <h2 className="text-xl sm:text-3xl font-black text-purple-500">Phonics Sing-Along</h2>
          <div className="w-10 sm:w-12" />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-purple-300 space-y-6 sm:space-y-8 max-w-md mx-auto"
        >
          <div className="text-7xl sm:text-8xl animate-bounce">🎵</div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#2F3061]">Learn Your Letters!</h3>
          <p className="text-lg sm:text-xl text-gray-500 font-medium">
            Tap each big letter to hear its sound and name. Learn 5 letters to win! 🌟
          </p>
          <button onClick={startGame} className="w-full bg-purple-500 text-white py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-xl hover:scale-105 transition-transform">
            Let's Sing! 🎶
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-purple-500">Phonics Sing-Along</h2>
        <div className="flex items-center gap-1 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-purple-600 font-black text-sm sm:text-base">{progress}/5</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${i < progress ? 'bg-purple-500 scale-125' : 'bg-gray-200'}`} />
        ))}
      </div>

      {/* Main tap card */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={playPhonic}
        className={`relative w-full ${current.color} rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-white p-6 sm:p-10 space-y-3 sm:space-y-4 cursor-pointer overflow-hidden`}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-10 text-white font-black select-none pointer-events-none"
          style={{ fontSize: 'clamp(8rem, 40vw, 20rem)', lineHeight: 1 }}>
          {current.letter}
        </div>
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1], rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="text-7xl sm:text-9xl relative z-10"
        >
          {current.emoji}
        </motion.div>
        <div className="relative z-10 space-y-1 sm:space-y-2">
          <p className="text-white/80 font-black text-xl sm:text-2xl uppercase tracking-wider">{current.letter} says...</p>
          <motion.p
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
            className="text-white font-black text-5xl sm:text-6xl"
          >
            "{current.sound}"
          </motion.p>
          <p className="text-white font-black text-2xl sm:text-3xl">{current.word}!</p>
        </div>
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 bg-white/20 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl">
          <Volume2 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-white font-black text-base sm:text-lg">Tap to hear!</span>
        </div>
      </motion.button>

      {/* Controls */}
      <div className="flex justify-center gap-3 sm:gap-4">
        <button onClick={reset} className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 text-sm sm:text-base">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Restart
        </button>
        <button onClick={nextLetter} className="px-5 sm:px-8 py-2 sm:py-3 bg-purple-500 text-white rounded-2xl font-black text-base sm:text-lg shadow-lg hover:scale-105 transition-transform">
          Next Letter →
        </button>
      </div>

      <p className="text-gray-400 font-medium text-xs sm:text-sm">
        Tap the card to hear <strong>{current.letter}</strong> for <strong>{current.word}</strong>!
      </p>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

// EXPANDED VOCABULARY
const WORDS = [
  { word: 'CAT', image: '🐱' }, { word: 'DOG', image: '🐶' },
  { word: 'SUN', image: '☀️' }, { word: 'FISH', image: '🐟' },
  { word: 'BIRD', image: '🐦' }, { word: 'TREE', image: '🌳' },
  { word: 'STAR', image: '⭐' }, { word: 'APPLE', image: '🍎' },
  { word: 'MOON', image: '🌙' }, { word: 'CAR', image: '🚗' },
  { word: 'BEAR', image: '🐻' }, { word: 'FROG', image: '🐸' },
  { word: 'DUCK', image: '🦆' }, { word: 'LION', image: '🦁' },
  { word: 'PIG', image: '🐷' }, { word: 'COW', image: '🐮' },
  { word: 'BOAT', image: '⛵' }, { word: 'SHOE', image: '👟' },
  { word: 'BALL', image: '⚽' }, { word: 'KITE', image: '🪁' },
  { word: 'BOOK', image: '📖' }, { word: 'MILK', image: '🥛' },
  { word: 'CAKE', image: '🎂' }, { word: 'HAT', image: '🎩' },
  { word: 'ROSE', image: '🌹' }, { word: 'FIRE', image: '🔥' },
  { word: 'LEAF', image: '🍂' }, { word: 'SNOW', image: '❄️' },
  { word: 'RAIN', image: '🌧️' }, { word: 'DOOR', image: '🚪' },
  { word: 'KEY', image: '🔑' }, { word: 'BELL', image: '🔔' }
];

export default function SpellingGame({ kid, onComplete }: Props) {
  const [currentWord, setCurrentWord] = useState(WORDS[0]);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // NEW: Central cleanup function to stop the music
  const cleanup = () => {
    soundManager.stopMusic();
  };

  useEffect(() => {
    reset();

    // NEW: React will run this cleanup function when the component unmounts (e.g., when leaving the page)
    return cleanup;
  }, []);

  const reset = () => {
    soundManager.stopMusic();
    soundManager.startMusic();
    const nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(nextWord);
    setTypedLetters([]);
    setIsComplete(false);

    // Create random bubbles including the word's letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const wordLetters = nextWord.word.split('');
    const extraLetters = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]);
    const allBubbles = [...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5);
    setBubbles(allBubbles);
  };

  const handlePop = (letter: string, index: number) => {
    if (isComplete) return;

    const nextLetter = currentWord.word[typedLetters.length];
    if (letter === nextLetter) {
      soundManager.playPop();
      const newTyped = [...typedLetters, letter];
      setTypedLetters(newTyped);

      // Remove the popped bubble
      setBubbles(prev => prev.filter((_, i) => i !== index));

      if (newTyped.length === currentWord.word.length) {
        handleFinish();
      }
    } else {
      // Wrong letter - shake effect or sound
      soundManager.playGameOver();
    }
  };

  const handleFinish = () => {
    soundManager.playSuccess();
    soundManager.stopMusic();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });
    setIsComplete(true);
    onComplete(5);
  };

  return (
    <div className="space-y-8 text-center">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={cleanup} // NEW: Immediately kill the music when clicking the Back button
          className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-black text-[#4ECDC4]">Word Bubbles</h2>
        <div className="w-12" />
      </div>

      <div className="bg-white p-12 rounded-[40px] shadow-2xl border-8 border-[#FFE66D] space-y-12">
        {/* Target Word Display */}
        <div className="space-y-6">
          <div className="text-9xl animate-bounce">{currentWord.image}</div>
          <div className="flex justify-center gap-4">
            {currentWord.word.split('').map((letter, i) => (
              <div
                key={i}
                className={`w-16 h-16 rounded-2xl border-4 flex items-center justify-center text-3xl font-black transition-all ${typedLetters[i]
                    ? 'bg-[#4ECDC4] border-[#4ECDC4] text-white scale-110'
                    : 'bg-gray-50 border-gray-200 text-transparent'
                  }`}
              >
                {typedLetters[i] || letter}
              </div>
            ))}
          </div>
        </div>

        {/* Bubbles Grid */}
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto">
          <AnimatePresence>
            {bubbles.map((letter, i) => (
              <motion.button
                key={`${letter}-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, rotate: 180 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handlePop(letter, i)}
                className="w-20 h-20 rounded-full bg-blue-100 border-4 border-blue-300 flex items-center justify-center text-3xl font-black text-blue-600 shadow-lg hover:bg-blue-200 transition-colors"
              >
                {letter}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="space-y-6 pt-8"
          >
            <h3 className="text-4xl font-black text-[#2F3061]">You Spelled It!</h3>
            <button
              onClick={reset}
              className="bg-[#4ECDC4] text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Next Word!
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200"
        >
          <RotateCcw className="w-5 h-5" />
          New Word
        </button>
      </div>
    </div>
  );
}
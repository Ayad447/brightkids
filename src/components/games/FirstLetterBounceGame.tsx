import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

// NEW: Massively expanded dictionary covering all 26 letters!
const ITEMS = [
  { word: 'Apple', emoji: '🍎', letter: 'A' }, { word: 'Ant', emoji: '🐜', letter: 'A' }, { word: 'Airplane', emoji: '✈️', letter: 'A' },
  { word: 'Banana', emoji: '🍌', letter: 'B' }, { word: 'Bear', emoji: '🐻', letter: 'B' }, { word: 'Ball', emoji: '⚽', letter: 'B' },
  { word: 'Cat', emoji: '🐱', letter: 'C' }, { word: 'Car', emoji: '🚗', letter: 'C' }, { word: 'Cow', emoji: '🐮', letter: 'C' },
  { word: 'Dog', emoji: '🐶', letter: 'D' }, { word: 'Duck', emoji: '🦆', letter: 'D' }, { word: 'Dolphin', emoji: '🐬', letter: 'D' },
  { word: 'Elephant', emoji: '🐘', letter: 'E' }, { word: 'Egg', emoji: '🥚', letter: 'E' },
  { word: 'Fish', emoji: '🐟', letter: 'F' }, { word: 'Frog', emoji: '🐸', letter: 'F' }, { word: 'Fire', emoji: '🔥', letter: 'F' },
  { word: 'Grapes', emoji: '🍇', letter: 'G' }, { word: 'Giraffe', emoji: '🦒', letter: 'G' }, { word: 'Guitar', emoji: '🎸', letter: 'G' },
  { word: 'Hat', emoji: '🎩', letter: 'H' }, { word: 'Horse', emoji: '🐴', letter: 'H' }, { word: 'House', emoji: '🏠', letter: 'H' },
  { word: 'Ice', emoji: '🧊', letter: 'I' }, { word: 'Ice Cream', emoji: '🍦', letter: 'I' },
  { word: 'Jar', emoji: '🫙', letter: 'J' }, { word: 'Juice', emoji: '🧃', letter: 'J' },
  { word: 'Kite', emoji: '🪁', letter: 'K' }, { word: 'Kangaroo', emoji: '🦘', letter: 'K' }, { word: 'Key', emoji: '🔑', letter: 'K' },
  { word: 'Lion', emoji: '🦁', letter: 'L' }, { word: 'Leaf', emoji: '🍃', letter: 'L' }, { word: 'Lemon', emoji: '🍋', letter: 'L' },
  { word: 'Moon', emoji: '🌙', letter: 'M' }, { word: 'Monkey', emoji: '🐵', letter: 'M' }, { word: 'Mouse', emoji: '🐭', letter: 'M' },
  { word: 'Nest', emoji: '🪺', letter: 'N' }, { word: 'Nose', emoji: '👃', letter: 'N' },
  { word: 'Orange', emoji: '🍊', letter: 'O' }, { word: 'Owl', emoji: '🦉', letter: 'O' }, { word: 'Octopus', emoji: '🐙', letter: 'O' },
  { word: 'Pig', emoji: '🐷', letter: 'P' }, { word: 'Penguin', emoji: '🐧', letter: 'P' }, { word: 'Pizza', emoji: '🍕', letter: 'P' },
  { word: 'Queen', emoji: '👑', letter: 'Q' },
  { word: 'Rainbow', emoji: '🌈', letter: 'R' }, { word: 'Rabbit', emoji: '🐰', letter: 'R' }, { word: 'Rocket', emoji: '🚀', letter: 'R' },
  { word: 'Star', emoji: '⭐', letter: 'S' }, { word: 'Sun', emoji: '☀️', letter: 'S' }, { word: 'Snake', emoji: '🐍', letter: 'S' },
  { word: 'Tree', emoji: '🌳', letter: 'T' }, { word: 'Tiger', emoji: '🐯', letter: 'T' }, { word: 'Train', emoji: '🚂', letter: 'T' },
  { word: 'Umbrella', emoji: '☂️', letter: 'U' }, { word: 'Unicorn', emoji: '🦄', letter: 'U' },
  { word: 'Van', emoji: '🚐', letter: 'V' }, { word: 'Volcano', emoji: '🌋', letter: 'V' },
  { word: 'Watermelon', emoji: '🍉', letter: 'W' }, { word: 'Whale', emoji: '🐳', letter: 'W' },
  { word: 'Xylophone', emoji: '🎹', letter: 'X' },
  { word: 'Yarn', emoji: '🧶', letter: 'Y' }, { word: 'Yo-yo', emoji: '🪀', letter: 'Y' },
  { word: 'Zebra', emoji: '🦓', letter: 'Z' }, { word: 'Zipper', emoji: '🤐', letter: 'Z' },
];

function getRandomLetters(correct: string, count = 3): string[] {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== correct);
  const wrong = alphabet.sort(() => Math.random() - 0.5).slice(0, count - 1);
  return [...wrong, correct].sort(() => Math.random() - 0.5);
}

export default function FirstLetterBounceGame({ kid, onComplete }: Props) {
  const [currentItem, setCurrentItem] = useState(ITEMS[0]);
  const [choices, setChoices] = useState<string[]>([]);
  const [dropY, setDropY] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const scoreRef = useRef(0);

  // NEW: A memory bank to prevent repetitive words during a single game
  const usedWordsRef = useRef<string[]>([]);

  // NEW: Logic to pick a fresh word every time
  const getNextFreshItem = () => {
    // Filter out words we've already played
    let availableItems = ITEMS.filter(item => !usedWordsRef.current.includes(item.word));

    // Safety fallback: If we somehow run out of words, reset the memory bank
    if (availableItems.length === 0) {
      usedWordsRef.current = [];
      availableItems = ITEMS;
    }

    const nextItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    usedWordsRef.current.push(nextItem.word); // Add it to memory
    return nextItem;
  };

  const safeTimeout = (cb: () => void, ms: number) => {
    const id = setTimeout(cb, ms);
    timeoutsRef.current.push(id);
  };

  const cleanup = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.8; utt.pitch = 1.3;
    window.speechSynthesis.speak(utt);
  };

  const startRound = (item: typeof ITEMS[0]) => {
    setDropY(0);
    setFeedback(null);
    setIsDropping(true);
    speak(`What letter does ${item.word} start with?`);
    startTimeRef.current = performance.now();

    const currentDuration = Math.max(1200, 3500 - (scoreRef.current * 300));

    const animate = (now: number) => {
      const elapsed = now - (startTimeRef.current ?? now);
      const progress = Math.min(elapsed / currentDuration, 1);
      setDropY(progress * 100);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsDropping(false);
        setFeedback('wrong');
        soundManager.playGameOver();
        speak(`Too slow! It starts with ${item.letter}!`);
        safeTimeout(nextRound, 1500);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  const stopDrop = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsDropping(false);
  };

  const handleChoice = (letter: string) => {
    if (feedback || !isDropping) return;
    stopDrop();
    if (letter === currentItem.letter) {
      setFeedback('correct');
      soundManager.playSuccess();
      speak(`Yes! ${currentItem.word} starts with ${letter}!`);

      const newScore = score + 1;
      setScore(newScore);
      scoreRef.current = newScore;

      if (newScore >= 8) {
        safeTimeout(() => {
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          setIsFinished(true);
          onComplete(8);
        }, 1000);
      } else {
        safeTimeout(nextRound, 1200);
      }
    } else {
      setFeedback('wrong');
      soundManager.playGameOver();
      speak(`Not quite! ${currentItem.word} starts with ${currentItem.letter}!`);
      safeTimeout(nextRound, 1500);
    }
  };

  const nextRound = () => {
    const next = getNextFreshItem(); // Using the new function!
    setCurrentItem(next);
    setChoices(getRandomLetters(next.letter));
    setFeedback(null);
    setDropY(0);
    safeTimeout(() => startRound(next), 400);
  };

  const reset = () => {
    cleanup();
    setScore(0);
    scoreRef.current = 0;
    usedWordsRef.current = []; // NEW: Clear the memory bank when restarting!
    setIsFinished(false);
    setFeedback(null);
    setDropY(0);
    setIsDropping(false);

    const next = getNextFreshItem();
    setCurrentItem(next);
    setChoices(getRandomLetters(next.letter));
    safeTimeout(() => startRound(next), 600);
  };

  useEffect(() => {
    const item = getNextFreshItem();
    setCurrentItem(item);
    setChoices(getRandomLetters(item.letter));
    safeTimeout(() => startRound(item), 800);
    return cleanup;
  }, []);

  return (
    <div className="space-y-8 text-center">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          onClick={cleanup}
          className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-black text-orange-500">First Letter Bounce</h2>
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
          <span className="text-orange-600 font-black">{score}/8</span>
        </div>
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border-8 border-orange-300 space-y-6">
          <div className="text-8xl">🏆</div>
          <h3 className="text-4xl font-black text-[#2F3061]">You're a Star!</h3>
          <button onClick={reset} className="bg-orange-500 text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform">
            Play Again!
          </button>
        </motion.div>
      ) : (
        <div className="bg-white rounded-[40px] shadow-2xl border-8 border-orange-200 overflow-hidden">
          {/* Drop zone */}
          <div className="relative h-56 bg-gradient-to-b from-sky-100 to-sky-200 flex items-start justify-center overflow-hidden">
            <AnimatePresence>
              <div
                className="absolute text-8xl transition-none"
                style={{ top: `${dropY * 0.78}%`, transform: 'translateY(-50%)' }}
              >
                {currentItem.emoji}
              </div>
            </AnimatePresence>

            {feedback === 'correct' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-green-400/30">
                <span className="text-6xl">✅</span>
              </motion.div>
            )}
            {feedback === 'wrong' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center bg-red-400/20">
                <span className="text-5xl">The letter is {currentItem.letter}!</span>
              </motion.div>
            )}

            <div className="absolute bottom-3 left-0 right-0 text-center">
              <p className="font-black text-sky-600 text-lg">{currentItem.word}</p>
            </div>
          </div>

          {/* Letter buttons */}
          <div className="p-6">
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-5">What letter does it start with?</p>
            <div className="grid grid-cols-3 gap-4">
              {choices.map((letter) => (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.08, y: -4 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleChoice(letter)}
                  className={`py-6 rounded-3xl font-black text-5xl shadow-lg transition-all min-h-[100px] ${feedback && letter === currentItem.letter
                      ? 'bg-green-400 text-white'
                      : feedback && letter !== currentItem.letter
                        ? 'bg-gray-100 text-gray-300'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-4 border-orange-200'
                    }`}
                >
                  {letter}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200">
          <RotateCcw className="w-5 h-5" />
          Restart
        </button>
      </div>
    </div>
  );
}
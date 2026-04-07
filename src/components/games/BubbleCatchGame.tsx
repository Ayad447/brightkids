import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

interface Bubble {
  id: number;
  letter: string;
  x: number;
  y: number;
  speed: number;
  size: number;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BubbleCatchGame({ kid, onComplete }: Props) {
  const [targetLetter, setTargetLetter] = useState('');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const requestRef = useRef<number>(null);
  const targetLetterRef = useRef(targetLetter);
  const bubblesCountRef = useRef(0);

  useEffect(() => {
    targetLetterRef.current = targetLetter;
  }, [targetLetter]);

  const spawnBubble = () => {
    const isTarget = Math.random() < 0.4 || bubblesCountRef.current === 0;
    const letter = isTarget ? targetLetterRef.current : LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      letter,
      x: Math.random() * 80 + 10, // Adjusted to stay away from extreme edges
      y: 105, // Start just slightly below the visible frame
      speed: Math.random() * 0.3 + 0.2, // Slightly faster for mobile engagement
      size: Math.random() * 20 + 60, // Slightly larger for easier touch targets
    };
    setBubbles(prev => [...prev, newBubble]);
    bubblesCountRef.current++;
  };

  const updateGame = () => {
    if (isGameOver || !isStarted) return;
    setBubbles(prev => {
      const next = prev.map(b => ({ ...b, y: b.y - b.speed }));
      const targetReachedTop = next.find(b => b.y < -10 && b.letter === targetLetterRef.current);
      if (targetReachedTop) { handleGameOver(); return next; }
      return next.filter(b => b.y >= -10);
    });
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    soundManager.playGameOver();
    soundManager.stopMusic();
  };

  const handleFinish = () => {
    setIsStarted(false);
    soundManager.playSuccess();
    soundManager.stopMusic();
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    onComplete(10);
  };

  useEffect(() => {
    if (isStarted && !isGameOver) {
      soundManager.startMusic();
      requestRef.current = requestAnimationFrame(updateGame);
      const interval = setInterval(spawnBubble, 1500);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(interval);
      };
    }
  }, [isStarted, isGameOver]);

  const handleBubbleClick = (bubble: Bubble) => {
    if (isGameOver || !isStarted) return;
    if (bubble.letter === targetLetter) {
      soundManager.playPop();
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
      setScore(s => {
        const nextScore = s + 1;
        if (nextScore >= 10) { handleFinish(); }
        else { setTargetLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]); }
        return nextScore;
      });
    }
  };

  const resetGame = () => {
    soundManager.playStartGame();
    const initialLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setTargetLetter(initialLetter);
    targetLetterRef.current = initialLetter;
    setBubbles([]);
    bubblesCountRef.current = 0;
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-screen p-4 space-y-3 sm:space-y-4 text-center overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <Link
          to="/"
          className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50"
          onClick={() => soundManager.stopMusic()}
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-cyan-500">Bubble Catch</h2>
        <div className="flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm">
          <span className="text-gray-400 font-bold text-xs sm:text-base">Score:</span>
          <span className="text-cyan-500 font-black text-sm sm:text-base">{score}/10</span>
        </div>
      </div>

      {/* Game Area — touch-none prevents swipe/scroll issues on mobile */}
      <div className="relative flex-1 min-h-0 touch-none bg-gradient-to-b from-cyan-100 to-blue-200 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-white overflow-hidden">
        {/* Bubbles */}
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.button
              key={b.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => handleBubbleClick(b)}
              className="absolute bg-white/40 backdrop-blur-sm rounded-full border-2 border-white/60 flex items-center justify-center font-black text-[#2F3061] shadow-lg hover:scale-110 active:scale-95 transition-transform z-20 select-none touch-manipulation"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                fontSize: `${b.size / 2.2}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {b.letter}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Target Letter Banner */}
        {isStarted && !isGameOver && (
          <div className="absolute top-3 sm:top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-2 sm:py-4 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-cyan-300 z-50 shadow-xl">
            <p className="text-[10px] sm:text-sm font-black text-cyan-600 uppercase">Catch the bubble</p>
            <h3 className="text-4xl sm:text-6xl font-black text-[#2F3061]">{targetLetter}</h3>
          </div>
        )}

        {/* Start Overlay */}
        {!isStarted && !isGameOver && (
          <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 sm:space-y-6 max-w-[280px] sm:max-w-xs border-4 sm:border-8 border-cyan-100 mx-4">
              <div className="text-5xl sm:text-7xl">🫧</div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">Ready to Pop?</h3>
              <p className="text-gray-500 font-medium text-sm sm:text-base">Catch the bubbles with the right letters before they reach the top!</p>
              <button
                onClick={resetGame}
                className="w-full bg-cyan-500 text-white py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Start Popping!
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 sm:space-y-6 max-w-[280px] sm:max-w-xs border-4 sm:border-8 border-red-100 mx-4">
              <div className="text-5xl sm:text-7xl">🎈</div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">Game Over!</h3>
              <p className="text-gray-500 font-medium text-sm sm:text-base">A bubble reached the top! Want to try again?</p>
              <button
                onClick={resetGame}
                className="w-full bg-red-500 text-white py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-400 font-medium text-xs sm:text-sm flex-shrink-0">
        Help {kid.name} catch all the {targetLetter} bubbles!
      </p>
    </div>
  );
}
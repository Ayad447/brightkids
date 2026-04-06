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
    // 40% chance of target letter, or if it's the first bubble
    const isTarget = Math.random() < 0.4 || bubblesCountRef.current === 0;
    const letter = isTarget ? targetLetterRef.current : LETTERS[Math.floor(Math.random() * LETTERS.length)];
    
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      letter: letter,
      x: Math.random() * 80 + 10,
      y: 110,
      speed: Math.random() * 0.2 + 0.1,
      size: Math.random() * 20 + 60,
    };
    
    setBubbles(prev => [...prev, newBubble]);
    bubblesCountRef.current++;
  };

  const updateGame = () => {
    if (isGameOver || !isStarted) return;

    setBubbles(prev => {
      const next = prev.map(b => ({ ...b, y: b.y - b.speed }));
      
      // Check if target bubble reached the top
      const targetReachedTop = next.find(b => b.y < -10 && b.letter === targetLetterRef.current);
      if (targetReachedTop) {
        handleGameOver();
        return next;
      }
      
      // Remove other bubbles that reach the top
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
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
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
        if (nextScore >= 10) {
          handleFinish();
        } else {
          setTargetLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
        }
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
    <div className="space-y-8 text-center h-full flex flex-col">
      <div className="flex items-center justify-between">
        <Link to="/" className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50" onClick={() => soundManager.stopMusic()}>
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-black text-cyan-500">Bubble Catch</h2>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm">
          <span className="text-gray-400 font-bold">Score:</span>
          <span className="text-cyan-500 font-black">{score}/10</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[500px] bg-gradient-to-b from-cyan-100 to-blue-200 rounded-[40px] shadow-2xl border-8 border-white overflow-hidden">
        {/* Bubbles */}
        <AnimatePresence>
          {bubbles.map(b => (
            <motion.button
              key={b.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => handleBubbleClick(b)}
              className="absolute -ml-8 -mt-8 bg-white/40 backdrop-blur-sm rounded-full border-2 border-white/60 flex items-center justify-center font-black text-[#2F3061] shadow-lg hover:scale-110 transition-transform z-20"
              style={{ 
                left: `${b.x}%`, 
                top: `${b.y}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                fontSize: `${b.size / 2}px`
              }}
            >
              {b.letter}
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Target Letter - High Z-Index */}
        {isStarted && !isGameOver && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-8 py-4 rounded-3xl border-4 border-cyan-300 z-50 shadow-xl">
            <p className="text-sm font-black text-cyan-600 uppercase">Catch the bubble</p>
            <h3 className="text-6xl font-black text-[#2F3061]">{targetLetter}</h3>
          </div>
        )}

        {/* Overlays */}
        {!isStarted && !isGameOver && (
          <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white p-8 rounded-[40px] shadow-2xl space-y-6 max-w-xs border-8 border-cyan-100">
              <div className="text-7xl">🫧</div>
              <h3 className="text-2xl font-black text-[#2F3061]">Ready to Pop?</h3>
              <p className="text-gray-500 font-medium">Catch the bubbles with the right letters before they reach the top!</p>
              <button 
                onClick={resetGame}
                className="w-full bg-cyan-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform"
              >
                Start Popping!
              </button>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-white p-8 rounded-[40px] shadow-2xl space-y-6 max-w-xs border-8 border-red-100">
              <div className="text-7xl">🎈</div>
              <h3 className="text-2xl font-black text-[#2F3061]">Game Over!</h3>
              <p className="text-gray-500 font-medium">A bubble reached the top! Want to try again?</p>
              <button 
                onClick={resetGame}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-400 font-medium">Help {kid.name} catch all the {targetLetter} bubbles!</p>
    </div>
  );
}

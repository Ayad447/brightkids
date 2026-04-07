import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Timer, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

const GRID_SIZE = 3;
const WINNING_SCORE = 20;
type MoleType = 'standard' | 'golden' | 'friend' | 'hit' | 'oops';
interface MoleData { type: MoleType; id: number; }

export default function WhackAMoleGame({ kid, onComplete }: Props) {
  const [moles, setMoles] = useState<Record<number, MoleData>>({});
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const molesRef = useRef<Record<number, MoleData>>({});
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cellTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => { molesRef.current = moles; }, [moles]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { isGameOverRef.current = isGameOver; }, [isGameOver]);

  const cleanup = () => {
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    cellTimeoutsRef.current.forEach(clearTimeout);
    cellTimeoutsRef.current.clear();
    soundManager.stopMusic();
  };

  useEffect(() => { return cleanup; }, []);

  const spawnMole = () => {
    if (isGameOverRef.current) return;
    const activeIndices = Object.keys(molesRef.current).map(Number);
    const availableSpots = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i)
      .filter(i => !activeIndices.includes(i));
    if (availableSpots.length > 0) {
      const pos = availableSpots[Math.floor(Math.random() * availableSpots.length)];
      const rand = Math.random();
      let type: MoleType = 'standard';
      if (rand > 0.85) type = 'golden';
      else if (rand > 0.65) type = 'friend';
      setMoles(prev => ({ ...prev, [pos]: { type, id: Date.now() } }));
      const currentScore = scoreRef.current;
      const baseDuration = type === 'golden' ? 800 : 1500;
      const duration = Math.max(500, baseDuration - (currentScore * 30));
      const despawnTid = setTimeout(() => {
        setMoles(prev => { const next = { ...prev }; delete next[pos]; return next; });
        cellTimeoutsRef.current.delete(pos);
      }, duration);
      cellTimeoutsRef.current.set(pos, despawnTid);
    }
    const spawnDelay = Math.max(400, 1000 - (scoreRef.current * 25));
    gameLoopRef.current = setTimeout(spawnMole, spawnDelay);
  };

  const startGameLoop = () => {
    gameLoopRef.current = setTimeout(spawnMole, 500);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleTimeUp(); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isStarted && !isGameOver) {
      soundManager.startMusic();
      startGameLoop();
    }
    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [isStarted, isGameOver]);

  const handleWhack = (index: number) => {
    if (isGameOver) return;
    const mole = molesRef.current[index];
    if (!mole || mole.type === 'hit' || mole.type === 'oops') return;
    const existingTid = cellTimeoutsRef.current.get(index);
    if (existingTid) clearTimeout(existingTid);
    let newType: MoleType = 'hit';
    if (mole.type === 'standard') { soundManager.playPop(); setScore(s => s + 1); }
    else if (mole.type === 'golden') { soundManager.playSuccess(); setScore(s => s + 3); setTimeLeft(t => t + 2); }
    else if (mole.type === 'friend') { soundManager.playGameOver(); newType = 'oops'; setScore(s => Math.max(0, s - 1)); }
    setMoles(prev => ({ ...prev, [index]: { ...mole, type: newType } }));
    const cleanupTid = setTimeout(() => {
      setMoles(prev => { const next = { ...prev }; delete next[index]; return next; });
      cellTimeoutsRef.current.delete(index);
    }, 400);
    cellTimeoutsRef.current.set(index, cleanupTid);
  };

  const handleTimeUp = () => {
    setIsGameOver(true);
    soundManager.stopMusic();
    if (scoreRef.current >= WINNING_SCORE) {
      setHasWon(true);
      soundManager.playSuccess();
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      onComplete(10);
    } else {
      setHasWon(false);
      soundManager.playGameOver();
    }
  };

  const resetGame = () => {
    cleanup();
    soundManager.playStartGame();
    setMoles({});
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setHasWon(false);
    setIsStarted(true);
  };

  const getEmojiForType = (type: MoleType) => {
    switch (type) {
      case 'standard': return '🐹';
      case 'golden': return '🌟';
      case 'friend': return '🐰';
      case 'hit': return '💥';
      case 'oops': return '❌';
      default: return '🐹';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4 text-center">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <Link to="/" className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50" onClick={cleanup}>
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-amber-600">Whack-a-Mole</h2>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm transition-colors ${timeLeft <= 5 ? 'bg-red-50' : ''}`}>
            <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
            <span className={`font-black text-sm sm:text-base ${timeLeft <= 5 ? 'text-red-600' : 'text-amber-600'}`}>{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm">
            <span className="text-gray-400 font-bold text-xs sm:text-sm">Score:</span>
            <span className="text-amber-600 font-black text-sm sm:text-base">{score}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative flex-1 min-h-0 bg-gradient-to-b from-amber-100 to-amber-200 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-white overflow-hidden p-3 sm:p-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 h-full max-w-sm sm:max-w-lg mx-auto">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const activeMole = moles[i];
            return (
              <div key={i} className="relative aspect-square">
                <div className="absolute inset-0 bg-amber-900/30 rounded-full border-b-4 sm:border-b-8 border-amber-950/20 shadow-inner" />
                <AnimatePresence>
                  {activeMole && (
                    <motion.button
                      key={activeMole.id}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      onClick={() => handleWhack(i)}
                      className="absolute inset-0 flex items-center justify-center text-5xl sm:text-7xl md:text-8xl z-20 hover:scale-110 transition-transform"
                      style={{ cursor: (activeMole.type === 'hit' || activeMole.type === 'oops') ? 'default' : 'pointer' }}
                    >
                      {getEmojiForType(activeMole.type)}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Start Overlay */}
        {!isStarted && !isGameOver && (
          <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 sm:space-y-6 max-w-[300px] sm:max-w-sm w-full border-4 sm:border-8 border-amber-100">
              <div className="flex justify-center gap-3 sm:gap-4 text-4xl sm:text-5xl">
                <span>🐹</span><span>🌟</span><span className="opacity-50">🐰</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">Whack the Moles!</h3>
              <div className="text-left space-y-2 text-gray-500 font-bold bg-gray-50 p-3 sm:p-4 rounded-2xl text-sm sm:text-base">
                <p>🐹 Standard Mole: +1</p>
                <p>🌟 Golden Mole: +3 & Time</p>
                <p className="text-red-400">🐰 Bunny Friend: Don't hit! (-1)</p>
              </div>
              <p className="text-amber-600 font-black text-sm sm:text-base">Score {WINNING_SCORE} points to win stars!</p>
              <button onClick={resetGame} className="w-full bg-amber-600 text-white py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform">
                Let's Go!
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className={`absolute inset-0 ${hasWon ? 'bg-green-500/20' : 'bg-red-500/20'} backdrop-blur-sm flex items-center justify-center z-40 p-4`}>
            <div className={`bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 sm:space-y-6 max-w-[300px] sm:max-w-sm w-full border-4 sm:border-8 ${hasWon ? 'border-green-100' : 'border-red-100'}`}>
              <div className="text-5xl sm:text-7xl">{hasWon ? '🏆' : '⏰'}</div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#2F3061]">{hasWon ? 'Awesome Job!' : "Time's Up!"}</h3>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-2xl">
                <p className="text-gray-500 font-bold mb-1 text-sm">Final Score</p>
                <p className="text-3xl sm:text-4xl font-black text-amber-500">{score}</p>
              </div>
              {!hasWon && <p className="text-gray-500 font-medium text-sm sm:text-base">You need {WINNING_SCORE} points to win. Try to be a little faster!</p>}
              <button onClick={resetGame} className={`w-full text-white py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform ${hasWon ? 'bg-green-500' : 'bg-red-500'}`}>
                {hasWon ? 'Play Again!' : 'Try Again'}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-400 font-medium text-xs sm:text-sm flex-shrink-0">
        Help {kid.name} catch the moles, but watch out for the bunnies!
      </p>
    </div>
  );
}
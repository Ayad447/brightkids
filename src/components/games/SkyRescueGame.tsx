import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { ArrowLeft, RotateCcw, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  emoji: string;
}

const OBSTACLE_EMOJIS = ['⛈️', '🦅', '🎈', '🛸', '☄️'];

export default function SkyRescueGame({ kid, onComplete }: Props) {
  const planeX = useMotionValue(20);
  const planeY = useMotionValue(50);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);

  const spawnObstacle = () => {
    const difficultyMultiplier = 1 + Math.floor(score / 500) * 0.2;
    const newObstacle: Obstacle = {
      id: Date.now(),
      x: 110,
      y: Math.random() * 80 + 10,
      size: Math.random() * 15 + 28,
      speed: (Math.random() * 0.5 + 0.3) * difficultyMultiplier,
      emoji: OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)],
    };
    setObstacles(prev => [...prev, newObstacle]);
  };

  const updateGame = () => {
    if (isGameOver || !isStarted) return;
    setObstacles(prev => {
      const next = prev.map(o => ({ ...o, x: o.x - o.speed })).filter(o => o.x > -20);
      const currentX = planeX.get();
      const currentY = planeY.get();
      const collision = next.find(o => {
        const dx = Math.abs(o.x - currentX);
        const dy = Math.abs(o.y - currentY);
        return dx < 8 && dy < 8;
      });
      if (collision) {
        setIsGameOver(true);
        soundManager.playGameOver();
        soundManager.stopMusic();
        return next;
      }
      return next;
    });
    setScore(s => s + 1);
    if (score > 0 && score % 1000 === 0) { handleWin(); }
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleWin = () => {
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
      const interval = setInterval(spawnObstacle, 1500);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(interval);
        soundManager.stopMusic();
      };
    }
  }, [isStarted, isGameOver]);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isStarted || isGameOver || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    planeX.set(Math.max(5, Math.min(95, x)));
    planeY.set(Math.max(5, Math.min(95, y)));
  };

  const resetGame = () => {
    soundManager.playStartGame();
    planeX.set(20);
    planeY.set(50);
    setObstacles([]);
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
  };

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4 text-center">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <Link to="/" className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-blue-500">Sky Rescue</h2>
        <div className="flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm">
          <span className="text-gray-400 font-bold text-xs sm:text-sm">Score:</span>
          <span className="text-blue-500 font-black text-sm sm:text-base">{Math.floor(score / 10)}</span>
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        className="relative flex-1 min-h-0 bg-gradient-to-b from-blue-400 to-blue-300 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-white overflow-hidden cursor-none touch-none"
      >
        {/* Decorative Clouds */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <Cloud className="absolute top-6 left-6 w-12 h-12 sm:w-20 sm:h-20 text-white animate-pulse" />
          <Cloud className="absolute top-24 right-8 w-16 h-16 sm:w-32 sm:h-32 text-white animate-bounce" />
          <Cloud className="absolute bottom-12 left-1/4 w-14 h-14 sm:w-24 sm:h-24 text-white" />
        </div>

        {/* Plane */}
        <motion.div
          style={{ x: planeX, y: planeY, left: 0, top: 0, position: 'absolute' }}
          className="text-4xl sm:text-6xl drop-shadow-lg z-20 pointer-events-none"
          // Center the emoji on the motion value position
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          🛩️
        </motion.div>

        {/* Obstacles */}
        <AnimatePresence>
          {obstacles.map(o => (
            <div
              key={o.id}
              className="absolute transition-all duration-75"
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                fontSize: `${o.size}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {o.emoji}
            </div>
          ))}
        </AnimatePresence>

        {/* Start Overlay */}
        {!isStarted && !isGameOver && (
          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-30 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 sm:space-y-6 max-w-[280px] sm:max-w-xs w-full border-4 sm:border-8 border-blue-100">
              <div className="text-5xl sm:text-7xl">👨‍✈️</div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">Ready for Takeoff?</h3>
              <p className="text-gray-500 font-medium text-sm sm:text-base">Use your finger to move the plane and avoid obstacles!</p>
              <button
                onClick={resetGame}
                className="w-full bg-blue-500 text-white py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform"
              >
                Start Flying!
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center z-30 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 sm:space-y-6 max-w-[280px] sm:max-w-xs w-full border-4 sm:border-8 border-red-100">
              <div className="text-5xl sm:text-7xl">💥</div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">Oh No!</h3>
              <p className="text-gray-500 font-medium text-sm sm:text-base">You hit something! Want to try again?</p>
              <button
                onClick={resetGame}
                className="w-full bg-red-500 text-white py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-gray-400 font-medium text-xs sm:text-sm flex-shrink-0">
        Help {kid.name} navigate the sky safely!
      </p>
    </div>
  );
}
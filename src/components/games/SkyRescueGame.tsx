import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

interface WallObstacle {
  id: number;
  y: number; // Moving along Y-axis
  blockedLanes: number[]; // 0: Left, 1: Center, 2: Right
  speed: number;
}

// X-axis percentages for the center of the 3 vertical lanes
const LANES = [16.66, 50, 83.33];

export default function SkyRescueGame({ kid, onComplete }: Props) {
  const [currentLane, setCurrentLane] = useState(1); // Start in the center lane
  const [obstacles, setObstacles] = useState<WallObstacle[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const requestRef = useRef<number>(null);
  const currentLaneRef = useRef(currentLane);
  const scoreRef = useRef(score);

  // Keep refs synced with state for the animation loop
  useEffect(() => { currentLaneRef.current = currentLane; }, [currentLane]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const spawnObstacle = () => {
    // Pick 1 or 2 lanes to block (leaving at least 1 open)
    const allLanes = [0, 1, 2];
    const numBlocked = Math.random() > 0.6 ? 2 : 1;
    const shuffled = allLanes.sort(() => 0.5 - Math.random());
    const blockedLanes = shuffled.slice(0, numBlocked);

    // Calculate display score (10 internal score ticks = 1 display point)
    const displayScore = Math.floor(scoreRef.current / 10);

    // Difficulty increases every 150 points
    const difficultyMultiplier = 1 + Math.floor(displayScore / 150) * 0.25;

    const newObstacle: WallObstacle = {
      id: Date.now(),
      y: -15, // Start off-screen at the top
      blockedLanes,
      speed: (Math.random() * 0.4 + 0.5) * difficultyMultiplier,
    };

    setObstacles(prev => [...prev, newObstacle]);
  };

  const updateGame = () => {
    if (isGameOver || !isStarted) return;

    setObstacles(prev => {
      // Obstacles move DOWN the screen (Y increases)
      const next = prev.map(o => ({ ...o, y: o.y + o.speed })).filter(o => o.y < 120);

      // The plane is fixed at Y = 80%. Check if an obstacle overlaps this zone.
      const collision = next.find(o => {
        const inCollisionZone = o.y > 72 && o.y < 88;
        const inBlockedLane = o.blockedLanes.includes(currentLaneRef.current);
        return inCollisionZone && inBlockedLane;
      });

      if (collision) {
        handleGameOver();
        return next;
      }
      return next;
    });

    // Infinitely increment the score
    setScore(s => s + 1);

    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    soundManager.playGameOver();
    soundManager.stopMusic();

    // Optional: Reward stars based on survival time before they restart or leave
    const finalDisplayScore = Math.floor(scoreRef.current / 10);
    if (finalDisplayScore >= 50) {
      onComplete(10);
    }
  };

  useEffect(() => {
    if (isStarted && !isGameOver) {
      soundManager.startMusic();
      requestRef.current = requestAnimationFrame(updateGame);

      // The speed of the loop is constant, but the falling speed increases
      const interval = setInterval(spawnObstacle, 1800);

      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(interval);
        soundManager.stopMusic();
      };
    }
  }, [isStarted, isGameOver]);

  const resetGame = () => {
    soundManager.playStartGame();
    setCurrentLane(1);
    setObstacles([]);
    setScore(0);
    setIsGameOver(false);
    setIsStarted(true);
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-screen p-4 space-y-3 sm:space-y-4 text-center overflow-hidden">
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

      {/* Main Game Layout */}
      <div className="relative flex-1 bg-gradient-to-b from-blue-400 to-blue-300 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-white overflow-hidden select-none touch-none">

        {/* Vertical Lane Dividers */}
        <div className="absolute left-[33.33%] h-full border-l-2 border-white/20 border-dashed z-0" />
        <div className="absolute left-[66.66%] h-full border-l-2 border-white/20 border-dashed z-0" />

        {/* Plane */}
        <motion.div
          animate={{ left: `${LANES[currentLane]}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute top-[80%] text-4xl sm:text-6xl z-20"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className="-rotate-45 drop-shadow-xl">✈️</div>
        </motion.div>

        {/* Storm Cloud Walls coming down */}
        <AnimatePresence>
          {obstacles.map(o => (
            <React.Fragment key={o.id}>
              {o.blockedLanes.map(lane => (
                <div
                  key={`${o.id}-${lane}`}
                  className="absolute bg-gray-700/80 backdrop-blur-sm rounded-xl border-2 border-gray-600 flex items-center justify-center shadow-lg"
                  style={{
                    top: `${o.y}%`,
                    left: `${LANES[lane]}%`,
                    width: '30%',
                    height: '60px',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className="text-2xl sm:text-3xl">⛈️</span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </AnimatePresence>

        {/* Tap/Touch Lanes Overlay */}
        {isStarted && !isGameOver && (
          <div className="absolute inset-0 flex z-30">
            {[0, 1, 2].map((laneIndex) => (
              <div
                key={laneIndex}
                className="flex-1 cursor-pointer"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setCurrentLane(laneIndex);
                }}
              />
            ))}
          </div>
        )}

        {/* Start Overlay */}
        {!isStarted && !isGameOver && (
          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white p-4 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 max-w-[280px] w-full border-4 border-blue-100">
              <div className="text-5xl">👨‍✈️</div>
              <h3 className="text-xl font-black text-[#2F3061]">Ready for Takeoff?</h3>
              <p className="text-gray-500 text-sm">Tap the screen lanes to steer left or right and dodge the storm clouds!</p>
              <button
                onClick={resetGame}
                className="w-full bg-blue-500 text-white py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Start Flying!
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white p-4 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 max-w-[280px] w-full border-4 border-red-100">
              <div className="text-5xl">💥</div>
              <h3 className="text-xl font-black text-[#2F3061]">Oh No!</h3>
              <p className="text-gray-500 text-sm">
                You hit a storm! Final Score: <span className="font-bold text-blue-500">{Math.floor(score / 10)}</span>
              </p>
              <button
                onClick={resetGame}
                className="w-full bg-red-500 text-white py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
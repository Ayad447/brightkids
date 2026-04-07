import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Shield, Magnet, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

interface WallObstacle {
  id: number;
  y: number;
  blockedLanes: number[];
  speed: number;
  emoji: string;
}

interface Collectible {
  id: number;
  y: number;
  lane: number;
  type: 'star' | 'shield' | 'slow' | 'magnet';
  emoji: string;
  speed: number;
}

const LANES = [16.66, 50, 83.33];

export default function SkyRescueGame({ kid, onComplete }: Props) {
  // Game State
  const [currentLane, setCurrentLane] = useState(1);
  const [obstacles, setObstacles] = useState<WallObstacle[]>([]);
  const [items, setItems] = useState<Collectible[]>([]);
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // High Score State
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Visual FX State
  const [isHit, setIsHit] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState({ shield: 0, slow: 0, magnet: 0 });

  // Refs for Game Loop
  const requestRef = useRef<number>(null);
  const frameCount = useRef(0);
  const highScoreRef = useRef(0);
  const stateRef = useRef({
    currentLane,
    score: 0,
    lives: 3,
    isHit: false,
    powerUps: { shield: 0, slow: 0, magnet: 0 },
    collectedItems: new Set<number>() // Added to track collections & prevent double-firing
  });

  // Load High Score on Mount
  useEffect(() => {
    const storedScore = localStorage.getItem(`skyRescueHighScore_${kid.id}`);
    if (storedScore) {
      const parsed = parseInt(storedScore, 10);
      setHighScore(parsed);
      highScoreRef.current = parsed;
    }
  }, [kid.id]);

  // Sync state to refs
  useEffect(() => { stateRef.current.currentLane = currentLane; }, [currentLane]);

  // Theme Engine (Now with more themes and an endless loop!)
  const getTheme = (pts: number) => {
    const THEMES = [
      { bg: 'from-blue-400 to-cyan-300', obs: ['⛈️'], phase: 'Day' },
      { bg: 'from-orange-400 to-pink-400', obs: ['🦅', '⛈️'], phase: 'Sunset' },
      { bg: 'from-indigo-800 to-purple-900', obs: ['🦇', '☁️'], phase: 'Night' },
      { bg: 'from-indigo-950 to-black', obs: ['☄️', '🛸'], phase: 'Space' },
      { bg: 'from-fuchsia-900 to-violet-950', obs: ['👾', '🪐'], phase: 'Nebula' },
      { bg: 'from-rose-900 to-red-950', obs: ['☄️', '🛰️'], phase: 'Galaxy' }
    ];

    // Each phase lasts for 200 points. The modulo (%) loops it back to 0!
    const phaseIndex = Math.floor(pts / 200) % THEMES.length;
    return THEMES[phaseIndex];
  };

  const theme = getTheme(displayScore);

  const spawnEntities = () => {
    const currentScore = stateRef.current.score;
    // Slowly scale up to 2.0x difficulty at 20,000 internal points (which is 2,000 display points)
    const difficultyMultiplier = 1 + (currentScore / 20000);
    const currentTheme = getTheme(Math.floor(currentScore / 10));

    // Spawn Obstacles
    const allLanes = [0, 1, 2];
    // Only spawn double obstacles 20% of the time early on, increasing with score
    const doubleChance = Math.min(0.6, 0.2 + (currentScore / 10000));
    const numBlocked = Math.random() < doubleChance ? 2 : 1;

    const blockedLanes = allLanes.sort(() => 0.5 - Math.random()).slice(0, numBlocked);
    const safeLane = allLanes.find(l => !blockedLanes.includes(l)) ?? 1;

    const newObstacle: WallObstacle = {
      id: Date.now(),
      y: -15,
      blockedLanes,
      // Lowered base speed from 0.6 to 0.4 for a gentler start
      speed: (Math.random() * 0.3 + 0.4) * difficultyMultiplier,
      emoji: currentTheme.obs[Math.floor(Math.random() * currentTheme.obs.length)],
    };

    setObstacles(prev => [...prev, newObstacle]);

    // Chance to spawn Collectible
    if (Math.random() > 0.4) {
      const isPowerUp = Math.random() > 0.85;
      let type: Collectible['type'] = 'star';
      let emoji = '⭐️';

      if (isPowerUp) {
        const pTypes: Collectible['type'][] = ['shield', 'slow', 'magnet'];
        type = pTypes[Math.floor(Math.random() * pTypes.length)];
        emoji = type === 'shield' ? '🛡️' : type === 'slow' ? '⏱️' : '🧲';
      }

      setItems(prev => [...prev, {
        id: Date.now() + 1,
        y: -15,
        lane: safeLane,
        type,
        emoji,
        speed: newObstacle.speed,
      }]);
    }
  };

  const updateGame = () => {
    if (stateRef.current.lives <= 0) return;

    frameCount.current++;
    const { powerUps, isHit, currentLane: lane } = stateRef.current;

    // Powerup Timers
    let powerUpsChanged = false;
    if (powerUps.shield > 0) { powerUps.shield--; powerUpsChanged = true; }
    if (powerUps.slow > 0) { powerUps.slow--; powerUpsChanged = true; }
    if (powerUps.magnet > 0) { powerUps.magnet--; powerUpsChanged = true; }

    if (powerUpsChanged && frameCount.current % 10 === 0) {
      setActivePowerUps({ ...powerUps });
    }

    const slowMultiplier = powerUps.slow > 0 ? 0.5 : 1;

    const currentScore = stateRef.current.score;
    // Difficulty multiplier used for timing
    const diffMultiplier = 1 + (currentScore / 20000);

    // Spawn Logic
    // Start with a very slow spawn (120 frames), narrowing down to 50 frames at high scores
    const baseSpawnRate = 120;
    const adjustedSpawnRate = Math.max(50, Math.floor((baseSpawnRate / diffMultiplier) / slowMultiplier));

    if (frameCount.current % adjustedSpawnRate === 0) {
      spawnEntities();
    }

    // Move & Check Obstacles
    setObstacles(prev => {
      const next = prev.map(o => ({ ...o, y: o.y + (o.speed * slowMultiplier) })).filter(o => o.y < 120);

      const collision = next.find(o =>
        o.y > 72 && o.y < 88 && o.blockedLanes.includes(lane)
      );

      if (collision && !isHit && powerUps.shield <= 0) {
        handleHit();
      }
      return next;
    });

    // Move & Check Items
    setItems(prev => {
      let next = prev.map(i => ({ ...i, y: i.y + (i.speed * slowMultiplier) })).filter(i => i.y < 120);

      const hitIndex = next.findIndex(i =>
        i.y > 72 && i.y < 88 && (i.lane === lane || powerUps.magnet > 0)
      );

      if (hitIndex !== -1) {
        handleItemCollect(next[hitIndex]);
        next.splice(hitIndex, 1);
      }
      return next;
    });

    // Score
    stateRef.current.score += 1;
    if (frameCount.current % 10 === 0) {
      setScore(stateRef.current.score);
      setDisplayScore(Math.floor(stateRef.current.score / 10));
    }

    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleHit = () => {
    // FIX: Block React StrictMode from double-firing this function
    if (stateRef.current.isHit) return;

    // Immediately flag as hit to prevent the second invocation
    stateRef.current.isHit = true;
    setIsHit(true);

    soundManager.playWrong?.() || soundManager.playGameOver();

    stateRef.current.lives -= 1;
    setLives(stateRef.current.lives);

    if (stateRef.current.lives <= 0) {
      setIsGameOver(true);
      soundManager.playGameOver();
      soundManager.stopMusic();

      // High Score Logic
      const finalScore = Math.floor(stateRef.current.score / 10);
      if (finalScore > highScoreRef.current) {
        setHighScore(finalScore);
        highScoreRef.current = finalScore;
        setIsNewHighScore(true);
        localStorage.setItem(`skyRescueHighScore_${kid.id}`, finalScore.toString());

        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, zIndex: 100 });
      }

      return;
    }

    // Invincibility frames
    setTimeout(() => {
      stateRef.current.isHit = false;
      setIsHit(false);
    }, 1500);
  };

  const handleItemCollect = (item: Collectible) => {
    // FIX: Prevent double-collecting in StrictMode
    if (stateRef.current.collectedItems.has(item.id)) return;
    stateRef.current.collectedItems.add(item.id);

    soundManager.playPop();
    if (item.type === 'star') {
      stateRef.current.score += 500; // +50 points
    } else {
      stateRef.current.powerUps[item.type] = 300; // ~5 seconds
      setActivePowerUps({ ...stateRef.current.powerUps });
    }
  };

  useEffect(() => {
    if (isStarted && !isGameOver) {
      soundManager.startMusic();
      requestRef.current = requestAnimationFrame(updateGame);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    }
  }, [isStarted, isGameOver]);

  const resetGame = () => {
    soundManager.playStartGame();
    setCurrentLane(1);
    setObstacles([]);
    setItems([]);
    setScore(0);
    setDisplayScore(0);
    setLives(3);
    setIsHit(false);
    setIsNewHighScore(false);
    setActivePowerUps({ shield: 0, slow: 0, magnet: 0 });

    stateRef.current = {
      currentLane: 1,
      score: 0,
      lives: 3,
      isHit: false,
      powerUps: { shield: 0, slow: 0, magnet: 0 },
      collectedItems: new Set<number>() // Reset collected items
    };
    frameCount.current = 0;

    setIsGameOver(false);
    setIsStarted(true);
  };

  const handleExit = () => {
    if (highScore > 50) {
      onComplete(10);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] max-h-screen p-4 space-y-3 sm:space-y-4 text-center overflow-hidden">
      {/* Header & HUD */}
      <div className="flex items-center justify-between flex-shrink-0">
        <Link
          to="/"
          onClick={handleExit}
          className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>

        {/* Lives Display */}
        <div className="flex gap-1 absolute left-[50%] -translate-x-[50%]">
          {[1, 2, 3].map(i => (
            <Heart
              key={i}
              className={`w-5 h-5 sm:w-8 sm:h-8 ${i <= lives ? 'fill-red-500 text-red-500' : 'fill-gray-200 text-gray-300'}`}
            />
          ))}
        </div>

        {/* Scores */}
        <div className="flex flex-col items-end gap-1">
          {highScore > 0 && (
            <div className="bg-white/60 px-2 sm:px-3 py-0.5 rounded-lg shadow-sm text-[10px] sm:text-xs">
              <span className="text-gray-500 font-bold">Best: </span>
              <span className="text-blue-600 font-black">{highScore}</span>
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm">
            <span className="text-gray-400 font-bold text-xs sm:text-sm">Score:</span>
            <span className="text-blue-500 font-black text-sm sm:text-base">{displayScore}</span>
          </div>
        </div>
      </div>

      {/* Main Game Layout */}
      <motion.div
        animate={{ x: isHit ? [-10, 10, -10, 10, 0] : 0 }}
        transition={{ duration: 0.4 }}
        className={`relative flex-1 bg-gradient-to-b ${theme.bg} transition-colors duration-1000 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-white overflow-hidden select-none touch-none`}
      >
        {/* Phase Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/40 font-black text-2xl uppercase tracking-widest pointer-events-none">
          {theme.phase}
        </div>

        {/* Vertical Lane Dividers */}
        <div className="absolute left-[33.33%] h-full border-l-2 border-white/20 border-dashed z-0" />
        <div className="absolute left-[66.66%] h-full border-l-2 border-white/20 border-dashed z-0" />

        {/* Plane Container */}
        <motion.div
          animate={{ left: `${LANES[currentLane]}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute top-[80%] z-20"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {/* Shield / Invulnerability Aura */}
          {(activePowerUps.shield > 0 || isHit) && (
            <div className={`absolute inset-[-20px] rounded-full blur-md opacity-60 animate-pulse ${isHit ? 'bg-red-500' : 'bg-yellow-400'}`} />
          )}

          <div className={`text-4xl sm:text-6xl -rotate-45 drop-shadow-xl transition-opacity ${isHit ? 'opacity-50' : 'opacity-100'}`}>
            {/* Turn into a rocket ship for the deep space phases! */}
            {['Space', 'Nebula', 'Galaxy'].includes(theme.phase) ? '🚀' : '✈️'}
          </div>

          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 text-sm animate-ping text-white/50">💨</div>
        </motion.div>

        {/* Entities (Obstacles & Items) */}
        <AnimatePresence>
          {obstacles.map(o => (
            <React.Fragment key={o.id}>
              {o.blockedLanes.map(lane => (
                <div
                  key={`${o.id}-${lane}`}
                  className="absolute flex items-center justify-center drop-shadow-md"
                  style={{ top: `${o.y}%`, left: `${LANES[lane]}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <span className="text-4xl sm:text-5xl">{o.emoji}</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {items.map(i => (
            <div
              key={i.id}
              className={`absolute flex items-center justify-center drop-shadow-lg ${activePowerUps.magnet > 0 ? 'animate-pulse' : ''}`}
              style={{ top: `${i.y}%`, left: `${LANES[i.lane]}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span className="text-3xl sm:text-4xl">{i.emoji}</span>
            </div>
          ))}
        </AnimatePresence>

        {/* Active Powerups HUD */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-30">
          {activePowerUps.shield > 0 && <div className="bg-yellow-400 p-2 rounded-full shadow-lg animate-bounce"><Shield className="text-white w-6 h-6" /></div>}
          {activePowerUps.slow > 0 && <div className="bg-blue-400 p-2 rounded-full shadow-lg animate-bounce"><Clock className="text-white w-6 h-6" /></div>}
          {activePowerUps.magnet > 0 && <div className="bg-purple-400 p-2 rounded-full shadow-lg animate-bounce"><Magnet className="text-white w-6 h-6" /></div>}
        </div>

        {/* Invisible Touch Controls */}
        {isStarted && !isGameOver && (
          <div className="absolute inset-0 flex z-40">
            {[0, 1, 2].map((laneIndex) => (
              <div
                key={laneIndex}
                className="flex-1 cursor-pointer"
                onPointerDown={(e) => { e.preventDefault(); setCurrentLane(laneIndex); }}
              />
            ))}
          </div>
        )}

        {/* Overlays */}
        {!isStarted && !isGameOver && (
          <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 max-w-[280px] w-full border-4 border-blue-100">
              <div className="text-5xl">👨‍✈️</div>
              <h3 className="text-xl font-black text-[#2F3061]">Ready for Takeoff?</h3>
              <div className="text-left text-xs sm:text-sm text-gray-500 space-y-2 font-medium">
                <p>👆 Tap lanes to dodge obstacles!</p>
                <p>⭐️ Collect stars for bonus points!</p>
                <p>🛡️🧲⏱️ Grab power-ups to survive!</p>
              </div>
              <button onClick={resetGame} className="w-full bg-blue-500 text-white py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-transform">
                Start Flying!
              </button>
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl space-y-4 max-w-[280px] w-full border-4 border-red-100">
              <div className="text-5xl">💥</div>
              <h3 className="text-xl font-black text-[#2F3061]">Game Over!</h3>
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-100 relative">
                {isNewHighScore && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full animate-bounce whitespace-nowrap shadow-md">
                    NEW RECORD!
                  </span>
                )}
                <p className="text-gray-400 font-bold text-sm">FINAL SCORE</p>
                <p className="text-4xl font-black text-blue-500">{displayScore}</p>
              </div>
              <button onClick={resetGame} className="w-full bg-red-500 text-white py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-transform">
                Fly Again
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
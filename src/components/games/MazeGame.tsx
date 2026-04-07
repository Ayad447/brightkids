import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

export default function MazeGame({ kid, onComplete }: Props) {
  const getMazeSize = () => {
    if (kid.stars > 100) return 11;
    if (kid.stars > 50) return 9;
    if (kid.stars > 20) return 7;
    return 5;
  };

  const mazeSize = getMazeSize();
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [maze, setMaze] = useState<number[][]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const generateMaze = useCallback(() => {
    const size = mazeSize;
    const newMaze = Array.from({ length: size }, () => Array(size).fill(1));
    const walk = (x: number, y: number) => {
      newMaze[y][x] = 0;
      const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
      for (const [dx, dy] of dirs) {
        const nx = x + dx; const ny = y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && newMaze[ny][nx] === 1) {
          newMaze[y + dy / 2][x + dx / 2] = 0;
          walk(nx, ny);
        }
      }
    };
    walk(0, 0);
    newMaze[size - 1][size - 1] = 0;
    if (newMaze[size - 2][size - 1] === 1 && newMaze[size - 1][size - 2] === 1) {
      newMaze[size - 2][size - 1] = 0;
    }
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setIsComplete(false);
    soundManager.startMusic();
  }, [mazeSize]);

  useEffect(() => { generateMaze(); return () => soundManager.stopMusic(); }, [generateMaze]);

  const move = (dx: number, dy: number) => {
    if (isComplete) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY]?.[newX] === 0) {
      soundManager.playPop();
      setPlayerPos({ x: newX, y: newY });
      if (newX === mazeSize - 1 && newY === mazeSize - 1) { handleFinish(); }
    }
  };

  const handleFinish = () => {
    soundManager.playSuccess();
    soundManager.stopMusic();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setIsComplete(true);
    onComplete(Math.floor(mazeSize / 2));
  };

  const levelName = mazeSize === 5 ? 'Easy' : mazeSize === 7 ? 'Medium' : mazeSize === 9 ? 'Hard' : 'Expert';

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <div className="flex flex-col items-center">
          <h2 className="text-xl sm:text-3xl font-black text-orange-500">Maze Runner</h2>
          <div className="flex items-center gap-1 sm:gap-2 bg-orange-100 px-3 py-1 rounded-full mt-1">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
            <span className="text-xs sm:text-sm font-black text-orange-700 uppercase tracking-wider">
              Level: {levelName}
            </span>
          </div>
        </div>
        <div className="w-10 sm:w-12" />
      </div>

      {/* Maze Grid — scrollable on tiny screens */}
      <div className="bg-white p-3 sm:p-6 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-orange-200 overflow-auto max-w-full">
        <div
          className="grid gap-1 sm:gap-1.5 mx-auto"
          style={{ gridTemplateColumns: `repeat(${mazeSize}, 1fr)`, maxWidth: `${mazeSize * 44}px` }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                onClick={() => {
                  const dx = x - playerPos.x;
                  const dy = y - playerPos.y;
                  if ((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
                    move(dx, dy);
                  }
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-2xl transition-all cursor-pointer ${cell === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-orange-50 hover:bg-orange-100'
                  } ${x === playerPos.x && y === playerPos.y ? 'bg-orange-400 scale-110 shadow-lg z-10' : ''} ${x === mazeSize - 1 && y === mazeSize - 1 ? 'bg-green-100 border-2 border-green-300' : ''
                  }`}
              >
                {x === playerPos.x && y === playerPos.y ? kid.avatar :
                  (x === mazeSize - 1 && y === mazeSize - 1 ? '🏠' : '')}
              </div>
            ))
          )}
        </div>
      </div>

      {/* D-pad for easier mobile control */}
      <div className="flex flex-col items-center gap-1 sm:hidden">
        <button onClick={() => move(0, -1)} className="w-12 h-12 bg-orange-100 rounded-xl text-xl font-black text-orange-700 active:bg-orange-300">↑</button>
        <div className="flex gap-1">
          <button onClick={() => move(-1, 0)} className="w-12 h-12 bg-orange-100 rounded-xl text-xl font-black text-orange-700 active:bg-orange-300">←</button>
          <button onClick={() => move(0, 1)} className="w-12 h-12 bg-orange-100 rounded-xl text-xl font-black text-orange-700 active:bg-orange-300">↓</button>
          <button onClick={() => move(1, 0)} className="w-12 h-12 bg-orange-100 rounded-xl text-xl font-black text-orange-700 active:bg-orange-300">→</button>
        </div>
      </div>

      {isComplete ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <Star className="fill-current w-6 h-6 sm:w-8 sm:h-8" />
            <h3 className="text-2xl sm:text-3xl font-black text-[#2F3061]">Amazing!</h3>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-600">You earned {Math.floor(mazeSize / 2)} stars!</p>
          <button onClick={generateMaze} className="bg-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform">
            Next Maze!
          </button>
        </motion.div>
      ) : (
        <p className="text-gray-400 font-medium text-xs sm:text-sm">
          Tap the path to help {kid.name} reach the house!<br />
          <span className="text-xs uppercase tracking-widest text-orange-300">Collect more stars to unlock bigger mazes!</span>
        </p>
      )}
    </div>
  );
}
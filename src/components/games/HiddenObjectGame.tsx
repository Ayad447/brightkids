import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, CheckCircle, RotateCcw, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

const WORLDS = [
  { name: 'Forest', bgColor: 'bg-green-50', borderColor: 'border-green-200', targets: [{ emoji: '🍎', name: 'Apple' }, { emoji: '🍌', name: 'Banana' }, { emoji: '🦋', name: 'Butterfly' }, { emoji: '🍄', name: 'Mushroom' }], backgrounds: ['🌳', '🌲', '🌵', '🌾', '🌿', '☘️', '🍀', '🍃', '🍂', '🍁'] },
  { name: 'Ocean', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', targets: [{ emoji: '🦀', name: 'Crab' }, { emoji: '🐙', name: 'Octopus' }, { emoji: '🐠', name: 'Tropical Fish' }, { emoji: '🧜‍♀️', name: 'Mermaid' }], backgrounds: ['🌊', '🫧', '🐚', '🪸', '🧊', '⚓', '🐟', '🐬', '🐋', '🦈'] },
  { name: 'Space', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', targets: [{ emoji: '🚀', name: 'Rocket' }, { emoji: '👽', name: 'Alien' }, { emoji: '🛸', name: 'UFO' }, { emoji: '👨‍🚀', name: 'Astronaut' }], backgrounds: ['⭐', '🌟', '✨', '☄️', '🌑', '🌒', '🌓', '🌔', '🌕', '🪐'] },
  { name: 'Farm', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', targets: [{ emoji: '🐮', name: 'Cow' }, { emoji: '🐷', name: 'Pig' }, { emoji: '🐔', name: 'Chicken' }, { emoji: '🚜', name: 'Tractor' }], backgrounds: ['🌾', '🌻', '🌽', '🥕', '🍎', '🏡', '🌳', '🌤️', '🐑', '🐎'] },
  { name: 'Jungle', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', targets: [{ emoji: '🦁', name: 'Lion' }, { emoji: '🐒', name: 'Monkey' }, { emoji: '🐘', name: 'Elephant' }, { emoji: '🐯', name: 'Tiger' }], backgrounds: ['🌴', '🌿', '🌺', '🦜', '🐍', '🦓', '🦒', '🦛', '🦏', '🐊'] },
  { name: 'Magic Kingdom', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', targets: [{ emoji: '🐉', name: 'Dragon' }, { emoji: '🦄', name: 'Unicorn' }, { emoji: '🪄', name: 'Wand' }, { emoji: '🏰', name: 'Castle' }], backgrounds: ['✨', '🔮', '🧚', '🧙', '🧝', '🧛', '🧟', '🧞', '🧜', '🦄'] },
  { name: 'City', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', targets: [{ emoji: '🚕', name: 'Taxi' }, { emoji: '🚌', name: 'Bus' }, { emoji: '🚓', name: 'Police Car' }, { emoji: '🚒', name: 'Firetruck' }], backgrounds: ['🏢', '🏙️', '🏦', '🏨', '🏪', '🏫', '🏥', '🏭', '🚦', '🛣️'] },
  { name: 'Candy Land', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', targets: [{ emoji: '🍭', name: 'Lollipop' }, { emoji: '🍬', name: 'Candy' }, { emoji: '🍫', name: 'Chocolate' }, { emoji: '🍰', name: 'Cake' }], backgrounds: ['🧁', '🍩', '🍪', '🍧', '🍨', '🍦', '🥧', '🍮', '🎂', '🍡'] },
  { name: 'Sports Field', bgColor: 'bg-lime-50', borderColor: 'border-lime-200', targets: [{ emoji: '⚽', name: 'Soccer Ball' }, { emoji: '🏀', name: 'Basketball' }, { emoji: '⚾', name: 'Baseball' }, { emoji: '🎾', name: 'Tennis Ball' }], backgrounds: ['🏐', '🏈', '🏉', '🎱', '🏓', '🏸', '🥅', '🏏', '⛳', '🥊'] },
  { name: 'Beach', bgColor: 'bg-cyan-50', borderColor: 'border-yellow-200', targets: [{ emoji: '⛱️', name: 'Umbrella' }, { emoji: '☀️', name: 'Sun' }, { emoji: '🦀', name: 'Crab' }, { emoji: '🐚', name: 'Shell' }], backgrounds: ['🏖️', '🏝️', '🌊', '🏄', '👙', '🩳', '🏐', '🍹', '🌴', '🚤'] },
];

export default function HiddenObjectGame({ kid, onComplete }: Props) {
  const [currentWorld, setCurrentWorld] = useState(WORLDS[0]);
  const [targetItem, setTargetItem] = useState(WORLDS[0].targets[0]);
  const [grid, setGrid] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  const cleanup = () => { soundManager.stopMusic(); };

  useEffect(() => { generateGrid(0); return cleanup; }, []);

  const generateGrid = (currentScore: number) => {
    soundManager.stopMusic();
    soundManager.startMusic();
    const world = WORLDS[Math.floor(Math.random() * WORLDS.length)];
    const nextTarget = world.targets[Math.floor(Math.random() * world.targets.length)];
    setCurrentWorld(world);
    setTargetItem(nextTarget);
    // Smaller grid on mobile — cap lower
    const gridSize = Math.min(12 + (currentScore * 4), 36);
    const newGrid = Array.from({ length: gridSize }, () =>
      world.backgrounds[Math.floor(Math.random() * world.backgrounds.length)]
    );
    const targetPos = Math.floor(Math.random() * gridSize);
    newGrid[targetPos] = nextTarget.emoji;
    setGrid(newGrid);
    setIsComplete(false);
  };

  const handleItemClick = (emoji: string) => {
    if (isComplete) return;
    if (emoji === targetItem.emoji) {
      soundManager.playPop();
      handleFinish();
    } else {
      soundManager.playGameOver();
    }
  };

  const handleFinish = () => {
    soundManager.playSuccess();
    const newScore = score + 1;
    setScore(newScore);
    setIsComplete(true);
    if (newScore % 3 === 0) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      onComplete(5);
    } else {
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
    }
  };

  const nextLevel = () => generateGrid(score);
  const resetGame = () => { setScore(0); generateGrid(0); };

  // Responsive grid columns
  const gridCols =
    grid.length > 30 ? 'grid-cols-6' :
      grid.length > 20 ? 'grid-cols-5' :
        grid.length > 12 ? 'grid-cols-4' :
          'grid-cols-4';

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" onClick={cleanup} className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-emerald-500">Spy Glass</h2>
        <div className="flex items-center gap-1 bg-white px-2 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-emerald-600 font-black text-sm sm:text-base">{score} Found</span>
        </div>
      </div>

      <div className={`bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 ${currentWorld.borderColor} space-y-4 sm:space-y-8 transition-colors duration-500`}>
        {/* Target Banner */}
        <div className={`flex items-center justify-center gap-3 ${currentWorld.bgColor} p-3 sm:p-6 rounded-2xl sm:rounded-3xl border-2 ${currentWorld.borderColor} transition-colors duration-500`}>
          <div className="text-4xl sm:text-5xl animate-bounce">{targetItem.emoji}</div>
          <div className="text-left">
            <p className="text-xs sm:text-sm font-black text-gray-500 uppercase">Find the</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">{targetItem.name}!</h3>
          </div>
        </div>

        {/* Grid */}
        <div className={`grid gap-2 sm:gap-3 transition-all duration-500 ${gridCols}`}>
          <AnimatePresence mode="popLayout">
            {grid.map((emoji, i) => {
              const isTarget = emoji === targetItem.emoji;
              return (
                <motion.button
                  key={`${emoji}-${i}-${score}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleItemClick(emoji)}
                  className={`w-full aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent ${isComplete && isTarget ? 'bg-green-200 border-green-500 scale-125 z-10' : 'bg-gray-50 hover:border-emerald-300'}`}
                >
                  {emoji}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        {isComplete && (
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
            <div className="flex items-center justify-center gap-2 text-emerald-500">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              <h3 className="text-2xl sm:text-3xl font-black">Eagle Eye!</h3>
            </div>
            <button onClick={nextLevel} className="bg-emerald-500 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform">
              Next Level!
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={resetGame} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 text-sm sm:text-base">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Start Over
        </button>
      </div>

      <p className="text-gray-400 font-medium text-xs sm:text-sm">
        Search the {currentWorld.name.toLowerCase()} carefully to find the hidden object!
      </p>
    </div>
  );
}
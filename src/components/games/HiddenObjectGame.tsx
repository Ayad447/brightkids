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

// THE ULTIMATE 30 WORLDS EXPANSION
const WORLDS = [
  { name: 'Forest', bgColor: 'bg-green-50', borderColor: 'border-green-200', targets: [{ emoji: '🍎', name: 'Apple' }, { emoji: '🍌', name: 'Banana' }, { emoji: '🦋', name: 'Butterfly' }, { emoji: '🍄', name: 'Mushroom' }], backgrounds: ['🌳', '🌲', '🌵', '🌾', '🌿', '☘️', '🍀', '🍃', '🍂', '🍁'] },
  { name: 'Ocean', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', targets: [{ emoji: '🦀', name: 'Crab' }, { emoji: '🐙', name: 'Octopus' }, { emoji: '🐠', name: 'Tropical Fish' }, { emoji: '🧜‍♀️', name: 'Mermaid' }], backgrounds: ['🌊', '🫧', '🐚', '🪸', '🧊', '⚓', '🐟', '🐬', '🐋', '🦈'] },
  { name: 'Space', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200', targets: [{ emoji: '🚀', name: 'Rocket' }, { emoji: '👽', name: 'Alien' }, { emoji: '🛸', name: 'UFO' }, { emoji: '👨‍🚀', name: 'Astronaut' }], backgrounds: ['⭐', '🌟', '✨', '☄️', '🌑', '🌒', '🌓', '🌔', '🌕', '🪐'] },
  { name: 'Farm', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', targets: [{ emoji: '🐮', name: 'Cow' }, { emoji: '🐷', name: 'Pig' }, { emoji: '🐔', name: 'Chicken' }, { emoji: '🚜', name: 'Tractor' }], backgrounds: ['🌾', '🌻', '🌽', '🥕', '🍎', '🏡', '🌳', '🌤️', '🐑', '🐎'] },
  { name: 'Desert', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', targets: [{ emoji: '🐪', name: 'Camel' }, { emoji: '🦂', name: 'Scorpion' }, { emoji: '🐍', name: 'Snake' }, { emoji: '🦎', name: 'Lizard' }], backgrounds: ['🌵', '🏜️', '☀️', '🐪', '🦂', '🐍', '🦎', '🌴', '⛺', '🐫'] },
  { name: 'Arctic', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', targets: [{ emoji: '🐧', name: 'Penguin' }, { emoji: '🐻‍❄️', name: 'Polar Bear' }, { emoji: '🦭', name: 'Seal' }, { emoji: '⛄', name: 'Snowman' }], backgrounds: ['❄️', '🧊', '🏔️', '🌨️', '🌬️', '🎿', '⛸️', '🛷', '🐧', '🐻‍❄️'] },
  { name: 'City', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', targets: [{ emoji: '🚕', name: 'Taxi' }, { emoji: '🚌', name: 'Bus' }, { emoji: '🚓', name: 'Police Car' }, { emoji: '🚒', name: 'Firetruck' }], backgrounds: ['🏢', '🏙️', '🏦', '🏨', '🏪', '🏫', '🏥', '🏭', '🚦', '🛣️'] },
  { name: 'Magic Kingdom', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', targets: [{ emoji: '🐉', name: 'Dragon' }, { emoji: '🦄', name: 'Unicorn' }, { emoji: '🪄', name: 'Wand' }, { emoji: '🏰', name: 'Castle' }], backgrounds: ['✨', '🔮', '🧚', '🧙', '🧝', '🧛', '🧟', '🧞', '🧜', '🦄'] },
  { name: 'Jungle', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', targets: [{ emoji: '🦁', name: 'Lion' }, { emoji: '🐒', name: 'Monkey' }, { emoji: '🐘', name: 'Elephant' }, { emoji: '🐯', name: 'Tiger' }], backgrounds: ['🌴', '🌿', '🌺', '🦜', '🐍', '🦓', '🦒', '🦛', '🦏', '🐊'] },
  { name: 'Pirate Cove', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', targets: [{ emoji: '💎', name: 'Treasure' }, { emoji: '🗺️', name: 'Map' }, { emoji: '⛵', name: 'Ship' }, { emoji: '⚓', name: 'Anchor' }], backgrounds: ['☠️', '🪙', '🗡️', '🦜', '🏝️', '🌊', '🧭', '🔭', '💰', '⚔️'] },
  { name: 'Candy Land', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', targets: [{ emoji: '🍭', name: 'Lollipop' }, { emoji: '🍬', name: 'Candy' }, { emoji: '🍫', name: 'Chocolate' }, { emoji: '🍰', name: 'Cake' }], backgrounds: ['🧁', '🍩', '🍪', '🍧', '🍨', '🍦', '🥧', '🍮', '🎂', '🍡'] },
  { name: 'Halloween', bgColor: 'bg-orange-50', borderColor: 'border-gray-800', targets: [{ emoji: '👻', name: 'Ghost' }, { emoji: '🎃', name: 'Pumpkin' }, { emoji: '🦇', name: 'Bat' }, { emoji: '🕷️', name: 'Spider' }], backgrounds: ['🕸️', '🦉', '🐈‍⬛', '🌕', '🍬', '🧟', '🧛', '🏚️', '🕯️', '💀'] },
  { name: 'Winter Holiday', bgColor: 'bg-red-50', borderColor: 'border-green-200', targets: [{ emoji: '🎅', name: 'Santa' }, { emoji: '🎁', name: 'Present' }, { emoji: '🎄', name: 'Tree' }, { emoji: '🦌', name: 'Reindeer' }], backgrounds: ['⛄', '❄️', '🧦', '🔔', '🕯️', '🍪', '🥛', '🤶', '🧣', '🧤'] },
  { name: 'Construction', bgColor: 'bg-yellow-50', borderColor: 'border-orange-200', targets: [{ emoji: '🏗️', name: 'Crane' }, { emoji: '🔨', name: 'Hammer' }, { emoji: '🔧', name: 'Wrench' }, { emoji: '👷', name: 'Builder' }], backgrounds: ['🧱', '🚧', '🚜', '🧰', '🔩', '⚙️', '📏', '🪵', '🪚', '⚠️'] },
  { name: 'Hospital', bgColor: 'bg-blue-50', borderColor: 'border-red-200', targets: [{ emoji: '🚑', name: 'Ambulance' }, { emoji: '💉', name: 'Syringe' }, { emoji: '💊', name: 'Pill' }, { emoji: '🩺', name: 'Stethoscope' }], backgrounds: ['🏥', '👨‍⚕️', '👩‍⚕️', '🩸', '🩹', '🦠', '🔬', '🩼', '🦷', '🦴'] },
  { name: 'Music Room', bgColor: 'bg-violet-50', borderColor: 'border-violet-200', targets: [{ emoji: '🎸', name: 'Guitar' }, { emoji: '🥁', name: 'Drum' }, { emoji: '🎺', name: 'Trumpet' }, { emoji: '🎻', name: 'Violin' }], backgrounds: ['🎵', '🎶', '🎼', '🎤', '🎧', '🎷', '🎹', '📻', '🎙️', '🪕'] },
  { name: 'Sports Field', bgColor: 'bg-lime-50', borderColor: 'border-lime-200', targets: [{ emoji: '⚽', name: 'Soccer Ball' }, { emoji: '🏀', name: 'Basketball' }, { emoji: '⚾', name: 'Baseball' }, { emoji: '🎾', name: 'Tennis Ball' }], backgrounds: ['🏐', '🏈', '🏉', '🎱', '🏓', '🏸', '🥅', '🏏', '⛳', '🥊'] },
  { name: 'School', bgColor: 'bg-yellow-50', borderColor: 'border-gray-200', targets: [{ emoji: '🚌', name: 'School Bus' }, { emoji: '📚', name: 'Books' }, { emoji: '✏️', name: 'Pencil' }, { emoji: '🎒', name: 'Backpack' }], backgrounds: ['🏫', '🍎', '📖', '📝', '🖍️', '✂️', '📏', '📐', '📎', '🎓'] },
  { name: 'Kitchen', bgColor: 'bg-stone-50', borderColor: 'border-stone-200', targets: [{ emoji: '🍳', name: 'Pan' }, { emoji: '🔪', name: 'Knife' }, { emoji: '🥄', name: 'Spoon' }, { emoji: '🍴', name: 'Fork' }], backgrounds: ['👨‍🍳', '👩‍🍳', '🍽️', '🥣', '🧂', '🏺', '🧊', '🧅', '🧄', '🍅'] },
  { name: 'Garden', bgColor: 'bg-green-50', borderColor: 'border-lime-200', targets: [{ emoji: '🌻', name: 'Flower' }, { emoji: '🚰', name: 'Water' }, { emoji: '🐌', name: 'Snail' }, { emoji: '🐞', name: 'Ladybug' }], backgrounds: ['🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀'] },
  { name: 'Beach', bgColor: 'bg-cyan-50', borderColor: 'border-yellow-200', targets: [{ emoji: '⛱️', name: 'Umbrella' }, { emoji: '☀️', name: 'Sun' }, { emoji: '🦀', name: 'Crab' }, { emoji: '🐚', name: 'Shell' }], backgrounds: ['🏖️', '🏝️', '🌊', '🏄', '👙', '🩳', '🏐', '🍹', '🌴', '🚤'] },
  { name: 'Dinosaur Era', bgColor: 'bg-orange-50', borderColor: 'border-green-200', targets: [{ emoji: '🦖', name: 'T-Rex' }, { emoji: '🦕', name: 'Brontosaurus' }, { emoji: '🌋', name: 'Volcano' }, { emoji: '🦴', name: 'Bone' }], backgrounds: ['🌴', '🌿', '🥩', '🩸', '🐾', '🥚', '☄️', '⛰️', '🧭', '🛖'] },
  { name: 'Weather Sky', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', targets: [{ emoji: '☀️', name: 'Sun' }, { emoji: '☁️', name: 'Cloud' }, { emoji: '🌧️', name: 'Rain' }, { emoji: '⚡', name: 'Lightning' }], backgrounds: ['⛅', '⛈️', '🌤️', '🌥️', '🌦️', '🌨️', '🌩️', '🌪️', '🌈', '☔'] },
  { name: 'Bug World', bgColor: 'bg-lime-50', borderColor: 'border-green-200', targets: [{ emoji: '🐝', name: 'Bee' }, { emoji: '🐜', name: 'Ant' }, { emoji: '🕷️', name: 'Spider' }, { emoji: '🦋', name: 'Butterfly' }], backgrounds: ['🐞', '🦗', '🦂', '🦟', '🐛', '🐌', '🕸️', '🌿', '🍃', '🌱'] },
  { name: 'Bakery', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', targets: [{ emoji: '🥐', name: 'Croissant' }, { emoji: '🥖', name: 'Baguette' }, { emoji: '🥨', name: 'Pretzel' }, { emoji: '🥧', name: 'Pie' }], backgrounds: ['🍞', '🥯', '🥞', '🧇', '🧀', '🧁', '🍰', '🎂', '🍪', '🍩'] },
  { name: 'Fast Food', bgColor: 'bg-red-50', borderColor: 'border-yellow-200', targets: [{ emoji: '🍔', name: 'Burger' }, { emoji: '🍟', name: 'Fries' }, { emoji: '🍕', name: 'Pizza' }, { emoji: '🌭', name: 'Hotdog' }], backgrounds: ['🌮', '🌯', '🍿', '🥤', '🧋', '🥓', '🍗', '🍖', '🥩', '🥪'] },
  { name: 'Tech Lab', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', targets: [{ emoji: '💻', name: 'Laptop' }, { emoji: '📱', name: 'Phone' }, { emoji: '⌚', name: 'Watch' }, { emoji: '📷', name: 'Camera' }], backgrounds: ['🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '🕹️', '💾', '💿', '🔋', '🔌'] },
  { name: 'Party Time', bgColor: 'bg-fuchsia-50', borderColor: 'border-fuchsia-200', targets: [{ emoji: '🎈', name: 'Balloon' }, { emoji: '🎉', name: 'Confetti' }, { emoji: '🎁', name: 'Gift' }, { emoji: '🎂', name: 'Cake' }], backgrounds: ['🥳', '🎊', '🪄', '🎀', '🪅', '🪩', '🩰', '👯', '🎶', '🥂'] },
  { name: 'Closet', bgColor: 'bg-indigo-50', borderColor: 'border-pink-200', targets: [{ emoji: '👕', name: 'Shirt' }, { emoji: '👖', name: 'Pants' }, { emoji: '👗', name: 'Dress' }, { emoji: '👟', name: 'Shoes' }], backgrounds: ['🧦', '🧥', '🧤', '🧣', '🎩', '🧢', '👒', '🎒', '👝', '👛'] },
  { name: 'Vehicles', bgColor: 'bg-gray-50', borderColor: 'border-gray-300', targets: [{ emoji: '🚗', name: 'Car' }, { emoji: '🚲', name: 'Bike' }, { emoji: '🚂', name: 'Train' }, { emoji: '✈️', name: 'Airplane' }], backgrounds: ['🚁', '⛵', '🛥️', '⛴️', '🏍️', '🛵', '🛺', '🚜', '🛸', '🛴'] }
];

export default function HiddenObjectGame({ kid, onComplete }: Props) {
  const [currentWorld, setCurrentWorld] = useState(WORLDS[0]);
  const [targetItem, setTargetItem] = useState(WORLDS[0].targets[0]);
  const [grid, setGrid] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);

  const cleanup = () => {
    soundManager.stopMusic();
  };

  useEffect(() => {
    generateGrid(0);
    return cleanup;
  }, []);

  const generateGrid = (currentScore: number) => {
    soundManager.stopMusic();
    soundManager.startMusic();

    // Pick a random world and target
    const world = WORLDS[Math.floor(Math.random() * WORLDS.length)];
    const nextTarget = world.targets[Math.floor(Math.random() * world.targets.length)];

    setCurrentWorld(world);
    setTargetItem(nextTarget);

    // Progressive Difficulty: Starts at 16, grows by 4 every point, caps at 48 items
    const gridSize = Math.min(16 + (currentScore * 4), 48);

    const newGrid = Array.from({ length: gridSize }, () =>
      world.backgrounds[Math.floor(Math.random() * world.backgrounds.length)]
    );

    // Insert target item at random position
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

    if (newScore % 3 === 0) { // Reward stars every 3 finds to match pacing
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      onComplete(5);
    } else {
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
    }
  };

  const nextLevel = () => {
    generateGrid(score);
  };

  const resetGame = () => {
    setScore(0);
    generateGrid(0);
  };

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
        <h2 className="text-3xl font-black text-emerald-500">Spy Glass</h2>
        <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
          <span className="text-emerald-600 font-black">{score} Found</span>
        </div>
      </div>

      <div className={`bg-white p-8 rounded-[40px] shadow-2xl border-8 ${currentWorld.borderColor} inline-block space-y-8 transition-colors duration-500`}>
        <div className={`flex items-center justify-center gap-4 ${currentWorld.bgColor} p-6 rounded-3xl border-2 ${currentWorld.borderColor} transition-colors duration-500`}>
          <div className="text-5xl animate-bounce">{targetItem.emoji}</div>
          <div className="text-left">
            <p className="text-sm font-black text-gray-500 uppercase">Find the</p>
            <h3 className="text-2xl font-black text-[#2F3061]">{targetItem.name}!</h3>
          </div>
        </div>

        {/* Dynamic Grid Layout based on size */}
        <div className={`grid gap-3 transition-all duration-500 ${grid.length > 36 ? 'grid-cols-6 md:grid-cols-8' :
            grid.length > 24 ? 'grid-cols-5 md:grid-cols-6' :
              'grid-cols-4 md:grid-cols-6'
          }`}>
          <AnimatePresence mode="popLayout">
            {grid.map((emoji, i) => {
              const isTarget = emoji === targetItem.emoji;
              const randomDuration = 2 + Math.random() * 2;
              const randomDelay = Math.random() * 2;

              return (
                <motion.button
                  key={`${emoji}-${i}-${score}`}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    rotate: isTarget ? 0 : [-3, 3, -3],
                  }}
                  transition={{
                    scale: { type: 'spring', damping: 12 },
                    rotate: {
                      duration: randomDuration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: randomDelay
                    }
                  }}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleItemClick(emoji)}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-sm hover:shadow-lg transition-all border-2 border-transparent ${isComplete && isTarget ? 'bg-green-200 border-green-500 z-10 scale-125' : 'bg-gray-50 hover:border-emerald-300'
                    }`}
                >
                  {emoji}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4 pt-4"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-500">
              <CheckCircle className="w-8 h-8" />
              <h3 className="text-3xl font-black">Eagle Eye!</h3>
            </div>
            <button
              onClick={nextLevel}
              className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform"
            >
              Next Level!
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={resetGame}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200"
        >
          <RotateCcw className="w-5 h-5" />
          Start Over
        </button>
      </div>

      <p className="text-gray-400 font-medium">Search the {currentWorld.name.toLowerCase()} carefully to find the hidden object!</p>
    </div>
  );
}
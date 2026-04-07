import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, CheckCircle, XCircle, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

const RHYME_SETS = [
  { word: 'CAT', emoji: '🐱', rhymes: [{ word: 'BAT', emoji: '🦇', sentence: 'The CAT played baseball with a BAT!' }, { word: 'HAT', emoji: '🎩', sentence: 'The CAT wore a giant purple HAT!' }, { word: 'MAT', emoji: '🪤', sentence: 'The CAT took a nap on the soft MAT!' }], wrong: [{ word: 'DOG', emoji: '🐶' }, { word: 'SUN', emoji: '☀️' }, { word: 'FISH', emoji: '🐟' }] },
  { word: 'BEE', emoji: '🐝', rhymes: [{ word: 'SEA', emoji: '🌊', sentence: 'The BEE went swimming in the blue SEA!' }, { word: 'TEA', emoji: '🍵', sentence: 'The BEE drank a tiny cup of TEA!' }, { word: 'KEY', emoji: '🔑', sentence: 'The BEE unlocked the door with a KEY!' }], wrong: [{ word: 'CAT', emoji: '🐱' }, { word: 'BUS', emoji: '🚌' }, { word: 'FROG', emoji: '🐸' }] },
  { word: 'DOG', emoji: '🐶', rhymes: [{ word: 'LOG', emoji: '🪵', sentence: 'The DOG jumped over the bumpy LOG!' }, { word: 'FROG', emoji: '🐸', sentence: 'The DOG made friends with a green FROG!' }], wrong: [{ word: 'CAT', emoji: '🐱' }, { word: 'BALL', emoji: '⚽' }, { word: 'SUN', emoji: '☀️' }] },
  { word: 'SUN', emoji: '☀️', rhymes: [{ word: 'BUN', emoji: '🍞', sentence: 'The SUN baked a tasty hot dog BUN!' }, { word: 'RUN', emoji: '🏃', sentence: 'The SUN watched the children RUN!' }, { word: 'FUN', emoji: '🎉', sentence: 'The SUN had so much FUN today!' }], wrong: [{ word: 'MOON', emoji: '🌙' }, { word: 'FISH', emoji: '🐟' }, { word: 'TREE', emoji: '🌳' }] },
  { word: 'STAR', emoji: '⭐', rhymes: [{ word: 'CAR', emoji: '🚗', sentence: 'The STAR drove a super fast CAR!' }, { word: 'JAR', emoji: '🫙', sentence: 'The STAR hid inside a glass JAR!' }], wrong: [{ word: 'CAT', emoji: '🐱' }, { word: 'BALL', emoji: '⚽' }, { word: 'SUN', emoji: '☀️' }] },
  { word: 'CAKE', emoji: '🎂', rhymes: [{ word: 'LAKE', emoji: '🏞️', sentence: 'The CAKE fell right into the LAKE!' }, { word: 'SNAKE', emoji: '🐍', sentence: 'The CAKE was eaten by a hungry SNAKE!' }], wrong: [{ word: 'PIE', emoji: '🥧' }, { word: 'FISH', emoji: '🐟' }, { word: 'BALL', emoji: '⚽' }] },
  { word: 'BUG', emoji: '🐛', rhymes: [{ word: 'RUG', emoji: '🧶', sentence: 'The BUG slept under the soft RUG!' }, { word: 'MUG', emoji: '☕', sentence: 'The BUG drank cocoa from a MUG!' }, { word: 'HUG', emoji: '🫂', sentence: 'The BUG gave his mom a big HUG!' }], wrong: [{ word: 'DOG', emoji: '🐶' }, { word: 'STAR', emoji: '⭐' }, { word: 'FISH', emoji: '🐟' }] },
  { word: 'BEAR', emoji: '🐻', rhymes: [{ word: 'HAIR', emoji: '💇‍♀️', sentence: 'The BEAR combed his very messy HAIR!' }, { word: 'CHAIR', emoji: '🪑', sentence: 'The BEAR sat on a tiny wooden CHAIR!' }, { word: 'PEAR', emoji: '🍐', sentence: 'The BEAR ate a juicy green PEAR!' }], wrong: [{ word: 'SUN', emoji: '☀️' }, { word: 'BUG', emoji: '🐛' }, { word: 'FISH', emoji: '🐟' }] },
  { word: 'TRAIN', emoji: '🚂', rhymes: [{ word: 'RAIN', emoji: '🌧️', sentence: 'The TRAIN drove right through the RAIN!' }, { word: 'BRAIN', emoji: '🧠', sentence: 'The TRAIN has a very smart BRAIN!' }, { word: 'PLANE', emoji: '✈️', sentence: 'The TRAIN raced a flying PLANE!' }], wrong: [{ word: 'BUG', emoji: '🐛' }, { word: 'CAT', emoji: '🐱' }, { word: 'SUN', emoji: '☀️' }] },
  { word: 'FOX', emoji: '🦊', rhymes: [{ word: 'BOX', emoji: '📦', sentence: 'The FOX hid inside a cardboard BOX!' }, { word: 'SOCKS', emoji: '🧦', sentence: 'The FOX wore silly mismatched SOCKS!' }], wrong: [{ word: 'FISH', emoji: '🐟' }, { word: 'BIRD', emoji: '🐦' }, { word: 'MOON', emoji: '🌙' }] },
];

function shuffleArray<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function buildChoices(set: typeof RHYME_SETS[0]) {
  const correctChoice = set.rhymes[Math.floor(Math.random() * set.rhymes.length)];
  const wrongChoices = shuffleArray(set.wrong).slice(0, 2);
  return shuffleArray([{ word: correctChoice.word, emoji: correctChoice.emoji, isCorrect: true, sentence: correctChoice.sentence }, ...wrongChoices.map(w => ({ ...w, isCorrect: false, sentence: undefined }))]);
}

export default function RhymeTimeGame({ kid, onComplete }: Props) {
  const [gameSequence, setGameSequence] = useState(() => shuffleArray(RHYME_SETS));
  const [setIndex, setSetIndex] = useState(0);
  const [choices, setChoices] = useState(() => buildChoices(gameSequence[0]));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [sillySentence, setSillySentence] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const current = gameSequence[setIndex];
  const isOnFire = streak >= 3;

  const safeTimeout = (cb: () => void, ms: number) => { const id = setTimeout(cb, ms); timeoutsRef.current.push(id); };
  const cleanup = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  useEffect(() => { return cleanup; }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.8; utt.pitch = 1.3;
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => { safeTimeout(() => speak(`Which one rhymes with ${current.word}?`), 400); }, [setIndex, current.word]);

  const handleChoice = (word: string, isCorrect: boolean, sentence?: string) => {
    if (selected) return;
    setSelected(word);
    if (isCorrect) {
      setFeedback('correct');
      soundManager.playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const starsToAward = newStreak >= 3 ? 2 : 1;
      const totalStars = starsEarned + starsToAward;
      setStarsEarned(totalStars);
      if (sentence) { setSillySentence(sentence); speak(sentence); }
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 5) {
        safeTimeout(() => { confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } }); setIsFinished(true); onComplete(totalStars); }, 3500);
      } else { safeTimeout(nextRound, 3500); }
    } else {
      setFeedback('wrong');
      soundManager.playGameOver();
      setStreak(0);
      speak(`Not quite! Try again next time.`);
      safeTimeout(nextRound, 2000);
    }
  };

  const nextRound = () => {
    const next = (setIndex + 1) % gameSequence.length;
    setSetIndex(next);
    setChoices(buildChoices(gameSequence[next]));
    setSelected(null); setFeedback(null); setSillySentence(null);
  };

  const reset = () => {
    cleanup();
    const newSequence = shuffleArray(RHYME_SETS);
    setGameSequence(newSequence);
    setSetIndex(0);
    setChoices(buildChoices(newSequence[0]));
    setSelected(null); setFeedback(null); setSillySentence(null);
    setScore(0); setStreak(0); setStarsEarned(0); setIsFinished(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" onClick={cleanup} className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className={`text-xl sm:text-3xl font-black ${isOnFire ? 'text-orange-500 animate-pulse' : 'text-green-500'}`}>
          {isOnFire ? 'ON FIRE! 🔥' : 'Rhyme Time'}
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <AnimatePresence>
            {streak > 1 && (
              <motion.div initial={{ scale: 0, x: 20 }} animate={{ scale: 1, x: 0 }} exit={{ scale: 0 }}
                className="flex items-center gap-1 bg-orange-100 px-2 sm:px-3 py-1 sm:py-2 rounded-2xl shadow-sm border-2 border-orange-300">
                <Flame className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                <span className="text-orange-600 font-black text-xs sm:text-sm">{streak}x</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-1 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-2xl shadow-sm">
            <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-gray-600 font-black text-sm sm:text-base">{starsEarned}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${i < score ? (isOnFire ? 'bg-orange-500 scale-125' : 'bg-green-500 scale-125') : 'bg-gray-200'}`} />
        ))}
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-green-300 space-y-4 sm:space-y-6">
          <div className="text-7xl sm:text-8xl">🎉</div>
          <h3 className="text-3xl sm:text-4xl font-black text-[#2F3061]">Amazing!</h3>
          <p className="text-lg sm:text-xl text-gray-500 font-medium">You earned <span className="font-black text-yellow-500">{starsEarned} Stars</span>!</p>
          <button onClick={reset} className="bg-green-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-xl hover:scale-105 transition-transform">
            Play Again!
          </button>
        </motion.div>
      ) : (
        <motion.div
          animate={isOnFire ? { boxShadow: '0px 0px 30px rgba(251, 146, 60, 0.4)' } : {}}
          className={`bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 space-y-5 sm:space-y-8 transition-colors duration-500 ${isOnFire ? 'border-orange-400 bg-orange-50/30' : 'border-green-200'}`}
        >
          {/* Target / Silly Sentence */}
          <div className="space-y-3 min-h-[130px] sm:min-h-[160px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {sillySentence ? (
                <motion.div key="sentence" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-4 ${isOnFire ? 'bg-orange-100 border-orange-300' : 'bg-green-100 border-green-300'}`}>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#2F3061] leading-relaxed">{sillySentence}</p>
                  {isOnFire && <p className="text-orange-500 font-black mt-2 text-xs sm:text-sm uppercase tracking-widest">+2 Bonus Stars!</p>}
                </motion.div>
              ) : (
                <motion.div key="target" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-gray-400 font-black uppercase tracking-widest text-xs sm:text-sm mb-3">Which one rhymes with...</p>
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    className={`${isOnFire ? 'bg-orange-100 border-orange-300' : 'bg-green-50 border-green-200'} border-4 rounded-2xl sm:rounded-3xl p-4 sm:p-6 inline-block transition-colors`}>
                    <div className="text-6xl sm:text-8xl mb-2 sm:mb-3">{current.emoji}</div>
                    <p className="text-4xl sm:text-5xl font-black text-[#2F3061]">{current.word}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Choice buttons — 3 cols on all sizes */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {choices.map((choice: any) => {
              const isSelected = selected === choice.word;
              let cardClass = 'bg-gray-50 border-4 border-gray-200 hover:border-green-400 hover:bg-green-50';
              if (isSelected && feedback === 'correct') cardClass = isOnFire ? 'bg-orange-100 border-4 border-orange-500' : 'bg-green-100 border-4 border-green-500';
              if (isSelected && feedback === 'wrong') cardClass = 'bg-red-100 border-4 border-red-400';
              if (selected && !isSelected && choice.isCorrect) cardClass = 'bg-green-50 border-4 border-green-300 opacity-50';
              if (selected && !isSelected && !choice.isCorrect) cardClass = 'bg-gray-50 border-4 border-gray-200 opacity-50';
              return (
                <motion.button
                  key={choice.word}
                  whileHover={!selected ? { scale: 1.05, y: -4 } : {}}
                  whileTap={!selected ? { scale: 0.95 } : {}}
                  onClick={() => handleChoice(choice.word, choice.isCorrect, choice.sentence)}
                  className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl transition-all space-y-1 sm:space-y-2 min-h-[90px] sm:min-h-[120px] flex flex-col items-center justify-center ${cardClass}`}
                >
                  <div className="text-4xl sm:text-5xl">{choice.emoji}</div>
                  <p className="font-black text-sm sm:text-lg text-[#2F3061]">{choice.word}</p>
                  {isSelected && feedback === 'correct' && <CheckCircle className={`${isOnFire ? 'text-orange-500' : 'text-green-500'} w-5 h-5 sm:w-6 sm:h-6`} />}
                  {isSelected && feedback === 'wrong' && <XCircle className="text-red-400 w-5 h-5 sm:w-6 sm:h-6" />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4">
        <button onClick={reset} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 text-sm sm:text-base">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Restart
        </button>
      </div>
    </div>
  );
}
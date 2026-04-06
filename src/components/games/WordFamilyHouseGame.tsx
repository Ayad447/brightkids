import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

// 30 MASSIVE WORD FAMILIES WITH THEMED HOUSES!
const FAMILIES = [
  { ending: '-AT', house: '🏰', color: 'bg-red-400', textColor: 'text-red-600', bg: 'bg-red-50', words: [{ prefix: 'C', full: 'CAT', emoji: '🐱' }, { prefix: 'B', full: 'BAT', emoji: '🦇' }, { prefix: 'H', full: 'HAT', emoji: '🎩' }, { prefix: 'M', full: 'MAT', emoji: '🪤' }] },
  { ending: '-AN', house: '🏭', color: 'bg-blue-400', textColor: 'text-blue-600', bg: 'bg-blue-50', words: [{ prefix: 'C', full: 'CAN', emoji: '🥫' }, { prefix: 'F', full: 'FAN', emoji: '🌀' }, { prefix: 'M', full: 'MAN', emoji: '🧍' }, { prefix: 'P', full: 'PAN', emoji: '🍳' }] },
  { ending: '-OG', house: '🛖', color: 'bg-green-400', textColor: 'text-green-600', bg: 'bg-green-50', words: [{ prefix: 'D', full: 'DOG', emoji: '🐶' }, { prefix: 'F', full: 'FOG', emoji: '🌫️' }, { prefix: 'L', full: 'LOG', emoji: '🪵' }, { prefix: 'H', full: 'HOG', emoji: '🐷' }] },
  { ending: '-UN', house: '🏖️', color: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50', words: [{ prefix: 'S', full: 'SUN', emoji: '☀️' }, { prefix: 'R', full: 'RUN', emoji: '🏃' }, { prefix: 'B', full: 'BUN', emoji: '🍞' }, { prefix: 'F', full: 'FUN', emoji: '🎉' }] },
  { ending: '-IG', house: '🏡', color: 'bg-pink-400', textColor: 'text-pink-600', bg: 'bg-pink-50', words: [{ prefix: 'P', full: 'PIG', emoji: '🐷' }, { prefix: 'W', full: 'WIG', emoji: '👱‍♀️' }, { prefix: 'F', full: 'FIG', emoji: '🧅' }, { prefix: 'D', full: 'DIG', emoji: '⛏️' }] },
  { ending: '-OP', house: '🎪', color: 'bg-purple-400', textColor: 'text-purple-600', bg: 'bg-purple-50', words: [{ prefix: 'M', full: 'MOP', emoji: '🧹' }, { prefix: 'T', full: 'TOP', emoji: '🌪️' }, { prefix: 'H', full: 'HOP', emoji: '🦘' }, { prefix: 'P', full: 'POP', emoji: '🍿' }] },
  { ending: '-UG', house: '⛺', color: 'bg-orange-400', textColor: 'text-orange-600', bg: 'bg-orange-50', words: [{ prefix: 'B', full: 'BUG', emoji: '🐛' }, { prefix: 'R', full: 'RUG', emoji: '🧶' }, { prefix: 'M', full: 'MUG', emoji: '☕' }, { prefix: 'H', full: 'HUG', emoji: '🫂' }] },
  { ending: '-IP', house: '🚢', color: 'bg-teal-400', textColor: 'text-teal-600', bg: 'bg-teal-50', words: [{ prefix: 'L', full: 'LIP', emoji: '👄' }, { prefix: 'Z', full: 'ZIP', emoji: '🤐' }, { prefix: 'S', full: 'SIP', emoji: '🥤' }, { prefix: 'D', full: 'DIP', emoji: '🥣' }] },
  { ending: '-EN', house: '🏫', color: 'bg-lime-400', textColor: 'text-lime-700', bg: 'bg-lime-50', words: [{ prefix: 'H', full: 'HEN', emoji: '🐔' }, { prefix: 'P', full: 'PEN', emoji: '🖊️' }, { prefix: 'T', full: 'TEN', emoji: '🔟' }, { prefix: 'M', full: 'MEN', emoji: '👨‍👦' }] },
  { ending: '-ED', house: '🛏️', color: 'bg-rose-400', textColor: 'text-rose-600', bg: 'bg-rose-50', words: [{ prefix: 'B', full: 'BED', emoji: '🛏️' }, { prefix: 'R', full: 'RED', emoji: '🔴' }, { prefix: 'W', full: 'WED', emoji: '💍' }, { prefix: 'F', full: 'FED', emoji: '🍼' }] },
  { ending: '-IN', house: '🗑️', color: 'bg-cyan-400', textColor: 'text-cyan-700', bg: 'bg-cyan-50', words: [{ prefix: 'P', full: 'PIN', emoji: '📌' }, { prefix: 'W', full: 'WIN', emoji: '🏆' }, { prefix: 'B', full: 'BIN', emoji: '🗑️' }, { prefix: 'F', full: 'FIN', emoji: '🦈' }] },
  { ending: '-AM', house: '🏪', color: 'bg-fuchsia-400', textColor: 'text-fuchsia-700', bg: 'bg-fuchsia-50', words: [{ prefix: 'J', full: 'JAM', emoji: '🍓' }, { prefix: 'H', full: 'HAM', emoji: '🍖' }, { prefix: 'R', full: 'RAM', emoji: '🐏' }, { prefix: 'Y', full: 'YAM', emoji: '🍠' }] },
  { ending: '-AP', house: '🗺️', color: 'bg-sky-400', textColor: 'text-sky-700', bg: 'bg-sky-50', words: [{ prefix: 'M', full: 'MAP', emoji: '🗺️' }, { prefix: 'C', full: 'CAP', emoji: '🧢' }, { prefix: 'T', full: 'TAP', emoji: '🚰' }, { prefix: 'N', full: 'NAP', emoji: '😴' }] },
  { ending: '-ILL', house: '🏥', color: 'bg-indigo-400', textColor: 'text-indigo-600', bg: 'bg-indigo-50', words: [{ prefix: 'H', full: 'HILL', emoji: '⛰️' }, { prefix: 'P', full: 'PILL', emoji: '💊' }, { prefix: 'B', full: 'BILL', emoji: '💵' }, { prefix: 'M', full: 'MILL', emoji: '🏭' }] },
  { ending: '-IT', house: '🏟️', color: 'bg-violet-400', textColor: 'text-violet-600', bg: 'bg-violet-50', words: [{ prefix: 'B', full: 'BIT', emoji: '🤏' }, { prefix: 'H', full: 'HIT', emoji: '🎯' }, { prefix: 'P', full: 'PIT', emoji: '🕳️' }, { prefix: 'K', full: 'KIT', emoji: '🧰' }] },
  { ending: '-OT', house: '🥘', color: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-100', words: [{ prefix: 'C', full: 'COT', emoji: '🛏️' }, { prefix: 'H', full: 'HOT', emoji: '🔥' }, { prefix: 'P', full: 'POT', emoji: '🍲' }, { prefix: 'D', full: 'DOT', emoji: '🟣' }] },
  { ending: '-UT', house: '🐿️', color: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-100', words: [{ prefix: 'H', full: 'HUT', emoji: '🛖' }, { prefix: 'N', full: 'NUT', emoji: '🥜' }, { prefix: 'C', full: 'CUT', emoji: '✂️' }, { prefix: 'G', full: 'GUT', emoji: '🫄' }] },
  { ending: '-AG', house: '🛍️', color: 'bg-lime-500', textColor: 'text-lime-700', bg: 'bg-lime-100', words: [{ prefix: 'B', full: 'BAG', emoji: '👜' }, { prefix: 'R', full: 'RAG', emoji: '🧽' }, { prefix: 'T', full: 'TAG', emoji: '🏷️' }, { prefix: 'W', full: 'WAG', emoji: '🐕' }] },
  { ending: '-AD', house: '🏠', color: 'bg-emerald-400', textColor: 'text-emerald-600', bg: 'bg-emerald-50', words: [{ prefix: 'D', full: 'DAD', emoji: '👨' }, { prefix: 'M', full: 'MAD', emoji: '😠' }, { prefix: 'S', full: 'SAD', emoji: '😢' }, { prefix: 'P', full: 'PAD', emoji: '📝' }] },
  { ending: '-AB', house: '🚕', color: 'bg-cyan-500', textColor: 'text-cyan-700', bg: 'bg-cyan-100', words: [{ prefix: 'C', full: 'CAB', emoji: '🚕' }, { prefix: 'L', full: 'LAB', emoji: '🧪' }, { prefix: 'CR', full: 'CRAB', emoji: '🦀' }, { prefix: 'GR', full: 'GRAB', emoji: '✊' }] },
  { ending: '-ELL', house: '🔔', color: 'bg-blue-500', textColor: 'text-blue-700', bg: 'bg-blue-100', words: [{ prefix: 'B', full: 'BELL', emoji: '🔔' }, { prefix: 'Y', full: 'YELL', emoji: '🗣️' }, { prefix: 'T', full: 'TELL', emoji: '💬' }, { prefix: 'S', full: 'SELL', emoji: '🏪' }] },
  { ending: '-ALL', house: '🧱', color: 'bg-indigo-500', textColor: 'text-indigo-700', bg: 'bg-indigo-100', words: [{ prefix: 'B', full: 'BALL', emoji: '🏀' }, { prefix: 'T', full: 'TALL', emoji: '🦒' }, { prefix: 'W', full: 'WALL', emoji: '🧱' }, { prefix: 'F', full: 'FALL', emoji: '🍂' }] },
  { ending: '-AY', house: '🎠', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-700', bg: 'bg-fuchsia-100', words: [{ prefix: 'D', full: 'DAY', emoji: '☀️' }, { prefix: 'PL', full: 'PLAY', emoji: '🎮' }, { prefix: 'S', full: 'SAY', emoji: '🗣️' }, { prefix: 'W', full: 'WAY', emoji: '🛣️' }] },
  { ending: '-AW', house: '🐾', color: 'bg-rose-500', textColor: 'text-rose-700', bg: 'bg-rose-100', words: [{ prefix: 'J', full: 'JAW', emoji: '🦷' }, { prefix: 'P', full: 'PAW', emoji: '🐾' }, { prefix: 'R', full: 'RAW', emoji: '🥩' }, { prefix: 'DR', full: 'DRAW', emoji: '🖍️' }] },
  { ending: '-AR', house: '🚗', color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-100', words: [{ prefix: 'C', full: 'CAR', emoji: '🚗' }, { prefix: 'ST', full: 'STAR', emoji: '⭐' }, { prefix: 'J', full: 'JAR', emoji: '🫙' }, { prefix: 'F', full: 'FAR', emoji: '🔭' }] },
  { ending: '-OW', house: '🐄', color: 'bg-stone-400', textColor: 'text-stone-700', bg: 'bg-stone-100', words: [{ prefix: 'C', full: 'COW', emoji: '🐄' }, { prefix: 'H', full: 'HOW', emoji: '🤷' }, { prefix: 'N', full: 'NOW', emoji: '⏰' }, { prefix: 'W', full: 'WOW', emoji: '😲' }] },
  { ending: '-OW2', house: '🏔️', color: 'bg-sky-200', textColor: 'text-sky-700', bg: 'bg-sky-50', words: [{ prefix: 'B', full: 'BOW', emoji: '🎀' }, { prefix: 'R', full: 'ROW', emoji: '🚣' }, { prefix: 'T', full: 'TOW', emoji: '🛻' }, { prefix: 'SN', full: 'SNOW', emoji: '❄️' }] },
  { ending: '-UB', house: '🛁', color: 'bg-teal-500', textColor: 'text-teal-700', bg: 'bg-teal-100', words: [{ prefix: 'C', full: 'CUB', emoji: '🐻' }, { prefix: 'R', full: 'RUB', emoji: '🧴' }, { prefix: 'T', full: 'TUB', emoji: '🛁' }, { prefix: 'S', full: 'SUB', emoji: '🥪' }] },
  { ending: '-UMP', house: '🦘', color: 'bg-purple-500', textColor: 'text-purple-700', bg: 'bg-purple-100', words: [{ prefix: 'J', full: 'JUMP', emoji: '🦘' }, { prefix: 'B', full: 'BUMP', emoji: '🤕' }, { prefix: 'L', full: 'LUMP', emoji: '🪨' }, { prefix: 'P', full: 'PUMP', emoji: '⛽' }] },
  { ending: '-ASH', house: '🌋', color: 'bg-red-600', textColor: 'text-red-800', bg: 'bg-red-200', words: [{ prefix: 'C', full: 'CASH', emoji: '💵' }, { prefix: 'D', full: 'DASH', emoji: '💨' }, { prefix: 'M', full: 'MASH', emoji: '🥔' }, { prefix: 'R', full: 'RASH', emoji: '🤒' }] }
];

function shuffleArr<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const HOUSES_PER_GAME = 3;
// 4 standard words + 1 Odd One Out bonus = 5 points per house
const MAX_SCORE = HOUSES_PER_GAME * 5;

type OddOption = { full: string; emoji: string; isOdd: boolean };

export default function WordFamilyHouseGame({ kid, onComplete }: Props) {
  const [gameFamilies, setGameFamilies] = useState(() => shuffleArr(FAMILIES).slice(0, HOUSES_PER_GAME));
  const [familyIndex, setFamilyIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const [totalScore, setTotalScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Odd One Out State
  const [isOddOneOutMode, setIsOddOneOutMode] = useState(false);
  const [oddOptions, setOddOptions] = useState<OddOption[]>([]);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const family = gameFamilies[familyIndex];
  const word = family?.words[wordIndex];

  const safeTimeout = (cb: () => void, ms: number) => {
    const id = setTimeout(cb, ms);
    timeoutsRef.current.push(id);
  };

  const cleanup = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  useEffect(() => { return cleanup; }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.8;
    utt.pitch = 1.2;
    window.speechSynthesis.speak(utt);
  };

  // Setup Standard Build-A-Word Mode
  useEffect(() => {
    if (isFinished || isOddOneOutMode || !word) return;
    const allPrefixes = FAMILIES.flatMap(f => f.words.map(w => w.prefix));
    const wrongs = shuffleArr(allPrefixes.filter(p => p !== word.prefix)).slice(0, 2);
    setChoices(shuffleArr([word.prefix, ...wrongs]));
    setSelected(null);
    setFeedback(null);

    // Clean ending for speech (e.g. "-OW2" -> "OW")
    const spokenEnding = family.ending.replace('-', '').replace('2', '');
    safeTimeout(() => speak(`What makes ${word.full}?`), 400);
  }, [familyIndex, wordIndex, isOddOneOutMode, isFinished]);

  const setupOddOneOut = () => {
    setIsOddOneOutMode(true);
    setFeedback(null);
    setSelected(null);

    // Grab 3 words from the current family
    const familyWords = shuffleArr(family.words).slice(0, 3).map(w => ({ full: w.full, emoji: w.emoji, isOdd: false }));

    // Grab 1 word from a DIFFERENT family
    const otherFamilies = FAMILIES.filter(f => f.ending !== family.ending);
    const randomFamily = otherFamilies[Math.floor(Math.random() * otherFamilies.length)];
    const oddWord = randomFamily.words[Math.floor(Math.random() * randomFamily.words.length)];

    const options = shuffleArr([...familyWords, { full: oddWord.full, emoji: oddWord.emoji, isOdd: true }]);
    setOddOptions(options);

    const spokenEnding = family.ending.replace('-', '').replace('2', '');
    speak(`Lightning round! Which one does not belong in the ${spokenEnding} house?`);
  };

  const handleStandardChoice = (letter: string) => {
    if (feedback) return;
    setSelected(letter);

    if (letter === word.prefix) {
      soundManager.playSuccess();
      const spokenEnding = family.ending.replace('-', '').replace('2', '');
      speak(`${letter} and ${spokenEnding} makes ${word.full}!`);
      setFeedback('correct');

      const newCompleted = [...completed, word.full];
      setCompleted(newCompleted);
      setTotalScore(s => s + 1);

      safeTimeout(() => {
        if (wordIndex < family.words.length - 1) {
          setWordIndex(wi => wi + 1);
        } else {
          // Trigger the Odd One Out Mini Game!
          setupOddOneOut();
        }
      }, 2000);
    } else {
      soundManager.playGameOver();
      speak(`Not quite! Try again!`);
      setFeedback('wrong');
      safeTimeout(() => {
        setSelected(null);
        setFeedback(null);
        const allPrefixes = FAMILIES.flatMap(f => f.words.map(w => w.prefix));
        const wrongs = shuffleArr(allPrefixes.filter(p => p !== word.prefix)).slice(0, 2);
        setChoices(shuffleArr([word.prefix, ...wrongs]));
      }, 1500);
    }
  };

  const handleOddChoice = (option: OddOption) => {
    if (feedback) return;
    setSelected(option.full);

    if (option.isOdd) {
      soundManager.playSuccess();
      speak(`Yes! ${option.full} does not belong! Bonus star!`);
      setFeedback('correct');

      const newScore = totalScore + 1;
      setTotalScore(newScore);

      if (newScore >= MAX_SCORE) {
        safeTimeout(() => {
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
          setIsFinished(true);
          onComplete(10);
        }, 1500);
      } else {
        safeTimeout(() => {
          setIsOddOneOutMode(false);
          setFamilyIndex(fi => fi + 1);
          setWordIndex(0);
          setCompleted([]);
        }, 2500);
      }
    } else {
      soundManager.playGameOver();
      speak(`Oops! ${option.full} lives in this house. Find the odd one out!`);
      setFeedback('wrong');
      safeTimeout(() => {
        setSelected(null);
        setFeedback(null);
      }, 1500);
    }
  };

  const reset = () => {
    cleanup();
    setGameFamilies(shuffleArr(FAMILIES).slice(0, HOUSES_PER_GAME));
    setFamilyIndex(0);
    setWordIndex(0);
    setCompleted([]);
    setTotalScore(0);
    setIsFinished(false);
    setIsOddOneOutMode(false);
    setSelected(null);
    setFeedback(null);
  };

  // Clean the display ending (e.g. "-OW2" -> "-OW")
  const displayEnding = family?.ending.replace('2', '');

  return (
    <div className="space-y-8 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={cleanup} className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-black text-amber-600">Word Family House</h2>
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
          <span className="text-amber-700 font-black">{totalScore}/{MAX_SCORE}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 flex-wrap max-w-lg mx-auto">
        {Array.from({ length: MAX_SCORE }).map((_, i) => (
          <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all ${i < totalScore ? 'bg-amber-500 scale-125' : 'bg-gray-200'}`} />
        ))}
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border-8 border-amber-300 space-y-6">
          <div className="text-8xl">🏆</div>
          <h3 className="text-4xl font-black text-[#2F3061]">Word Wizard!</h3>
          <p className="text-xl text-gray-500">You built the houses and found the odd ones out!</p>
          <button onClick={reset} className="bg-amber-500 text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform">
            Play Again!
          </button>
        </motion.div>
      ) : isOddOneOutMode ? (
        // ODD ONE OUT MINI GAME UI
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl border-8 border-yellow-300 space-y-6">
          <div className="flex items-center justify-center gap-3 text-yellow-500 mb-2">
            <Zap className="w-8 h-8 fill-current animate-pulse" />
            <h3 className="text-3xl font-black">Lightning Round!</h3>
            <Zap className="w-8 h-8 fill-current animate-pulse" />
          </div>

          <p className="text-gray-500 font-black uppercase tracking-widest text-sm">
            Which one DOES NOT live in the {displayEnding} house?
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {oddOptions.map(option => {
              const isSelected = selected === option.full;
              let cardClass = 'bg-gray-50 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50';
              if (isSelected && feedback === 'correct') cardClass = 'bg-green-100 border-green-500';
              if (isSelected && feedback === 'wrong') cardClass = 'bg-red-100 border-red-400';
              if (selected && !isSelected && option.isOdd) cardClass = 'bg-green-50 border-green-300 opacity-70';

              return (
                <motion.button
                  key={option.full}
                  whileHover={!feedback ? { scale: 1.05 } : {}}
                  whileTap={!feedback ? { scale: 0.95 } : {}}
                  onClick={() => handleOddChoice(option)}
                  className={`p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 ${cardClass}`}
                >
                  <div className="text-6xl">{option.emoji}</div>
                  <div className="text-2xl font-black text-[#2F3061]">{option.full}</div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      ) : (
        // STANDARD BUILD-A-WORD UI
        <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl border-8 border-amber-200 space-y-6">
          {/* Themed House Display */}
          <div className={`${family.bg} border-4 border-amber-200 rounded-3xl p-6 space-y-2 transition-colors duration-500 relative overflow-hidden`}>
            <div className="absolute -right-4 -top-4 opacity-10 text-[150px] pointer-events-none">{family.house}</div>

            <div className="text-6xl relative z-10">{family.house}</div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-sm relative z-10">The {displayEnding} house</p>

            <div className="flex flex-wrap gap-2 justify-center mt-2 min-h-[44px] relative z-10">
              {family.words.map(w => (
                <span
                  key={w.full}
                  className={`px-4 py-2 rounded-xl font-black text-lg transition-all ${completed.includes(w.full)
                    ? `${family.color} text-white shadow-md scale-110`
                    : 'bg-white/50 text-gray-400 border-2 border-dashed border-gray-300'
                    }`}
                >
                  {completed.includes(w.full) ? w.full : '???'}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-4">
              Which letter makes <span className="text-[#2F3061] text-lg">{word.full}</span>?
            </p>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className={`w-20 h-24 rounded-2xl ${selected === word.prefix ? (feedback === 'correct' ? 'bg-green-100 border-4 border-green-400' : 'bg-red-100 border-4 border-red-300') : 'bg-gray-50 border-4 border-dashed border-gray-300'} flex items-center justify-center text-5xl font-black text-gray-700 shadow-inner transition-colors`}>
                {selected ? selected : '?'}
              </div>
              <div className={`${family.color} text-white px-5 py-4 rounded-2xl font-black text-4xl shadow-md transition-colors duration-500`}>
                {displayEnding}
              </div>
              <div className="text-5xl ml-2">{word.emoji}</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {choices.map(letter => (
                <motion.button
                  key={letter}
                  whileHover={!feedback ? { scale: 1.05, y: -4 } : {}}
                  whileTap={!feedback ? { scale: 0.95 } : {}}
                  onClick={() => handleStandardChoice(letter)}
                  className={`py-6 rounded-3xl font-black text-5xl shadow-md transition-all ${selected === letter && feedback === 'correct' ? 'bg-green-400 text-white border-green-500' :
                    selected === letter && feedback === 'wrong' ? 'bg-red-400 text-white border-red-500' :
                      feedback && letter === word.prefix ? 'bg-green-100 text-green-700 border-green-300' :
                        'bg-amber-50 text-amber-700 hover:bg-amber-100 border-4 border-amber-200'
                    }`}
                >
                  {letter}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={reset} className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200">
        <RotateCcw className="w-5 h-5" />
        Restart
      </button>
    </div>
  );
}
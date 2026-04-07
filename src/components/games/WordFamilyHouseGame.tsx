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

const FAMILIES = [
  { ending: '-AT', house: '🏰', color: 'bg-red-400', textColor: 'text-red-600', bg: 'bg-red-50', words: [{ prefix: 'C', full: 'CAT', emoji: '🐱' }, { prefix: 'B', full: 'BAT', emoji: '🦇' }, { prefix: 'H', full: 'HAT', emoji: '🎩' }, { prefix: 'M', full: 'MAT', emoji: '🪤' }] },
  { ending: '-AN', house: '🏭', color: 'bg-blue-400', textColor: 'text-blue-600', bg: 'bg-blue-50', words: [{ prefix: 'C', full: 'CAN', emoji: '🥫' }, { prefix: 'F', full: 'FAN', emoji: '🌀' }, { prefix: 'M', full: 'MAN', emoji: '🧍' }, { prefix: 'P', full: 'PAN', emoji: '🍳' }] },
  { ending: '-OG', house: '🛖', color: 'bg-green-400', textColor: 'text-green-600', bg: 'bg-green-50', words: [{ prefix: 'D', full: 'DOG', emoji: '🐶' }, { prefix: 'F', full: 'FOG', emoji: '🌫️' }, { prefix: 'L', full: 'LOG', emoji: '🪵' }, { prefix: 'H', full: 'HOG', emoji: '🐷' }] },
  { ending: '-UN', house: '🏖️', color: 'bg-yellow-400', textColor: 'text-yellow-700', bg: 'bg-yellow-50', words: [{ prefix: 'S', full: 'SUN', emoji: '☀️' }, { prefix: 'R', full: 'RUN', emoji: '🏃' }, { prefix: 'B', full: 'BUN', emoji: '🍞' }, { prefix: 'F', full: 'FUN', emoji: '🎉' }] },
  { ending: '-IG', house: '🏡', color: 'bg-pink-400', textColor: 'text-pink-600', bg: 'bg-pink-50', words: [{ prefix: 'P', full: 'PIG', emoji: '🐷' }, { prefix: 'W', full: 'WIG', emoji: '👱‍♀️' }, { prefix: 'F', full: 'FIG', emoji: '🧅' }, { prefix: 'D', full: 'DIG', emoji: '⛏️' }] },
  { ending: '-OP', house: '🎪', color: 'bg-purple-400', textColor: 'text-purple-600', bg: 'bg-purple-50', words: [{ prefix: 'M', full: 'MOP', emoji: '🧹' }, { prefix: 'T', full: 'TOP', emoji: '🌪️' }, { prefix: 'H', full: 'HOP', emoji: '🦘' }, { prefix: 'P', full: 'POP', emoji: '🍿' }] },
  { ending: '-UG', house: '⛺', color: 'bg-orange-400', textColor: 'text-orange-600', bg: 'bg-orange-50', words: [{ prefix: 'B', full: 'BUG', emoji: '🐛' }, { prefix: 'R', full: 'RUG', emoji: '🧶' }, { prefix: 'M', full: 'MUG', emoji: '☕' }, { prefix: 'H', full: 'HUG', emoji: '🫂' }] },
  { ending: '-EN', house: '🏫', color: 'bg-lime-400', textColor: 'text-lime-700', bg: 'bg-lime-50', words: [{ prefix: 'H', full: 'HEN', emoji: '🐔' }, { prefix: 'P', full: 'PEN', emoji: '🖊️' }, { prefix: 'T', full: 'TEN', emoji: '🔟' }, { prefix: 'M', full: 'MEN', emoji: '👨‍👦' }] },
  { ending: '-AY', house: '🎠', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-700', bg: 'bg-fuchsia-100', words: [{ prefix: 'D', full: 'DAY', emoji: '☀️' }, { prefix: 'PL', full: 'PLAY', emoji: '🎮' }, { prefix: 'S', full: 'SAY', emoji: '🗣️' }, { prefix: 'W', full: 'WAY', emoji: '🛣️' }] },
  { ending: '-AR', house: '🚗', color: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-100', words: [{ prefix: 'C', full: 'CAR', emoji: '🚗' }, { prefix: 'ST', full: 'STAR', emoji: '⭐' }, { prefix: 'J', full: 'JAR', emoji: '🫙' }, { prefix: 'F', full: 'FAR', emoji: '🔭' }] },
  { ending: '-ALL', house: '🧱', color: 'bg-indigo-500', textColor: 'text-indigo-700', bg: 'bg-indigo-100', words: [{ prefix: 'B', full: 'BALL', emoji: '🏀' }, { prefix: 'T', full: 'TALL', emoji: '🦒' }, { prefix: 'W', full: 'WALL', emoji: '🧱' }, { prefix: 'F', full: 'FALL', emoji: '🍂' }] },
  { ending: '-ELL', house: '🔔', color: 'bg-blue-500', textColor: 'text-blue-700', bg: 'bg-blue-100', words: [{ prefix: 'B', full: 'BELL', emoji: '🔔' }, { prefix: 'Y', full: 'YELL', emoji: '🗣️' }, { prefix: 'T', full: 'TELL', emoji: '💬' }, { prefix: 'S', full: 'SELL', emoji: '🏪' }] },
];

function shuffleArr<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

const HOUSES_PER_GAME = 3;
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
  const [isOddOneOutMode, setIsOddOneOutMode] = useState(false);
  const [oddOptions, setOddOptions] = useState<OddOption[]>([]);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const family = gameFamilies[familyIndex];
  const word = family?.words[wordIndex];

  const safeTimeout = (cb: () => void, ms: number) => { const id = setTimeout(cb, ms); timeoutsRef.current.push(id); };
  const cleanup = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  useEffect(() => { return cleanup; }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.8; utt.pitch = 1.2;
    window.speechSynthesis.speak(utt);
  };

  const initChoices = (currentWord: typeof word) => {
    if (!currentWord) return;
    const allPrefixes = FAMILIES.flatMap(f => f.words.map(w => w.prefix));
    const wrongs = shuffleArr(allPrefixes.filter(p => p !== currentWord.prefix)).slice(0, 2);
    setChoices(shuffleArr([currentWord.prefix, ...wrongs]));
    setSelected(null); setFeedback(null);
    speak(`What letter makes ${currentWord.full}?`);
  };

  const startOddOneOut = (fam: typeof gameFamilies[0]) => {
    setIsOddOneOutMode(true);
    const allWords = FAMILIES.flatMap(f => f.words);
    const oddWord = shuffleArr(allWords.filter(w => !fam.words.some(fw => fw.full === w.full)))[0];
    const correctWords = shuffleArr(fam.words).slice(0, 3);
    const options: OddOption[] = shuffleArr([
      ...correctWords.map(w => ({ full: w.full, emoji: w.emoji, isOdd: false })),
      { full: oddWord.full, emoji: oddWord.emoji, isOdd: true }
    ]);
    setOddOptions(options);
    setSelected(null); setFeedback(null);
    speak(`Which word does NOT live in the ${fam.ending.replace('2', '')} house?`);
  };

  useEffect(() => {
    if (word && !isOddOneOutMode) { initChoices(word); }
  }, [wordIndex, familyIndex, isOddOneOutMode]);

  const handleStandardChoice = (letter: string) => {
    if (feedback || !word) return;
    setSelected(letter);
    if (letter === word.prefix) {
      soundManager.playSuccess();
      speak(`Yes! ${letter} makes ${word.full}!`);
      setFeedback('correct');
      const newCompleted = [...completed, word.full];
      setCompleted(newCompleted);
      const newScore = totalScore + 1;
      setTotalScore(newScore);
      if (wordIndex >= family.words.length - 1) {
        // All words done — start odd one out!
        safeTimeout(() => startOddOneOut(family), 1500);
      } else {
        safeTimeout(() => { setWordIndex(wi => wi + 1); setFeedback(null); setSelected(null); }, 1500);
      }
    } else {
      soundManager.playGameOver();
      speak(`Not quite! Try again!`);
      setFeedback('wrong');
      safeTimeout(() => { initChoices(word); }, 1500);
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
        safeTimeout(() => { confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } }); setIsFinished(true); onComplete(10); }, 1500);
      } else {
        safeTimeout(() => { setIsOddOneOutMode(false); setFamilyIndex(fi => fi + 1); setWordIndex(0); setCompleted([]); }, 2000);
      }
    } else {
      soundManager.playGameOver();
      speak(`Oops! ${option.full} lives in this house. Find the odd one out!`);
      setFeedback('wrong');
      safeTimeout(() => { setSelected(null); setFeedback(null); }, 1500);
    }
  };

  const reset = () => {
    cleanup();
    setGameFamilies(shuffleArr(FAMILIES).slice(0, HOUSES_PER_GAME));
    setFamilyIndex(0); setWordIndex(0); setCompleted([]); setTotalScore(0);
    setIsFinished(false); setIsOddOneOutMode(false); setSelected(null); setFeedback(null);
  };

  const displayEnding = family?.ending.replace('2', '');

  return (
    <div className="space-y-4 sm:space-y-6 text-center max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" onClick={cleanup} className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-lg sm:text-3xl font-black text-amber-600">Word Family House</h2>
        <div className="flex items-center gap-1 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-amber-700 font-black text-sm sm:text-base">{totalScore}/{MAX_SCORE}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-1 sm:gap-2 flex-wrap max-w-xs sm:max-w-lg mx-auto">
        {Array.from({ length: MAX_SCORE }).map((_, i) => (
          <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${i < totalScore ? 'bg-amber-500 scale-125' : 'bg-gray-200'}`} />
        ))}
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-amber-300 space-y-4 sm:space-y-6">
          <div className="text-7xl sm:text-8xl">🏆</div>
          <h3 className="text-3xl sm:text-4xl font-black text-[#2F3061]">Word Wizard!</h3>
          <p className="text-lg sm:text-xl text-gray-500">You built the houses and found the odd ones out!</p>
          <button onClick={reset} className="bg-amber-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-xl hover:scale-105 transition-transform">
            Play Again!
          </button>
        </motion.div>

      ) : isOddOneOutMode ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-yellow-300 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-yellow-500 mb-1 sm:mb-2">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-current animate-pulse" />
            <h3 className="text-2xl sm:text-3xl font-black">Lightning Round!</h3>
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 fill-current animate-pulse" />
          </div>
          <p className="text-gray-500 font-black uppercase tracking-widest text-xs sm:text-sm">
            Which one DOES NOT live in the {displayEnding} house?
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
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
                  className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-4 transition-all flex flex-col items-center gap-1 sm:gap-2 ${cardClass}`}
                >
                  <div className="text-5xl sm:text-6xl">{option.emoji}</div>
                  <div className="text-xl sm:text-2xl font-black text-[#2F3061]">{option.full}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

      ) : (
        <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-amber-200 space-y-4 sm:space-y-6">
          {/* House Display */}
          <div className={`${family?.bg} border-4 border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2 transition-colors duration-500 relative overflow-hidden`}>
            <div className="absolute -right-4 -top-4 opacity-10 text-[100px] sm:text-[150px] pointer-events-none">{family?.house}</div>
            <div className="text-5xl sm:text-6xl relative z-10">{family?.house}</div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs sm:text-sm relative z-10">The {displayEnding} house</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2 min-h-[40px] sm:min-h-[44px] relative z-10">
              {family?.words.map(w => (
                <span key={w.full} className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl font-black text-sm sm:text-lg transition-all ${completed.includes(w.full)
                  ? `${family.color} text-white shadow-md scale-110`
                  : 'bg-white/50 text-gray-400 border-2 border-dashed border-gray-300'
                  }`}>
                  {completed.includes(w.full) ? w.full : '???'}
                </span>
              ))}
            </div>
          </div>

          {/* Word Builder */}
          {word && (
            <div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4">
                Which letter makes <span className="text-[#2F3061] text-base sm:text-lg">{word.full}</span>?
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl ${selected === word.prefix ? (feedback === 'correct' ? 'bg-green-100 border-4 border-green-400' : 'bg-red-100 border-4 border-red-300') : 'bg-gray-50 border-4 border-dashed border-gray-300'
                  } flex items-center justify-center text-4xl sm:text-5xl font-black text-gray-700 shadow-inner transition-colors`}>
                  {selected ? selected : '?'}
                </div>
                <div className={`${family?.color} text-white px-4 sm:px-5 py-3 sm:py-4 rounded-2xl font-black text-3xl sm:text-4xl shadow-md`}>
                  {displayEnding}
                </div>
                <div className="text-4xl sm:text-5xl ml-1 sm:ml-2">{word.emoji}</div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {choices.map(letter => (
                  <motion.button
                    key={letter}
                    whileHover={!feedback ? { scale: 1.05, y: -4 } : {}}
                    whileTap={!feedback ? { scale: 0.95 } : {}}
                    onClick={() => handleStandardChoice(letter)}
                    className={`py-5 sm:py-6 rounded-3xl font-black text-4xl sm:text-5xl shadow-md transition-all border-4 ${selected === letter && feedback === 'correct' ? 'bg-green-400 text-white border-green-500' :
                      selected === letter && feedback === 'wrong' ? 'bg-red-400 text-white border-red-500' :
                        feedback && letter === word.prefix ? 'bg-green-100 text-green-700 border-green-300' :
                          'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                      }`}
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={reset} className="flex items-center gap-2 mx-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 text-sm sm:text-base">
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        Restart
      </button>
    </div>
  );
}
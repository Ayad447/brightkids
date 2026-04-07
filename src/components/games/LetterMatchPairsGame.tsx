import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, Timer, Image as ImageIcon, Type, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

const ALPHABET = [
  { upper: 'A', lower: 'a', emoji: '🍎', word: 'Apple' }, { upper: 'B', lower: 'b', emoji: '⚽', word: 'Ball' },
  { upper: 'C', lower: 'c', emoji: '🐱', word: 'Cat' }, { upper: 'D', lower: 'd', emoji: '🐶', word: 'Dog' },
  { upper: 'E', lower: 'e', emoji: '🥚', word: 'Egg' }, { upper: 'F', lower: 'f', emoji: '🐟', word: 'Fish' },
  { upper: 'G', lower: 'g', emoji: '🐐', word: 'Goat' }, { upper: 'H', lower: 'h', emoji: '🎩', word: 'Hat' },
  { upper: 'I', lower: 'i', emoji: '🧊', word: 'Ice' }, { upper: 'J', lower: 'j', emoji: '🫙', word: 'Jar' },
  { upper: 'K', lower: 'k', emoji: '🪁', word: 'Kite' }, { upper: 'L', lower: 'l', emoji: '🦁', word: 'Lion' },
  { upper: 'M', lower: 'm', emoji: '🌙', word: 'Moon' }, { upper: 'N', lower: 'n', emoji: '🪺', word: 'Nest' },
  { upper: 'O', lower: 'o', emoji: '🦉', word: 'Owl' }, { upper: 'P', lower: 'p', emoji: '🐷', word: 'Pig' },
  { upper: 'Q', lower: 'q', emoji: '👑', word: 'Queen' }, { upper: 'R', lower: 'r', emoji: '🌈', word: 'Rainbow' },
  { upper: 'S', lower: 's', emoji: '⭐', word: 'Star' }, { upper: 'T', lower: 't', emoji: '🌳', word: 'Tree' },
  { upper: 'U', lower: 'u', emoji: '☂️', word: 'Umbrella' }, { upper: 'V', lower: 'v', emoji: '🌋', word: 'Volcano' },
  { upper: 'W', lower: 'w', emoji: '🍉', word: 'Watermelon' }, { upper: 'X', lower: 'x', emoji: '🎹', word: 'Xylophone' },
  { upper: 'Y', lower: 'y', emoji: '🪀', word: 'Yoyo' }, { upper: 'Z', lower: 'z', emoji: '🦓', word: 'Zebra' }
];

type GameMode = 'letters' | 'phonics';
type Difficulty = 'easy' | 'medium' | 'hard';
type Card = { id: string; display: string; pairId: string; type: 'A' | 'B'; data: typeof ALPHABET[0] };

function buildCards(mode: GameMode, difficulty: Difficulty): Card[] {
  const numPairs = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
  const shuffledAlphabet = [...ALPHABET].sort(() => Math.random() - 0.5).slice(0, numPairs);
  const cards: Card[] = [];
  shuffledAlphabet.forEach((item, index) => {
    cards.push({ id: `a${index}`, display: item.upper, pairId: `pair${index}`, type: 'A', data: item });
    if (mode === 'letters') cards.push({ id: `b${index}`, display: item.lower, pairId: `pair${index}`, type: 'B', data: item });
    else cards.push({ id: `b${index}`, display: item.emoji, pairId: `pair${index}`, type: 'B', data: item });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function LetterMatchPairsGame({ kid, onComplete }: Props) {
  const [hasStarted, setHasStarted] = useState(false);
  const [mode, setMode] = useState<GameMode>('letters');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const safeTimeout = (cb: () => void, ms: number) => { const id = setTimeout(cb, ms); timeoutsRef.current.push(id); };
  const cleanup = () => { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = []; if (timerRef.current) clearInterval(timerRef.current); if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  useEffect(() => { return cleanup; }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.8; utt.pitch = 1.3;
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => {
    if (hasStarted && !isFinished) { timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [hasStarted, isFinished]);

  const startGame = () => {
    soundManager.playStartGame();
    setCards(buildCards(mode, difficulty));
    setFlipped([]); setMatched([]); setMoves(0); setSeconds(0); setIsFinished(false); setIsLocked(false); setHasStarted(true);
    if (mode === 'letters') speak('Match the big letters with their small letters!');
    else speak('Match the letters to their pictures!');
  };

  const handleFlip = (card: Card) => {
    if (isLocked || flipped.includes(card.id) || matched.includes(card.pairId)) return;
    soundManager.playPop();
    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setIsLocked(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId)!;
      const secondCard = cards.find(c => c.id === secondId)!;
      if (firstCard.pairId === secondCard.pairId) {
        soundManager.playSuccess();
        if (mode === 'letters') speak(`Yes! ${firstCard.data.upper} and ${firstCard.data.lower}!`);
        else speak(`${firstCard.data.upper} is for ${firstCard.data.word}!`);
        const newMatched = [...matched, firstCard.pairId];
        setMatched(newMatched);
        setFlipped([]);
        setIsLocked(false);
        const totalPairs = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
        if (newMatched.length === totalPairs) {
          safeTimeout(() => { confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } }); setIsFinished(true); onComplete(10); }, 500);
        }
      } else {
        soundManager.playGameOver();
        safeTimeout(() => { setFlipped([]); setIsLocked(false); }, 1200);
      }
    }
  };

  const resetToLobby = () => { cleanup(); setHasStarted(false); };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const numPairs = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;

  if (!hasStarted) {
    return (
      <div className="space-y-4 sm:space-y-8 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" onClick={cleanup} className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <h2 className="text-xl sm:text-3xl font-black text-indigo-500">Memory Match</h2>
          <div className="w-10 sm:w-12" />
        </div>

        <div className="bg-white p-5 sm:p-12 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-indigo-200 space-y-6 sm:space-y-10">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">1. Choose Your Game</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setMode('letters')}
                className={`p-4 sm:p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 sm:gap-3 ${mode === 'letters' ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-300'}`}>
                <Type className="w-7 h-7 sm:w-10 sm:h-10" />
                <span className="font-black text-base sm:text-xl">Letters (A-a)</span>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setMode('phonics')}
                className={`p-4 sm:p-6 rounded-3xl border-4 transition-all flex flex-col items-center gap-2 sm:gap-3 ${mode === 'phonics' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-purple-300'}`}>
                <ImageIcon className="w-7 h-7 sm:w-10 sm:h-10" />
                <span className="font-black text-base sm:text-xl">Pictures (A-🍎)</span>
              </motion.button>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">2. Choose Difficulty</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <motion.button key={d} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDifficulty(d)}
                  className={`py-3 sm:py-4 rounded-2xl border-4 font-black capitalize transition-all text-sm sm:text-base ${difficulty === d ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-green-300'}`}>
                  {d}
                </motion.button>
              ))}
            </div>
          </div>

          <button onClick={startGame} className="w-full bg-indigo-500 text-white py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-xl hover:bg-indigo-600 transition-colors">
            Play Game!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      <div className="flex items-center justify-between">
        <button onClick={resetToLobby} className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h2 className="text-lg sm:text-3xl font-black text-indigo-500">
          {mode === 'letters' ? 'Letter Match' : 'Picture Match'}
        </h2>
        <div className="flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-2xl shadow-sm">
          <Timer className="w-4 h-4 text-indigo-400" />
          <span className="text-indigo-600 font-black text-xs sm:text-sm">{formatTime(seconds)}</span>
        </div>
      </div>

      <div className="flex justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm font-black text-indigo-600">
          {matched.length}/{numPairs} matched
        </div>
        <div className="bg-white px-3 sm:px-4 py-1 sm:py-2 rounded-2xl shadow-sm font-black text-gray-500">
          {moves} moves
        </div>
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-indigo-300 space-y-4 sm:space-y-6">
          <div className="text-7xl sm:text-8xl">🎉</div>
          <h3 className="text-3xl sm:text-4xl font-black text-[#2F3061]">All Matched!</h3>
          <p className="text-lg sm:text-xl text-gray-500">{moves} moves · {formatTime(seconds)}</p>
          <div className="flex items-center justify-center gap-2 text-yellow-500 font-black text-xl sm:text-2xl">
            <Star className="fill-current w-6 h-6 sm:w-7 sm:h-7" />+10 Stars!
          </div>
          <div className="flex gap-3 sm:gap-4 justify-center mt-4 sm:mt-6">
            <button onClick={resetToLobby} className="bg-gray-100 text-gray-600 px-5 sm:px-8 py-3 sm:py-5 rounded-3xl font-black text-base sm:text-xl hover:bg-gray-200 transition-colors">
              Main Menu
            </button>
            <button onClick={startGame} className="bg-indigo-500 text-white px-5 sm:px-8 py-3 sm:py-5 rounded-3xl font-black text-base sm:text-xl shadow-xl hover:scale-105 transition-transform">
              Play Again!
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white p-3 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-indigo-200">
          {/* Responsive grid: fewer columns on small screens */}
          <div className={`grid gap-2 sm:gap-3 mx-auto ${difficulty === 'easy' ? 'grid-cols-3 max-w-xs sm:max-w-lg' :
            difficulty === 'medium' ? 'grid-cols-4 max-w-sm sm:max-w-xl' :
              'grid-cols-4 max-w-sm sm:max-w-2xl'
            }`}>
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id);
              const isMatched = matched.includes(card.pairId);
              const isVisible = isFlipped || isMatched;
              return (
                <motion.button
                  key={card.id}
                  animate={isMatched ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  whileHover={!isVisible ? { scale: 1.05 } : {}}
                  whileTap={!isVisible ? { scale: 0.95 } : {}}
                  onClick={() => handleFlip(card)}
                  className={`aspect-square rounded-xl sm:rounded-2xl font-black text-3xl sm:text-5xl md:text-6xl flex items-center justify-center border-4 transition-all ${isMatched ? 'bg-green-100 border-green-400 text-green-700 shadow-inner' :
                    isFlipped ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-md' :
                      'bg-gradient-to-br from-indigo-400 to-purple-500 border-indigo-600 shadow-md hover:from-indigo-300 hover:to-purple-400 cursor-pointer'
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {isVisible ? (
                      <motion.span key="letter" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }}>
                        {card.display}
                      </motion.span>
                    ) : (
                      <motion.span key="hidden" className="text-indigo-200 opacity-50 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 sm:w-10 sm:h-10" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
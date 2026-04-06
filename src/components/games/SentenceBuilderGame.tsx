import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

// MASSIVELY EXPANDED VOCABULARY WITH GRAMMAR TAGGING
// Format: "Word|partOfSpeech"
const SENTENCES = [
  { theme: 'Dinosaurs', scene: '🦖🌴', words: ['The|other', 'dinosaur|noun', 'stomps|verb', 'loudly|other'], hint: 'A giant lizard taking big steps!' },
  { theme: 'Vehicles', scene: '🚂💨', words: ['The|other', 'train|noun', 'moves|verb', 'very|other', 'fast|adj'], hint: 'Speeding down the tracks!' },
  { theme: 'Farm', scene: '🐄🌾', words: ['The|other', 'cow|noun', 'eats|verb', 'green|adj', 'grass|noun'], hint: 'A farm animal having lunch!' },
  { theme: 'Ocean', scene: '🦈🌊', words: ['A|other', 'shark|noun', 'swims|verb', 'deep|other', 'down|other'], hint: 'A big fish in the sea!' },
  { theme: 'Jungle', scene: '🐒🌳', words: ['Monkeys|noun', 'swing|verb', 'from|other', 'the|other', 'trees|noun'], hint: 'Playing in the jungle!' },
  { theme: 'Superheroes', scene: '🦸‍♂️🏙️', words: ['The|other', 'hero|noun', 'saves|verb', 'the|other', 'day|noun'], hint: 'A brave protector!' },
  { theme: 'Pirates', scene: '🏴‍☠️💰', words: ['Pirates|noun', 'look|verb', 'for|other', 'hidden|adj', 'gold|noun'], hint: 'Searching for treasure!' },
  { theme: 'Robots', scene: '🤖⚙️', words: ['The|other', 'robot|noun', 'has|verb', 'metal|adj', 'arms|noun'], hint: 'A mechanical friend!' },
  { theme: 'Monsters', scene: '👾👋', words: ['A|other', 'friendly|adj', 'monster|noun', 'says|verb', 'hello|other'], hint: 'Not scary at all!' },
  { theme: 'School', scene: '📚🏫', words: ['We|other', 'learn|verb', 'to|other', 'read|verb', 'books|noun'], hint: 'Time for class!' },
  { theme: 'Cooking', scene: '👨‍🍳🎂', words: ['The|other', 'chef|noun', 'bakes|verb', 'a|other', 'cake|noun'], hint: 'Making a sweet treat!' },
  { theme: 'Sports', scene: '⚽🥅', words: ['She|other', 'kicks|verb', 'the|other', 'soccer|adj', 'ball|noun'], hint: 'Playing a fun game!' },
  { theme: 'Music', scene: '🥁🎵', words: ['He|other', 'plays|verb', 'the|other', 'loud|adj', 'drums|noun'], hint: 'Making a lot of noise!' },
  { theme: 'Winter', scene: '❄️⛄', words: ['Snow|noun', 'falls|verb', 'on|other', 'the|other', 'ground|noun'], hint: 'A chilly day!' },
  { theme: 'Beach', scene: '🏖️🏰', words: ['We|other', 'build|verb', 'sand|adj', 'castles|noun', 'here|other'], hint: 'Playing by the ocean!' },
  { theme: 'Pets', scene: '🐕🎾', words: ['My|other', 'puppy|noun', 'likes|verb', 'to|other', 'play|verb'], hint: 'A playful furry friend!' },
  { theme: 'Insects', scene: '🐝🍯', words: ['The|other', 'bee|noun', 'makes|verb', 'sweet|adj', 'honey|noun'], hint: 'A busy little bug!' },
  { theme: 'Bedtime', scene: '🪥🦷', words: ['I|other', 'brush|verb', 'my|other', 'white|adj', 'teeth|noun'], hint: 'Getting ready for sleep!' },
  { theme: 'Colors', scene: '🍎🔴', words: ['The|other', 'apple|noun', 'is|verb', 'very|other', 'red|adj'], hint: 'A bright, healthy snack!' },
  { theme: 'Numbers', scene: '👐✌️', words: ['I|other', 'have|verb', 'two|adj', 'small|adj', 'hands|noun'], hint: 'Counting our fingers!' },
  { theme: 'Clothes', scene: '🧥🧣', words: ['Put|verb', 'on|other', 'your|other', 'warm|adj', 'coat|noun'], hint: 'Dressing for the cold!' },
  { theme: 'Emotions', scene: '😊💖', words: ['A|other', 'big|adj', 'smile|noun', 'means|verb', 'happy|adj'], hint: 'Feeling wonderful!' },
  { theme: 'Toys', scene: '🪁☁️', words: ['The|other', 'kite|noun', 'flies|verb', 'up|other', 'high|adj'], hint: 'Floating in the wind!' },
  { theme: 'City', scene: '🏢🏙️', words: ['Tall|adj', 'buildings|noun', 'touch|verb', 'the|other', 'sky|noun'], hint: 'A busy downtown area!' },
  { theme: 'Weather', scene: '🍃💨', words: ['The|other', 'wind|noun', 'blows|verb', 'the|other', 'leaves|noun'], hint: 'A breezy afternoon!' },
  { theme: 'Space', scene: '✨🌙', words: ['Stars|noun', 'shine|verb', 'in|other', 'the|other', 'dark|noun'], hint: 'Looking at the night sky!' },
  { theme: 'Magic', scene: '🧙‍♂️🪄', words: ['The|other', 'wizard|noun', 'has|verb', 'a|other', 'wand|noun'], hint: 'Casting a fun spell!' },
  { theme: 'Fruit', scene: '🍌🐵', words: ['Monkeys|noun', 'like|verb', 'to|other', 'eat|verb', 'bananas|noun'], hint: 'A yellow, peeling snack!' },
  { theme: 'Birds', scene: '🦉🌃', words: ['The|other', 'owl|noun', 'hoots|verb', 'at|other', 'night|noun'], hint: 'A bird that stays up late!' },
  { theme: 'Bugs', scene: '🕷️🕸️', words: ['A|other', 'spider|noun', 'spins|verb', 'a|other', 'web|noun'], hint: 'Catching flies in a net!' }
];

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Helpers to get raw words without grammar tags
const extractWord = (wordKey: string) => wordKey.split('_')[0].split('|')[0];
const extractType = (wordKey: string) => wordKey.split('_')[0].split('|')[1];

export default function SentenceBuilderGame({ kid, onComplete }: Props) {
  const [gameSequence, setGameSequence] = useState(() => shuffleArray(SENTENCES));
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const current = gameSequence[sentenceIndex];

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
    utt.rate = 0.8; utt.pitch = 1.2;
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => {
    const shuffled = [...current.words].sort(() => Math.random() - 0.5);
    setAvailable(shuffled.map((w, i) => `${w}_${i}`));
    setPlaced([]);
    setFeedback(null);
    safeTimeout(() => speak(`Build a sentence about ${current.theme.toLowerCase()}!`), 400);
  }, [sentenceIndex, current]);

  const addWord = (wordKey: string) => {
    if (feedback) return;
    soundManager.playPop();
    setPlaced(prev => [...prev, wordKey]);
    setAvailable(prev => prev.filter(w => w !== wordKey));
  };

  const removeWord = (wordKey: string) => {
    if (feedback) return;
    soundManager.playPop();
    setAvailable(prev => [...prev, wordKey]);
    setPlaced(prev => prev.filter(w => w !== wordKey));
  };

  const checkSentence = () => {
    const placedWords = placed.map(extractWord);
    const targetWords = current.words.map(w => w.split('|')[0]);
    const isCorrect = placedWords.join(' ') === targetWords.join(' ');

    if (isCorrect) {
      setFeedback('correct');
      soundManager.playSuccess();
      speak(targetWords.join(' ') + '! Great job!');
      const newScore = score + 1;
      setScore(newScore);

      if (newScore >= 5) {
        safeTimeout(() => {
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
          setIsFinished(true);
          onComplete(10);
        }, 1500);
      } else {
        safeTimeout(nextRound, 2000);
      }
    } else {
      setFeedback('wrong');
      soundManager.playGameOver();
      speak(`Not quite! Try a different order!`);
      safeTimeout(() => {
        setFeedback(null);
        const shuffled = [...current.words].sort(() => Math.random() - 0.5);
        setAvailable(shuffled.map((w, i) => `${w}_${i}`));
        setPlaced([]);
      }, 2000);
    }
  };

  const nextRound = () => {
    setSentenceIndex(i => (i + 1) % gameSequence.length);
  };

  const reset = () => {
    cleanup();
    setGameSequence(shuffleArray(SENTENCES));
    setSentenceIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  // Helper to color-code grammar tiles
  const getGrammarColors = (type: string, isPlaced: boolean) => {
    if (feedback === 'correct') return 'bg-green-500 text-white border-green-600 shadow-md';
    if (feedback === 'wrong') return 'bg-red-500 text-white border-red-600 shadow-md';

    if (isPlaced) {
      switch (type) {
        case 'noun': return 'bg-blue-500 text-white border-blue-600 shadow-md hover:bg-blue-600';
        case 'verb': return 'bg-red-500 text-white border-red-600 shadow-md hover:bg-red-600';
        case 'adj': return 'bg-green-500 text-white border-green-600 shadow-md hover:bg-green-600';
        default: return 'bg-orange-400 text-white border-orange-500 shadow-md hover:bg-orange-500';
      }
    } else {
      switch (type) {
        case 'noun': return 'bg-blue-100 text-blue-700 border-3 border-blue-300 shadow-sm hover:bg-blue-200';
        case 'verb': return 'bg-red-100 text-red-700 border-3 border-red-300 shadow-sm hover:bg-red-200';
        case 'adj': return 'bg-green-100 text-green-700 border-3 border-green-300 shadow-sm hover:bg-green-200';
        default: return 'bg-orange-50 text-orange-700 border-3 border-orange-200 shadow-sm hover:bg-orange-100';
      }
    }
  };

  return (
    <div className="space-y-8 text-center">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={cleanup} className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-black text-teal-500">Sentence Builder</h2>
        <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
          <span className="text-teal-600 font-black">{score}/5</span>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < score ? 'bg-teal-500 scale-125' : 'bg-gray-200'}`} />
        ))}
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border-8 border-teal-300 space-y-6">
          <div className="text-8xl">📚</div>
          <h3 className="text-4xl font-black text-[#2F3061]">Brilliant Writer!</h3>
          <p className="text-xl text-gray-500 font-medium">You built 5 perfect sentences!</p>
          <button onClick={reset} className="bg-teal-500 text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform">
            Play Again!
          </button>
        </motion.div>
      ) : (
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border-8 border-teal-200 space-y-6">
          <div className="bg-teal-50 border-4 border-teal-100 rounded-3xl p-6 relative">
            <div className="absolute top-4 right-4 bg-teal-200 text-teal-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {current.theme}
            </div>
            <div className="text-6xl mb-2 mt-4">{current.scene}</div>
            <p className="text-teal-600 font-bold">{current.hint}</p>
          </div>

          <div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm mb-3">Build the sentence:</p>
            <div className={`min-h-[72px] flex flex-wrap gap-3 justify-center items-center p-4 rounded-3xl border-4 border-dashed transition-all ${feedback === 'correct' ? 'border-green-400 bg-green-50' :
                feedback === 'wrong' ? 'border-red-300 bg-red-50' :
                  'border-teal-200 bg-gray-50'
              }`}>
              <AnimatePresence>
                {placed.map((wordKey) => (
                  <motion.button
                    key={wordKey}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    whileTap={{ scale: 0.9 }} onClick={() => removeWord(wordKey)}
                    className={`px-5 py-3 rounded-2xl font-black text-xl transition-colors ${getGrammarColors(extractType(wordKey), true)}`}
                  >
                    {extractWord(wordKey)}
                  </motion.button>
                ))}
                {placed.length === 0 && (
                  <p className="text-gray-300 font-bold text-lg">Tap words below to add them here</p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            {/* GRAMMAR LEGEND */}
            <div className="flex justify-center gap-4 mb-4">
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">🟦 Noun (Thing)</span>
              <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg">🟥 Verb (Action)</span>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">🟩 Adjective (Describing)</span>
            </div>

            <div className="flex flex-wrap gap-3 justify-center min-h-[64px]">
              <AnimatePresence>
                {available.map((wordKey) => (
                  <motion.button
                    key={wordKey}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}
                    onClick={() => addWord(wordKey)}
                    className={`px-5 py-3 rounded-2xl font-black text-xl transition-colors ${getGrammarColors(extractType(wordKey), false)}`}
                  >
                    {extractWord(wordKey)}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {placed.length === current.words.length && !feedback && (
            <motion.button
              initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={checkSentence}
              className="w-full bg-teal-500 text-white py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Check My Sentence! ✓
            </motion.button>
          )}
        </div>
      )}

      <button onClick={reset} className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200">
        <RotateCcw className="w-5 h-5" />
        Restart
      </button>
    </div>
  );
}
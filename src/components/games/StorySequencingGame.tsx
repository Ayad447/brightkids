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

const STORIES = [
  { title: 'The Hungry Frog', panels: [{ order: 1, emoji: '🐸', text: 'A green frog sits patiently on a lily pad.' }, { order: 2, emoji: '🦟', text: 'He spots a delicious, buzzing mosquito.' }, { order: 3, emoji: '👅', text: 'He quickly snaps his long, sticky tongue!' }, { order: 4, emoji: '😋', text: 'The frog rubs his belly, feeling full.' }] },
  { title: 'The Little Seed', panels: [{ order: 1, emoji: '🌱', text: 'A tiny seed is planted deep in the soil.' }, { order: 2, emoji: '🌧️', text: 'Gentle raindrops water the thirsty seed.' }, { order: 3, emoji: '☀️', text: 'The bright sun warms the damp earth.' }, { order: 4, emoji: '🌸', text: 'A gorgeous pink flower blooms wonderfully!' }] },
  { title: 'Bedtime for Bear', panels: [{ order: 1, emoji: '🐻', text: 'A brown bear plays outside all afternoon.' }, { order: 2, emoji: '🍯', text: 'He eats sticky, sweet honey for dinner.' }, { order: 3, emoji: '🛁', text: 'He takes a warm, relaxing bubble bath.' }, { order: 4, emoji: '😴', text: 'The bear falls fast asleep in his cozy bed.' }] },
  { title: 'Caterpillar Magic', panels: [{ order: 1, emoji: '🐛', text: 'A fuzzy caterpillar eats green leaves.' }, { order: 2, emoji: '🌿', text: 'He spins a safe, silky chrysalis.' }, { order: 3, emoji: '⏳', text: 'He rests inside for many long days.' }, { order: 4, emoji: '🦋', text: 'He emerges as a beautiful butterfly!' }] },
  { title: 'Morning Routine', panels: [{ order: 1, emoji: '🌅', text: 'The bright sun rises in the morning sky.' }, { order: 2, emoji: '🥱', text: 'I stretch my arms and yawn sleepily.' }, { order: 3, emoji: '🪥', text: 'I thoroughly brush my teeth until they shine.' }, { order: 4, emoji: '👕', text: 'I put on clean clothes for the day.' }] },
  { title: 'Baking Cookies', panels: [{ order: 1, emoji: '🥣', text: 'We mix sugar, flour, and butter in a bowl.' }, { order: 2, emoji: '🥄', text: 'We stir in dark chocolate chips.' }, { order: 3, emoji: '♨️', text: 'We bake them inside the hot oven.' }, { order: 4, emoji: '🍪', text: 'We eat warm, chewy cookies with milk!' }] },
  { title: 'The Brave Firefighter', panels: [{ order: 1, emoji: '🚨', text: 'The loud fire alarm rings at the station.' }, { order: 2, emoji: '🚒', text: 'The firefighters drive the fast red truck.' }, { order: 3, emoji: '💦', text: 'They spray cold water from a heavy hose.' }, { order: 4, emoji: '🔥', text: 'They successfully put out the dangerous fire!' }] },
  { title: 'Pirate Treasure', panels: [{ order: 1, emoji: '🏴‍☠️', text: 'A pirate ship sails across the ocean.' }, { order: 2, emoji: '🗺️', text: 'The captain reads a torn treasure map.' }, { order: 3, emoji: '🏝️', text: 'They dock the ship at a deserted island.' }, { order: 4, emoji: '💎', text: 'They dig up a chest full of shiny gold.' }] },
  { title: 'Winter Snowman', panels: [{ order: 1, emoji: '❄️', text: 'Soft snow falls quietly from the sky.' }, { order: 2, emoji: '⛄', text: 'We roll three giant balls of cold snow.' }, { order: 3, emoji: '🥕', text: 'We give him a carrot nose and a hat.' }, { order: 4, emoji: '🧣', text: 'We wrap a warm scarf around his neck.' }] },
  { title: 'Birthday Party', panels: [{ order: 1, emoji: '🎈', text: 'We blow up colorful balloons for the party.' }, { order: 2, emoji: '🎁', text: 'Friends arrive carrying wrapped presents.' }, { order: 3, emoji: '🎂', text: 'We light candles on the frosted cake.' }, { order: 4, emoji: '🥳', text: 'We sing happy birthday and eat dessert!' }] },
  { title: 'The Race', panels: [{ order: 1, emoji: '🏁', text: 'The runners line up at the starting line.' }, { order: 2, emoji: '🏃', text: 'They sprint incredibly fast around the track.' }, { order: 3, emoji: '🥵', text: 'They breathe heavily, feeling very tired.' }, { order: 4, emoji: '🥇', text: 'The winner proudly receives a gold medal.' }] },
  { title: 'Spring Rain', panels: [{ order: 1, emoji: '☁️', text: 'Dark grey clouds roll into the sky.' }, { order: 2, emoji: '🌧️', text: 'Heavy rain pours down on the town.' }, { order: 3, emoji: '🌂', text: 'We open our colorful umbrellas.' }, { order: 4, emoji: '🌈', text: 'A bright rainbow appears after the storm.' }] },
];

function shuffleArray<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }
type Panel = typeof STORIES[0]['panels'][0];

export default function StorySequencingGame({ kid, onComplete }: Props) {
  const [gameSequence, setGameSequence] = useState(() => shuffleArray(STORIES));
  const [storyIndex, setStoryIndex] = useState(0);
  const [placed, setPlaced] = useState<Panel[]>([]);
  const [available, setAvailable] = useState<Panel[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [readingIndex, setReadingIndex] = useState<number | null>(null);

  const isMounted = useRef(true);
  const current = gameSequence[storyIndex];

  const cleanup = () => { isMounted.current = false; if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  useEffect(() => { return cleanup; }, []);

  useEffect(() => {
    setFailedAttempts(0); setFeedback(null); setIsChecking(false); setReadingIndex(null);
    const sh = [...current.panels].sort(() => Math.random() - 0.5);
    setAvailable(sh); setPlaced([]);
    speakSentence(`Tell the story of ${current.title}!`, -1);
  }, [storyIndex, current]);

  const speakSentence = (text: string, panelOrderIndicator: number, rate = 0.8) => {
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis || !isMounted.current) { resolve(); return; }
      window.speechSynthesis.cancel();
      setReadingIndex(panelOrderIndicator);
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = rate; utt.pitch = 1.2;
      const fallbackTimer = setTimeout(() => resolve(), text.length * 80 + 1000);
      utt.onend = () => { clearTimeout(fallbackTimer); resolve(); };
      utt.onerror = () => { clearTimeout(fallbackTimer); resolve(); };
      window.speechSynthesis.speak(utt);
    });
  };

  const addPanel = (panel: Panel) => {
    if (isChecking) return;
    soundManager.playPop();
    setPlaced(prev => [...prev, panel]);
    setAvailable(prev => prev.filter(p => p.order !== panel.order));
  };

  const removePanel = (panel: Panel) => {
    if (isChecking) return;
    if (failedAttempts > 0 && panel.order === 1) return;
    soundManager.playPop();
    setAvailable(prev => [...prev, panel]);
    setPlaced(prev => prev.filter(p => p.order !== panel.order));
  };

  const checkOrder = async () => {
    if (isChecking || placed.length !== current.panels.length) return;
    setIsChecking(true);
    const isCorrect = placed.every((p, i) => p.order === i + 1);
    if (isCorrect) {
      setFeedback('correct');
      soundManager.playSuccess();
      await speakSentence("Perfect! Let's read your story.", -1);
      for (let i = 0; i < placed.length; i++) {
        if (!isMounted.current) return;
        await speakSentence(placed[i].text, placed[i].order);
      }
      if (!isMounted.current) return;
      setReadingIndex(null);
      const newScore = score + 1;
      setScore(newScore);
      if (newScore >= 3) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        setIsFinished(true);
        onComplete(10);
      } else {
        setTimeout(() => {
          if (!isMounted.current) return;
          setStoryIndex(i => (i + 1) % gameSequence.length);
          setIsChecking(false);
        }, 1000);
      }
    } else {
      setFeedback('wrong');
      soundManager.playGameOver();
      const newFailed = failedAttempts + 1;
      setFailedAttempts(newFailed);
      await speakSentence("Not quite! Try a different order.", -1);
      if (!isMounted.current) return;
      // Give a hint after 2 failures — lock panel 1 in place
      if (newFailed >= 2) {
        const firstPanel = current.panels.find(p => p.order === 1)!;
        const reShuffled = [...current.panels.filter(p => p.order !== 1)].sort(() => Math.random() - 0.5);
        setAvailable(reShuffled);
        setPlaced([firstPanel]);
        await speakSentence(`Here's a hint! Start with: ${firstPanel.text}`, -1);
      } else {
        const sh = [...current.panels].sort(() => Math.random() - 0.5);
        setAvailable(sh); setPlaced([]);
      }
      setFeedback(null); setIsChecking(false); setReadingIndex(null);
    }
  };

  const reset = () => {
    cleanup(); isMounted.current = true;
    setGameSequence(shuffleArray(STORIES));
    setStoryIndex(0); setScore(0); setIsFinished(false);
    setIsChecking(false); setFailedAttempts(0); setReadingIndex(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" onClick={cleanup} className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-violet-500">Story Order</h2>
        <div className="flex items-center gap-1 bg-white px-2 sm:px-3 py-1 sm:py-2 rounded-2xl shadow-sm">
          <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-violet-600 font-black text-sm sm:text-base">{score}/3</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all ${i < score ? 'bg-violet-500 scale-125' : 'bg-gray-200'}`} />
        ))}
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-violet-300 space-y-4 sm:space-y-6">
          <div className="text-7xl sm:text-8xl">📖</div>
          <h3 className="text-3xl sm:text-4xl font-black text-[#2F3061]">Amazing Storyteller!</h3>
          <p className="text-lg sm:text-xl text-gray-500 font-medium">You ordered 3 stories perfectly!</p>
          <button onClick={reset} className="bg-violet-500 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-xl hover:scale-105 transition-transform">
            Play Again!
          </button>
        </motion.div>
      ) : (
        <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-violet-200 space-y-4 sm:space-y-6">
          {/* Story title */}
          <div className="bg-violet-50 border-4 border-violet-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-black text-violet-400 uppercase tracking-widest">Order this story</p>
            <h3 className="text-xl sm:text-2xl font-black text-[#2F3061] mt-1">{current.title}</h3>
          </div>

          {/* Placed panels — the story so far */}
          <div>
            <p className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">Your story order:</p>
            <div className={`min-h-[64px] sm:min-h-[80px] grid grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl border-4 border-dashed transition-all ${feedback === 'correct' ? 'border-green-400 bg-green-50' :
              feedback === 'wrong' ? 'border-red-300 bg-red-50' :
                'border-violet-200 bg-gray-50'
              }`}>
              {Array.from({ length: current.panels.length }).map((_, slotIdx) => {
                const panel = placed[slotIdx];
                const isReading = panel && readingIndex === panel.order;
                return (
                  <div key={slotIdx} className="aspect-square">
                    {panel ? (
                      <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removePanel(panel)}
                        className={`w-full h-full rounded-xl sm:rounded-2xl border-4 flex flex-col items-center justify-center gap-1 transition-all ${isReading ? 'bg-yellow-100 border-yellow-400 scale-105' :
                          feedback === 'correct' ? 'bg-green-100 border-green-400' :
                            'bg-violet-100 border-violet-400 hover:bg-violet-200'
                          }`}
                      >
                        <span className="text-2xl sm:text-4xl">{panel.emoji}</span>
                        <span className="text-xs font-black text-violet-600">{slotIdx + 1}</span>
                      </motion.button>
                    ) : (
                      <div className="w-full h-full rounded-xl sm:rounded-2xl border-4 border-dashed border-gray-300 flex items-center justify-center text-gray-300 font-black text-lg sm:text-2xl">
                        {slotIdx + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {placed.length > 0 && (
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">Tap a panel to remove it</p>
            )}
          </div>

          {/* Available panels to pick from */}
          <div>
            <p className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">Tap to add to your story:</p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <AnimatePresence>
                {available.map((panel) => (
                  <motion.button
                    key={panel.order}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    whileHover={{ scale: 1.08, y: -4 }} whileTap={{ scale: 0.92 }}
                    onClick={() => addPanel(panel)}
                    className="aspect-square rounded-xl sm:rounded-2xl border-4 border-violet-200 bg-violet-50 flex flex-col items-center justify-center gap-1 hover:bg-violet-100 hover:border-violet-400 transition-all"
                  >
                    <span className="text-2xl sm:text-4xl">{panel.emoji}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Panel text preview — shows text for placed panels */}
          {placed.length > 0 && (
            <div className="space-y-1 sm:space-y-2 text-left bg-gray-50 rounded-2xl p-3 sm:p-4">
              {placed.map((p, i) => (
                <p key={p.order} className={`text-xs sm:text-sm font-bold transition-all ${readingIndex === p.order ? 'text-yellow-600 scale-105' : 'text-gray-500'}`}>
                  <span className="font-black text-violet-500 mr-1">{i + 1}.</span>{p.text}
                </p>
              ))}
            </div>
          )}

          {placed.length === current.panels.length && !isChecking && feedback !== 'correct' && (
            <motion.button
              initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={checkOrder}
              className="w-full bg-violet-500 text-white py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Check My Story! ✓
            </motion.button>
          )}

          {feedback === 'correct' && (
            <div className="flex items-center justify-center gap-2 text-green-500">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
              <p className="text-xl sm:text-2xl font-black">
                {readingIndex !== null ? 'Reading your story...' : 'Perfect Order! 🎉'}
              </p>
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
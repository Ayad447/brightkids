import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, RotateCcw, Star, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from "@google/genai";
import { KidProfile, Story } from '../../types';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

const THEMES = [
  { id: 'space', icon: '🚀', title: 'Space Adventure' },
  { id: 'jungle', icon: '🦁', title: 'Jungle Safari' },
  { id: 'ocean', icon: '🐟', title: 'Deep Sea' },
  { id: 'magic', icon: '🪄', title: 'Magic Kingdom' },
  { id: 'dino', icon: '🦖', title: 'Dino World' },
  { id: 'pirate', icon: '🏴‍☠️', title: 'Pirate Quest' },
  { id: 'farm', icon: '🚜', title: 'Happy Farm' },
  { id: 'superhero', icon: '🦸', title: 'Superhero City' },
  { id: 'robot', icon: '🤖', title: 'Robot Factory' },
  { id: 'bug', icon: '🐛', title: 'Bug Micro-world' },
  { id: 'snow', icon: '⛄', title: 'Winter Wonderland' },
  { id: 'castle', icon: '🏰', title: "Knight's Castle" },
  { id: 'candy', icon: '🍬', title: 'Candy Land' },
  { id: 'pet', icon: '🐕', title: 'Pet Rescue' },
  { id: 'train', icon: '🚂', title: 'Train Journey' },
  { id: 'fairy', icon: '🧚', title: 'Fairy Garden' },
  { id: 'dragon', icon: '🐉', title: "Dragon's Cave" },
  { id: 'mermaid', icon: '🧜‍♀️', title: 'Mermaid Lagoon' },
  { id: 'alien', icon: '👽', title: 'Friendly Aliens' },
  { id: 'camping', icon: '⛺', title: 'Forest Camp' },
  { id: 'treasure', icon: '💎', title: 'Treasure Hunt' },
  { id: 'weather', icon: '🌈', title: 'Rainbow Sky' },
  { id: 'ghost', icon: '👻', title: 'Friendly Ghost' },
  { id: 'time', icon: '⏳', title: 'Time Travel' },
];

export default function StoryBuddy({ kid, onComplete }: Props) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRead, setIsRead] = useState(false);

  const generateStory = async (theme: string) => {
    setIsLoading(true);
    setSelectedTheme(theme);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a very short, 3-sentence bedtime story for a ${kid.age} year old about ${theme}. The story should be simple, engaging, and positive. Return the result in JSON format with fields: "title", "content", "emoji".`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setStory(data);
    } catch (error) {
      setStory({
        title: "A Magic Adventure",
        content: `Once upon a time, a little ${kid.avatar} went on a journey to the ${theme}. They found a magic star and made a wish. Everyone lived happily ever after!`,
        emoji: "✨"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setIsRead(true);
    onComplete(10);
  };

  const reset = () => { setSelectedTheme(null); setStory(null); setIsRead(false); };

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-purple-500">AI Story Buddy</h2>
        <div className="w-10 sm:w-12" />
      </div>

      {!selectedTheme ? (
        <div className="space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-2xl font-black text-[#2F3061]">Pick a theme for your story!</h3>
          {/* 3-col grid on mobile, 4-col on larger */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4">
            {THEMES.map((theme) => (
              <motion.button
                key={theme.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => generateStory(theme.id)}
                className="bg-white p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border-4 border-purple-100 hover:border-purple-400 transition-colors space-y-2 sm:space-y-4"
              >
                <div className="text-3xl sm:text-5xl">{theme.icon}</div>
                <p className="font-black text-[#2F3061] text-xs sm:text-sm leading-tight">{theme.title}</p>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-12 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-purple-400 space-y-5 sm:space-y-8 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="py-12 sm:py-20 flex flex-col items-center gap-4 sm:gap-6">
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500 animate-spin" />
              <p className="text-xl sm:text-2xl font-black text-purple-500 animate-pulse">Magic is happening...</p>
            </div>
          ) : story ? (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 sm:space-y-8">
                <div className="text-7xl sm:text-8xl">{story.emoji}</div>
                <h3 className="text-2xl sm:text-4xl font-black text-[#2F3061]">{story.title}</h3>
                <div className="text-lg sm:text-2xl leading-relaxed font-medium text-gray-700 bg-purple-50 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-purple-100 text-left">
                  {story.content}
                </div>
                {!isRead ? (
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-2 sm:gap-3 mx-auto bg-purple-500 text-white px-7 sm:px-10 py-4 sm:py-5 rounded-3xl font-black text-xl sm:text-2xl shadow-xl hover:scale-105 transition-transform"
                  >
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                    I Finished Reading!
                  </button>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-center gap-2 text-yellow-500 text-2xl sm:text-3xl font-black">
                      <Star className="fill-current w-6 h-6 sm:w-8 sm:h-8" />
                      <span>+10 Stars!</span>
                    </div>
                    <button onClick={reset} className="flex items-center gap-2 mx-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 text-sm sm:text-base">
                      <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                      New Story
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>
      )}

      <p className="text-gray-400 font-medium text-xs sm:text-sm">
        Choose a theme and let the AI create a magical story just for you!
      </p>
    </div>
  );
}
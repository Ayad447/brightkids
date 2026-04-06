import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, LogOut, ArrowRight, Trophy, CheckCircle2, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { KidProfile } from '../types';
import { ACTIVITIES } from '../constants';
import { soundManager } from '../lib/sound-utils';

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface Props {
  kid: KidProfile;
  onLogout: () => void;
}

const MILESTONES = [
  { stars: 25, reward: '🎖️', label: 'Bronze Badge' },
  { stars: 50, reward: '🥈', label: 'Silver Badge' },
  { stars: 100, reward: '🏆', label: 'Gold Trophy' },
  { stars: 200, reward: '👑', label: 'Crown' },
];

function speak(text: string) {
  // Speech has been intentionally disabled
}

export default function Dashboard({ kid, onLogout }: Props) {
  const logActivity = async (activityId: string, stars: number) => {
    const path = 'activities';
    try {
      await addDoc(collection(db, path), {
        kidId: kid.id,
        activityType: activityId,
        timestamp: new Date().toISOString(),
        starsEarned: stars
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // Age-filtered activities: show games where kid.age >= minAge
  const visibleActivities = (ACTIVITIES as any[]).filter(a => kid.age >= (a.minAge ?? 4));

  // Next milestone
  const nextMilestone = MILESTONES.find(m => kid.stars < m.stars);
  const currentMilestone = [...MILESTONES].reverse().find(m => kid.stars >= m.stars);

  useEffect(() => {
    setTimeout(() => speak(`Hi ${kid.name}! Ready to play and learn?`), 500);
  }, []);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-[#FFE66D] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-6xl bg-gray-50 w-24 h-24 rounded-2xl flex items-center justify-center border-4 border-[#4ECDC4]">
            {kid.avatar}
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#2F3061]">Hi, {kid.name}!</h2>
            <div className="flex items-center gap-2 text-[#FF6B6B] font-bold">
              <Star className="fill-current w-5 h-5" />
              <span>{kid.stars} Stars collected</span>
            </div>
            {currentMilestone && (
              <div className="flex items-center gap-2 mt-1 text-sm font-bold text-gray-500">
                <span>{currentMilestone.reward}</span>
                <span>{currentMilestone.label} earned!</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => speak(`Hi ${kid.name}! You have ${kid.stars} stars!`)}
            className="p-3 bg-purple-100 hover:bg-purple-200 rounded-2xl transition-colors"
            title="Read my stats aloud"
          >
            <Volume2 className="w-5 h-5 text-purple-500" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl text-gray-600 font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Switch Profile</span>
          </button>
        </div>
      </div>

      {/* Next milestone progress */}
      {nextMilestone && (
        <div className="bg-white p-5 rounded-2xl shadow-md border-2 border-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-gray-600">Next reward: {nextMilestone.reward} {nextMilestone.label}</span>
            <span className="font-bold text-yellow-600">{kid.stars}/{nextMilestone.stars} ⭐</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (kid.stars / nextMilestone.stars) * 100)}%` }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Daily Quests */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-[#4ECDC4] space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-[#FFE66D] w-8 h-8" />
          <h3 className="text-2xl font-black text-[#2F3061]">Daily Quests</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kid.dailyQuests?.map((quest) => (
            <div
              key={quest.id}
              className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all ${quest.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                }`}
            >
              <div className="flex-1 space-y-1">
                <p className={`font-black ${quest.completed ? 'text-green-700' : 'text-[#2F3061]'}`}>
                  {quest.title}
                </p>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                    className={`h-full ${quest.completed ? 'bg-green-500' : 'bg-[#4ECDC4]'}`}
                  />
                </div>
                <p className="text-xs text-gray-400 font-bold">{quest.current}/{quest.target}</p>
              </div>
              <div className="text-right">
                {quest.completed ? (
                  <CheckCircle2 className="text-green-500 w-8 h-8" />
                ) : (
                  <div className="flex items-center gap-1 text-yellow-500 font-black">
                    <Star className="fill-current w-4 h-4" />
                    <span>+{quest.reward}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Age gate notice */}
      {kid.age < 5 && visibleActivities.length < (ACTIVITIES as any[]).length && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-5 py-3 text-sm font-bold text-yellow-700">
          🌟 Some games unlock when you're a bit older! Keep playing to grow!
        </div>
      )}

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleActivities.map((activity: any) => (
          <motion.div
            key={activity.id}
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden p-8 rounded-3xl shadow-lg border-b-8 border-black/10 ${activity.color} text-white group`}
          >
            {/* NEW badge */}
            {activity.isNew && (
              <div className="absolute top-4 right-4 bg-white text-xs font-black px-3 py-1 rounded-full text-[#FF6B6B] shadow-md z-10">
                ✨ NEW
              </div>
            )}

            <div className="relative z-10 space-y-4">
              <div className="text-5xl">{activity.icon}</div>
              <div>
                <h3 className="text-2xl font-black">{activity.title}</h3>
                <p className="text-white/90 font-medium">{activity.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`/play/${activity.id}`}
                  onClick={() => {
                    soundManager.playStartGame();
                    speak(`Let's play ${activity.title}!`);
                  }}
                  className="inline-flex items-center gap-2 bg-white text-[#2F3061] px-6 py-4 rounded-2xl font-bold shadow-md hover:shadow-xl transition-all group-hover:gap-4 min-h-[56px] text-lg"
                >
                  Let's Play!
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => speak(activity.description)}
                  className="p-4 bg-white/20 rounded-2xl hover:bg-white/30 transition-colors min-h-[56px] min-w-[56px] flex items-center justify-center"
                  title="Hear description"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 text-white/10 text-9xl font-black select-none pointer-events-none">
              {activity.icon}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

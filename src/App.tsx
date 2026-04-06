import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import KidSelector from './components/KidSelector';
import MathMagicGame from './components/games/MathMagicGame';
import Dashboard from './components/Dashboard';
import ParentDashboard from './components/ParentDashboard';
import TracingGame from './components/games/TracingGame';
import SpellingGame from './components/games/SpellingGame';
import StoryBuddy from './components/games/StoryBuddy';
import MazeGame from './components/games/MazeGame';
import HiddenObjectGame from './components/games/HiddenObjectGame';
import SkyRescueGame from './components/games/SkyRescueGame';
import BubbleCatchGame from './components/games/BubbleCatchGame';
import WhackAMoleGame from './components/games/WhackAMoleGame';
import PhonicsSingAlongGame from './components/games/PhonicsSingAlongGame';
import RhymeTimeGame from './components/games/RhymeTimeGame';
import FirstLetterBounceGame from './components/games/FirstLetterBounceGame';
import LetterMatchPairsGame from './components/games/LetterMatchPairsGame';
import SentenceBuilderGame from './components/games/SentenceBuilderGame';
import StorySequencingGame from './components/games/StorySequencingGame';
import WordFamilyHouseGame from './components/games/WordFamilyHouseGame';
import { KidProfile, Quest } from './types';
import { soundManager } from './lib/sound-utils';

import { AuthProvider, useAuth } from './components/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { user: realUser, loading, login } = useAuth();
  // If you are on localhost, this forces a mock user. Otherwise, it uses real Firebase auth.
  const user = import.meta.env.DEV ? { uid: 'local-test-user' } : realUser;
  const [currentKid, setCurrentKid] = useState<KidProfile | null>(null);
  const [kids, setKids] = useState<KidProfile[]>(() => {
    const saved = localStorage.getItem('brightkids_profiles');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((k: KidProfile) => ({
        ...k,
        dailyQuests: k.dailyQuests || [
          { id: 'q1', title: 'Play 2 Games', target: 2, current: 0, reward: 10, completed: false },
          { id: 'q2', title: 'Collect 5 Stars', target: 5, current: 0, reward: 5, completed: false },
        ]
      }));
    }
    return [
      {
        id: '1', name: 'Kid 1', age: 4, avatar: '🦁', stars: 12,
        dailyQuests: [
          { id: 'q1', title: 'Play 2 Games', target: 2, current: 0, reward: 10, completed: false },
          { id: 'q2', title: 'Collect 5 Stars', target: 5, current: 0, reward: 5, completed: false },
        ]
      },
      {
        id: '2', name: 'Kid 2', age: 6, avatar: '🐘', stars: 25,
        dailyQuests: [
          { id: 'q1', title: 'Play 2 Games', target: 2, current: 0, reward: 10, completed: false },
          { id: 'q2', title: 'Collect 5 Stars', target: 5, current: 0, reward: 5, completed: false },
        ]
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('brightkids_profiles', JSON.stringify(kids));
  }, [kids]);

  const logActivity = async (kidId: string, activityId: string, stars: number) => {
    const path = 'activities';
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await addDoc(collection(db, path), {
        kidId,
        activityType: activityId,
        timestamp: new Date().toISOString(),
        starsEarned: stars
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const updateStars = (kidId: string, amount: number, activityId?: string) => {
    setKids(prev => prev.map(k => {
      if (k.id !== kidId) return k;
      const updatedQuests = k.dailyQuests?.map(q => {
        if (q.completed) return q;
        let newCurrent = q.current;
        if (q.id === 'q1' && activityId) newCurrent += 1;
        if (q.id === 'q2') newCurrent += amount;
        const isCompleted = newCurrent >= q.target;
        if (isCompleted && !q.completed) {
          amount += q.reward;
          soundManager.playSuccess();
        }
        return { ...q, current: newCurrent, completed: isCompleted };
      });
      return { ...k, stars: k.stars + amount, dailyQuests: updatedQuests };
    }));
    if (currentKid?.id === kidId) {
      setCurrentKid(prev => {
        if (!prev) return null;
        const updated = kids.find(k => k.id === kidId);
        return updated || prev;
      });
    }
    if (activityId) logActivity(kidId, activityId, amount);
  };

  const addKid = (name: string, age: number, avatar: string) => {
    const newKid: KidProfile = {
      id: Date.now().toString(), name, age, avatar, stars: 0,
      dailyQuests: [
        { id: 'q1', title: 'Play 2 Games', target: 2, current: 0, reward: 10, completed: false },
        { id: 'q2', title: 'Collect 5 Stars', target: 5, current: 0, reward: 5, completed: false },
      ]
    };
    setKids(prev => [...prev, newKid]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FFF7]">
        <div className="animate-bounce text-4xl">✨</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-8 bg-[#F7FFF7]">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl border-8 border-[#4ECDC4] space-y-8 max-w-md">
          <div className="text-8xl">🦁</div>
          <h1 className="text-4xl font-black text-[#FF6B6B]">BrightKids</h1>
          <p className="text-xl font-medium text-gray-600">Please sign in to start learning!</p>
          <button
            onClick={login}
            className="w-full bg-[#4ECDC4] text-white px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-3"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Helper to make game routes cleaner
  const makeRoute = (path: string, GameComponent: React.ComponentType<any>, activityId: string) => (
    <Route
      path={path}
      element={
        currentKid ? (
          <GameComponent kid={currentKid} onComplete={(s: number) => updateStars(currentKid.id, s, activityId)} />
        ) : (
          <Navigate to="/" />
        )
      }
    />
  );

  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              currentKid ? (
                <Dashboard kid={currentKid} onLogout={() => setCurrentKid(null)} />
              ) : (
                <KidSelector kids={kids} onSelect={setCurrentKid} onAddKid={addKid} />
              )
            }
          />
          <Route path="/parent" element={<ParentDashboard kids={kids} />} />

          {/* Existing games */}
          {makeRoute('/play/tracing', TracingGame, 'tracing')}
          {makeRoute('/play/spelling', SpellingGame, 'spelling')}
          {makeRoute('/play/story', StoryBuddy, 'story')}
          {makeRoute('/play/maze', MazeGame, 'maze')}
          {makeRoute('/play/hidden', HiddenObjectGame, 'hidden')}
          {makeRoute('/play/sky', SkyRescueGame, 'sky')}
          {makeRoute('/play/bubble', BubbleCatchGame, 'bubble')}
          {makeRoute('/play/mole', WhackAMoleGame, 'mole')}

          {/* New games */}
          {makeRoute('/play/phonics', PhonicsSingAlongGame, 'phonics')}
          {makeRoute('/play/rhyme', RhymeTimeGame, 'rhyme')}
          {makeRoute('/play/bounce', FirstLetterBounceGame, 'bounce')}
          {makeRoute('/play/match', LetterMatchPairsGame, 'match')}
          {makeRoute('/play/sentence', SentenceBuilderGame, 'sentence')}
          {makeRoute('/play/sequence', StorySequencingGame, 'sequence')}
          {makeRoute('/play/wordfamily', WordFamilyHouseGame, 'wordfamily')}
          {makeRoute('/play/math', MathMagicGame, 'math')}
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { KidProfile } from './types';
import { soundManager } from './lib/sound-utils';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  // Authentication removed: Using a static mock user so Firebase functions don't crash
  const user = { uid: 'public-user' };

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
    ];
  });

  useEffect(() => {
    localStorage.setItem('brightkids_profiles', JSON.stringify(kids));
  }, [kids]);

  const logActivity = async (kidId: string, activityId: string, stars: number) => {
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      await addDoc(collection(db, 'activities'), {
        kidId,
        activityType: activityId,
        timestamp: new Date().toISOString(),
        starsEarned: stars,
        userId: user.uid
      });
    } catch (error) {
      console.warn('Firebase log skipped (unauthenticated):', error);
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
          {makeRoute('/play/tracing', TracingGame, 'tracing')}
          {makeRoute('/play/spelling', SpellingGame, 'spelling')}
          {makeRoute('/play/story', StoryBuddy, 'story')}
          {makeRoute('/play/maze', MazeGame, 'maze')}
          {makeRoute('/play/hidden', HiddenObjectGame, 'hidden')}
          {makeRoute('/play/sky', SkyRescueGame, 'sky')}
          {makeRoute('/play/bubble', BubbleCatchGame, 'bubble')}
          {makeRoute('/play/mole', WhackAMoleGame, 'mole')}
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
    <Router>
      <AppContent />
    </Router>
  );
}
import React from 'react';
import { motion } from 'motion/react';
import { Activity, Star, Calendar, Clock, TrendingUp } from 'lucide-react';
import { KidProfile } from '../types';

import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface Props {
  kids: KidProfile[];
}

export default function ParentDashboard({ kids }: Props) {
  const [recentLogs, setRecentLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    const path = 'activities';
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, []);
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-[#FFE66D] p-3 rounded-2xl">
          <TrendingUp className="text-[#2F3061] w-8 h-8" />
        </div>
        <h2 className="text-4xl font-black text-[#2F3061]">Parent Dashboard</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Activity className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Activities</p>
            <p className="text-2xl font-black text-[#2F3061]">42</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-100 p-3 rounded-2xl">
            <Star className="text-yellow-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Total Stars</p>
            <p className="text-2xl font-black text-[#2F3061]">
              {kids.reduce((acc, k) => acc + k.stars, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-2xl">
            <Clock className="text-green-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Time Today</p>
            <p className="text-2xl font-black text-[#2F3061]">1h 15m</p>
          </div>
        </div>
      </div>

      {/* Kid Progress */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-[#2F3061]">Kid Progress</h3>
        <div className="grid grid-cols-1 gap-6">
          {kids.map((kid) => (
            <motion.div
              key={kid.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-8 rounded-3xl shadow-xl border-4 border-[#4ECDC4] flex flex-wrap items-center justify-between gap-8"
            >
              <div className="flex items-center gap-6">
                <div className="text-5xl bg-gray-50 w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-gray-100">
                  {kid.avatar}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[#2F3061]">{kid.name}</h4>
                  <p className="text-gray-500 font-medium">{kid.age} years old • {kid.stars} Stars</p>
                </div>
              </div>

              <div className="flex-1 min-w-[200px] space-y-2">
                <div className="flex justify-between text-sm font-bold text-gray-600">
                  <span>Daily Goal</span>
                  <span>75%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    className="h-full bg-[#4ECDC4]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase">Tracing</p>
                  <p className="text-lg font-black text-[#FF6B6B]">Level 4</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase">Spelling</p>
                  <p className="text-lg font-black text-[#4ECDC4]">Level 2</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-gray-100 space-y-6">
        <h3 className="text-2xl font-black text-[#2F3061]">Recent Activity</h3>
        <div className="space-y-4">
          {recentLogs.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No activities yet!</p>
          ) : (
            recentLogs.map((log, i) => {
              const kid = kids.find(k => k.id === log.kidId);
              return (
                <div key={log.id || i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">
                      {kid?.avatar || '👤'}
                    </div>
                    <div>
                      <p className="font-black text-[#2F3061]">{kid?.name || 'Someone'} completed {log.activityType}</p>
                      <p className="text-sm text-gray-400 font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 font-black">
                    <Star className="fill-current w-4 h-4" />
                    <span>+{log.starsEarned}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

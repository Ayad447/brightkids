import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X } from 'lucide-react';
import { KidProfile } from '../types';

interface Props {
  kids: KidProfile[];
  onSelect: (kid: KidProfile) => void;
  onAddKid: (name: string, age: number, avatar: string) => void;
}

const AVATARS = ['🦁', '🐘', '🦒', '🦓', '🐼', '🐨', '🐯', '🦊'];

export default function KidSelector({ kids, onSelect, onAddKid }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(4);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddKid(newName.trim(), newAge, selectedAvatar);
      setIsAdding(false);
      setNewName('');
    }
  };

  return (
    <div className="text-center space-y-8 py-12">
      <motion.h2 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="text-4xl font-black text-[#FF6B6B]"
      >
        Who is learning today?
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-8">
        {kids.map((kid, index) => (
          <motion.button
            key={kid.id}
            whileHover={{ scale: 1.1, rotate: index % 2 === 0 ? 2 : -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(kid)}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-xl border-8 border-[#4ECDC4] group-hover:border-[#FF6B6B] transition-colors">
              {kid.avatar}
            </div>
            <div className="bg-white px-6 py-2 rounded-full shadow-md border-2 border-gray-100">
              <span className="text-xl font-bold text-[#2F3061]">{kid.name}</span>
              <p className="text-sm text-gray-500 font-medium">{kid.age} years old</p>
            </div>
          </motion.button>
        ))}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="flex flex-col items-center gap-4 group"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-xl border-8 border-dashed border-gray-300 group-hover:border-[#4ECDC4] transition-colors text-gray-300 group-hover:text-[#4ECDC4]">
            <Plus className="w-12 h-12" />
          </div>
          <div className="bg-white px-6 py-2 rounded-full shadow-md border-2 border-gray-100">
            <span className="text-xl font-bold text-gray-400 group-hover:text-[#4ECDC4]">Add New</span>
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl p-8 w-full max-w-md relative border-8 border-[#4ECDC4]"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              <h3 className="text-3xl font-black text-[#FF6B6B] mb-6">New Explorer!</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-black text-gray-500 uppercase ml-2">Explorer Name</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-[#4ECDC4] outline-none text-xl font-bold"
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-sm font-black text-gray-500 uppercase ml-2">Age</label>
                  <div className="flex gap-4">
                    {[4, 5, 6, 7].map(age => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setNewAge(age)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          newAge === age ? 'bg-[#4ECDC4] text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-sm font-black text-gray-500 uppercase ml-2">Choose Avatar</label>
                  <div className="grid grid-cols-4 gap-3">
                    {AVATARS.map(avatar => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`text-3xl p-3 rounded-2xl transition-all ${
                          selectedAvatar === avatar ? 'bg-yellow-100 border-2 border-yellow-400 scale-110' : 'bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#FF6B6B] text-white py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform mt-4"
                >
                  Let's Go! 🚀
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Home, User, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isParent = location.pathname.startsWith('/parent');

  return (
    <div className="min-h-screen bg-[#F7FFF7] font-sans text-[#2F3061]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-[#4ECDC4] px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-[#FF6B6B] p-2 rounded-2xl rotate-3 group-hover:rotate-0 transition-transform">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#FF6B6B]">BrightKids</h1>
        </Link>

        <nav className="flex items-center gap-4">
          <Link 
            to="/" 
            className={`p-3 rounded-2xl transition-colors ${location.pathname === '/' ? 'bg-[#4ECDC4] text-white' : 'hover:bg-gray-100'}`}
          >
            <Home className="w-6 h-6" />
          </Link>
          <Link 
            to="/parent" 
            className={`p-3 rounded-2xl transition-colors ${isParent ? 'bg-[#FFE66D] text-[#2F3061]' : 'hover:bg-gray-100'}`}
          >
            <Settings className="w-6 h-6" />
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#FFE66D] pointer-events-none" />
    </div>
  );
}

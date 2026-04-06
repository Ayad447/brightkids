import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
  kid: KidProfile;
  onComplete: (stars: number) => void;
}

// NEW: Now includes uppercase, lowercase, and numbers 0-9!
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');

export default function TracingGame({ kid, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentChar, setCurrentChar] = useState(CHARACTERS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    const size = Math.min(window.innerWidth - 40, 400);
    canvas.width = size;
    canvas.height = size;

    // Draw background character
    ctx.font = `bold ${size * 0.8}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText(currentChar, size / 2, size / 2);

    // Draw outline
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.strokeText(currentChar, size / 2, size / 2);
  }, [currentChar]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FF6B6B';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Play a very subtle sound while drawing
    if (Math.random() > 0.9) soundManager.playPop();
  };

  const handleFinish = () => {
    soundManager.playSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setIsComplete(true);
    onComplete(3);
  };

  const reset = () => {
    soundManager.stopMusic();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCurrentChar(CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]);
    setIsComplete(false);
  };

  return (
    <div className="space-y-8 text-center">
      <div className="flex items-center justify-between">
        <Link to="/" className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-3xl font-black text-[#FF6B6B]">Letter Safari</h2>
        <div className="w-12" />
      </div>

      <div className="relative inline-block bg-white p-8 rounded-[40px] shadow-2xl border-8 border-[#4ECDC4]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none"
        />

        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-[32px] space-y-6"
          >
            <CheckCircle className="w-24 h-24 text-green-500" />
            <h3 className="text-3xl font-black text-[#2F3061]">Amazing Job!</h3>
            <button
              onClick={reset}
              className="bg-[#FF6B6B] text-white px-8 py-4 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform"
            >
              Next One!
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200"
        >
          <RotateCcw className="w-5 h-5" />
          Start Over
        </button>
        {!isComplete && (
          <button
            onClick={handleFinish}
            className="px-8 py-3 bg-[#4ECDC4] text-white rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform"
          >
            I'm Done!
          </button>
        )}
      </div>

      {/* NEW: Updated the text to be generic for letters and numbers */}
      <p className="text-gray-400 font-medium">Trace {currentChar} with your finger or mouse!</p>
    </div>
  );
}
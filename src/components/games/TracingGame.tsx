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

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');

export default function TracingGame({ kid, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentChar, setCurrentChar] = useState(CHARACTERS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const drawBackground = (char: string) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Size canvas to its container
    const size = Math.min(container.clientWidth - 32, 380);
    canvas.width = size;
    canvas.height = size;
    ctx.font = `bold ${size * 0.8}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f0f0f0';
    ctx.fillText(char, size / 2, size / 2);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.strokeText(char, size / 2, size / 2);
  };

  useEffect(() => {
    drawBackground(currentChar);
  }, [currentChar]);

  // Re-draw on resize
  useEffect(() => {
    const obs = new ResizeObserver(() => drawBackground(currentChar));
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [currentChar]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => { setIsDrawing(false); };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    if (Math.random() > 0.9) soundManager.playPop();
  };

  const handleFinish = () => {
    soundManager.playSuccess();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setIsComplete(true);
    onComplete(3);
  };

  const reset = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    const nextChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
    setCurrentChar(nextChar);
    setIsComplete(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="p-2 sm:p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <h2 className="text-xl sm:text-3xl font-black text-[#FF6B6B]">Letter Safari</h2>
        <div className="w-10 sm:w-12" />
      </div>

      <div
        ref={containerRef}
        className="relative bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-2xl border-4 sm:border-8 border-[#4ECDC4] w-full"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none mx-auto block rounded-2xl"
          style={{ maxWidth: '100%' }}
        />

        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-[20px] sm:rounded-[32px] space-y-4 sm:space-y-6"
          >
            <CheckCircle className="w-16 h-16 sm:w-24 sm:h-24 text-green-500" />
            <h3 className="text-2xl sm:text-3xl font-black text-[#2F3061]">Amazing Job!</h3>
            <button onClick={reset} className="bg-[#FF6B6B] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform">
              Next One!
            </button>
          </motion.div>
        )}
      </div>

      <div className="flex justify-center gap-3 sm:gap-4">
        <button onClick={reset} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 text-sm sm:text-base">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          Start Over
        </button>
        {!isComplete && (
          <button onClick={handleFinish} className="px-6 sm:px-8 py-2 sm:py-3 bg-[#4ECDC4] text-white rounded-2xl font-black text-lg sm:text-xl shadow-lg hover:scale-105 transition-transform">
            I'm Done!
          </button>
        )}
      </div>

      <p className="text-gray-400 font-medium text-sm sm:text-base">Trace {currentChar} with your finger or mouse!</p>
    </div>
  );
}
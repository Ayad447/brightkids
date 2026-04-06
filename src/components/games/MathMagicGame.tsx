import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KidProfile } from '../../types';
import { soundManager } from '../../lib/sound-utils';

interface Props {
    kid: KidProfile;
    onComplete: (stars: number) => void;
}

const EMOJIS = ['🍎', '🍕', '🚀', '🎈', '🦖', '🐶', '⭐', '🚗', '🍓', '🍩', '🐸', '🤖'];
const MAX_SCORE = 10;

interface Equation {
    num1: number;
    num2: number;
    operator: '+' | '-';
    answer: number;
    options: number[];
    emoji: string;
}

function generateEquation(): Equation {
    const isAddition = Math.random() > 0.5;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    let num1: number, num2: number, answer: number;

    if (isAddition) {
        num1 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        num2 = Math.floor(Math.random() * 5) + 1; // 1 to 5
        answer = num1 + num2;
    } else {
        num1 = Math.floor(Math.random() * 8) + 3; // 3 to 10
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // 1 to (num1 - 1) to ensure answer >= 1
        answer = num1 - num2;
    }

    // Generate 3 unique multiple choice options
    const offsets = [-2, -1, 1, 2, 3].sort(() => Math.random() - 0.5);
    const optionsSet = new Set<number>([answer]);

    for (const offset of offsets) {
        if (optionsSet.size >= 3) break;
        const opt = answer + offset;
        if (opt >= 0) optionsSet.add(opt); // No negative options for early learners
    }

    return {
        num1,
        num2,
        operator: isAddition ? '+' : '-',
        answer,
        options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
        emoji
    };
}

export default function MathMagicGame({ kid, onComplete }: Props) {
    const [current, setCurrent] = useState<Equation>(generateEquation());
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [selected, setSelected] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const isMounted = useRef(true);

    const safeTimeout = (cb: () => void, ms: number) => {
        const id = setTimeout(cb, ms);
        timeoutsRef.current.push(id);
    };

    const cleanup = () => {
        isMounted.current = false;
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    };

    useEffect(() => { return cleanup; }, []);

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.8;
        utt.pitch = 1.3;
        window.speechSynthesis.speak(utt);
    };

    // Speak the equation whenever a new one loads
    useEffect(() => {
        const action = current.operator === '+' ? 'plus' : 'minus';
        safeTimeout(() => speak(`What is ${current.num1} ${action} ${current.num2}?`), 300);
    }, [current]);

    const handleAnswer = (answerChoice: number) => {
        if (feedback) return;
        setSelected(answerChoice);

        if (answerChoice === current.answer) {
            setFeedback('correct');
            soundManager.playSuccess();
            speak(`Yes! ${current.answer} is correct!`);

            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= MAX_SCORE) {
                safeTimeout(() => {
                    confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
                    setIsFinished(true);
                    onComplete(10);
                }, 1500);
            } else {
                safeTimeout(nextRound, 2000);
            }
        } else {
            setFeedback('wrong');
            soundManager.playGameOver();
            speak(`Not quite! Try counting the ${current.emoji} again.`);

            safeTimeout(() => {
                setFeedback(null);
                setSelected(null);
            }, 2000);
        }
    };

    const nextRound = () => {
        setCurrent(generateEquation());
        setFeedback(null);
        setSelected(null);
    };

    const reset = () => {
        cleanup();
        isMounted.current = true;
        setCurrent(generateEquation());
        setScore(0);
        setIsFinished(false);
        setFeedback(null);
        setSelected(null);
    };

    // Renders the visual counting aids for kids
    const renderVisuals = () => {
        if (current.operator === '+') {
            return (
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-3xl md:text-4xl mt-6">
                    <div className="flex flex-wrap justify-center gap-1 bg-cyan-50 p-3 md:p-4 rounded-2xl border-2 border-cyan-200 shadow-inner max-w-[150px]">
                        {Array.from({ length: current.num1 }).map((_, i) => <span key={`n1-${i}`}>{current.emoji}</span>)}
                    </div>
                    <span className="font-black text-cyan-400 text-5xl">+</span>
                    <div className="flex flex-wrap justify-center gap-1 bg-cyan-50 p-3 md:p-4 rounded-2xl border-2 border-cyan-200 shadow-inner max-w-[150px]">
                        {Array.from({ length: current.num2 }).map((_, i) => <span key={`n2-${i}`}>{current.emoji}</span>)}
                    </div>
                </div>
            );
        } else {
            // Subtraction visually crosses out the removed items
            return (
                <div className="flex flex-wrap items-center justify-center gap-4 text-3xl md:text-4xl mt-6">
                    <div className="flex flex-wrap justify-center gap-2 bg-cyan-50 p-4 rounded-2xl border-2 border-cyan-200 shadow-inner max-w-[300px]">
                        {/* The remaining items */}
                        {Array.from({ length: current.answer }).map((_, i) => (
                            <span key={`ans-${i}`}>{current.emoji}</span>
                        ))}
                        {/* The subtracted (crossed out) items */}
                        {Array.from({ length: current.num2 }).map((_, i) => (
                            <span key={`sub-${i}`} className="relative opacity-40 grayscale">
                                {current.emoji}
                                <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-5xl rotate-45">/</div>
                            </span>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="space-y-8 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <Link to="/" onClick={cleanup} className="p-3 bg-white rounded-2xl shadow-md hover:bg-gray-50">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h2 className="text-3xl font-black text-cyan-500">Math Magic</h2>
                <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl shadow-sm">
                    <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
                    <span className="text-cyan-600 font-black">{score}/{MAX_SCORE}</span>
                </div>
            </div>

            <div className="flex justify-center gap-2 flex-wrap">
                {Array.from({ length: MAX_SCORE }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all ${i < score ? 'bg-cyan-500 scale-125' : 'bg-gray-200'}`} />
                ))}
            </div>

            {isFinished ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl border-8 border-cyan-300 space-y-6">
                    <div className="text-8xl">🪄</div>
                    <h3 className="text-4xl font-black text-[#2F3061]">Math Wizard!</h3>
                    <p className="text-xl text-gray-500 font-medium">You solved all {MAX_SCORE} math puzzles!</p>
                    <button onClick={reset} className="bg-cyan-500 text-white px-10 py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-transform">
                        Play Again!
                    </button>
                </motion.div>
            ) : (
                <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl border-8 border-cyan-200 space-y-8">

                    <div className="space-y-4">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Solve the puzzle</p>

                        {/* The Equation */}
                        <motion.div
                            key={`${current.num1}-${current.operator}-${current.num2}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-6xl md:text-7xl font-black text-[#2F3061] tracking-wider"
                        >
                            {current.num1} <span className="text-cyan-400">{current.operator}</span> {current.num2} <span className="text-cyan-400">=</span> ?
                        </motion.div>

                        {/* Visual Counting Aids */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`visuals-${current.num1}-${current.num2}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {renderVisuals()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t-4 border-dashed border-cyan-100">
                        {current.options.map((opt) => {
                            const isSelected = selected === opt;
                            let btnClass = 'bg-gray-50 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 text-[#2F3061]';

                            if (isSelected && feedback === 'correct') {
                                btnClass = 'bg-green-100 border-green-500 text-green-700';
                            } else if (isSelected && feedback === 'wrong') {
                                btnClass = 'bg-red-100 border-red-400 text-red-700';
                            } else if (selected && feedback === 'correct' && opt !== current.answer) {
                                btnClass = 'bg-gray-50 border-gray-200 text-gray-300 opacity-50'; // Dim wrong answers on win
                            }

                            return (
                                <motion.button
                                    key={opt}
                                    disabled={feedback !== null}
                                    whileHover={!feedback ? { scale: 1.05, y: -4 } : {}}
                                    whileTap={!feedback ? { scale: 0.95 } : {}}
                                    onClick={() => handleAnswer(opt)}
                                    className={`py-6 md:py-8 rounded-3xl border-4 font-black text-4xl md:text-5xl shadow-md transition-all flex justify-center items-center gap-2 ${btnClass}`}
                                >
                                    {opt}
                                    {isSelected && feedback === 'correct' && <CheckCircle className="w-8 h-8 text-green-500" />}
                                    {isSelected && feedback === 'wrong' && <XCircle className="w-8 h-8 text-red-500" />}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            )}

            <button onClick={reset} className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-200">
                <RotateCcw className="w-5 h-5" />
                Restart
            </button>
        </div>
    );
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/store/useGameStore';
import { ShareScore } from '@/components/game/ShareScore';

interface FallingLetter {
    id: string;
    letter: string;
    position: number;
    progress: number;
}

export function LetterPopGame() {
    const {
        score,
        life,
        currentStreak,
        totalWordsTyped,
        incrementScore,
        decrementLife,
        incrementStreak,
        resetStreak,
        incrementWordsTyped,
        addBadge,
        resetGame,
    } = useGameStore();

    const [letters, setLetters] = useState<FallingLetter[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);

    const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

    // Add new falling letter
    const addLetter = useCallback(() => {
        const newLetter: FallingLetter = {
            id: `letter-${Date.now()}-${Math.random()}`,
            letter: LETTERS[Math.floor(Math.random() * LETTERS.length)].toUpperCase(),
            position: Math.random() * 80 + 10,
            progress: 0,
        };
        setLetters((prev) => [...prev, newLetter]);
    }, []);

    // Handle key press
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (!gameStarted || gameOver) return;

            const key = event.key.toUpperCase();

            // Find the lowest letter that matches
            const matchedLetter = letters
                .filter((l) => l.letter === key)
                .sort((a, b) => b.progress - a.progress)[0];

            if (matchedLetter) {
                // Pop the letter!
                setLetters((prev) => prev.filter((l) => l.id !== matchedLetter.id));

                const points = 5 * (Math.floor(currentStreak / 5) + 1);
                incrementScore(points);
                incrementStreak();
                incrementWordsTyped();

                // Check for badges
                if (currentStreak === 10) addBadge('Letter Master');
                if (currentStreak === 20) addBadge('Pop Champion');
                if (score > 200) addBadge('Balloon Buster');
            }
        },
        [gameStarted, gameOver, letters, currentStreak, incrementScore, incrementStreak, incrementWordsTyped, addBadge, score]
    );

    // Game loop
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const gameInterval = setInterval(() => {
            setLetters((prev) => {
                const updated = prev.map((letter) => {
                    // Calculate speed increment based on level
                    // Level 1: ~15s (0.33 per tick)
                    // Level 2: ~10s (0.5 per tick) 
                    // Level 3: ~7s (0.7 per tick)
                    const speedIncrement = selectedLevel === 1 ? 0.33 : selectedLevel === 2 ? 0.5 : 0.7;

                    return {
                        ...letter,
                        progress: letter.progress + speedIncrement,
                    };
                });

                // Check for letters that reached the bottom (only remove when actually past 100%)
                const missed = updated.filter((l) => l.progress > 100);
                if (missed.length > 0) {
                    missed.forEach(() => {
                        decrementLife();
                        resetStreak();
                    });
                }

                // Keep letters until they're completely past the bottom
                return updated.filter((l) => l.progress <= 100);
            });
        }, 50);

        return () => clearInterval(gameInterval);
    }, [gameStarted, gameOver, decrementLife, resetStreak, selectedLevel]);

    // Add letters periodically
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        const addInterval = setInterval(() => {
            addLetter();
        }, selectedLevel === 1 ? 3000 : selectedLevel === 2 ? 2000 : 1500); // Slower spawn rates

        return () => clearInterval(addInterval);
    }, [gameStarted, gameOver, addLetter, selectedLevel]);

    // Keyboard listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    // Check game over
    useEffect(() => {
        if (life <= 0 && gameStarted) {
            setGameOver(true);
        }
    }, [life, gameStarted]);

    const startGame = () => {
        resetGame();
        setGameStarted(true);
        setGameOver(false);
        setLetters([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-kids-blue to-kids-purple p-8 relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow font-bold text-gray-700"
                    >
                        ← Back
                    </Link>
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                        🎈 Letter Pop
                    </h1>
                    <div className="w-24"></div>
                </div>

                {!gameStarted ? (
                    /* Start Screen */
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                    >
                        <div className="text-6xl mb-6">🎈</div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">
                            Pop the Balloons!
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Type the letters on the falling balloons before they reach the ground!
                        </p>

                        <div className="mb-8">
                            <label className="block text-gray-700 font-bold mb-4">
                                Choose Speed:
                            </label>
                            <div className="flex gap-4 justify-center">
                                {[1, 2, 3].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-8 py-4 rounded-2xl font-bold transition-all ${selectedLevel === level
                                            ? 'bg-kids-blue text-white shadow-lg scale-110'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {level === 1 ? 'Slow' : level === 2 ? 'Medium' : 'Fast'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="px-12 py-4 bg-gradient-to-r from-kids-pink to-kids-purple text-white rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            Start Popping! 🎈
                        </button>
                    </motion.div>
                ) : gameOver ? (
                    /* Game Over Screen */
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                    >
                        <div className="text-6xl mb-6">🎮</div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Game Over!</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            You popped {totalWordsTyped} balloons!
                        </p>
                        <div className="text-5xl font-bold text-kids-purple mb-8">{score}</div>

                        <div className="mb-8">
                            <ShareScore score={score} gameName="Letter Pop" />
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-kids-blue text-white rounded-full font-bold hover:shadow-lg transition-all"
                            >
                                Play Again
                            </button>
                            <Link
                                href="/"
                                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:shadow-lg transition-all"
                            >
                                Home
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    /* Game Screen */
                    <div>
                        {/* Stats */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 flex justify-around">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-kids-purple">{score}</div>
                                <div className="text-sm text-gray-600">Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-red-500">
                                    {'❤️'.repeat(life)}
                                </div>
                                <div className="text-sm text-gray-600">Lives</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-kids-blue">{currentStreak}</div>
                                <div className="text-sm text-gray-600">Streak</div>
                            </div>
                        </div>

                        {/* Game Area */}
                        <div className="bg-white rounded-3xl p-8 shadow-2xl relative h-[75vh] overflow-hidden">
                            <AnimatePresence>
                                {letters.map((letter) => (
                                    <motion.div
                                        key={letter.id}
                                        initial={{ y: -50, opacity: 0 }}
                                        animate={{
                                            y: `${letter.progress}%`,
                                            opacity: 1,
                                        }}
                                        exit={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 0.1 }}
                                        className="absolute"
                                        style={{
                                            left: `${letter.position}%`,
                                            top: 0,
                                            transform: 'translateX(-50%)', // Center horizontally
                                        }}
                                    >
                                        <div className="relative inline-block">
                                            <div className="text-6xl leading-none">🎈</div>
                                            <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white drop-shadow-lg">
                                                {letter.letter}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Instructions */}
                            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-gray-500">
                                💡 Press the letter keys to pop the balloons!
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/store/useGameStore';
import { ShareScore } from '@/components/game/ShareScore';

export function WordRaceGame() {
    const { incrementScore, incrementWordsTyped, addBadge, resetGame } = useGameStore();

    const [currentWord, setCurrentWord] = useState('start');
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [wordsTyped, setWordsTyped] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [wordList, setWordList] = useState<string[]>(['start']);
    const [loading, setLoading] = useState(false);

    // Fetch words
    const fetchWords = async () => {
        try {
            const difficulty = selectedLevel === 1 ? 'easy' : selectedLevel === 2 ? 'medium' : 'hard';
            const timestamp = Date.now();
            const response = await fetch(
                `/api/generate?level=${selectedLevel}&mode=word-race&count=50&difficulty=${difficulty}&timestamp=${timestamp}`
            );
            const data = await response.json();
            if (!data.success || !data.words) {
                throw new Error('Invalid API response');
            }
            const words = data.words.map((w: any) => w.text) || [];
            return words.length > 0 ? words : [...FALLBACK_WORDS].sort(() => Math.random() - 0.5);
        } catch (error) {
            console.error('Failed to fetch words:', error);
            return [...FALLBACK_WORDS].sort(() => Math.random() - 0.5);
        }
    };

    const FALLBACK_WORDS = [
        'cat', 'dog', 'sun', 'run', 'fun', 'hat', 'bat', 'mat', 'can', 'pan',
        'fish', 'bird', 'jump', 'play', 'blue', 'red', 'green', 'tree', 'ball', 'kite',
        'happy', 'smile', 'laugh', 'cloud', 'star', 'moon', 'cake', 'milk', 'book', 'door',
        'house', 'park', 'duck', 'frog', 'bear', 'lion', 'tiger', 'zebra', 'snake', 'horse',
        'apple', 'grape', 'lemon', 'melon', 'berry', 'peach', 'mango', 'pizza', 'taco', 'chip'
    ];

    // Start game
    const startGame = async () => {
        setLoading(true);
        resetGame();
        setGameOver(false);
        setWordsTyped(0);
        setInput('');
        setTimeLeft(60);

        const words = await fetchWords();
        setWordList(words);
        setCurrentWord(words[0]);
        setLoading(false);
        setGameStarted(true);
    };

    // Timer
    useEffect(() => {
        if (!gameStarted || gameOver || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameOver(true);
                    if (wordsTyped >= 20) addBadge('Speed Demon');
                    if (wordsTyped >= 30) addBadge('Racing Champion');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, gameOver, timeLeft, wordsTyped, addBadge]);

    // Handle input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        if (value === currentWord) {
            // Correct!
            const newWordsTyped = wordsTyped + 1;
            setWordsTyped(newWordsTyped);
            incrementScore(10);
            incrementWordsTyped();

            // Next word
            const nextWord = wordList[newWordsTyped % wordList.length];
            setCurrentWord(nextWord);
            setInput('');
        }
    };

    const wpm = Math.round(wordsTyped / ((60 - timeLeft) / 60 || 1));

    return (
        <div className="min-h-screen bg-gradient-to-br from-kids-yellow to-kids-green p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow font-bold text-gray-700"
                    >
                        ← Back
                    </Link>
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                        🏁 Word Race
                    </h1>
                    <div className="w-24"></div>
                </div>

                {loading ? (
                    /* Loading Screen */
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                    >
                        <div className="text-6xl mb-6 animate-bounce">🏁</div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">
                            Loading Words...
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Get ready to race!
                        </p>
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-kids-green"></div>
                        </div>
                    </motion.div>
                ) : !gameStarted ? (
                    /* Start Screen */
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                    >
                        <div className="text-6xl mb-6">🏁</div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">
                            Type as Fast as You Can!
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            You have 60 seconds to type as many words as possible. How fast can you go?
                        </p>

                        <div className="mb-8">
                            <label className="block text-gray-700 font-bold mb-4">
                                Choose Difficulty:
                            </label>
                            <div className="flex gap-4 justify-center">
                                {[1, 2, 3].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setSelectedLevel(level)}
                                        className={`px-8 py-4 rounded-2xl font-bold transition-all ${selectedLevel === level
                                            ? 'bg-kids-green text-white shadow-lg scale-110'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="px-12 py-4 bg-gradient-to-r from-kids-yellow to-kids-green text-white rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            Start Race! 🏁
                        </button>
                    </motion.div>
                ) : gameOver ? (
                    /* Game Over Screen */
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                    >
                        <div className="text-6xl mb-6">🏆</div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">Race Complete!</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            You typed {wordsTyped} words in 60 seconds!
                        </p>
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="bg-kids-yellow bg-opacity-20 rounded-2xl p-6">
                                <div className="text-4xl font-bold text-kids-yellow">{wordsTyped}</div>
                                <div className="text-sm text-gray-600 mt-2">Words Typed</div>
                            </div>
                            <div className="bg-kids-green bg-opacity-20 rounded-2xl p-6">
                                <div className="text-4xl font-bold text-kids-green">{wpm}</div>
                                <div className="text-sm text-gray-600 mt-2">WPM</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <ShareScore score={wordsTyped} gameName="Word Race" />
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={startGame}
                                className="px-8 py-3 bg-kids-green text-white rounded-full font-bold hover:shadow-lg transition-all"
                            >
                                Race Again
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
                    <div className="space-y-8">
                        {/* Stats */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg flex justify-around">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-red-500">{timeLeft}s</div>
                                <div className="text-sm text-gray-600">Time Left</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-kids-green">{wordsTyped}</div>
                                <div className="text-sm text-gray-600">Words Typed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-kids-blue">{wpm}</div>
                                <div className="text-sm text-gray-600">WPM</div>
                            </div>
                        </div>

                        {/* Word Display */}
                        <div className="bg-white rounded-3xl p-16 shadow-2xl text-center">
                            <motion.div
                                key={currentWord}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-7xl font-bold text-kids-purple mb-12"
                            >
                                {currentWord}
                            </motion.div>

                            {/* Input */}
                            <input
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setInput('');
                                    }
                                }}
                                className="w-full max-w-md mx-auto p-6 text-3xl text-center border-4 border-kids-green rounded-2xl focus:outline-none focus:ring-4 focus:ring-kids-green focus:ring-opacity-30"
                                placeholder="Type here..."
                                autoFocus
                            />

                            {/* Character feedback */}
                            <div className="mt-8 text-3xl font-mono mb-8">
                                {currentWord.split('').map((char, i) => (
                                    <span
                                        key={i}
                                        className={
                                            i < input.length
                                                ? input[i] === char
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                : 'text-gray-300'
                                        }
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>

                            {/* Next word preview */}
                            <div className="mt-8 pt-8 border-t-2 border-gray-200">
                                <div className="text-sm text-gray-500 mb-2">Next word:</div>
                                <div className="text-3xl font-bold text-gray-400">
                                    {wordList[(wordsTyped + 1) % wordList.length]}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

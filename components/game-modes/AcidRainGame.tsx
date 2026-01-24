'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore, Word } from '@/store/useGameStore';
import { FallingWord } from '@/components/game/FallingWord';
import { KeyboardGuide } from '@/components/game/KeyboardGuide';
import { ShareScore } from '@/components/game/ShareScore';

interface ActiveWord extends Word {
    position: number;
    speed: number;
}

export function AcidRainGame() {
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

    const [activeWords, setActiveWords] = useState<ActiveWord[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [wordPool, setWordPool] = useState<string[]>([]);
    const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
    const [wordsTyped, setWordsTyped] = useState(0);
    const [loading, setLoading] = useState(false);

    // Speak word using Web Speech API with better quality
    const speakWord = (word: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8; // Slightly faster for clarity
            utterance.pitch = 1.1; // Higher pitch for kids
            utterance.volume = 1.0; // Full volume

            // Try to use a high-quality voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoices = voices.filter(voice =>
                voice.lang.startsWith('en') &&
                (voice.name.includes('Google') || voice.name.includes('Premium') || voice.name.includes('Enhanced'))
            );

            if (preferredVoices.length > 0) {
                utterance.voice = preferredVoices[0];
            } else {
                // Fallback to any English voice
                const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
                if (englishVoice) utterance.voice = englishVoice;
            }

            window.speechSynthesis.speak(utterance);
        }
    };

    // Calculate difficulty based on selected level - SUPER EASY MODE
    const getCurrentDifficulty = () => {
        if (selectedLevel === 1) return 'easy';
        if (selectedLevel === 2) return 'medium'; // Smoother curve (was hard)
        return 'expert';
    };

    // Fetch words from API based on selected level - DRAGON MODE
    const fetchWords = async () => {
        try {
            const difficulty = getCurrentDifficulty();
            const timestamp = Date.now(); // Add timestamp to ensure unique words
            const response = await fetch(
                `/api/generate?level=${selectedLevel}&mode=acid-rain&count=50&difficulty=${difficulty}&timestamp=${timestamp}`
            );
            const data = await response.json();
            const words = data.words?.map((w: Word) => w.text) || [];
            return words;
        } catch (error) {
            console.error('Failed to fetch words:', error);
            return [];
        }
    };

    // Add new falling word
    const addWord = useCallback(() => {
        if (wordPool.length === 0) return;

        setActiveWords((prevActiveWords) => {
            // Filter out words that are already on screen using current state
            const activeWordTexts = prevActiveWords.map(w => w.text.toLowerCase());
            const availableWords = wordPool.filter(
                word => !activeWordTexts.includes(word.toLowerCase()) && !usedWords.has(word.toLowerCase())
            );

            // If we've used most words, refresh the pool
            if (availableWords.length < 3) {
                setUsedWords(new Set());
                return prevActiveWords; // Don't add new word, return current state
            }

            const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];

            // Speed based on level (duration in seconds, lower is faster)
            // Speed based on level (duration in seconds, lower is faster)
            const speedMap: Record<number, number> = {
                1: 30, // Much slower for kids (was 25)
                2: 20, // (was 15)
                3: 12  // (was 10)
            };
            const speed = speedMap[selectedLevel] || 20;

            const newWord: ActiveWord = {
                id: `word-${Date.now()}-${Math.random()}`, // Use timestamp + random for unique IDs
                text: randomWord,
                position: Math.random() * 80 + 10,
                speed: speed,
            };

            setUsedWords(prev => new Set([...prev, randomWord.toLowerCase()]));
            speakWord(randomWord);

            return [...prevActiveWords, newWord];
        });
    }, [wordPool, usedWords, wordsTyped]);

    // Start game
    const startGame = async () => {
        setLoading(true);
        resetGame();
        setGameOver(false);
        setCurrentInput('');
        setActiveWords([]);
        setUsedWords(new Set());
        setWordsTyped(0);

        // Fetch initial words
        const words = await fetchWords();
        setWordPool(words);
        setLoading(false);
        setGameStarted(true);

        // Add first few words with delay
        setTimeout(() => addWord(), 500);
        setTimeout(() => addWord(), 1500);
        setTimeout(() => addWord(), 2500);
    };

    // Handle word miss
    const handleMiss = (word: Word) => {
        setActiveWords((prev) => prev.filter((w) => w.id !== word.id));
        decrementLife();
        resetStreak();
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCurrentInput(value);

        // Check if any word matches
        const matchedWord = activeWords.find(
            (w) => w.text.toLowerCase() === value.toLowerCase()
        );

        if (matchedWord) {
            // Word typed correctly!
            setActiveWords((prev) => prev.filter((w) => w.id !== matchedWord.id));
            const comboMultiplier = Math.min(Math.floor(currentStreak / 3) + 1, 5);
            const points = 10 * comboMultiplier;
            incrementScore(points);
            incrementStreak();
            incrementWordsTyped();
            setCurrentInput('');

            // Increment local words typed counter
            const newWordsTyped = wordsTyped + 1;
            setWordsTyped(newWordsTyped);

            // Add new word
            setTimeout(addWord, 1000);

            // Check for badges
            if (currentStreak === 5) addBadge('Streak Master');
            if (currentStreak === 10) addBadge('Lightning Speed');
            if (score > 100) addBadge('Century Club');
        }
    };

    // Game loop
    useEffect(() => {
        if (!gameStarted || gameOver) return;

        // Dynamic spawn rate based on level
        const spawnIntervalMap: Record<number, number> = {
            1: 4500, // Very slow spawn for Level 1 (was 3000)
            2: 3500,
            3: 2500
        };
        const intervalTime = spawnIntervalMap[selectedLevel] || 3000;

        // Dynamic max words on screen
        const maxWordsMap: Record<number, number> = {
            1: 3, // Max 3 words for Level 1 to reduce clutter
            2: 4,
            3: 5
        };
        const maxWords = maxWordsMap[selectedLevel] || 5;

        const interval = setInterval(() => {
            if (activeWords.length < maxWords) {
                addWord();
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [gameStarted, gameOver, activeWords.length, addWord, selectedLevel]);

    // Check game over
    useEffect(() => {
        if (life === 0 && gameStarted) {
            setGameOver(true);
            setGameStarted(false);
        }
    }, [life, gameStarted]);

    return (
        <main className="min-h-screen p-8 relative overflow-hidden">
            <Link href="/" className="absolute top-4 left-4 btn-secondary text-sm">
                ← Back to Home
            </Link>

            {/* Header */}
            <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
                <div className="flex gap-8 bg-white rounded-kids px-6 py-4 shadow-lg">
                    <div>
                        <span className="text-gray-600">Score:</span>
                        <span className="text-2xl font-bold text-kids-blue ml-2">{score}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Lives:</span>
                        <span className="text-2xl font-bold text-kids-pink ml-2">
                            {'❤️'.repeat(life)}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Combo:</span>
                        <span className="text-2xl font-bold text-kids-yellow ml-2">
                            {currentStreak > 0 ? `🔥${currentStreak}` : '0'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative h-[600px] max-w-6xl mx-auto bg-white/30 rounded-kids backdrop-blur-sm">
                <AnimatePresence>
                    {activeWords.map((word) => (
                        <FallingWord
                            key={word.id}
                            word={word}
                            speed={word.speed}
                            onMiss={handleMiss}
                            position={word.position}
                        />
                    ))}
                </AnimatePresence>

                {/* Ground line */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-kids-pink"></div>
            </div>

            {/* Input Area */}
            {gameStarted && !gameOver && (
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="max-w-2xl mx-auto mt-8"
                >
                    <input
                        type="text"
                        value={currentInput}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setCurrentInput('');
                            }
                        }}
                        autoFocus
                        className="w-full text-3xl text-center font-bold py-4 px-6 rounded-kids border-4 border-kids-blue focus:outline-none focus:border-kids-pink"
                        placeholder="Type the words here..."
                    />
                    <KeyboardGuide highlightKey={currentInput[currentInput.length - 1]} />
                </motion.div>
            )}

            {/* Loading Screen */}
            {loading && (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                >
                    <div className="bg-white rounded-3xl p-12 shadow-2xl text-center">
                        <div className="text-6xl mb-6 animate-bounce">☔</div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">
                            Loading Words...
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Preparing your typing challenge!
                        </p>
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-kids-blue"></div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Start Screen */}
            {!gameStarted && !gameOver && !loading && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="game-card text-center">
                        <h1 className="text-5xl font-bold text-kids-blue mb-6">Acid Rain ☔</h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Type the falling words before they hit the ground!
                        </p>

                        <div className="mb-8">
                            <label className="text-lg font-bold text-gray-700 mb-3 block">
                                Select Level:
                            </label>
                            <div className="flex gap-4 justify-center">
                                {[1, 2, 3].map((lvl) => (
                                    <button
                                        key={lvl}
                                        onClick={() => setSelectedLevel(lvl)}
                                        className={`px-6 py-3 rounded-kids font-bold transition-all ${selectedLevel === lvl
                                            ? 'bg-kids-blue text-white scale-110'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        Level {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={startGame} className="btn-primary text-2xl">
                            Start Game! 🚀
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="game-card text-center max-w-2xl w-full bg-white rounded-3xl p-8 shadow-2xl"
                    >
                        <h1 className="text-5xl font-bold text-kids-pink mb-6">Game Over!</h1>
                        <p className="text-3xl font-bold text-kids-blue mb-4">
                            Final Score: {score}
                        </p>
                        <p className="text-xl text-gray-600 mb-4">
                            Words Completed: {totalWordsTyped}
                        </p>
                        <p className="text-xl text-gray-600 mb-8">
                            Best Streak: {currentStreak} 🔥
                        </p>
                        <ShareScore score={score} gameName="Acid Rain" />
                        <button onClick={startGame} className="btn-primary text-2xl mt-8">
                            Play Again! 🎮
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </main>
    );
}

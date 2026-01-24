'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore, Word } from '@/store/useGameStore';
import { ShareScore } from '@/components/game/ShareScore';

export function SpellingBloomGame() {
    const {
        score,
        level,
        currentStreak,
        incrementScore,
        incrementStreak,
        resetStreak,
        incrementWordsTyped,
        addBadge,
        resetGame,
    } = useGameStore();

    const [gameStarted, setGameStarted] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [words, setWords] = useState<Word[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showFlowerAnimation, setShowFlowerAnimation] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Shuffle options when word changes
    useEffect(() => {
        if (words[currentWordIndex]) {
            const currentWord = words[currentWordIndex];
            const options = [currentWord.text, currentWord.wrongSpelling].filter((opt): opt is string => Boolean(opt));
            const shuffled = [...options].sort(() => Math.random() - 0.5);
            setShuffledOptions(shuffled);
        }
    }, [currentWordIndex, words]);

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

    // Fallback words with wrong spellings
    const FALLBACK_WORDS: Word[] = [
        { id: 'fb1', text: 'happy', wrongSpelling: 'hapy' },
        { id: 'fb2', text: 'little', wrongSpelling: 'litle' },
        { id: 'fb3', text: 'friend', wrongSpelling: 'freind' },
        { id: 'fb4', text: 'school', wrongSpelling: 'scool' },
        { id: 'fb5', text: 'sister', wrongSpelling: 'sistr' },
        { id: 'fb6', text: 'brother', wrongSpelling: 'bruther' },
        { id: 'fb7', text: 'mother', wrongSpelling: 'muther' },
        { id: 'fb8', text: 'father', wrongSpelling: 'fadur' },
        { id: 'fb9', text: 'animal', wrongSpelling: 'aminal' },
        { id: 'fb10', text: 'banana', wrongSpelling: 'bannana' }
    ];

    // Fetch words from API
    const fetchWords = async () => {
        try {
            // Map levels to difficulties - Aggressive Scaling
            const levelDifficultyMap: Record<number, string> = {
                1: 'easy',
                2: 'hard',
                3: 'expert'
            };

            const difficulty = levelDifficultyMap[selectedLevel] || 'easy';
            const timestamp = Date.now(); // Add timestamp to ensure unique words each time
            const response = await fetch(
                `/api/generate?level=${selectedLevel}&mode=spelling-bloom&count=10&difficulty=${difficulty}&timestamp=${timestamp}`
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success || !data.words) {
                throw new Error(data.message || 'Failed to fetch words');
            }

            return data.words;
        } catch (error) {
            console.error('Failed to fetch words:', error);
            // Return fallback words instead of throwing
            return FALLBACK_WORDS;
        }
    };

    // Start game
    const startGame = async () => {
        setLoading(true);
        setError(null);
        resetGame();
        setGameComplete(false);
        setCurrentWordIndex(0);
        setQuestionsAnswered(0);
        setCorrectAnswers(0);
        setSelectedAnswer(null);
        setIsCorrect(null);

        try {
            const fetchedWords = await fetchWords();
            if (fetchedWords.length > 0) {
                setWords(fetchedWords);
                setGameStarted(true);
                speakWord(fetchedWords[0].text);
            } else {
                setError('No words found. Please try again.');
                setGameStarted(false);
            }
        } catch (err) {
            setError('Oops! Something went wrong while loading the game. Please check your connection and try again.');
            setGameStarted(false);
        } finally {
            setLoading(false);
        }
    };

    // Handle answer selection
    const handleAnswer = (answer: string) => {
        if (selectedAnswer !== null) return;

        const currentWord = words[currentWordIndex];
        const correct = answer === currentWord.text;

        setSelectedAnswer(answer);
        setIsCorrect(correct);

        if (correct) {
            setShowFlowerAnimation(true);
            setCorrectAnswers(prev => prev + 1);
            const comboMultiplier = Math.min(Math.floor(currentStreak / 3) + 1, 3);
            const points = 15 * comboMultiplier;
            incrementScore(points);
            incrementStreak();
            incrementWordsTyped();

            // Check for badges
            if (currentStreak === 5) addBadge('Perfect Speller');
            if (currentStreak === 10) addBadge('Spelling Bee Champion');
            if (score > 150) addBadge('Bloom Master');

            setTimeout(() => setShowFlowerAnimation(false), 1500);
        } else {
            resetStreak();
        }

        // Move to next word after delay
        setTimeout(() => {
            const nextIndex = currentWordIndex + 1;
            setQuestionsAnswered(questionsAnswered + 1);

            if (nextIndex < words.length) {
                setCurrentWordIndex(nextIndex);
                setSelectedAnswer(null);
                setIsCorrect(null);
                speakWord(words[nextIndex].text);
            } else {
                setGameComplete(true);
            }
        }, 2000);
    };

    const currentWord = words[currentWordIndex];
    const progress = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

    return (
        <main className="min-h-screen p-8 relative overflow-hidden">
            <Link href="/" className="absolute top-4 left-4 btn-secondary text-sm">
                ← Back to Home
            </Link>

            {/* Header */}
            <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
                <div className="flex gap-8 bg-white rounded-kids px-6 py-4 shadow-lg">
                    <div>
                        <span className="text-gray-600">Score:</span>
                        <span className="text-2xl font-bold text-kids-pink ml-2">{score}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Streak:</span>
                        <span className="text-2xl font-bold text-kids-yellow ml-2">
                            {currentStreak > 0 ? `🌟${currentStreak}` : '0'}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Question:</span>
                        <span className="text-2xl font-bold text-kids-purple ml-2">
                            {currentWordIndex + 1}/{words.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {gameStarted && !gameComplete && (
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="h-4 bg-white/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-kids-pink"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            )}

            {/* Game Area */}
            {gameStarted && !gameComplete && currentWord && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="game-card text-center relative">
                        {/* Flower Animation */}
                        <AnimatePresence>
                            {showFlowerAnimation && (
                                <motion.div
                                    initial={{ scale: 0, rotate: 0 }}
                                    animate={{ scale: 3, rotate: 360 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl z-10"
                                >
                                    🌸
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <h2 className="text-3xl font-bold text-kids-purple mb-8">
                            Which spelling is correct?
                        </h2>

                        {/* Speaker Button */}
                        <button
                            onClick={() => speakWord(currentWord.text)}
                            className="mb-8 bg-kids-blue hover:bg-blue-400 text-white text-4xl w-20 h-20 rounded-full shadow-lg transition-transform hover:scale-110"
                        >
                            🔊
                        </button>

                        {/* Answer Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            {shuffledOptions.map((option, idx) => {
                                if (!option) return null;

                                const isSelected = selectedAnswer === option;
                                const showResult = selectedAnswer !== null;
                                const isCorrectAnswer = option === currentWord.text;

                                let buttonClass = 'bg-white hover:bg-gray-50 text-gray-800 border-4 border-gray-300';

                                if (showResult) {
                                    if (isSelected && isCorrect) {
                                        buttonClass = 'bg-kids-green text-white border-kids-green scale-110';
                                    } else if (isSelected && !isCorrect) {
                                        buttonClass = 'bg-red-400 text-white border-red-400 scale-90';
                                    } else if (!isSelected && isCorrectAnswer) {
                                        buttonClass = 'bg-kids-green text-white border-kids-green scale-105';
                                    }
                                }

                                return (
                                    <motion.button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        disabled={selectedAnswer !== null}
                                        className={`${buttonClass} text-4xl font-bold py-8 px-12 rounded-kids transition-all duration-300 shadow-xl`}
                                        whileHover={{ scale: selectedAnswer ? 1 : 1.05 }}
                                        whileTap={{ scale: selectedAnswer ? 1 : 0.95 }}
                                    >
                                        {option}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Feedback */}
                        {selectedAnswer !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8"
                            >
                                <p
                                    className={`text-2xl font-bold ${isCorrect ? 'text-kids-green' : 'text-red-500'
                                        }`}
                                >
                                    {isCorrect ? '🎉 Correct! Great job!' : '❌ Oops! Try again next time!'}
                                </p>
                            </motion.div>
                        )}
                    </div>
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
                        <div className="text-6xl mb-6 animate-bounce">🌸</div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">
                            Loading Words...
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Preparing spelling challenges!
                        </p>
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-kids-pink"></div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Start Screen */}
            {!gameStarted && !gameComplete && !loading && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="game-card text-center min-w-[400px]">
                        <h1 className="text-5xl font-bold text-kids-pink mb-6">Spelling Bloom 🌸</h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Choose the correct spelling and watch flowers bloom!
                        </p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-kids text-red-600"
                            >
                                <p className="font-bold mb-2">Oops!</p>
                                <p>{error}</p>
                                <button
                                    onClick={startGame}
                                    className="mt-4 text-sm font-bold underline hover:no-underline"
                                >
                                    Try Again
                                </button>
                            </motion.div>
                        )}

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
                                            ? 'bg-kids-pink text-white scale-110'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        Level {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={startGame} className="btn-primary text-2xl">
                            Start Game! 🌺
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Game Complete Screen */}
            {gameComplete && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="game-card text-center">
                        <h1 className="text-5xl font-bold text-kids-pink mb-6">Well Done! 🎊</h1>
                        <div className="text-8xl mb-6">🌸🌼🌺</div>
                        <p className="text-2xl font-bold text-kids-blue mb-4">
                            Final Score: {score}
                        </p>
                        <p className="text-xl text-gray-600 mb-2">
                            Correct Answers: {correctAnswers} / {words.length}
                        </p>
                        <p className="text-xl text-gray-600 mb-8">
                            Best Streak: {currentStreak} 🌟
                        </p>
                        <div className="mb-8">
                            <ShareScore score={score} gameName="Spelling Bloom" />
                        </div>
                        <button onClick={startGame} className="btn-primary text-2xl">
                            Play Again! 🎮
                        </button>
                    </div>
                </motion.div>
            )}
        </main>
    );
}

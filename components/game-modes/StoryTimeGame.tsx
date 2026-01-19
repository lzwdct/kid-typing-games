'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameStore } from '@/store/useGameStore';
import { ShareScore } from '@/components/game/ShareScore';

interface StorySegment {
    id: string;
    text: string;
    completed: boolean;
}

export function StoryTimeGame() {
    const {
        score,
        incrementScore,
        incrementWordsTyped,
        addBadge,
        resetGame,
    } = useGameStore();

    const [story, setStory] = useState<StorySegment[]>([]);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
    const [currentInput, setCurrentInput] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [errors, setErrors] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [totalChars, setTotalChars] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch story from API
    const fetchStory = async () => {
        setLoading(true);
        try {
            const timestamp = Date.now();
            const response = await fetch(
                `/api/generate?level=${selectedLevel}&mode=story-time&count=1&timestamp=${timestamp}`
            );
            const data = await response.json();

            if (data.success && data.story) {
                // Split story into sentences
                const sentences = data.story
                    .match(/[^.!?]+[.!?]+/g)
                    ?.map((sentence: string, index: number) => ({
                        id: `segment-${index}`,
                        text: sentence.trim(),
                        completed: false,
                    })) || [];

                setStory(sentences);
            }
        } catch (error) {
            console.error('Failed to fetch story:', error);
        } finally {
            setLoading(false);
        }
    };

    // Start game
    const startGame = async () => {
        resetGame();
        setGameStarted(true);
        setGameOver(false);
        setCurrentInput('');
        setCurrentSegmentIndex(0);
        setErrors(0);
        setStartTime(Date.now());
        setWpm(0);
        setAccuracy(100);
        setTotalChars(0);

        await fetchStory();
    };

    // Calculate WPM and accuracy
    const calculateStats = () => {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        const wordsTyped = totalChars / 5; // average word length
        const currentWpm = Math.round(wordsTyped / timeElapsed);
        const currentAccuracy = totalChars > 0 ? Math.round(((totalChars - errors) / totalChars) * 100) : 100;

        setWpm(currentWpm);
        setAccuracy(currentAccuracy);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (!story[currentSegmentIndex]) return;

        const targetText = story[currentSegmentIndex].text;

        // Only allow typing if it matches the target character-by-character
        let isValid = true;
        for (let i = 0; i < value.length; i++) {
            if (value[i] !== targetText[i]) {
                isValid = false;
                setErrors(prev => prev + 1);
                return; // Don't update input if character is wrong
            }
        }

        // Don't allow typing beyond the target length
        if (value.length > targetText.length) {
            return;
        }

        setCurrentInput(value);

        // Check if user completed the segment
        if (value === targetText) {
            // Correct completion!
            const newStory = [...story];
            newStory[currentSegmentIndex].completed = true;
            setStory(newStory);

            // Calculate points based on accuracy
            const segmentLength = targetText.length;
            const points = Math.round((segmentLength / 5) * 10); // 10 points per word
            incrementScore(points);

            // Count words typed
            const wordsInSegment = targetText.split(/\s+/).length;
            for (let i = 0; i < wordsInSegment; i++) {
                incrementWordsTyped();
            }

            setTotalChars(prev => prev + segmentLength);

            // Move to next segment
            if (currentSegmentIndex < story.length - 1) {
                setCurrentSegmentIndex(prev => prev + 1);
                setCurrentInput('');
            } else {
                // Story completed!
                setGameOver(true);
                addBadge('Story Master');
                if (accuracy >= 95) addBadge('Perfect Typist');
            }
        }
    };

    // Update stats periodically
    useEffect(() => {
        if (gameStarted && !gameOver && startTime > 0) {
            const interval = setInterval(calculateStats, 1000);
            return () => clearInterval(interval);
        }
    }, [gameStarted, gameOver, startTime, totalChars, errors]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-kids-purple to-kids-pink p-8">
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
                        📖 Story Time
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
                        <div className="text-6xl mb-6">📚</div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">
                            Type a Story!
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Read the story and type it exactly as shown. Practice your typing while enjoying fun stories!
                        </p>

                        <div className="mb-8">
                            <label className="block text-gray-700 font-bold mb-4">
                                Choose Story Length:
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
                                        {level === 1 ? 'Short' : level === 2 ? 'Medium' : 'Long'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={startGame}
                            className="px-12 py-4 bg-gradient-to-r from-kids-green to-kids-blue text-white rounded-full text-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            Start Reading! 📖
                        </button>
                    </motion.div>
                ) : loading ? (
                    /* Loading Screen */
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                    >
                        <div className="text-6xl mb-6 animate-bounce">📚</div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-800">
                            Creating Your Story...
                        </h2>
                        <p className="text-gray-600 mb-8 text-lg">
                            Our AI is writing a fun story just for you!
                        </p>
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-kids-purple"></div>
                        </div>
                    </motion.div>
                ) : (
                    /* Game Screen */
                    <div className="space-y-6">
                        {/* Stats Bar */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg flex justify-around">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-kids-purple">{score}</div>
                                <div className="text-sm text-gray-600">Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-kids-blue">{wpm}</div>
                                <div className="text-sm text-gray-600">WPM</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-kids-green">{accuracy}%</div>
                                <div className="text-sm text-gray-600">Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-kids-pink">
                                    {currentSegmentIndex + 1}/{story.length}
                                </div>
                                <div className="text-sm text-gray-600">Progress</div>
                            </div>
                        </div>

                        {/* Story Display with Inline Typing */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg space-y-8">
                            {story.map((segment, index) => (
                                <motion.div
                                    key={segment.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="space-y-3 pb-4 border-b border-gray-200 last:border-b-0"
                                >
                                    {/* Reference Text */}
                                    <div
                                        className={`p-4 rounded-lg text-lg font-mono break-words ${segment.completed
                                            ? 'bg-kids-green bg-opacity-20 text-gray-500'
                                            : index === currentSegmentIndex
                                                ? 'bg-kids-yellow bg-opacity-30 text-gray-800 font-bold'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        {segment.text}
                                    </div>

                                    {/* Typing Input - Only show for current or completed segments */}
                                    {index <= currentSegmentIndex && !gameOver && (
                                        <div className="relative">
                                            {/* Character-by-character display */}
                                            <div className="p-4 bg-gray-50 rounded-lg font-mono text-lg border-2 border-kids-blue break-words whitespace-pre-wrap">
                                                {segment.text.split('').map((char, charIndex) => {
                                                    const typedChar = index === currentSegmentIndex
                                                        ? currentInput[charIndex]
                                                        : segment.completed
                                                            ? segment.text[charIndex]
                                                            : undefined;

                                                    const isTyped = typedChar !== undefined;
                                                    const isCorrect = typedChar === char;
                                                    const isCurrent = index === currentSegmentIndex && charIndex === currentInput.length;

                                                    return (
                                                        <span
                                                            key={charIndex}
                                                            className={`${isCurrent
                                                                ? 'bg-kids-blue bg-opacity-30 animate-pulse'
                                                                : isTyped
                                                                    ? isCorrect
                                                                        ? 'text-green-600 bg-green-100'
                                                                        : 'text-red-600 bg-red-100'
                                                                    : 'text-gray-400'
                                                                }`}
                                                        >
                                                            {char === ' ' ? '\u00A0' : char}
                                                        </span>
                                                    );
                                                })}
                                            </div>

                                            {/* Invisible input for actual typing */}
                                            {index === currentSegmentIndex && (
                                                <input
                                                    type="text"
                                                    value={currentInput}
                                                    onChange={handleInputChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-default"
                                                    autoFocus
                                                />
                                            )}

                                            {/* Completed checkmark */}
                                            {segment.completed && (
                                                <div className="absolute right-2 top-2 text-2xl">✅</div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Instruction */}
                            {!gameOver && (
                                <div className="text-center text-gray-500 text-sm mt-6">
                                    💡 Type the text shown above. Click anywhere to start typing.
                                </div>
                            )}
                        </div>

                        {/* Game Over */}
                        {gameOver && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-2xl p-12 shadow-2xl text-center"
                            >
                                <div className="text-6xl mb-6">🎉</div>
                                <h2 className="text-3xl font-bold mb-4 text-gray-800">
                                    Story Complete!
                                </h2>
                                <p className="text-gray-600 mb-6 text-lg">
                                    Great job! You typed the whole story!
                                </p>
                                <div className="flex gap-6 justify-center mb-8">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-kids-blue">{wpm}</div>
                                        <div className="text-sm text-gray-600">WPM</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-kids-green">{accuracy}%</div>
                                        <div className="text-sm text-gray-600">Accuracy</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-kids-purple">{score}</div>
                                        <div className="text-sm text-gray-600">Score</div>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <ShareScore score={score} gameName="Story Time" />
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={startGame}
                                        className="px-8 py-3 bg-kids-blue text-white rounded-full font-bold hover:shadow-lg transition-all"
                                    >
                                        New Story
                                    </button>
                                    <Link
                                        href="/"
                                        className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:shadow-lg transition-all"
                                    >
                                        Home
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareScoreProps {
    score: number;
    gameName: string; // e.g., "Acid Rain", "Letter Pop"
}

export function ShareScore({ score, gameName }: ShareScoreProps) {
    const [showCopied, setShowCopied] = useState(false);

    // Share Text
    const text = `I just scored ${score} points in ${gameName}! Can you beat my high score? 🏆\n\nPlay free typing games for kids here: https://kids-typing-game.pages.dev`;
    const encodedText = encodeURIComponent(text);

    // Social Links
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://kids-typing-game.pages.dev')}&quote=${encodedText}`;

    // Copy to Clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 mt-8">
            <h3 className="text-xl font-bold text-gray-700">Challenge your Friends! 🌟</h3>

            <div className="flex gap-4">
                {/* Twitter Button */}
                <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share
                </a>

                {/* Facebook Button */}
                <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 2.848-6.32 6.191-6.32 1.602 0 3.183.123 3.183.123v3.472h-1.792c-2.032 0-2.668 1.257-2.668 2.547v1.76h3.912l-.625 3.667h-3.287v7.98h-4.914z" />
                    </svg>
                    Share
                </a>

                {/* Copy Button */}
                <div className="relative">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 hover:scale-105 transition-all shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy
                    </button>

                    <AnimatePresence>
                        {showCopied && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-3 rounded shadow-lg whitespace-nowrap"
                            >
                                Copied!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

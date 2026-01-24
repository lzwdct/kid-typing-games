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

                {/* Threads Button */}
                <a
                    href={`https://www.threads.net/intent/post?text=${encodedText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg border border-gray-700"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 192 192">
                        <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4485 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7729 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 59.2915 97.2435 59.2915H97.5638C113.679 59.4124 123.018 69.4687 124.646 86.8643C116.35 84.8143 107.037 83.6953 97.5303 83.6953C67.3197 83.6953 48 95.8906 48 116.488C48 131.815 60.5925 142.221 78.4116 142.221C94.0152 142.221 106.398 134.502 113.238 122.955C118.91 133.504 128.596 139.673 140.231 139.673C155.158 139.673 162.909 127.321 163.633 113.376L164.062 105.105H149.33L148.974 113.376C148.552 121.571 145.454 125.127 140.231 125.127C133.568 125.127 129.897 119.508 128.318 108.638C136.257 111.41 144.184 113.914 152.028 116.126C152.544 114.159 152.88 112.146 153.02 110.091C154.542 87.7262 141.537 88.9883 141.537 88.9883ZM78.4116 127.674C68.9723 127.674 62.5471 122.569 62.5471 116.488C62.5471 106.634 74.0664 98.2432 97.5303 98.2432C102.668 98.2432 107.491 98.5369 111.968 99.0838C109.972 116.471 100.864 127.674 78.4116 127.674Z" />
                    </svg>
                    Threads
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

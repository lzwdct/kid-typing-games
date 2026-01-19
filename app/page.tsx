'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';

export default function Home() {
  const { maxStreak, badges, totalWordsTyped } = useGameStore();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          English Typing Adventure! 🚀
        </h1>
        <p className="text-2xl text-white drop-shadow-md">
          Learn to type and spell English words while having fun!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl w-full">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/acid-rain" aria-label="Play Acid Rain typing game">
            <div className="game-card cursor-pointer">
              <div className="text-6xl mb-4 text-center" aria-hidden="true">☔</div>
              <h2 className="text-3xl font-bold text-kids-blue mb-3 text-center">
                Acid Rain
              </h2>
              <p className="text-gray-600 text-center text-lg">
                Type the falling words before they hit the ground! Fast-paced action game.
              </p>
              <div className="mt-6 text-center">
                <span className="bg-kids-blue text-white px-4 py-2 rounded-full text-sm font-bold">
                  Defense Mode
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/spelling-bloom" aria-label="Play Spelling Bloom spelling game">
            <div className="game-card cursor-pointer">
              <div className="text-6xl mb-4 text-center" aria-hidden="true">🌸</div>
              <h2 className="text-3xl font-bold text-kids-pink mb-3 text-center">
                Spelling Bloom
              </h2>
              <p className="text-gray-600 text-center text-lg">
                Choose the correct spelling and watch flowers bloom! Learn tricky words.
              </p>
              <div className="mt-6 text-center">
                <span className="bg-kids-pink text-white px-4 py-2 rounded-full text-sm font-bold">
                  Discovery Mode
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/story-time" aria-label="Play Story Time reading game">
            <div className="game-card cursor-pointer">
              <div className="text-6xl mb-4 text-center" aria-hidden="true">📖</div>
              <h2 className="text-3xl font-bold text-kids-purple mb-3 text-center">
                Story Time
              </h2>
              <p className="text-gray-600 text-center text-lg">
                Read and type fun stories! Practice typing while enjoying adventures.
              </p>
              <div className="mt-6 text-center">
                <span className="bg-kids-purple text-white px-4 py-2 rounded-full text-sm font-bold">
                  Story Mode
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/letter-pop" aria-label="Play Letter Pop game">
            <div className="game-card cursor-pointer">
              <div className="text-6xl mb-4 text-center" aria-hidden="true">🎈</div>
              <h2 className="text-3xl font-bold text-kids-blue mb-3 text-center">
                Letter Pop
              </h2>
              <p className="text-gray-600 text-center text-lg">
                Pop balloons by typing letters! Fast-paced letter recognition game.
              </p>
              <div className="mt-6 text-center">
                <span className="bg-kids-blue text-white px-4 py-2 rounded-full text-sm font-bold">
                  Action Mode
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/word-race" aria-label="Play Word Race speed game">
            <div className="game-card cursor-pointer">
              <div className="text-6xl mb-4 text-center" aria-hidden="true">🏁</div>
              <h2 className="text-3xl font-bold text-kids-yellow mb-3 text-center">
                Word Race
              </h2>
              <p className="text-gray-600 text-center text-lg">
                Type words as fast as you can! Race against the clock for 60 seconds.
              </p>
              <div className="mt-6 text-center">
                <span className="bg-kids-yellow text-white px-4 py-2 rounded-full text-sm font-bold">
                  Speed Mode
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 game-card max-w-2xl w-full"
      >
        <h3 className="text-2xl font-bold text-center mb-6 text-kids-purple">
          Your Progress
        </h3>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-kids-blue">{totalWordsTyped}</div>
            <div className="text-gray-600 mt-2">Words Typed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-kids-pink">{maxStreak}</div>
            <div className="text-gray-600 mt-2">Best Streak</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-kids-purple">{badges.length}</div>
            <div className="text-gray-600 mt-2">Badges Earned</div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

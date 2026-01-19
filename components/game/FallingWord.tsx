'use client';

import { motion } from 'framer-motion';
import { Word } from '@/store/useGameStore';

interface FallingWordProps {
  word: Word;
  speed: number;
  onMiss: (word: Word) => void;
  position: number;
}

export function FallingWord({ word, speed, onMiss, position }: FallingWordProps) {
  return (
    <motion.div
      initial={{ y: -50, opacity: 1 }}
      animate={{ y: 600 }}
      transition={{
        duration: speed,
        ease: 'linear',
      }}
      onAnimationComplete={() => onMiss(word)}
      className="absolute text-2xl font-bold text-kids-blue drop-shadow-lg"
      style={{
        left: `${position}%`,
      }}
    >
      <div className="bg-white px-4 py-2 rounded-kids shadow-xl border-4 border-kids-blue">
        {word.text}
      </div>
    </motion.div>
  );
}

import type { Metadata } from 'next';
import { WordRaceGame } from '@/components/game-modes/WordRaceGame';

export const metadata: Metadata = {
  title: "Word Race | Fast Typing Challenge for Kids",
  description: "Race against the clock in Word Race! Type as many words as you can in 60 seconds to improve your typing speed.",
  keywords: ["word race typing", "fast typing for kids", "typing speed challenge"],
};

export default function WordRacePage() {
  return <WordRaceGame />;
}

import type { Metadata } from 'next';
import { SpellingBloomGame } from '@/components/game-modes/SpellingBloomGame';

export const metadata: Metadata = {
  title: "Spelling Bloom | Kids Spelling & Typing Game",
  description: "Learn English spelling with Spelling Bloom! Choose the correct spelling and watch the flowers bloom in this educational game for kids.",
  keywords: ["spelling bloom", "kids spelling game", "learn english spelling", "typing for kids"],
};

export default function SpellingBloomPage() {
  return <SpellingBloomGame />;
}

import type { Metadata } from 'next';
import { AcidRainGame } from '@/components/game-modes/AcidRainGame';

export const metadata: Metadata = {
  title: "Acid Rain | Fast-Paced Kids Typing Game",
  description: "Type the falling words before they hit the ground in Acid Rain! A fun way for kids to practice typing speed and accuracy.",
  keywords: ["acid rain typing game", "kids typing practice", "typing speed game"],
};

export default function AcidRainPage() {
  return <AcidRainGame />;
}

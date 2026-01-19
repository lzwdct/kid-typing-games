import type { Metadata } from 'next';
import { LetterPopGame } from '@/components/game-modes/LetterPopGame';

export const metadata: Metadata = {
  title: "Letter Pop | Kids Letter Recognition Game",
  description: "Pop balloons by typing letters in Letter Pop! A fun and simple game for kids to learn the keyboard and letter recognition.",
  keywords: ["letter pop game", "kids letter recognition", "keyboard learning for kids"],
};

export default function LetterPopPage() {
  return <LetterPopGame />;
}

import type { Metadata } from 'next';
import { StoryTimeGame } from '@/components/game-modes/StoryTimeGame';

export const metadata: Metadata = {
  title: "Story Time | Interactive Typing Stories for Kids",
  description: "Practice typing while reading fun stories! Story Time helps kids improve their typing skills through engaging narratives.",
  keywords: ["story time typing", "kids typing stories", "interactive reading game"],
};

export default function StoryTimePage() {
  return <StoryTimeGame />;
}

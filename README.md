# Kids English Typing Game Platform 🎮

A fun and educational typing game platform for children (ages 7-12) to learn English spelling and improve typing skills.

## Features

### 🎯 Two Game Modes

1. **Acid Rain (Defense Mode)** ☔
   - Type falling words before they hit the ground
   - Fast-paced action gameplay
   - Combo system for bonus points
   - Progressive difficulty

2. **Spelling Bloom (Discovery Mode)** 🌸
   - Choose the correct spelling from two options
   - Beautiful flower bloom animations
   - Learn tricky spellings
   - Audio pronunciation support

### 🚀 Key Features

- **Kid-Friendly Design**: Pastel colors, rounded corners, and playful fonts
- **High-Quality TTS**: Enhanced voice selection for clear, natural pronunciation
- **Dynamic AI Content**: Cloudflare Workers AI generates age-appropriate words
- **Progressive Difficulty**: Words get longer and harder as you improve
  - Easy: 3-4 letter words
  - Medium: 5-6 letter words
  - Hard: 7-8 letter words
  - Expert: 9+ letter words
- **Smart Word Management**: No duplicate words on screen, unique word pool
- **Progress Tracking**: Score, streaks, and badge system
- **Cloudflare Analytics**: Track user engagement and site usage
- **Responsive**: Works on desktop and tablet devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: Zustand
- **AI**: Cloudflare Workers AI (llama-3-8b-instruct)
- **Hosting**: Cloudflare Pages

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build

```bash
npm run build
```

## Project Structure

```
/app
  /acid-rain        # Acid Rain game page
  /spelling-bloom   # Spelling Bloom game page
  /api/generate     # Word generation API
  layout.tsx        # Root layout
  page.tsx          # Home page
  globals.css       # Global styles

/components
  /game
    FallingWord.tsx      # Falling word component
    KeyboardGuide.tsx    # Virtual keyboard guide

/store
  useGameStore.ts   # Zustand game state store
```

## Deployment to Cloudflare Pages

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy:
```bash
npm run build
wrangler pages deploy .next
```

4. Set up Workers AI binding in your Cloudflare dashboard

## Environment Variables

Create a `.env.local` file with:

```env
# Cloudflare Web Analytics Token (optional)
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_token_here
```

To get your Cloudflare Analytics token:
1. Go to https://dash.cloudflare.com/
2. Navigate to: Account > Analytics & Logs > Web Analytics
3. Create a new site or select existing
4. Copy the token from the setup script

For production with Cloudflare Workers AI, configure the AI binding in your `wrangler.toml`:

```toml
name = "kids-typing-game"
compatibility_date = "2024-01-01"

[ai]
binding = "AI"

[vars]
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN = "your_token_here"
```

## Game Modes

### Acid Rain
- Type words as they fall from the top
- Lose a life if a word hits the ground
- Build combos for bonus points
- **Progressive Difficulty**: Words automatically get longer as you type more
  - 0-10 words: Easy (3-4 letters)
  - 10-25 words: Medium (5-6 letters)
  - 25-50 words: Hard (7-8 letters)
  - 50+ words: Expert (9+ letters)
- New words fetched every 10 correct answers
- No duplicate words on screen simultaneously

### Spelling Bloom
- Choose between correct and incorrect spelling
- Beautiful flower animations on correct answers
- High-quality audio pronunciation for each word
- Increased difficulty across all levels
  - Level 1: Medium difficulty words
  - Level 2: Hard difficulty words
  - Level 3: Expert difficulty words
- Progress tracking

## Badges

Earn badges by achieving milestones:
- **Streak Master**: 5 words in a row
- **Lightning Speed**: 10 words in a row
- **Century Club**: Score over 100 points
- **Perfect Speller**: 5 correct spellings in a row
- **Spelling Bee Champion**: 10 correct spellings in a row
- **Bloom Master**: Score over 150 points

## License

MIT

## Credits

Created with Claude Code following the PTR (Project Transformation Roadmap) methodology.
# kid-typing-games

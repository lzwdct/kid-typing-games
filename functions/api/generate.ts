// Cloudflare Pages Function
import { Ai } from '@cloudflare/ai';

interface Env {
  AI?: any;
}

interface PagesContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
}

// Cache configuration
const CACHE_CONFIG = {
  words: {
    ttl: 3600, // 1 hour for word lists
    cacheName: 'typing-game-words-cache',
  },
  stories: {
    ttl: 7200, // 2 hours for stories
    cacheName: 'typing-game-stories-cache',
  },
};

const STORY_TOPICS = [
  'a friendly dragon', 'a space adventure', 'a magical forest', 'a day at the beach',
  'a funny robot', 'a brave superhero', 'a lost puppy', 'a picnic in the park',
  'underwater exploration', 'a flying car', 'a delicious pizza party', 'a cute kitten',
  'a visiting alien', 'a hidden treasure', 'a magic school bus', 'a dinosaur friend',
  'jumping on the moon', 'a secret garden', 'a big storm', 'making a new friend',
  'a race car', 'a camping trip', 'growing a giant flower', 'baking cookies'
];

const WORD_CATEGORIES = [
  'animals', 'food', 'nature', 'space', 'fantasy', 'school', 'home', 'technology',
  'ocean', 'emotions', 'colors', 'clothing', 'sports', 'music', 'art', 'professions'
];

function shuffleArray(array: string[]): string[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateWrongSpelling(word: string): string {
  if (!word || word.length < 2) return word;
  const chars = word.split('');
  const idx = Math.floor(Math.random() * (chars.length - 1));
  [chars[idx], chars[idx + 1]] = [chars[idx + 1], chars[idx]];
  return chars.join('');
}

// Large fallback dictionary for when AI fails or times out
const FALLBACK_DICTIONARY = {
  easy: [
    'cat', 'dog', 'sun', 'run', 'fun', 'hat', 'bat', 'mat', 'can', 'pan',
    'big', 'red', 'fox', 'box', 'day', 'sky', 'cow', 'pig', 'bus', 'car',
    'toy', 'boy', 'nut', 'jam', 'egg', 'cup', 'bed', 'key', 'pen', 'map'
  ],
  medium: [
    'jump', 'play', 'blue', 'tree', 'ball', 'kite', 'fish', 'bird', 'star',
    'moon', 'cake', 'milk', 'book', 'door', 'home', 'park', 'duck', 'frog',
    'bear', 'lion', 'sand', 'wind', 'snow', 'rain', 'fire', 'gold', 'ship'
  ],
  hard: [
    'happy', 'smile', 'laugh', 'cloud', 'horse', 'snake', 'zebra', 'tiger',
    'apple', 'grape', 'lemon', 'melon', 'berry', 'peach', 'mango', 'pizza',
    'party', 'music', 'dance', 'beach', 'water', 'plant', 'flower', 'world'
  ],
  expert: [
    'adventure', 'beautiful', 'butterfly', 'chocolate', 'dinosaur', 'elephant',
    'fantastic', 'garden', 'holiday', 'island', 'jungle', 'kangaroo', 'lightning',
    'mountain', 'notebook', 'ocean', 'penguin', 'rainbow', 'sunshine', 'treasure'
  ]
};

function getRandomWordsFromDictionary(count: number, difficulty: string): string[] {
  const diffKey = difficulty as keyof typeof FALLBACK_DICTIONARY;
  let pool: string[] = [];

  if (diffKey === 'easy') pool = [...FALLBACK_DICTIONARY.easy];
  else if (diffKey === 'medium') pool = [...FALLBACK_DICTIONARY.easy, ...FALLBACK_DICTIONARY.medium];
  else if (diffKey === 'hard') pool = [...FALLBACK_DICTIONARY.medium, ...FALLBACK_DICTIONARY.hard];
  else pool = [...FALLBACK_DICTIONARY.hard, ...FALLBACK_DICTIONARY.expert];

  if (pool.length === 0) pool = FALLBACK_DICTIONARY.easy;

  return shuffleArray(pool).slice(0, count);
}

// Cache helper functions
async function getCachedResponse(cacheKey: string, cacheName: string): Promise<Response | null> {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      // Check if cache is still valid
      const cachedTime = cachedResponse.headers.get('X-Cache-Time');
      const ttl = parseInt(cachedResponse.headers.get('X-Cache-TTL') || '0');

      if (cachedTime && ttl) {
        const age = Date.now() - parseInt(cachedTime);
        if (age < ttl * 1000) {
          return cachedResponse;
        }
      }
    }
  } catch (error) {
    console.error('Cache retrieval error:', error);
  }
  return null;
}

async function setCachedResponse(
  cacheKey: string,
  cacheName: string,
  response: Response,
  ttl: number
): Promise<void> {
  try {
    const clonedResponse = response.clone(); // Clone immediately before any await
    const cache = await caches.open(cacheName);

    // Add cache metadata to headers
    const headers = new Headers(clonedResponse.headers);
    headers.set('X-Cache-Time', Date.now().toString());
    headers.set('X-Cache-TTL', ttl.toString());
    headers.set('Cache-Control', `public, max-age=${ttl}`);

    const cachedResponse = new Response(clonedResponse.body, {
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers,
    });

    await cache.put(cacheKey, cachedResponse);
  } catch (error) {
    console.error('Cache storage error:', error);
  }
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  let source = 'ai'; // Track where words came from for debugging

  try {
    const url = new URL(context.request.url);
    const difficulty = url.searchParams.get('difficulty') || 'easy';
    const mode = url.searchParams.get('mode') || 'acid-rain';
    const count = parseInt(url.searchParams.get('count') || '10', 10);
    const level = url.searchParams.get('level') || '1';

    // Create cache key based on request parameters
    const cacheKey = context.request.url; // Use full URL including query params to key off timestamp
    const cacheConfig = mode === 'story-time' ? CACHE_CONFIG.stories : CACHE_CONFIG.words;

    // Try to get cached response
    const cachedResponse = await getCachedResponse(cacheKey, cacheConfig.cacheName);
    if (cachedResponse) {
      console.log('Cache hit for:', cacheKey);
      return cachedResponse;
    }

    console.log('Cache miss for:', cacheKey);

    // Handle story-time mode separately
    if (mode === 'story-time' && context.env.AI) {
      try {
        const randomTopic = STORY_TOPICS[Math.floor(Math.random() * STORY_TOPICS.length)];

        const storyLengths: Record<string, string> = {
          '1': `Write a very short 2-3 sentence story for young children (ages 4-6) about "${randomTopic}". Use only simple 3-letter or 4-letter words. STRICTLY separate sentences with periods. Example: "The cat sat. The dog run."`,
          '2': `Write a short 3-4 sentence story for young children (ages 5-7) about "${randomTopic}". Use simple words. STRICTLY separate sentences with periods.`,
          '3': `Write a 4-5 sentence story for children (ages 6-8) about "${randomTopic}". STRICTLY separate sentences with periods. Keep the story short and fun.`,
        };

        const prompt = storyLengths[level] || storyLengths['1'];

        const ai = new Ai(context.env.AI);

        const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'You are a children\'s storyteller. Write age-appropriate, fun, and educational stories. ALWAYS use proper punctuation ending each sentence with a period. Do NOT use colons (:), semi-colons (;), or complex lists. Keep sentences simple.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        if (aiResponse && (aiResponse as any).response) {
          let storyText = (aiResponse as any).response;

          // Sanitize the story text to remove colons and other difficult punctuation
          storyText = storyText.replace(/[:;]/g, '.').replace(/\.{2,}/g, '.');

          const response = new Response(
            JSON.stringify({
              success: true,
              story: storyText.trim(),
              level,
              mode,
              source: 'ai'
            }),
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          // Cache the successful response
          context.waitUntil(setCachedResponse(cacheKey, cacheConfig.cacheName, response, cacheConfig.ttl));

          return response;
        }
      } catch (aiError) {
        console.error('AI story generation failed:', aiError);
        throw aiError; // Re-throw to be caught by outer catch
      }
    }

    let selectedWords: string[] = [];

    // Try to use AI to generate words
    if (context.env.AI) {
      try {
        const randomCategory = WORD_CATEGORIES[Math.floor(Math.random() * WORD_CATEGORIES.length)];

        const difficultyDescriptions: Record<string, string> = {
          easy: 'STRICTLY 3-letter simple words (e.g., cat, dog, sun)',
          medium: 'STRICTLY 4-5 letter common words (e.g., play, jump, tree)',
          hard: 'STRICTLY 6-8 letter words (e.g., school, rainbow, dolphin)',
          expert: 'STRICTLY 9+ letter challenging words (e.g., adventure, education, technology)',
        };

        const prompt = `Generate exactly ${count} unique English words related to "${randomCategory}" (or general kid-friendly words if needed) for kids learning typing. 
        Difficulty: ${difficultyDescriptions[difficulty] || difficultyDescriptions.easy}. 
        CRITICAL: All generated words MUST be exactly within the character length range specified for the difficulty. 
        Return ONLY the words as a comma-separated list, no explanations or numbering.`;

        const ai = new Ai(context.env.AI);

        const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates word lists for kids learning English. Always respond with only comma-separated words, nothing else.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        if (aiResponse && (aiResponse as any).response) {
          // Parse AI response
          const wordsText = (aiResponse as any).response.trim();
          const words: string[] = wordsText
            .split(/[,\n]+/)
            .map((w: string) => w.trim().toLowerCase().replace(/[^a-z]/g, ''))
            .filter((w: string) => w.length > 0);

          // Remove duplicates and limit to requested count
          const uniqueWords: string[] = Array.from(new Set(words));
          selectedWords = uniqueWords.slice(0, count);

          if (selectedWords.length > 0) {
            console.log(`AI generation successful: ${selectedWords.length} words`);
            source = 'ai';
          }
        }
      } catch (aiError) {
        console.error('AI generation failed, falling back to dictionary:', aiError);
        selectedWords = getRandomWordsFromDictionary(count, difficulty);
        source = 'dictionary_fallback_ai_error';
      }
    } else {
      // No AI env found
      console.log('No AI environment found, using dictionary');
      selectedWords = getRandomWordsFromDictionary(count, difficulty);
      source = 'dictionary_no_ai';
    }

    // Fill with dictionary words if AI didn't generate enough
    if (selectedWords.length < count) {
      console.log(`AI generated fewer words than requested (${selectedWords.length}/${count}), padding with dictionary.`);
      const paddingNeeded = count - selectedWords.length;
      const paddingWords = getRandomWordsFromDictionary(paddingNeeded, difficulty);

      for (const word of paddingWords) {
        if (!selectedWords.includes(word)) {
          selectedWords.push(word);
        }
      }
      if (selectedWords.length === 0) {
        // Total failure of AI to produce any valid words
        source = 'dictionary_fallback_zero_result';
        selectedWords = getRandomWordsFromDictionary(count, difficulty);
      } else if (source === 'ai') {
        source = 'ai_partial_dictionary_padded';
      }
    }

    // Format response
    const timestamp = Date.now();
    const formattedWords = selectedWords.map((word, index) => {
      const wordObj: any = {
        id: `word-${timestamp}-${index}`,
        text: word,
      };

      if (mode === 'spelling-bloom') {
        wordObj.wrongSpelling = generateWrongSpelling(word);
      }

      return wordObj;
    });

    const response = new Response(
      JSON.stringify({
        success: true,
        words: formattedWords,
        level,
        mode,
        source: source
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Cache the successful word generation response
    context.waitUntil(setCachedResponse(cacheKey, cacheConfig.cacheName, response, cacheConfig.ttl));

    return response;

  } catch (error) {
    console.error('Error generating words:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to generate words',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 200, // Return 200 to avoid Cloudflare error pages during debugging
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

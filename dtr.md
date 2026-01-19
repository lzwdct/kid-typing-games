🏗️ 시스템 아키텍처 (DTR)
1. 프로젝트 구조 (Directory Structure)
Plaintext

/src
  /app
    /spelling-bloom    # 맞춤법 틔움 게임 페이지
    /acid-rain        # 산성비 게임 페이지
    /api/generate     # Workers AI 연동 API (단어 생성)
  /components
    /game
      KeyboardGuide.tsx # 가상 키보드 가이드
      FallingWord.tsx  # 산성비 개별 단어 컴포넌트
  /store
    useGameStore.ts    # 점수, 라이프, 레벨 상태 관리
2. 데이터 흐름
초기화: 페이지 로드 시 Cloudflare Worker가 LLM을 호출하여 오늘의 테마 단어(예: Animals, Space)를 생성합니다.

게임 루프: requestAnimationFrame 또는 setInterval을 활용하여 단어의 위치와 입력값을 실시간 비교합니다.

피드백: 사용자가 오타를 내면 LLM이 해당 단어의 발음 힌트나 쉬운 예문을 즉석에서 생성해 보여줍니다.

🛠️ 상세 구현 가이드 (Implementation Steps)
Step 1: Cloudflare Workers AI 연동 (API)
아이들의 수준에 맞는 단어를 실시간으로 가져오는 엔드포인트를 만듭니다.

TypeScript

// src/app/api/generate/route.ts
import { Ai } from '@cloudflare/ai';

export const runtime = 'edge';

export async function GET(req: Request) {
  const ai = new Ai((process.env as any).AI);
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level') || 'easy';

  const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
    prompt: `Generate 20 English words for ${level} level kids (ages 7-12). 
             Return only a JSON array of strings.`
  });

  return Response.json(response);
}
Step 2: "Acid Rain" 게임 엔진 로직
아이들의 흥미를 위해 Framer Motion을 활용한 부드러운 하강 효과를 구현합니다.

TypeScript

// src/components/game/FallingWord.tsx
import { motion } from "framer-motion";

export const FallingWord = ({ word, speed, onMiss }: any) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 1 }}
      animate={{ y: 800 }} // 바닥 높이
      transition={{ duration: speed, ease: "linear" }}
      onAnimationComplete={() => onMiss(word)}
      className="absolute text-xl font-bold text-blue-600"
    >
      {word}
      {/* 여기에 LLM이 생성한 단어 이미지 아이콘을 띄울 수 있음 */}
    </motion.div>
  );
};
Step 3: "Spelling Bloom" 로직 (2지선다)
LLM을 사용하여 "비슷하지만 틀린 철자"를 동적으로 생성합니다.

Prompt 예시: Create a confusing spelling quiz for the word 'Library'. Option A: Library, Option B: Libary. Explanation: It comes from 'liber' in Latin.

🚀 Claude Code 작업 지시서 (Prompting)
Claude Code에게 다음과 같이 명령하여 개발을 시작하세요.

Command: "Next.js 14와 Tailwind CSS를 사용하여 Cloudflare Pages용 프로젝트를 생성해줘.

src/app/api/ai에 Cloudflare Workers AI를 사용하여 초등학생용 영단어 10개를 생성하는 API를 만들어.

src/app/acid-rain에 단어가 위에서 아래로 떨어지는 게임 화면을 만들어줘. 단어를 치면 사라지고 점수가 올라가야 해.

src/app/spelling-bloom에 한컴타자 맞춤법 틔움처럼 두 단어 중 맞는 철자를 고르는 게임을 만들어줘.

모든 디자인은 파스텔 톤의 Rounded 스타일로 아이들이 좋아하게 만들어줘."

💡 아이들을 위한 추가 제언 (Roadmap)
TTS Integration: 브라우저의 window.speechSynthesis를 사용하여 단어가 나타날 때마다 소리를 들려주세요.

Visual Feedback:

Progressive Difficulty: 처음엔 3글자 단어만 나오다가, 연속 성공 시 4글자, 5글자로 늘어나는 로직을 Zustand 스토어에 추가하세요.
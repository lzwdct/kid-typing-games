Claude Code를 사용하여 프로젝트를 진행할 때, 프로젝트의 방향성을 정의하는 **PTR (Project Transformation Roadmap)**을 작성해 드립니다. 이 문서는 단순한 할 일 목록이 아니라, 각 단계에서 어떤 기술적 변환(Transformation)이 일어나는지 명시합니다.

🗺️ PTR (Project Transformation Roadmap)
Phase 1: Foundation & Infrastructure (The Skeleton)
이 단계에서는 Cloudflare 환경과 Next.js의 기본 구조를 잡습니다.

Infrastructure Setup: Cloudflare Pages와 Workers AI 바인딩 설정.

Core Game Engine: requestAnimationFrame 기반의 타이핑 판정 엔진 구축.

Asset Pipeline: 아이들을 위한 파스텔 톤 컬러 팔레트 및 폰트(Comic Sans 대체재 등 가독성 좋은 폰트) 적용.

Phase 2: LLM Integration (The Brain)
LLM을 활용해 정적인 단어장이 아닌 동적인 학습 환경을 만듭니다.

Dynamic Vocabulary: Cloudflare Workers AI를 통해 레벨별(7~9세, 10~12세) 영단어 리스트 자동 생성.

Contextual Hints: 아이가 특정 단어에서 계속 오타를 낼 경우, LLM이 해당 단어의 연상 암기법(Mnemonics)을 생성하여 팝업으로 노출.

Spelling Logic: 맞춤법 틔움(Spelling Bloom)을 위해 '혼동하기 쉬운 철자' 쌍을 LLM으로 자동 페어링.

Phase 3: Interactive Gameplay (The Muscle)
한컴타자의 재미 요소를 영어 버전에 이식합니다.

Acid Rain: Defense Mode:

단어가 떨어질 때 이미지 API를 연동하여 단어 옆에 작은 아이콘 노출.

콤보 시스템 도입 (연속 성공 시 보너스 점수 및 이펙트).

Spelling Bloom: Discovery Mode:

2지선다 선택형 타이핑 모드.

정답 시 꽃이 피어나는 애니메이션 프레임 구현.

Phase 4: Feedback & Reward (The Soul)
아이들의 지속적인 참여를 유도하는 보상 체계입니다.

Phonics TTS: Web Speech API를 사용하여 타이핑할 때마다 원어민 발음 출력.

Progress Tracking: Cloudflare KV를 이용해 일일 학습량과 최고 타이핑 속도(WPM) 저장.

Gamified Badge: '철자 왕', '빛의 속도' 등 배지 시스템 구축.

📝 Claude Code를 위한 상세 작업 지시 예시
PTR의 각 단계를 완료하기 위해 Claude Code에게 다음과 같이 구체적으로 요청하세요.

"Phase 1 & 2 통합 구현 요청"

Next.js App Router 구조에서 useGameStore를 Zustand로 만들어서 게임 상태(Score, Life, Level, WordList)를 관리해줘.

Cloudflare Workers AI를 사용하여 GET /api/words?level=1 호출 시, 7세 아이용 3글자 영단어 20개와 각 단어의 오답 철자(Spelling Bloom용)를 JSON으로 반환하는 API를 작성해줘.

모든 스타일은 tailwind.config.js에 'Kids-Friendly' 테마(둥근 모서리, 부드러운 노란색/분홍색 배경)를 정의해서 적용해줘.

🛠️ Tech-Spec 보완 (Cloudflare AI 모델 추천)
Cloudflare에서 제공하는 모델 중 이 프로젝트에 가장 적합한 모델 구성입니다.

Text Generation: @cf/meta/llama-3-8b-instruct (단어 및 퀴즈 생성용, 속도가 빠름)

Translation (Optional): @cf/meta/m2m100-1.2b (필요시 단어의 한국어 뜻 풀이 제공용)

Storage: Cloudflare KV (아이들의 로컬 최고 기록 저장)
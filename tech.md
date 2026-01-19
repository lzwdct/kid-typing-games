Tech-Spec: Kids English Typing Platform
1. 목표 (Goals)
Target: 7~12세 아동 (가독성 높은 UI, 직관적 게임성).

핵심 기능: * Spelling Bloom: 맞춤법 틔움 컨셉의 2지선다 철자 퀴즈.

Acid Rain: 산성비 컨셉의 단어 방어 게임.

LLM 기반 동적 콘텐츠: 아이 수준에 맞는 영단어/문장 실시간 생성.

2. 기술 스택 (Tech Stack)
Frontend: Next.js (App Router) + Tailwind CSS + Framer Motion (애니메이션).

Infrastructure: Cloudflare Pages (호스팅).

Backend/AI: * Cloudflare Workers AI: @cf/meta/llama-3-8b-instruct (단어장 및 문장 생성).

Cloudflare KV: 사용자 최고 점수 및 기본 단어 데이터베이스 저장.

State Management: Zustand (가볍고 빠른 게임 상태 관리).
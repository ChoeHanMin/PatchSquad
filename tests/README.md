# 테스트 (Playwright, 게임 시간을 직접 진행)

먼저 `node build.js --dev` 로 dist/index.dev.html 만들기.

- `node tests/free_skills.test.js` — 자유 작전 스킬 9개 + 롤백 효과를 하나씩 측정
- `node tests/free_playthrough.test.js <스테이지 0~4> <초> <언어> [난이도]` — 봇이 자유 작전을 끝까지 플레이

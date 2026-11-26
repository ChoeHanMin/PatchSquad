# Patch Squad 트레일러 (46초, 1920×1080 30fps)

1. `node rec.js st0 0 14 3` … `st4 4 16 2` — 게임 시간을 1/30초씩 직접 진행하며 스테이지별 프레임 녹화 (영어 화면, 봇이 조준·사격)
2. `node music.js` — 게임 음악 코드(MUS)를 OfflineAudioContext로 렌더링 → `music.wav`, 컷 위치 `marks.json`
3. `node cards2.js` — 오프닝 글리치 문구, 자막, 로고 슬램, 엔드 카드
4. `python3 pick.py` — 장면마다 버그가 가장 많은 구간 2개 고르기
5. `python3 assemble2.py` — 박자 컷 + 글리치 + 레이저 효과음(Kenney CC0) + 저음 쿵 → `PatchSquad_Trailer_1080p.mp4`

경로는 스크래치 폴더 기준이라 다시 만들 땐 경로를 맞춰 주세요.

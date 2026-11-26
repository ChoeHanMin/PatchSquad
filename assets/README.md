# assets/ — 그림 넣는 곳

여기에 **정해진 파일 이름**으로 PNG(또는 WebP)를 넣고 `node build.js`를 실행하면 게임에 들어가요.
파일이 없으면 지금처럼 코드로 그린 픽셀 그림을 씁니다. 그래서 하나씩 바꿔도 괜찮아요.

빌드할 때 자동으로 해 주는 것: 투명 여백 자르기, 크기 줄이기, HTML 안에 넣기.
그러니 **원본은 큰 크기(1024px) 그대로** 넣으면 됩니다.

| 파일 이름 | 무엇 | 게임 안 크기 | 필수 조건 |
|---|---|---|---|
| `bug_basic.png` | 기본 버그 | 96×96 | 투명 배경, 정사각형 |
| `bug_clone.png` | 복제 버그 | 96×96 | 투명 배경 |
| `bug_mini.png` | 작은 복제 버그 (없으면 복제 버그 그림을 작게 씀) | 96×96 | 투명 배경 |
| `bug_ghost.png` | 투명 버그 | 96×96 | 투명 배경 |
| `bug_404.png` | 404 버그 | 96×96 | 투명 배경 |
| `bug_loop.png` | 무한루프 버그 | 96×96 | 투명 배경 |
| `logo.png` | 타이틀 로고 "PATCH SQUAD" | 가로 900 | 투명 배경, 가로로 긴 그림 |
| `item_hotfix.png` | (선택) 핫픽스 아이템 | 96×96 | 투명 배경 |
| `gun.png` | 패치 건 1인칭 (손이 오른쪽 아래에서 쥐고, 총구가 왼쪽 위 끝) | 가로 640 | 투명 배경, 4:3 |
| `gun_refactor.png` | (선택) 리팩터 모드 총 — 같은 구도 | 가로 640 | 투명 배경, 4:3 |
| `sfx_shot.mp3` / `sfx_spread.mp3` / `sfx_snipe.mp3` | (선택) 연사 / 산탄 / 저격 발사음 (mp3·ogg·wav) | 그대로 | 1초 이하, 150KB 이하 |
| `portrait_dot.png` / `portrait_rex.png` / `portrait_pin.png` | 분대 얼굴 3장 | 128×128 | 투명 배경, 정사각형 |
| `gun_sniper.png` | 저격 패치 건 1인칭 (gun.png와 같은 구도) | 가로 640 | 투명 배경, 4:3 |
| `bug_throw.png` | throw 버그 | 96×96 | 투명 배경 |
| `proj_missile.png` / `proj_packet.png` | 관통 미사일 / 에러 패킷 | 64×64 | 투명 배경 |
| `cover.png` 또는 `cover_forest.png` 등 | (선택) 엄폐물 정면, 화면 아래를 가로로 채움 | 가로 800 | 투명 배경, 3:1 |
| `char_dot.png` / `char_rex.png` / `char_pin.png` | 엄폐 중 3인칭 전신 (벽에 기댄 기본 자세) | 가로 230 | 투명 배경, 1:2, 발이 아래 끝, 여백 안 자름 |
| `char_*_flinch.png` / `char_*_hurt.png` | 같은 캐릭터의 움찔 / 고통 자세 (기본과 같은 크기·위치) | 가로 230 | 위와 같음 |
| `cover_side.png` | 3인칭 엄폐 때 캐릭터가 기대는 키 큰 벽 (오른쪽 모서리가 그림 끝) | 가로 360 | 투명 배경, 1:3 |
| `cover_<스테이지>.png` / `cover_side_<스테이지>.png` | 스테이지별 낮은 엄폐물 / 옆 벽 (forest·city·subway·physics, 없으면 공용) | 가로 800 / 높이 860 | 투명 배경 |
| `char_*_run.png` / `char_*_run2.png` | 이동 중 달리는 뒷모습 (2장 번갈아, 2번째는 선택) | 가로 230 | 투명 배경, 1:2, 발이 아래 끝, 여백 안 자름 |
| `thumbnail.png` | saaskr 업로드용 썸네일 (게임에 안 들어감) | — | — |

ChatGPT에 쓸 프롬프트는 `../PROMPTS.md`에 있어요.

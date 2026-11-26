# Patch Squad — 스팀 도전 과제 9개

Steamworks → **Edit Steamworks Settings → Stats & Achievements → Achievements** 에서 하나씩 **New Achievement**로 만들어요.
- **API Name**은 아래와 **글자 하나까지 똑같이** (게임 코드가 이 이름으로 달성을 보냄)
- 아이콘: `steam/achievements/` 의 `ACH_*.png`(달성) / `ACH_*_locked.png`(미달성), 256×256
- 다 만들면 **Publish** 탭에서 게시 → 그다음 스토어 Basic Info의 Supported Features에서 **Steam Achievements** 체크

| API Name | 한국어 이름 / 설명 | English | 日本語 | 简体中文 |
|---|---|---|---|---|
| ACH_TUTORIAL | 훈련 수료 / 튜토리얼을 끝까지 완료 | Training Complete / Finish the tutorial | 訓練修了 / チュートリアルを最後まで完了 | 训练结业 / 完成教程 |
| ACH_RELEASE | 정식 출시 / 정식 출시 등급 받기 | Released / Get the Released grade | 正式リリース / 「正式リリース」評価を獲得 | 正式发布 / 获得“正式发布”评价 |
| ACH_NOCRASH | 무사고 / 크래시 0회로 클리어 | Zero Crashes / Clear with no crashes | ノークラッシュ / クラッシュ0回でクリア | 零崩溃 / 无崩溃通关 |
| ACH_NOROLLBACK | 되감기 없이 / 롤백 없이 클리어 | No Rewinds / Clear without Rollback | 巻き戻しなし / ロールバックなしでクリア | 绝不回滚 / 不使用回滚通关 |
| ACH_ACC90 | 정밀 디버깅 / 정확도 90% 이상으로 클리어 | Precision Debugging / Clear with 90%+ accuracy | 精密デバッグ / 命中率90%以上でクリア | 精准调试 / 命中率90%以上通关 |
| ACH_BLAST5 | 대규모 리팩터 / 리팩터 한 방에 복제 버그 5마리 | Mass Refactor / Hit 5 clone bugs with one Refactor shot | 大規模リファクタ / リファクタ1発でクローンバグ5匹 | 大规模重构 / 一发重构命中5只克隆Bug |
| ACH_BOSS90 | 핫픽스 배포 / 보스를 1분 30초 안에 정상화 | Hotfix Deployed / Fix the boss within 1:30 | ホットフィックス配信 / ボスを1分30秒以内に修復 | 热修复上线 / 1分30秒内修好Boss |
| ACH_HARD | 하드 모드 / 난이도 상 클리어 | Hard Mode / Clear on Hard | ハードモード / ハードをクリア | 困难模式 / 通关困难难度 |
| ACH_HARDRELEASE | 완벽한 출시 / 난이도 상에서 정식 출시 등급 | Flawless Launch / Get the Released grade on Hard | 完璧なリリース / ハードで「正式リリース」評価 | 完美发布 / 困难难度获得“正式发布”评价 |

예전(v1.0.x)에 이미 깬 도전 과제는 게임을 켤 때 자동으로 스팀에도 달성 처리돼요.

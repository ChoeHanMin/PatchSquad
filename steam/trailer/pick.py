# 장면마다 가장 바쁜 구간 2개 고르기 (화면 속 버그 수 + 쏘는 중)
import json, os, sys
D = os.path.dirname(os.path.abspath(__file__))
W = int(sys.argv[1]) if len(sys.argv) > 1 else 100
res = {}
for st in ['st1', 'st2', 'st3', 'st4']:
    p = f'{D}/frames/{st}/log.json'
    if not os.path.exists(p): continue
    log = json.load(open(p))
    sc = [((x['n'] if x else 0) + (1.5 if x and x['out'] else 0) - (4 if x and x['ph'] != 'fight' else 0)) for x in log]
    n = len(sc); win = W if st != 'st4' else 123
    sums = [sum(sc[i:i + win]) for i in range(0, max(1, n - win), 5)]
    order = sorted(range(len(sums)), key=lambda i: -sums[i])
    picks = []
    for i in order:
        s = i * 5
        if all(abs(s - q) >= win for q in picks): picks.append(s)
        if len(picks) == 2: break
    picks.sort(); res[st] = picks
    print(st, n, 'frames, picks', picks, 'scores', [round(sums[q // 5]) for q in picks])
json.dump(res, open(D + '/picks.json', 'w'))

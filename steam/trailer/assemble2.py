# 어그로 트레일러: 박자 컷 + 글리치 + 컷마다 레이저 효과음 + 로고 슬램
import json, subprocess, os
D = os.path.dirname(os.path.abspath(__file__))
FPS = 30
M = {m['name']: m['t'] for m in json.load(open(D + '/marks.json'))}
P = json.load(open(D + '/picks.json'))
P['st0'] = [240, 345]
half = lambda a, b: (a + b) / 2
cuts = []  # (시작, 끝, 종류, 정보)
cuts.append((0.0, half(M['intro'], M['s1']), 'card', {'img': 'open1', 'glitch': True}))
cuts.append((half(M['intro'], M['s1']), M['s1'], 'card', {'img': 'open2', 'glitch': True}))
stages = [('s1', 'st0'), ('s2', 'st1'), ('s3', 'st2'), ('s4', 'st3')]
nxt = {'s1': 's2', 's2': 's3', 's3': 's4', 's4': 'boss'}
for name, st in stages:
    a, b = M[name], M[nxt[name]]; m = half(a, b)
    cuts.append((a, m, 'game', {'dir': st, 'from': P[st][0], 'cap': name}))
    cuts.append((m, b, 'game', {'dir': st, 'from': P[st][1], 'cap': None}))
bm = half(M['boss'], M['end'])
cuts.append((M['boss'], bm, 'game', {'dir': 'st4', 'from': P['st4'][0], 'cap': 'boss'}))
cuts.append((bm, M['end'], 'game', {'dir': 'st4', 'from': P['st4'][1], 'cap': None}))
cuts.append((M['end'], M['end2'], 'card', {'img': 'slam', 'shake': True}))
END = M['stop'] + 1.8
cuts.append((M['end2'], END, 'card', {'img': 'endcard', 'fade': True}))

os.makedirs(D + '/clips2', exist_ok=True)
def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(' '.join(cmd)[:400]); print(r.stderr[-2000:]); raise SystemExit(1)
GL = "rgbashift=rh=-26:bh=26:gv=6:enable='lt(t,0.14)',eq=brightness=0.22:enable='lt(t,0.067)'"
files = []; acc = 0
for i, (a, b, kind, info) in enumerate(cuts):
    # 프레임 단위로 반올림해서 누적 오차가 안 생기게
    n = round(b * FPS) - round(a * FPS); dur = n / FPS
    out = f'{D}/clips2/{i:02d}.mp4'
    if kind == 'card':
        vf = []
        if info.get('shake'):
            vf.append("scale=2040:1148,crop=1920:1080:x='60+46*sin(t*95)*exp(-t*7)':y='34+30*cos(t*83)*exp(-t*7)'")
            vf.append("eq=brightness=0.5:enable='lt(t,0.05)'")
        if info.get('glitch'): vf.append(GL)
        if info.get('fade'): vf.append('fade=t=in:st=0:d=0.3')
        vf.append('format=yuv420p')
        run(['ffmpeg', '-y', '-loop', '1', '-framerate', str(FPS), '-i', f"{D}/cards/{info['img']}.png", '-vf', ','.join(vf), '-frames:v', str(n), '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-r', str(FPS), out])
    else:
        cmd = ['ffmpeg', '-y', '-framerate', str(FPS), '-start_number', str(info['from']), '-i', f"{D}/frames/{info['dir']}/%05d.jpg"]
        base = f"[0:v]{GL}[g]"
        if info['cap']:
            cmd += ['-loop', '1', '-framerate', str(FPS), '-i', f"{D}/cards/cap_{info['cap']}.png"]
            fc = base + f";[1:v]format=rgba,fade=t=in:st=0.12:d=0.15:alpha=1,fade=t=out:st={dur - 0.35:.2f}:d=0.25:alpha=1[c];[g][c]overlay=x=(W-w)/2:y=150:shortest=1,format=yuv420p[v]"
        else:
            fc = base + ";[g]format=yuv420p[v]"
        cmd += ['-filter_complex', fc, '-map', '[v]', '-frames:v', str(n), '-c:v', 'libx264', '-preset', 'medium', '-crf', '15', '-r', str(FPS), out]
        run(cmd)
    files.append(out)
    print(f'{i:02d} {a:6.2f}-{b:6.2f} {kind} {info}')
open(D + '/clips2/list.txt', 'w').write(''.join(f"file '{p}'\n" for p in files))

# 효과음: 컷마다 레이저(게임 저격음), 오프닝은 글리치 잡음, 로고 슬램은 저음 쿵
A = '/home/user/bughunter-steam/assets/'
run(['ffmpeg', '-y', '-f', 'lavfi', '-i', "aevalsrc='0.9*sin(2*PI*(38+90*exp(-t*9))*t)*exp(-t*3.2)':s=48000:d=1.6", '-ac', '2', D + '/boom.wav'])
run(['ffmpeg', '-y', '-f', 'lavfi', '-i', 'anoisesrc=d=0.22:c=white:a=0.5:r=48000', '-af', 'highpass=f=1800,afade=t=out:st=0.05:d=0.17', '-ac', '2', D + '/glitch.wav'])
sfx = []
for (a, b, kind, info) in cuts:
    if kind == 'game': sfx.append((A + 'sfx_snipe.mp3', a, 0.55))
    if info.get('glitch'): sfx.append((D + '/glitch.wav', a, 0.6))
    if info.get('shake'): sfx += [(D + '/boom.wav', a, 1.0), (A + 'sfx_snipe.mp3', a, 0.8)]
inputs = ['-i', D + '/music.wav']; fl = []
for k, (f, t, v) in enumerate(sfx):
    inputs += ['-i', f]; ms = int(t * 1000)
    fl.append(f"[{k + 1}:a]aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{k}]")
mix = ''.join(f'[s{k}]' for k in range(len(sfx)))
fl.append(f"[0:a]volume=0.85[m];[m]{mix}amix=inputs={len(sfx) + 1}:normalize=0:duration=first,alimiter=limit=0.95,afade=t=out:st={END - 1.5:.2f}:d=1.5[a]")
run(['ffmpeg', '-y'] + inputs + ['-filter_complex', ';'.join(fl), '-map', '[a]', '-t', f'{END:.2f}', '-c:a', 'pcm_s16le', D + '/mix.wav'])
out = D + '/PatchSquad_Trailer_1080p.mp4'
run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', D + '/clips2/list.txt', '-i', D + '/mix.wav', '-map', '0:v', '-map', '1:a', '-t', f'{END:.2f}',
     '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', str(FPS), '-movflags', '+faststart',
     '-c:a', 'aac', '-b:a', '256k', out])
print('done', round(END, 2), 's ->', out)

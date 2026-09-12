from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'target not found: {label}')
    s=s.replace(old,new,1)

anchor="function beginTreatment(){state.session.phase='treatment';render();state.session.treatmentTimer=setTimeout(finishTreatment,900)}"
insert=r'''const treatmentGameSpecs={
 facial:{kind:'trace',title:'美容液をムラなく塗り込む',instruction:'額 → 右頬 → 左頬 → あご の順になぞるようにタップ',sequence:['額','右頬','左頬','あご'],icon:'🫧'},
 smallface:{kind:'lift',title:'左右の引き上げをそろえる',instruction:'左右交互にリフトしてフェイスラインを整える',sequence:['左','右','左','右','左','右'],icon:'✨'},
 slimming:{kind:'pressure',title:'圧加減をベストゾーンに合わせる',instruction:'動くゲージが中央の適正圧に入った瞬間にタップ',rounds:3,icon:'🌿'},
 luxurySlimming:{kind:'pressure',title:'高出力の圧を精密に合わせる',instruction:'通常痩身より狭い適正ゾーンを4回狙う',rounds:4,hard:true,icon:'💎'},
 relax:{kind:'breath',title:'呼吸に合わせてゆっくり圧を入れる',instruction:'呼吸サークルが最もゆるんだ瞬間にタップ',rounds:3,icon:'🕯️'},
 bust:{kind:'balance',title:'左右のバランスを整える',instruction:'左・右を交互にケアして左右差を作らない',sequence:['左','右','左','右','左','右'],icon:'🌸'},
 pore:{kind:'pore',title:'毛穴を順番にクリーンアップ',instruction:'光っている毛穴だけを順番にタップ',sequence:['2','5','1','4','3'],icon:'💧'},
 headspa:{kind:'rhythm',title:'頭皮ポイントをリズムよくほぐす',instruction:'表示された順番どおりに5ポイントをタップ',sequence:['頭頂','左側頭','右側頭','後頭','頭頂'],icon:'💆🏻‍♀️'}
};
function treatmentGameSpecFor(serviceOrId){const id=typeof serviceOrId==='string'?serviceOrId:serviceOrId?.id;return treatmentGameSpecs[id]||treatmentGameSpecs.facial}
function createTreatmentGame(serviceOrId,now=Date.now()){const spec=treatmentGameSpecFor(serviceOrId);return{serviceId:typeof serviceOrId==='string'?serviceOrId:serviceOrId?.id,kind:spec.kind,step:0,score:0,mistakes:0,startedAt:now,roundStartedAt:now,finished:false}}
function treatmentGameProgress(game,now=Date.now(),duration=1800){return((Math.max(0,now-Number(game?.roundStartedAt||now)))%duration)/duration}
function treatmentTimingPoints(game,now=Date.now()){const spec=treatmentGameSpecFor(game?.serviceId),progress=treatmentGameProgress(game,now,spec.kind==='breath'?2400:1800),target=spec.kind==='breath'?.72:.5,d=Math.abs(progress-target),perfect=spec.hard?.055:.085,good=spec.hard?.13:.18;return d<=perfect?3:d<=good?2:d<=good+.12?1:0}
function finishTreatmentGame(){const game=state.session?.treatmentGame;if(!game)return;const bonus=clamp(Math.round(Number(game.score||0)-Number(game.mistakes||0)),0,8),service=services.find(x=>x.id===game.serviceId);state.session.treatmentBonus=Number(state.session.treatmentBonus||0)+bonus;state.todayHighlights.push(`${service?.name||'施術'}ミニゲーム：${bonus>=7?'PERFECT':bonus>=4?'GOOD':'OK'} +${bonus}`);game.finished=true;game.bonus=bonus;state.session.phase='treatment';save();render();state.session.treatmentTimer=setTimeout(finishTreatment,650)}
function treatmentGameAction(value,now=Date.now()){
 const game=state.session?.treatmentGame;if(!game||game.finished)return false;const spec=treatmentGameSpecFor(game.serviceId),expected=spec.sequence?.[game.step];
 if(['pressure','breath'].includes(spec.kind)){game.score+=treatmentTimingPoints(game,now);game.step++;game.roundStartedAt=now;if(game.step>=Number(spec.rounds||3))return finishTreatmentGame(),true;save();render();return true}
 if(String(value)===String(expected)){game.score+=spec.kind==='trace'?2:spec.kind==='pore'?1.6:1.35;game.step++;}else game.mistakes+=1;
 if(game.step>=Number(spec.sequence?.length||1))return finishTreatmentGame(),true;save();render();return true
}
function treatmentGamePage(c){const game=state.session.treatmentGame,spec=treatmentGameSpecFor(game?.serviceId),service=services.find(x=>x.id===game?.serviceId),step=game?.step||0,total=spec.sequence?.length||spec.rounds||3,progress=Math.round(step/total*100);let board='';
 if(spec.kind==='pressure')board=`<div class="tm-gauge ${spec.hard?'hard':''}"><div class="tm-zone">適正圧</div><i></i></div><button class="primary wide tm-action" data-treatment-game="timing">圧を決定</button>`;
 else if(spec.kind==='breath')board=`<div class="tm-breath"><span>息を吐く</span></div><button class="primary wide tm-action" data-treatment-game="timing">ここでゆっくり圧</button>`;
 else if(spec.kind==='trace')board=`<div class="tm-face-grid">${spec.sequence.map((x,i)=>`<button data-treatment-game="${x}" class="${i===step?'active':i<step?'done':''}">${i<step?'✓':i===step?'●':'○'}<small>${x}</small></button>`).join('')}</div>`;
 else if(['lift','balance'].includes(spec.kind))board=`<div class="tm-two-hand"><button data-treatment-game="左" class="${expectedSide(spec,step,'左')?'active':''}">↖<b>左</b></button><button data-treatment-game="右" class="${expectedSide(spec,step,'右')?'active':''}">↗<b>右</b></button></div>`;
 else if(spec.kind==='pore')board=`<div class="tm-pore-grid">${['1','2','3','4','5'].map(x=>`<button data-treatment-game="${x}" class="${String(spec.sequence[step])===x?'active':''}">●<small>${x}</small></button>`).join('')}</div>`;
 else board=`<div class="tm-scalp-grid">${['頭頂','左側頭','右側頭','後頭'].map(x=>`<button data-treatment-game="${x}" class="${spec.sequence[step]===x?'active':''}">${x==='頭頂'?'◎':x==='後頭'?'◉':'○'}<small>${x}</small></button>`).join('')}</div>`;
 return`${salonScene('treatment',c)}<section class="card treatment-minigame kind-${spec.kind}"><small>TREATMENT SKILL · ${service?.name||''}</small><h2>${spec.icon} ${spec.title}</h2><p>${spec.instruction}</p><div class="tm-progress"><i style="width:${progress}%"></i></div><b>${step+1}/${total}</b>${board}<small class="tm-note">上手くできるほど施術評価に最大 +8。失敗しても施術は続けられます。</small><button class="soft wide" data-action="skipTreatmentGame">ミニゲームをスキップ</button></section>`}
function expectedSide(spec,step,side){return spec.sequence?.[step]===side}
function beginTreatment(){const service=availableServices().find(x=>x.id===state.session.selectedService)||services.find(x=>x.id===state.session.selectedService);state.session.treatmentGame=createTreatmentGame(service||state.session.selectedService);state.session.phase='treatmentGame';save();render()}'''
rep(anchor,insert,'treatment game engine')

rep("if(phase==='treatmentDecision')return treatmentDecisionPageV6(c);",
    "if(phase==='treatmentDecision')return treatmentDecisionPageV6(c);if(phase==='treatmentGame')return treatmentGamePage(c);",
    'playPage treatment game phase')

bind="document.querySelectorAll('[data-treatment-choice]').forEach(b=>b.onclick=()=>chooseTreatment(+b.dataset.treatmentChoice));"
newbind=bind+"document.querySelectorAll('[data-treatment-game]').forEach(b=>b.onclick=()=>treatmentGameAction(b.dataset.treatmentGame));document.querySelector('[data-action=\"skipTreatmentGame\"]')?.addEventListener('click',()=>{if(state.session?.treatmentGame){state.session.treatmentGame.score=0;state.session.treatmentGame.mistakes=0;finishTreatmentGame()}});"
rep(bind,newbind,'minigame bindings')

rep("promoteStaff,nextCustomerStory,referralGroupMembers",
    "promoteStaff,treatmentGameSpecFor,createTreatmentGame,treatmentGameProgress,treatmentTimingPoints,treatmentGameAction,treatmentGamePage,nextCustomerStory,referralGroupMembers",
    'test api minigame exports')

p.write_text(s)

css=Path('src/v62.css')
cs=css.read_text()
marker='/* Treatment-specific mini games */'
if marker not in cs:
 cs += r'''

/* Treatment-specific mini games */
.treatment-minigame{max-width:680px;margin:16px auto;text-align:center;padding:20px}.treatment-minigame>small:first-child{letter-spacing:.12em;color:#a8887b}.treatment-minigame h2{margin:8px 0}.tm-progress{height:7px;margin:12px 0 6px;border-radius:99px;background:#efe5df;overflow:hidden}.tm-progress i{display:block;height:100%;background:#c87982;transition:width .2s}.tm-note{display:block;margin:12px 0;color:#9a7168}.tm-gauge{position:relative;height:42px;margin:24px 0;border-radius:22px;background:linear-gradient(90deg,#ead9d2,#f4cdd0,#ead9d2);overflow:hidden}.tm-gauge .tm-zone{position:absolute;left:40%;width:20%;inset-block:0;display:grid;place-items:center;background:#c9a45e55;font-size:11px;font-weight:900}.tm-gauge.hard .tm-zone{left:44%;width:12%}.tm-gauge>i{position:absolute;top:4px;bottom:4px;width:7px;border-radius:9px;background:#5b4636;animation:tmGauge 1.8s linear infinite alternate}.tm-breath{width:150px;height:150px;margin:18px auto;display:grid;place-items:center;border-radius:50%;background:#f4cdd0aa;animation:tmBreath 2.4s ease-in-out infinite}.tm-breath span{font-weight:900;color:#76564d}.tm-face-grid,.tm-pore-grid,.tm-scalp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px auto}.tm-face-grid button,.tm-pore-grid button,.tm-scalp-grid button,.tm-two-hand button{min-height:74px;border:1px solid #ead9d2;border-radius:18px;background:#fff;color:#76564d;font-size:26px}.tm-face-grid button small,.tm-pore-grid button small,.tm-scalp-grid button small,.tm-two-hand b{display:block;font-size:12px}.tm-face-grid button.active,.tm-pore-grid button.active,.tm-scalp-grid button.active,.tm-two-hand button.active{border:2px solid #c9a45e;background:#fff8e9;box-shadow:0 0 0 4px #c9a45e22}.tm-face-grid button.done{background:#eef7f2;color:#568876}.tm-two-hand{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:22px 0}.tm-two-hand button{min-height:110px;font-size:42px}.tm-action{margin-top:10px}@keyframes tmGauge{from{left:2%}to{left:96%}}@keyframes tmBreath{0%,100%{transform:scale(.72);opacity:.65}55%{transform:scale(1);opacity:1}}@media(max-width:430px){.treatment-minigame{padding:16px 12px}.tm-face-grid,.tm-pore-grid,.tm-scalp-grid{grid-template-columns:repeat(2,1fr)}.tm-two-hand button{min-height:94px}}
@media(prefers-reduced-motion:reduce){.tm-gauge>i{animation-duration:3.6s}.tm-breath{animation-duration:4.8s}}
'''
 css.write_text(cs)

# Regression tests
t=Path('tests/v06-systems.test.mjs')
ts=t.read_text()
marker='// Treatment-specific minigames.'
if marker not in ts:
 ts += r'''

// Treatment-specific minigames.
const gameKinds={facial:'trace',smallface:'lift',slimming:'pressure',relax:'breath',bust:'balance',pore:'pore',headspa:'rhythm',luxurySlimming:'pressure'};
for(const [id,kind] of Object.entries(gameKinds))assert.equal(api.treatmentGameSpecFor(id).kind,kind,`${id}は施術専用ミニゲーム`);
assert.equal(new Set(Object.values(gameKinds)).size>=6,true,'施術ジャンルごとに6種類以上の操作を用意');
const slimGame=api.createTreatmentGame('slimming',1000);assert.equal(slimGame.kind,'pressure');
assert.equal(api.treatmentTimingPoints(slimGame,1900),3,'痩身は適正圧中央で高得点');
const luxury=api.createTreatmentGame('luxurySlimming',1000);assert.equal(api.treatmentGameSpecFor('luxurySlimming').hard,true,'高級痩身は狭い適正圧');
const facialGame=api.createTreatmentGame('facial',1000);assert.deepEqual(api.treatmentGameSpecFor('facial').sequence,['額','右頬','左頬','あご'],'フェイシャルは塗り込み順序');
const headGame=api.createTreatmentGame('headspa',1000);assert.equal(api.treatmentGameSpecFor('headspa').sequence.length,5,'ヘッドスパは頭皮ポイント5手順');
const gameSource=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
assert.match(gameSource,/phase==='treatmentGame'/,'施術中に専用ミニゲーム画面へ遷移');
assert.match(gameSource,/data-treatment-game/,'タッチ操作を実装');
assert.match(gameSource,/最大 \+8/,'ミニゲーム結果を施術評価へ反映');
'''
 t.write_text(ts)

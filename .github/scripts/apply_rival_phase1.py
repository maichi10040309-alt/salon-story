from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()

s=s.replace("contest:{best:null,entries:0,lastRanking:null},gameFlags:{}", "contest:{best:null,entries:0,lastRanking:null},rivalBattle:{wins:0,losses:0,draws:0,streak:0,lastDay:0,history:[]},gameFlags:{}",1)
s=s.replace("contest:{...base.contest,...(raw.contest||{})},migrationFlags:", "contest:{...base.contest,...(raw.contest||{})},rivalBattle:{...base.rivalBattle,...(raw.rivalBattle||{}),history:Array.isArray(raw.rivalBattle?.history)?raw.rivalBattle.history:[]},migrationFlags:",1)

anchor="function updateRivals(){if(!state.rivalsUnlocked)return;for(const r of state.rivals)r.popularity+=r.growth[0]+Math.floor(Math.random()*(r.growth[1]-r.growth[0]+1))}\n"
insert="""function updateRivals(){if(!state.rivalsUnlocked)return;for(const r of state.rivals)r.popularity+=r.growth[0]+Math.floor(Math.random()*(r.growth[1]-r.growth[0]+1))}
function rivalChallengeAvailable(s=state){return!!s.rivalsUnlocked&&Number(s.day||1)-Number(s.rivalBattle?.lastDay||0)>=7}
function rivalChallengeTarget(s=state){if(!s.rivalsUnlocked||!Array.isArray(s.rivals)||!s.rivals.length)return null;return[...s.rivals].sort((a,b)=>Math.abs(Number(a.popularity||0)-Number(s.popularity||0))-Math.abs(Number(b.popularity||0)-Number(s.popularity||0)))[0]||null}
function rivalChallengeScores(strategy,s=state,target=rivalChallengeTarget(s)){if(!target)return null;const staff=s.staff||{tech:50,service:50,sales:50},rankBonus=Math.max(0,rankOrder.indexOf(s.storeRank))*12,streak=Math.max(0,Number(s.rivalBattle?.streak||0));let player=0;if(strategy==='tech')player=Number(staff.tech||50)*1.2+Number(s.rating||0)*12+rankBonus;else if(strategy==='service')player=Number(staff.service||50)*1.15+Number(s.rating||0)*15+counts(s).vip*2;else player=Number(staff.sales||50)+Number(s.popularity||0)/25+Number(s.socialFollowers||0)/150;player+=Math.min(24,streak*3);const rival=72+Number(target.popularity||0)/22+Math.max(0,Number(target.growth?.[1]||0))*2;return{player:Math.round(player),rival:Math.round(rival)}}
function resolveRivalChallenge(strategy,s=state){if(!rivalChallengeAvailable(s)||!['tech','service','marketing'].includes(strategy))return null;const target=rivalChallengeTarget(s),scores=rivalChallengeScores(strategy,s,target);if(!target||!scores)return null;const result=scores.player>scores.rival+4?'win':scores.player+4<scores.rival?'loss':'draw';let money=0,popularity=0;if(result==='win'){money=50000;popularity=25;s.rivalBattle.wins++;s.rivalBattle.streak=Math.max(0,Number(s.rivalBattle.streak||0))+1}else if(result==='draw'){money=10000;popularity=5;s.rivalBattle.draws++;s.rivalBattle.streak=0}else{s.rivalBattle.losses++;s.rivalBattle.streak=0;target.popularity+=8}s.money+=money;s.popularity+=popularity;s.rivalBattle.lastDay=s.day;const record={day:s.day,rivalId:target.id,rivalName:target.name,strategy,result,playerScore:scores.player,rivalScore:scores.rival,money,popularity};s.rivalBattle.history=[...(s.rivalBattle.history||[]),record].slice(-12);const label=result==='win'?'勝利！':result==='draw'?'引き分け':'敗北';s.news.unshift(`RIVAL BATTLE ${target.name}戦：${label}`);s.specialOverlay={type:'contest',title:'RIVAL BATTLE',big:label,text:`${target.name}との対決 ${scores.player} - ${scores.rival}${money?`\\n報酬 ${yen(money)}・人気 +${popularity}`:''}`};return record}
"""
if anchor not in s: raise SystemExit('updateRivals anchor missing')
s=s.replace(anchor,insert,1)

s=s.replace("eventQueue:selectBusinessEvents({day:state.day})", "eventQueue:selectBusinessEvents({day:state.day,rivalsUnlocked:state.rivalsUnlocked})",1)

old="""function worldPageV5(){const ranked=ranking();return`<div class=\"section-title\"><h2>SALON WORLD</h2><span class=\"pill\">現在 ${rankingPosition()}位</span></div>${chapterCard()}<h3>人気ランキング</h3><div class=\"ranking\">${ranked.map((r,i)=>`<div class=\"card rank-row ${r.self?'self':''}\"><strong>${i+1}</strong><span>${r.self?'🌸':state.rivals.find(x=>x.name===r.name)?.icon} ${r.name}</span><b>${r.popularity}</b></div>`).join('')}</div>${state.rivalsUnlocked?`<h3>ライバルオーナー</h3><div class=\"grid\">${state.rivals.map((r,i)=>{const o=rivalOwners[r.id];return`<div class=\"card rival-owner\">${rivalPortrait(r.id,o.name,'lg')}<span class=\"pill\">${r.name} · ${ranked.findIndex(x=>x.name===r.name)+1}位</span><h3>${o.name}</h3><p>${o.personality}／${r.type||'得意分野を研究中'}</p><div class=\"speech\">「${o.line}」</div></div>`}).join('')}</div><div class=\"card contest-card\"><h2>🏆 地域美容サロンAWARD</h2><p>口コミ・人気・技術・店舗Rank・接客の総合審査</p>${state.contest.lastRanking?`<div class=\"contest-podium\">${state.contest.lastRanking.map((x,i)=>`<div class=\"podium ${i===0?'first':''}\"><b>${i+1}${i===0?'st':'位'}</b><span>${x}</span></div>`).join('')}</div>`:''}<button class=\"primary\" data-action=\"contest\">コンテストに参加</button><b>${state.contest.best?`最高：${state.contest.best}`:'未参加'}</b></div>`:'<div class=\"card mystery-rival\">🔒 Chapter 2クリアでライバルサロンが登場します</div>'}`}"""
new="""function rivalBattleCard(){if(!state.rivalsUnlocked)return'';const b=state.rivalBattle||{},target=rivalChallengeTarget(),ready=rivalChallengeAvailable(),wait=Math.max(0,7-(state.day-Number(b.lastDay||0))),history=(b.history||[]).slice(-3).reverse();return`<div class=\"card contest-card\"><h2>⚡ RIVAL BATTLE</h2><p>${target?`${target.name}と直接対決。得意な戦略を選んで勝負します。`:'ライバル対決を準備中'}</p><div class=\"row\"><span>戦績</span><b>${b.wins||0}勝 ${b.losses||0}敗 ${b.draws||0}分 · 連勝 ${b.streak||0}</b></div>${ready&&target?`<div class=\"grid\"><button class=\"primary\" data-rival-challenge=\"tech\">技術で勝負</button><button class=\"primary\" data-rival-challenge=\"service\">接客で勝負</button><button class=\"primary\" data-rival-challenge=\"marketing\">集客で勝負</button></div>`:`<small>次の対決まで ${wait}日</small>`}${history.length?`<h3>最近の対決</h3>${history.map(x=>`<div class=\"row\"><span>Day ${x.day} · ${x.rivalName}</span><b>${x.result==='win'?'勝利':x.result==='draw'?'引分':'敗北'} ${x.playerScore}-${x.rivalScore}</b></div>`).join('')}`:''}</div>`}
function worldPageV5(){const ranked=ranking();return`<div class=\"section-title\"><h2>SALON WORLD</h2><span class=\"pill\">現在 ${rankingPosition()}位</span></div>${chapterCard()}<h3>人気ランキング</h3><div class=\"ranking\">${ranked.map((r,i)=>`<div class=\"card rank-row ${r.self?'self':''}\"><strong>${i+1}</strong><span>${r.self?'🌸':state.rivals.find(x=>x.name===r.name)?.icon} ${r.name}</span><b>${r.popularity}</b></div>`).join('')}</div>${state.rivalsUnlocked?`<h3>ライバルオーナー</h3><div class=\"grid\">${state.rivals.map((r,i)=>{const o=rivalOwners[r.id];return`<div class=\"card rival-owner\">${rivalPortrait(r.id,o.name,'lg')}<span class=\"pill\">${r.name} · ${ranked.findIndex(x=>x.name===r.name)+1}位</span><h3>${o.name}</h3><p>${o.personality}／${r.type||'得意分野を研究中'}</p><div class=\"speech\">「${o.line}」</div></div>`}).join('')}</div>${rivalBattleCard()}<div class=\"card contest-card\"><h2>🏆 地域美容サロンAWARD</h2><p>口コミ・人気・技術・店舗Rank・接客の総合審査</p>${state.contest.lastRanking?`<div class=\"contest-podium\">${state.contest.lastRanking.map((x,i)=>`<div class=\"podium ${i===0?'first':''}\"><b>${i+1}${i===0?'st':'位'}</b><span>${x}</span></div>`).join('')}</div>`:''}<button class=\"primary\" data-action=\"contest\">コンテストに参加</button><b>${state.contest.best?`最高：${state.contest.best}`:'未参加'}</b></div>`:'<div class=\"card mystery-rival\">🔒 Chapter 2クリアでライバルサロンが登場します</div>'}`}"""
if old not in s: raise SystemExit('worldPageV5 anchor missing')
s=s.replace(old,new,1)

oldbind="document.querySelector('[data-action=\"contest\"]')?.addEventListener('click',()=>{"
if oldbind not in s: raise SystemExit('contest bind anchor missing')
s=s.replace(oldbind,"document.querySelectorAll('[data-rival-challenge]').forEach(b=>b.onclick=()=>{const result=resolveRivalChallenge(b.dataset.rivalChallenge);if(result){save();render()}});\n  "+oldbind,1)

s=s.replace("chapterReady,completeChapter,endlessModeActive", "chapterReady,completeChapter,rivalChallengeAvailable,rivalChallengeTarget,rivalChallengeScores,resolveRivalChallenge,endlessModeActive",1)
p.write_text(s)

p=Path('src/v06-systems.js')
s=p.read_text()
s=s.replace("export function selectBusinessEvents({day=1,rng=Math.random,max=3}={}){const count=Math.min(max,1+(rng()>.58?1:0)+(rng()>.88?1:0)),pool=[...businessEvents],picked=[];", "export function selectBusinessEvents({day=1,rng=Math.random,max=3,rivalsUnlocked=true}={}){const count=Math.min(max,1+(rng()>.58?1:0)+(rng()>.88?1:0)),pool=businessEvents.filter(event=>rivalsUnlocked||event.category!=='rival'),picked=[];",1)
p.write_text(s)

p=Path('tests/v06-systems.test.mjs')
s=p.read_text()
marker="assert.equal(selected.every(x=>x.day===12),true);\n"
extra="""assert.equal(selectBusinessEvents({day:12,rng:()=>.99,max:3,rivalsUnlocked:false}).every(x=>x.category!=='rival'),true,'ライバル未解放時はライバル営業イベントを除外');
"""
if extra.strip() not in s:
    if marker not in s: raise SystemExit('business event test anchor missing')
    s=s.replace(marker,marker+extra,1)
marker="const payrollState={day:30,stores:[{rent:70000}],staffRoster:[\n"
extra="""const rivalState=api.migrate({...api.freshState(),day:20,rivalsUnlocked:true,popularity:900,rivalBattle:{wins:0,losses:0,draws:0,streak:0,lastDay:10,history:[]},staff:{...staffTemplates[0],tech:95,service:92,sales:90,energy:100},staffRoster:[{...staffTemplates[0],tech:95,service:92,sales:90,energy:100}]});
api.setState(rivalState);
assert.equal(api.rivalChallengeAvailable(rivalState),true,'7日以上空くとライバル対決可能');
assert.ok(api.rivalChallengeTarget(rivalState),'対戦相手を選出');
const battle=api.resolveRivalChallenge('tech',rivalState);assert.ok(battle,'ライバル対決を実行');
assert.equal(rivalState.rivalBattle.history.length,1,'対決履歴を保存');
assert.equal(rivalState.rivalBattle.lastDay,20,'対決日を保存');
assert.equal(api.rivalChallengeAvailable(rivalState),false,'同日再戦は不可');

"""
if extra.strip() not in s:
    if marker not in s: raise SystemExit('rival test anchor missing')
    s=s.replace(marker,extra+marker,1)
p.write_text(s)

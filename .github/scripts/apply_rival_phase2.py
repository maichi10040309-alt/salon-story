from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()

old="const rankOrder=['D','C','B','A'];\n"
new="""const rankOrder=['D','C','B','A'];
const rivalStorylines={
  luxe:[
    {id:'encounter',title:'格の違い',need:{},text:'神崎レイナがSalon Storyを視察に訪れた。華やかな店構えだけではなく、お客様との距離の近さを静かに見定めている。',line:'小さくても、ちゃんと芯のある店みたいね。',reward:{popularity:5}},
    {id:'challenge',title:'高級店からの挑戦状',need:{battles:1},text:'LUXE BEAUTYとの初対決を終え、レイナから次の勝負を告げるメッセージが届いた。',line:'一度の結果で終わりじゃないわ。次はもっと本気で来なさい。',reward:{money:15000}},
    {id:'respect',title:'結果で認めさせる',need:{wins:1},text:'Salon Storyの結果を見たレイナの態度が少し変わった。競争相手として、こちらの強みを認め始めている。',line:'あなたの接客、数字だけでは測れない強さがあるのね。',reward:{popularity:20}},
    {id:'rival',title:'本物のライバル',need:{wins:3},text:'何度も競い合ううち、LUXE BEAUTYとの関係は単なる敵対から互いを高めるライバルへ変わった。',line:'次も負けない。でも、あなたが相手なら楽しめそうね。',reward:{money:30000,popularity:30}}
  ],
  pop:[
    {id:'encounter',title:'SNSで見つけた店',need:{},text:'星野ミミがSalon StoryをSNSで紹介した。軽いノリに見えて、投稿には店の良さがしっかり書かれている。',line:'ここ、写真だけじゃなくて空気感もいいじゃん！',reward:{popularity:5}},
    {id:'challenge',title:'バズ対決スタート',need:{battles:1},text:'Beauty Popとの初対決をきっかけに、街の美容好きの間で二つのサロンが話題になり始めた。',line:'次はどっちが街をもっとワクワクさせるか勝負ね！',reward:{money:15000}},
    {id:'respect',title:'数字の向こう側',need:{wins:1},text:'勝負のあと、ミミはフォロワー数だけではないSalon Storyの強さに気づいたようだ。',line:'リピートされる理由、ちょっと分かったかも。',reward:{popularity:20}},
    {id:'rival',title:'最高の競争相手',need:{wins:3},text:'競いながら互いのSNSや接客を研究する関係になり、Beauty Popは一番身近な競争相手になった。',line:'負けたくないけど、一緒に街を盛り上げるのもアリだよね！',reward:{money:30000,popularity:30}}
  ],
  slim:[
    {id:'encounter',title:'数字で見る実力',need:{},text:'白石トワが施術データを手にSalon Storyを訪れた。感覚ではなく結果で店の実力を判断するつもりらしい。',line:'雰囲気では評価しません。結果を見せてください。',reward:{popularity:5}},
    {id:'challenge',title:'技術検証',need:{battles:1},text:'Slim Labとの初対決後、トワから施術結果をさらに比較したいと申し出があった。',line:'興味深い結果です。再現できるなら、本物ですね。',reward:{money:15000}},
    {id:'respect',title:'データが示した答え',need:{wins:1},text:'Salon Storyが勝利を収め、トワはスタッフ育成と顧客相性まで含めた運営力を評価した。',line:'技術だけではない。その組み合わせが強さなんですね。',reward:{popularity:20}},
    {id:'rival',title:'研究者からライバルへ',need:{wins:3},text:'何度も結果を競い合い、Slim LabはSalon Storyを研究対象ではなく対等なライバルとして見るようになった。',line:'次のデータも楽しみにしています。もちろん、次は私が勝ちます。',reward:{money:30000,popularity:30}}
  ]
};
"""
assert old in s, 'rankOrder anchor missing'
s=s.replace(old,new,1)

old="stores:defaultStores(),activeStore:'main',ownerEnergy:100,weekday:'月曜日',news:['街にFashion ShopとBeauty Shopがオープンしました'],contest:{best:null,entries:0,lastRanking:null},rivalBattle:{wins:0,losses:0,draws:0,streak:0,lastDay:0,history:[]},gameFlags:{},lastAutoStoreReport:null,"
new="stores:defaultStores(),activeStore:'main',ownerEnergy:100,weekday:'月曜日',news:['街にFashion ShopとBeauty Shopがオープンしました'],contest:{best:null,entries:0,lastRanking:null},rivalBattle:{wins:0,losses:0,draws:0,streak:0,lastDay:0,history:[]},rivalStorySeen:[],gameFlags:{},lastAutoStoreReport:null,"
assert old in s, 'fresh state anchor missing'
s=s.replace(old,new,1)

old="rivalBattle:{...base.rivalBattle,...(raw.rivalBattle||{}),history:Array.isArray(raw.rivalBattle?.history)?raw.rivalBattle.history:[]},migrationFlags:"
new="rivalBattle:{...base.rivalBattle,...(raw.rivalBattle||{}),history:Array.isArray(raw.rivalBattle?.history)?raw.rivalBattle.history:[]},rivalStorySeen:Array.isArray(raw.rivalStorySeen)?raw.rivalStorySeen:[],migrationFlags:"
assert old in s, 'migrate anchor missing'
s=s.replace(old,new,1)

old="function rivalChallengeAvailable(s=state){return!!s.rivalsUnlocked&&Number(s.day||1)-Number(s.rivalBattle?.lastDay||0)>=7}\n"
new="""function rivalStoryStats(rivalId,s=state){const history=Array.isArray(s.rivalBattle?.history)?s.rivalBattle.history:[],battles=history.filter(x=>x.rivalId===rivalId),wins=battles.filter(x=>x.result==='win');return{battles:battles.length,wins:wins.length}}
function rivalStorySeenCount(rivalId,s=state){const seen=Array.isArray(s.rivalStorySeen)?s.rivalStorySeen:[];return(rivalStorylines[rivalId]||[]).filter(ep=>seen.includes(`${rivalId}:${ep.id}`)).length}
function nextRivalStory(rivalId,s=state){if(!s.rivalsUnlocked)return null;const episodes=rivalStorylines[rivalId]||[],stats=rivalStoryStats(rivalId,s),seen=Array.isArray(s.rivalStorySeen)?s.rivalStorySeen:[];return episodes.find(ep=>!seen.includes(`${rivalId}:${ep.id}`)&&stats.battles>=Number(ep.need?.battles||0)&&stats.wins>=Number(ep.need?.wins||0))||null}
function playRivalStory(rivalId,s=state){const ep=nextRivalStory(rivalId,s),rival=s.rivals?.find(x=>x.id===rivalId),owner=rivalOwners[rivalId];if(!ep||!rival||!owner)return null;s.rivalStorySeen=Array.isArray(s.rivalStorySeen)?s.rivalStorySeen:[];s.rivalStorySeen.push(`${rivalId}:${ep.id}`);const money=Number(ep.reward?.money||0),popularity=Number(ep.reward?.popularity||0);s.money+=money;s.popularity+=popularity;s.news.unshift(`${rival.name} STORY「${ep.title}」`);s.specialOverlay={type:'contest',title:`${rival.icon||'⚡'} ${rival.name} STORY`,big:ep.title,text:`${ep.text}\n\n${owner.name}「${ep.line}」${money||popularity?`\n報酬 ${money?yen(money):''}${money&&popularity?'・':''}${popularity?`人気 +${popularity}`:''}`:''}`};return ep}
function rivalChallengeAvailable(s=state){return!!s.rivalsUnlocked&&Number(s.day||1)-Number(s.rivalBattle?.lastDay||0)>=7}
"""
assert old in s, 'rival available anchor missing'
s=s.replace(old,new,1)

old="function rivalBattleCard(){if(!state.rivalsUnlocked)return'';"
new="""function rivalStoryCard(){if(!state.rivalsUnlocked)return'';return`<div class=\"card contest-card\"><h2>📖 RIVAL STORY</h2><p>対決を重ねると、ライバルオーナーとの関係が変化します。</p>${state.rivals.map(r=>{const owner=rivalOwners[r.id],episodes=rivalStorylines[r.id]||[],seen=rivalStorySeenCount(r.id),next=nextRivalStory(r.id);return`<div class=\"row rival-story-row\"><span>${r.icon||'⚡'} <b>${owner?.name||r.name}</b><small>${r.name} · STORY ${seen}/${episodes.length}</small></span>${next?`<button class=\"soft\" data-rival-story=\"${r.id}\">${next.title}を見る</button>`:`<b>${seen>=episodes.length?'COMPLETE':'次の対決で進展'}</b>`}</div>`}).join('')}</div>`}
function rivalBattleCard(){if(!state.rivalsUnlocked)return'';"""
assert old in s, 'battle card anchor missing'
s=s.replace(old,new,1)

old="</div>${rivalBattleCard()}<div class=\"card contest-card\"><h2>🏆 地域美容サロンAWARD</h2>"
new="</div>${rivalStoryCard()}${rivalBattleCard()}<div class=\"card contest-card\"><h2>🏆 地域美容サロンAWARD</h2>"
assert old in s, 'world card anchor missing'
s=s.replace(old,new,1)

old="document.querySelectorAll('[data-rival-challenge]').forEach(b=>b.onclick=()=>{const result=resolveRivalChallenge(b.dataset.rivalChallenge);if(result){save();render()}});"
new="document.querySelectorAll('[data-rival-story]').forEach(b=>b.onclick=()=>{const story=playRivalStory(b.dataset.rivalStory);if(story){save();render()}});document.querySelectorAll('[data-rival-challenge]').forEach(b=>b.onclick=()=>{const result=resolveRivalChallenge(b.dataset.rivalChallenge);if(result){save();render()}});"
assert old in s, 'event listener anchor missing'
s=s.replace(old,new,1)

old="completeChapter,rivalChallengeAvailable,rivalChallengeTarget,rivalChallengeScores,resolveRivalChallenge,endlessModeActive"
new="completeChapter,rivalStoryStats,rivalStorySeenCount,nextRivalStory,playRivalStory,rivalChallengeAvailable,rivalChallengeTarget,rivalChallengeScores,resolveRivalChallenge,endlessModeActive"
assert old in s, 'test export anchor missing'
s=s.replace(old,new,1)

p.write_text(s)

p=Path('tests/v06-systems.test.mjs')
t=p.read_text()
marker='// Rival story phase 2 regression coverage.'
if marker not in t:
    t += r'''

// Rival story phase 2 regression coverage.
{
  const s=api.freshState();
  s.rivalsUnlocked=true;
  assert.equal(api.rivalStoryStats('luxe',s).battles,0,'ライバル別対戦数は0から開始');
  assert.equal(api.nextRivalStory('luxe',s)?.id,'encounter','解放直後に固有導入ストーリーが出る');
  const first=api.playRivalStory('luxe',s);
  assert.equal(first?.id,'encounter','導入ストーリーを再生できる');
  assert.equal(api.nextRivalStory('luxe',s),null,'未対戦では第2話は未解放');
  s.rivalBattle.history.push({day:8,rivalId:'luxe',rivalName:'LUXE BEAUTY',result:'loss'});
  assert.equal(api.nextRivalStory('luxe',s)?.id,'challenge','初対戦後に第2話が解放');
  api.playRivalStory('luxe',s);
  s.rivalBattle.history.push({day:15,rivalId:'luxe',rivalName:'LUXE BEAUTY',result:'win'});
  assert.equal(api.nextRivalStory('luxe',s)?.id,'respect','初勝利後に第3話が解放');
  api.playRivalStory('luxe',s);
  s.rivalBattle.history.push({day:22,rivalId:'luxe',rivalName:'LUXE BEAUTY',result:'win'});
  s.rivalBattle.history.push({day:29,rivalId:'luxe',rivalName:'LUXE BEAUTY',result:'win'});
  assert.equal(api.nextRivalStory('luxe',s)?.id,'rival','3勝後に最終話が解放');
  const beforeMoney=s.money,beforePopularity=s.popularity;
  api.playRivalStory('luxe',s);
  assert.equal(s.money,beforeMoney+30000,'最終話報酬の賞金を付与');
  assert.equal(s.popularity,beforePopularity+30,'最終話報酬の人気を付与');
  assert.equal(api.rivalStorySeenCount('luxe',s),4,'4話完読を記録');
  assert.equal(api.nextRivalStory('luxe',s),null,'完読後は重複再生しない');
}
'''
p.write_text(t)

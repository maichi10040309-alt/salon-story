import assert from'node:assert/strict';
import{access,readFile}from'node:fs/promises';
import{createTreatmentGame,estimateScore,ratingForBonus,treatmentBonusFromGame,treatmentGamePage,treatmentGameSpecs}from'../src/treatment-games.js';
import{staff as staffTemplates}from'../src/data/staff.js';

const expected={
  facial:['serumSpread','facial.png',1145,1374],pore:['poreClean','pore.png',1199,1312],smallface:['liftSwipe','smallface.png',1145,1374],
  relax:['massageHold','relax.png',1164,1351],slimming:['machineTrace','slimming.png',1024,1536],luxurySlimming:['machineTraceAdvanced','slimming.png',1024,1536],
  bust:['decolleteLift','bust.png',1237,1272],headspa:['scalpMassage','headspa.png',1199,1312]
};
for(const [serviceId,[kind,file,width,height]]of Object.entries(expected)){
  const spec=treatmentGameSpecs[serviceId];assert.equal(spec.kind,kind,`${serviceId}のゲーム種別`);assert.equal(spec.imagePath,`assets/treatment-games/${file}`);
  const path=new URL(`../assets/treatment-games/${file}`,import.meta.url);await access(path);const png=await readFile(path);
  assert.equal(png.subarray(1,4).toString(),'PNG',`${file}はPNG`);assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);assert.equal(png[25],6,`${file}はRGBA透過PNG`);
}
assert.equal(new Set(Object.values(treatmentGameSpecs).map(spec=>spec.imagePath)).size,7,'高級痩身だけ通常痩身画像を共用');

for(const serviceId of Object.keys(expected)){
  const game=createTreatmentGame(serviceId);assert.equal(game.serviceId,serviceId);assert.equal(game.kind,expected[serviceId][0]);assert.equal(game.progress,0);assert.equal(game.completed,false);
  assert.doesNotThrow(()=>JSON.parse(JSON.stringify(game)),`${serviceId}状態はセーブ可能`);
  const markup=treatmentGamePage(game);assert.match(markup,new RegExp(expected[serviceId][1].replace('.','\\.')));assert.match(markup,/data-game-stage/);assert.match(markup,/data-action="skipTreatment"/);assert.doesNotMatch(markup,/base64|blob:|data:image/);
}
const assisted=createTreatmentGame('facial',{assisted:true,tech:92});assert.equal(assisted.assisted,true);assert.equal(assisted.tech,92);
const perfect={...createTreatmentGame('facial'),progress:100,attempts:10,successfulActions:10,totalDistance:100,outsideDistance:0,mistakes:0};
assert.equal(estimateScore(perfect),100);assert.equal(treatmentBonusFromGame(perfect),8);assert.equal(ratingForBonus(8),'PERFECT');
const miss=createTreatmentGame('facial');assert.equal(estimateScore(miss),0);assert.equal(treatmentBonusFromGame(miss),0);assert.equal(ratingForBonus(0),'MISS');
for(let progress=0;progress<=100;progress+=5){const bonus=treatmentBonusFromGame({...createTreatmentGame('pore'),progress});assert.ok(bonus>=0&&bonus<=8,'bonusは0〜8')}

const source=await readFile(new URL('../src/treatment-games.js',import.meta.url),'utf8'),css=await readFile(new URL('../src/treatment-games.css',import.meta.url),'utf8'),gameSource=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
for(const event of ['pointerdown','pointermove','pointerup','pointercancel'])assert.match(source,new RegExp(`addEventListener\\('${event}'`),`${event}対応`);
assert.match(source,/setPointerCapture/);assert.match(source,/releasePointerCapture/);assert.match(css,/touch-action:none/,'iPhone操作領域のスクロール抑止');
assert.match(source,/serum-stroke/);assert.match(source,/poreTargets/);assert.match(source,/liftLines/);assert.match(source,/circleTravel/);assert.match(source,/machine-head/);assert.match(source,/speedLabel/);
assert.match(gameSource,/assignedStaffId\|\|!!state\.session\?\.autoMode/,'スタッフ施術でも判定軽減');assert.match(gameSource,/finishTreatmentGame\(\{skipped:true\}\)/,'スキップ経路');assert.match(gameSource,/nominationMiss=!!nominatedStaff&&servedBy!==nominatedStaff/,'指名外PERFECT制限');
assert.match(gameSource,/current\.kind===expected\.kind/,'旧式ミニゲーム状態は新しいkindへ安全に更新');

const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};globalThis.window=globalThis;Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
await import('../src/game-v03.js?treatment-tests');const api=window.__SALON_STORY_TEST__,play=api.freshState();
play.storeRank='A';play.popularity=1000;play.rating=5;play.staff={...staffTemplates[0],level:1,xp:0,energy:100,bond:0,role:'スタッフ',management:20,treatments:0,skills:[],nominations:0,monthlySales:0,monthlyPerfect:0};api.setState(play);api.startDay();
assert.ok(play.session.queue.length>0,'営業対象顧客あり');api.prepareAutoService();api.beginTreatment();assert.equal(play.session.phase,'treatmentGame');assert.equal(play.session.treatmentGame.assisted,true,'スタッフ施術は判定軽減');
play.session.treatmentDecisionBonus=3;play.session.treatmentBonus=3;api.finishTreatmentGame({skipped:true});assert.equal(play.session.results.at(-1).treatmentBonus,3,'スキップでも施術判断bonusを維持');assert.equal(play.session.phase,'serviceResult','スキップ後も営業継続');

const designated=api.freshState();designated.storeRank='A';designated.popularity=1000;designated.rating=5;designated.staff={...staffTemplates[0],name:'担当外スタッフ',tech:100,service:100,level:20,xp:0,energy:100,bond:0,role:'店長',management:100,treatments:0,skills:['痩身マスター','美肌マスター'],nominations:0,monthlySales:0,monthlyPerfect:0};api.setState(designated);api.startDay();
const designatedCustomer=designated.customers.find(customer=>customer.id===designated.session.queue[0]);designatedCustomer.favoriteStaff='指名スタッフ';designated.session.eventModifiers.satisfaction=30;const designatedResult=api.autoServeCurrent(true);assert.ok(designatedResult.score<=89,'指名外スタッフは満点でもPERFECT不可');

const legacy=api.freshState();legacy.gameVersion='0.6';legacy.session={phase:'treatment',selectedService:'facial',queue:['misaki'],index:0,results:[]};legacy.activeBusinessSession=legacy.session;
const migrated=api.migrate(legacy);assert.equal(migrated.session.selectedService,'facial','旧営業セーブを維持');assert.equal(migrated.session.treatmentGame,undefined,'旧セーブへ必須破壊変更なし');

console.log('Salon Story interactive treatment game tests: OK');

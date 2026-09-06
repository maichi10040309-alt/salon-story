import assert from 'node:assert/strict';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};
globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};
globalThis.window=globalThis;
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});

await import('../src/game-v03.js');
const api=window.__SALON_STORY_TEST__;
const fresh=api.freshState();
assert.equal(fresh.gameVersion,'0.5');
assert.equal(fresh.money,500000);
assert.equal(fresh.customers.length>=30,true);
assert.equal(new Set(fresh.customers.map(c=>c.id)).size,fresh.customers.length);
assert.equal(fresh.customers.every(c=>c.counseling.length===4),true);
assert.equal(fresh.unlockedCustomers.length,10);
assert.equal(fresh.storeRank,'D');
assert.equal(fresh.rivals.length,3);
assert.equal(fresh.dailyMissions.length,3);
assert.deepEqual(fresh.encounteredCustomers,[],'新規ゲームは未遭遇から開始');
assert.deepEqual(fresh.recentCustomerIds,[],'来店履歴は空で開始');
assert.equal(fresh.wardrobe.owned.length>=3,true,'初期コーデパーツ');
assert.equal(fresh.stores.length,1,'本店を保持');
assert.equal(fresh.ui.preview,null,'試着状態は空で開始');
assert.equal(typeof fresh.customers.find(c=>c.id==='misaki').appearance,'object','主要顧客の外見データ');

const old={version:2,day:12,money:345678,popularity:456,rating:4.2,salonLevel:3,xp:270,staff:{id:'akari',name:'あかり',tech:50,service:80,sales:60,speed:55,stamina:60,popularity:55,salary:180000,trait:'接客上手',emoji:'👩🏻‍🦰'},customers:[{id:'misaki',trust:77,visits:6,totalSpent:88000}],equipment:{bed:3,sofa:2,plant:1,shelf:1},history:[{day:1,sales:8000,guests:1,avg:80,profit:8000}],cumulativeSales:88000,developedServices:['facial','smallface','slimming'],serviceLevels:{facial:1,smallface:1,slimming:1}};
const migrated=api.migrate(old);
assert.equal(migrated.money,345678);
assert.equal(migrated.staff.name,'あかり');
assert.equal(migrated.customers.find(c=>c.id==='misaki').trust,77);
assert.equal(migrated.equipment.bed,3);
assert.equal(migrated.history.length,1);
assert.equal(migrated.gameVersion,'0.5');
assert.equal(migrated.customers.length>=30,true);
assert.equal(migrated.encounteredCustomers.includes('misaki'),true);
assert.equal(migrated.money,old.money,'Ver.0.3の所持金を維持');
assert.equal(migrated.stores[0].name,'Salon Story 本店','店舗データを補完');
assert.equal(api.customerRank({visits:2,trust:20}),'リピーター');
assert.equal(api.customerRank({visits:5,trust:60}),'常連');
assert.equal(api.customerRank({visits:10,trust:90}),'VIP');
assert.equal(api.ratingLabel(95).label,'✨ PERFECT!');
assert.equal(api.ratingLabel(80).label,'♡ GOOD!');
assert.equal(api.ratingLabel(30).label,'💢 BAD');

api.setState(fresh);api.addXP(100);
assert.equal(api.getState().salonLevel,2);
assert.equal(api.getState().unlockedCustomers.includes('nana'),true);
assert.equal(api.canDevelopService('bust'),true);
assert.equal(api.developServiceById('bust'),true);

const rankState=api.freshState();rankState.money=500000;rankState.popularity=500;rankState.cumulativeSales=500000;api.setState(rankState);
assert.equal(api.rankEligible('C'),true);
assert.equal(api.expandStore('C'),true);
assert.equal(api.getState().money,200000);
const poor=api.freshState();poor.money=100;poor.popularity=500;poor.cumulativeSales=500000;api.setState(poor);
assert.equal(api.expandStore('C'),false);

const chapterState=api.freshState();chapterState.salonLevel=2;chapterState.cumulativeSales=100000;chapterState.customers[0].visits=2;chapterState.encounteredCustomers.push(chapterState.customers[0].id);api.setState(chapterState);
assert.equal(api.chapterReady(),true);
assert.equal(api.completeChapter(),true);
assert.equal(api.getState().money,550000);

const bonusState=api.freshState();bonusState.player.outfit='trend';bonusState.fashion.owned.push('trend');api.setState(bonusState);
assert.equal(api.outfitBonus({category:'若年層',personality:'流行好き',concern:'小顔'},{matches:['小顔']}).bonus,8);
bonusState.machines.poreMachine={owned:true,level:1};
assert.equal(api.machineBonus({concern:'毛穴'}),10);
console.log('Salon Story Ver.0.5 state tests: OK');

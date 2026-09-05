import assert from 'node:assert/strict';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};
globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};
globalThis.window=globalThis;
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});

await import('../src/game-v02.js');
const api=window.__SALON_STORY_TEST__;

const fresh=api.freshState();
assert.equal(fresh.money,500000,'新規ゲームの所持金');
assert.deepEqual(fresh.developedServices,['facial','smallface','slimming'],'初期施術');
assert.equal(fresh.customers.length,10,'顧客数');
assert.equal(fresh.customers.every(c=>c.counseling.length===4),true,'全顧客の4選択肢');
assert.equal(fresh.goals.length,3,'短期目標');

const old={day:12,money:345678,popularity:456,rating:4.2,salonLevel:3,xp:270,staff:{id:'akari',name:'あかり',tech:50,service:80,sales:60,speed:55,stamina:60,popularity:55,salary:180000,trait:'接客上手',emoji:'👩🏻‍🦰'},customers:[{id:'misaki',trust:77,visits:6,totalSpent:88000}],equipment:{bed:3,sofa:2,plant:1,shelf:1},history:[{day:1,sales:8000,guests:1,avg:80,profit:8000}],cumulativeSales:88000};
const migrated=api.migrate(old);
assert.equal(migrated.money,345678,'所持金を維持');
assert.equal(migrated.staff.name,'あかり','スタッフを維持');
assert.equal(migrated.customers.find(c=>c.id==='misaki').trust,77,'顧客信頼度を維持');
assert.equal(migrated.equipment.bed,3,'設備を維持');
assert.equal(migrated.history.length,1,'履歴を維持');
assert.equal(migrated.customers.find(c=>c.id==='misaki').job,'会社員','不足項目を補完');
assert.equal(api.customerRank({visits:2,trust:20}),'リピーター');
assert.equal(api.customerRank({visits:5,trust:60}),'常連');
assert.equal(api.customerRank({visits:10,trust:90}),'VIP');
assert.equal(api.ratingLabel(95).label,'✨ PERFECT!');
assert.equal(api.ratingLabel(80).label,'♡ GOOD!');
assert.equal(api.ratingLabel(30).label,'💢 BAD');
console.log('Salon Story Ver.0.2 state tests: OK');

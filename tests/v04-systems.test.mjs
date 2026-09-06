import assert from'node:assert/strict';
import{fashionItems,makeupStyles,hairstyles20,staffProfiles,secondStoreAreas}from'../src/data/v04.js';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};
globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};
globalThis.window=globalThis;
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
await import('../src/game-v03.js?systems');
const api=window.__SALON_STORY_TEST__;

assert.equal(fashionItems.length>=40,true,'衣装40点以上');
assert.equal(new Set(fashionItems.map(x=>x.id)).size,fashionItems.length,'衣装ID重複なし');
assert.equal(new Set(fashionItems.map(x=>x.brand)).size,4,'4ブランド');
assert.equal(makeupStyles.length>=6,true,'メイク6種類');
assert.equal(hairstyles20.length>=20,true,'髪型20種類');
assert.equal(Object.keys(staffProfiles).length,3,'初期スタッフ全員のプロフィール');
assert.equal(secondStoreAreas.length,3,'出店候補3エリア');

const s=api.freshState();
s.staff={id:'akari',name:'あかり',level:3,bond:20,treatments:10,service:75,role:'新人',skills:[],management:20,popularity:55};
api.setState(s);
assert.equal(api.canPromote(),true,'スタッフ昇格条件');
assert.equal(api.promoteStaff(),true,'新人からスタッフへ昇格');
assert.equal(api.getState().staff.role,'スタッフ');

const storyState=api.freshState(),misaki=storyState.customers.find(c=>c.id==='misaki');misaki.visits=1;storyState.encounteredCustomers.push('misaki');api.setState(storyState);
assert.equal(api.nextCustomerStory(misaki).step,1,'顧客Story 1解禁');

const chain=api.freshState();chain.storeRank='A';chain.completedChapters=[1,2,3,4,5];api.setState(chain);
assert.equal(api.secondStoreUnlocked(),true,'Rank A＋Chapter 5で2号店解禁');

const style=api.freshState();style.wardrobe.owned.push('tops-silk','bottoms-slacks');style.wardrobe.equipped={tops:'tops-silk',bottoms:'bottoms-slacks',dresses:null,shoes:null,bags:null,accessories:null};style.wardrobe.makeup='mode';style.wardrobe.makeupOwned.push('mode');api.setState(style);
assert.equal(api.styleScores().luxury>0,true,'パーツとメイクからSTYLE計算');

const legacy={version:3,gameVersion:'0.3',day:22,money:765432,popularity:900,rating:4.4,salonLevel:4,xp:600,customers:[{id:'misaki',trust:88,visits:7,totalSpent:120000,visitHistory:[{day:21,service:'痩身ケア',score:90,sales:8000}]}],equipment:{bed:3},history:[{day:21,sales:8000}],staff:{id:'akari',name:'あかり',level:5,service:82,tech:60,sales:65,speed:60,popularity:70}};
const migrated=api.migrate(legacy);
assert.equal(migrated.gameVersion,'0.6');assert.equal(migrated.money,765432);assert.equal(migrated.day,22);assert.equal(migrated.customers.find(c=>c.id==='misaki').trust,88);assert.equal(migrated.customers.find(c=>c.id==='misaki').lastVisitDay,21);assert.equal(migrated.staff.level,5);assert.equal(migrated.staff.bond,0);assert.equal(migrated.wardrobe.owned.length>=3,true);assert.equal(migrated.stores.length,1);
console.log('Salon Story Ver.0.5 systems tests: OK');

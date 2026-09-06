import assert from'node:assert/strict';

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};
globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};
globalThis.window=globalThis;
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});

await import('../src/game-v03.js?encounters-v57');
const api=window.__SALON_STORY_TEST__;

const first=api.freshState(),customerA=first.customers[0];
first.session={newCustomers:0,results:[]};
first.dailyMissions=[{id:'new-test',title:'新規顧客1人と出会う',type:'newCustomers',target:1,progress:0,done:false}];
api.setState(first);
assert.equal(api.isNewCustomer(customerA),true,'未遭遇顧客は新規');
assert.equal(api.registerCustomerEncounter(first,customerA),true,'初回だけ登録');
api.updateDailyMissions();
assert.deepEqual(first.encounteredCustomers,[customerA.id]);
assert.equal(first.session.newCustomers,1);
assert.equal(first.dailyMissions[0].progress,1);
assert.equal(first.dailyMissions[0].done,true,'お迎え時点でミッション達成');

assert.equal(api.registerCustomerEncounter(first,customerA),false,'遭遇済みは再加算しない');
api.updateDailyMissions();
assert.equal(first.session.newCustomers,1,'連打しても二重加算なし');

const two=api.freshState(),[customerB,customerC]=two.customers;
two.session={newCustomers:0,results:[]};
assert.equal(api.registerCustomerEncounter(two,customerB),true);
assert.equal(api.registerCustomerEncounter(two,customerC),true);
assert.equal(two.session.newCustomers,2,'未遭遇2名をそれぞれ加算');

const returning=api.freshState(),returningCustomer=returning.customers[0];
returning.encounteredCustomers=[returningCustomer.id];returning.session={newCustomers:0,results:[]};
assert.equal(api.registerCustomerEncounter(returning,returningCustomer),false);
assert.equal(returning.session.newCustomers,0,'再来店は新規顧客に数えない');

const legacyBase=api.freshState();
const legacyCustomers=legacyBase.customers.map(customer=>({...customer,visits:0,visitHistory:[],reviews:[]}));
legacyCustomers[0].visits=1;
const migrated=api.migrate({version:5,gameVersion:'0.5',customers:legacyCustomers,encounteredCustomers:legacyCustomers.map(customer=>customer.id)});
assert.equal(migrated.encounteredCustomers.length,1,'全顧客データがあっても全員を遭遇済みにしない');
assert.equal(migrated.encounteredCustomers.includes(legacyCustomers[0].id),true,'visits > 0 は遭遇済みに復元');
assert.equal(migrated.encounteredCustomers.includes(legacyCustomers[1].id),false,'履歴なし・visits 0 は未遭遇に復元');
assert.equal(migrated.migrationFlags.encounteredV57,true,'v57救済処理の完了を記録');

console.log('Salon Story v57 customer encounter tests: OK');

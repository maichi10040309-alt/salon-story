import assert from'node:assert/strict';
import{customers as templates}from'../src/data/customers.js';
import{selectDailyCustomers}from'../src/visitor-selection.js';

function rng(seed=7){let x=seed>>>0;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
const customers=templates.map(c=>({...c,lastVisitDay:null,visits:0,repeatChance:20}));
const encountered=[],history=[],frequency=new Map(customers.map(c=>[c.id,0]));
let yesterday=[];const random=rng(42);
for(let day=1;day<=100;day++){
  const ids=selectDailyCustomers({day,availableCustomers:customers,recentHistory:history,encounteredCustomers:encountered,reservationIds:[],desiredCount:day<=10?3:6,trend:{name:'小顔ブーム',targets:['小顔']},rng:random});
  assert.equal(ids.length,new Set(ids).size,`Day ${day}: 同一日重複なし`);
  assert.equal(ids.some(id=>yesterday.includes(id)),false,`Day ${day}: 通常客の連続来店なし`);
  if(day<=7&&customers.some(c=>!encountered.includes(c.id)))assert.equal(ids.some(id=>!encountered.includes(id)),true,`Day ${day}: 未遭遇を保証`);
  for(const id of ids){const c=customers.find(x=>x.id===id);c.lastVisitDay=day;c.visits++;c.repeatChance=Math.min(75,c.repeatChance+2);frequency.set(id,frequency.get(id)+1);if(!encountered.includes(id))encountered.push(id)}
  history.push({day,ids});if(history.length>7)history.shift();yesterday=ids;
}
assert.equal(encountered.length>=30,true,'100日で30名以上に遭遇');
const firstTen=templates.slice(0,10).filter(c=>encountered.includes(c.id)).length;
assert.equal(firstTen>=8,true,'初期顧客の大半に遭遇');
const values=[...frequency.values()];
assert.equal(Math.max(...values)-Math.min(...values)<20,true,`分布差 ${Math.max(...values)}-${Math.min(...values)}`);
assert.equal(customers.filter(c=>c.visits>=5).length>10,true,'リピーター候補も再来店');
customers[0].visits=10;customers[0].trust=95;customers[0].lastVisitDay=98;
const vipDay=selectDailyCustomers({day:101,availableCustomers:customers,recentHistory:history,encounteredCustomers:encountered,reservationIds:[customers[0].id],desiredCount:4,rng:random});
assert.equal(vipDay[0],customers[0].id,'予約・ストーリー客を優先可能');
console.log('Salon Story Ver.0.4 visitor simulation: OK',Object.fromEntries(frequency));

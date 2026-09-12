from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'target not found: {label}')
    s=s.replace(old,new,1)

# Persistent referral state.
rep("salonDecor:{owned:[],equipped:[]},staffRoster:[],secretCustomers:[]",
    "salonDecor:{owned:[],equipped:[]},staffRoster:[],secretCustomers:[],referralQueue:[],referralHistory:[]",
    'fresh referral state')

rep("salonDecor:{...base.salonDecor,...(raw.salonDecor||{})},staffRoster:raw.staffRoster||[],secretCustomers:raw.secretCustomers||[]",
    "salonDecor:{...base.salonDecor,...(raw.salonDecor||{})},staffRoster:raw.staffRoster||[],secretCustomers:raw.secretCustomers||[],referralQueue:Array.isArray(raw.referralQueue)?raw.referralQueue:[],referralHistory:Array.isArray(raw.referralHistory)?raw.referralHistory:[]",
    'migrate referral state')

rep("visitHistory:visits,referrals:old.referrals||0,lastVisitDay:old.lastVisitDay??visits.at(-1)?.day??null,staffScores:old.staffScores||{}",
    "visitHistory:visits,referrals:old.referrals||0,referredBy:old.referredBy||null,referralGroupId:old.referralGroupId||null,lastVisitDay:old.lastVisitDay??visits.at(-1)?.day??null,staffScores:old.staffScores||{}",
    'migrate customer referral fields')

# Referral helpers and story acceleration.
anchor="function storyRankAtLeast(c,rank){const order=['新規顧客','一般客','リピーター','常連','VIP'];return order.indexOf(customerRank(c))>=order.indexOf(rank)}"
helpers=r'''function referralGroupMembers(groupId,s=state){return groupId?s.customers.filter(c=>c.referralGroupId===groupId):[]}
function pendingReferralForDay(s=state){return(s.referralQueue||[]).find(x=>!x.completed&&Number(x.dueDay||0)<=Number(s.day)&&s.unlockedCustomers.includes(x.customerId))||null}
function referralRecordFor(customerId,s=state){return(s.referralQueue||[]).find(x=>!x.completed&&x.customerId===customerId)||null}
function createCustomerReferral(referrer,score,s=state,rng=Math.random){
  if(!referrer||Number(score)<88||Number(referrer.trust)<80||!['常連','VIP'].includes(customerRank(referrer))||Number(referrer.referrals||0)>=3)return null;
  const queued=new Set((s.referralQueue||[]).filter(x=>!x.completed).map(x=>x.customerId)),candidates=s.customers.filter(c=>c.id!==referrer.id&&s.unlockedCustomers.includes(c.id)&&!s.encounteredCustomers.includes(c.id)&&!queued.has(c.id));
  if(!candidates.length)return null;
  const guaranteed=Number(referrer.referrals||0)===0||Number(score)>=95;if(!guaranteed&&rng()>.45)return null;
  const target=candidates[Math.floor(rng()*candidates.length)]||candidates[0],groupId=referrer.referralGroupId||`circle-${referrer.id}`,record={id:`ref-${s.day}-${referrer.id}-${target.id}`,referrerId:referrer.id,customerId:target.id,groupId,createdDay:s.day,dueDay:s.day+1,completed:false};
  referrer.referrals=Number(referrer.referrals||0)+1;referrer.referralGroupId=groupId;s.referralQueue.push(record);s.referralHistory.push({...record,status:'created'});s.referralHistory=s.referralHistory.slice(-100);s.news.unshift(`紹介：${referrer.name}様が${target.name}様を紹介してくれました`);s.todayHighlights?.push(`${referrer.name}様から${target.name}様へ紹介がつながりました`);return record
}
function applyReferralArrival(customer,s=state){const record=referralRecordFor(customer?.id,s);if(!record)return null;const referrer=s.customers.find(c=>c.id===record.referrerId);customer.referredBy=record.referrerId;customer.referralGroupId=record.groupId;customer.trust=clamp(Number(customer.trust||0)+10,0,100);record.completed=true;record.arrivedDay=s.day;s.referralHistory.push({...record,status:'arrived'});s.referralHistory=s.referralHistory.slice(-100);s.todayHighlights?.push(`${referrer?.name||'常連のお客様'}様の紹介で${customer.name}様が来店（信頼度 +10）`);return record
}'''
rep(anchor,anchor+'\n'+helpers,'referral helpers')

old_story="function nextCustomerStory(c){if(!customerStoryIds.includes(c.id))return null;const progress=state.customerStories[c.id]||0,step=customerStorySteps[progress];if(!step)return null;const n=step.need;return(!n.visits||c.visits>=n.visits)&&(!n.trust||c.trust>=n.trust)&&(!n.rank||storyRankAtLeast(c,n.rank))?step:null}"
new_story="function nextCustomerStory(c){if(!customerStoryIds.includes(c.id))return null;const progress=state.customerStories[c.id]||0,step=customerStorySteps[progress];if(!step)return null;const n=step.need,referralBond=!!c.referredBy||Number(c.referrals||0)>0,visitsNeed=referralBond&&n.visits?Math.max(1,n.visits-1):n.visits,trustNeed=referralBond&&n.trust?Math.max(0,n.trust-5):n.trust;return(!visitsNeed||c.visits>=visitsNeed)&&(!trustNeed||c.trust>=trustNeed)&&(!n.rank||storyRankAtLeast(c,n.rank))?step:null}"
rep(old_story,new_story,'referral story acceleration')

# Prioritize one due referral in the day's queue and surface the referrer in the visit reason.
start=s.index('function startDay(){')
end=s.index('\nfunction currentCustomer()',start)
block=s[start:end]
block=block.replace(',ids=count?selectDailyCustomers({', ';let ids=count?selectDailyCustomers({',1)
block=block.replace('}):[],reasons={};state.dailyVisitorForecast=visitorForecast(count);', '}):[];const dueReferral=pendingReferralForDay();if(dueReferral&&!ids.includes(dueReferral.customerId))ids=[dueReferral.customerId,...ids].slice(0,Math.max(1,count));const reasons={};state.dailyVisitorForecast=visitorForecast(Math.max(count,ids.length));',1)
old_reason="reasons[id]=`${visitReason({customer:c,encounteredCustomers:state.encounteredCustomers,reservationIds,trend:state.dailyTrend})} · ${condition.name}`"
new_reason="const referral=referralRecordFor(id),referrer=referral&&state.customers.find(x=>x.id===referral.referrerId);reasons[id]=`${visitReason({customer:c,encounteredCustomers:state.encounteredCustomers,reservationIds,trend:state.dailyTrend,referrer:referrer?.name||null})} · ${condition.name}`"
if old_reason not in block: raise SystemExit('target not found: startDay referral reason')
block=block.replace(old_reason,new_reason,1)
s=s[:start]+block+s[end:]

# Apply initial trust bonus and chain membership as the referred customer enters service.
rep("state.session.assignedStaffId=null;state.session.assignedStaffName=null;if(isNewCustomer(c))",
    "state.session.assignedStaffId=null;state.session.assignedStaffName=null;applyReferralArrival(c);if(isNewCustomer(c))",
    'apply referral arrival')

# Successful regular/VIP treatments can create a referral.
rep("if(score>=90)state.todayHighlights.push(`${c.name}様がPERFECT！`);",
    "createCustomerReferral(c,score);if(score>=90)state.todayHighlights.push(`${c.name}様がPERFECT！`);",
    'create referral after treatment')

# Make the referral chain visible in the customer chart.
rep("['紹介人数',`${c.referrals||0}人`],['お気に入り施術',c.favoriteService||'—']",
    "['紹介人数',`${c.referrals||0}人`],['紹介元',state.customers.find(x=>x.id===c.referredBy)?.name||'—'],['紹介グループ',c.referralGroupId?`${referralGroupMembers(c.referralGroupId).length}人`:'—'],['お気に入り施術',c.favoriteService||'—']",
    'customer chart referral fields')

# Expose helpers to regression tests.
rep("promoteStaff,nextCustomerStory,secondStoreUnlocked",
    "promoteStaff,nextCustomerStory,referralGroupMembers,pendingReferralForDay,referralRecordFor,createCustomerReferral,applyReferralArrival,secondStoreUnlocked",
    'test api referral exports')

p.write_text(s)

# Behavioral tests for the new chain.
t=Path('tests/v06-systems.test.mjs')
ts=t.read_text()
marker='// Customer referral chain: trusted regulars introduce new customers.'
if marker not in ts:
    ts += r'''

// Customer referral chain: trusted regulars introduce new customers.
const referralState=api.migrate({...api.freshState(),day:12});
const referrer=referralState.customers[0];
referralState.encounteredCustomers.push(referrer.id);referrer.visits=6;referrer.trust=92;referrer.referrals=0;
const referralTarget=referralState.customers.find(c=>c.id!==referrer.id&&referralState.unlockedCustomers.includes(c.id)&&!referralState.encounteredCustomers.includes(c.id));
assert.ok(referralTarget,'紹介候補の未遭遇顧客がいる');
api.setState(referralState);
const referral=api.createCustomerReferral(referrer,96,referralState,()=>0);
assert.ok(referral,'高満足の常連から紹介が発生');
assert.equal(referrer.referrals,1,'紹介人数を可視化');
assert.equal(referral.customerId,referralTarget.id,'未遭遇の解禁済み顧客を紹介');
referralState.day=13;
assert.equal(api.pendingReferralForDay(referralState).customerId,referralTarget.id,'翌日に紹介客を優先来店させる');
const trustBefore=referralTarget.trust;
const arrived=api.applyReferralArrival(referralTarget,referralState);
assert.ok(arrived,'紹介客の来店を処理');
assert.equal(referralTarget.trust,Math.min(100,trustBefore+10),'紹介客は初期信頼度+10');
assert.equal(referralTarget.referredBy,referrer.id,'紹介元を保存');
assert.equal(referralTarget.referralGroupId,referrer.referralGroupId,'同じ紹介グループへ所属');
assert.equal(api.referralGroupMembers(referrer.referralGroupId,referralState).length>=2,true,'紹介チェーンをグループとして可視化');
const migratedReferral=api.migrate(referralState);
assert.equal(Array.isArray(migratedReferral.referralQueue),true,'紹介キューを旧セーブ互換で保持');
assert.equal(migratedReferral.customers.find(c=>c.id===referralTarget.id).referredBy,referrer.id,'紹介関係をセーブ移行後も保持');
'''
    t.write_text(ts)

import assert from'node:assert/strict';
import{LUMIERE_CITY,beautyResultTier,beautyTreatmentType,calculateDailyVisitorCount,canPauseBusiness,createBeforeAfterRecord,createBeautyVisualProfile,createMonthlyGoals,createTreatmentPlans,eventResultSummary,resumableSession,treatmentAffinity,visitorForecast}from'../src/v62-systems.js';
import{storyEpisodes,extraStaff,socialPostTypes}from'../src/data/v62.js';

const service={id:'facial',name:'フェイシャル',price:13200,time:60,matches:['毛穴','肌荒れ']};
const customer={id:'megumi',name:'恵',concern:'毛穴',budget:14000,visits:1,trust:30};
const staff={name:'美月',energy:80};
const plans=createTreatmentPlans(service,customer,{customerConditions:{megumi:{id:'before-payday',name:'給料日前',budget:.7}}},staff);
assert.equal(plans.length,3);assert.ok(plans[0].score>plans[2].score);assert.equal(treatmentAffinity(service,customer,{}).label,'◎ 相性良好');
const vip={...customer,id:'rena',visits:12,trust:95,budget:30000};
const bonus=createTreatmentPlans(service,vip,{customerConditions:{rena:{id:'after-bonus',budget:1.3}}},staff);
const tired=createTreatmentPlans(service,vip,{customerConditions:{rena:{id:'after-bonus',budget:1.3}}},{...staff,energy:20});
assert.ok(bonus[2].score>bonus[0].score);assert.ok(tired[2].score<bonus[2].score);
assert.equal(calculateDailyVisitorCount({rank:'D',popularity:100,rating:3,reviews:0,rng:()=>0,zeroGuestStreak:0}),0);
assert.ok(calculateDailyVisitorCount({rank:'D',popularity:100,rating:3,reviews:0,rng:()=>0,zeroGuestStreak:2})>=1);assert.equal(visitorForecast(0),'かなり少なそう');
const session={queue:['a'],index:0,results:[],phase:'assign'};assert.ok(resumableSession(session));assert.ok(canPauseBusiness(session));assert.equal(canPauseBusiness({...session,phase:'treatment'}),false);
assert.equal(eventResultSummary({title:'予約なし新規客'},{label:'待ってもらう'},{money:16500,satisfaction:-2},{staff}).changes.length,2);
assert.equal(createBeforeAfterRecord({day:2,customer,service,plan:plans[0],score:90,staff:'オーナー'}).afterExpression,'joy');
for(const [serviceId,type] of [['smallface','smallface'],['facial','facial'],['slimming','slimming'],['bust','bust'],['relax','relax']]){
  const visual=createBeautyVisualProfile(serviceId,95);
  assert.equal(beautyTreatmentType(serviceId),type,`${serviceId}の美容差分種別`);
  assert.notEqual(visual.before.effect,visual.after.effect,`${serviceId}のBefore/Afterは同一にしない`);
}
assert.deepEqual([95,80,55,20].map(beautyResultTier),['perfect','good','notbad','bad'],'結果ランク別の差分');
assert.ok(createBeautyVisualProfile('facial',95).intensity>createBeautyVisualProfile('facial',55).intensity,'結果が良いほど変化を強くする');
assert.equal(Object.keys(storyEpisodes).length,10);assert.ok(Object.values(storyEpisodes).every(v=>v.length===5));assert.equal(Object.values(storyEpisodes).flat().length,50);
assert.equal(extraStaff.length,2);assert.equal(socialPostTypes.length,4);assert.equal(createMonthlyGoals(1).length,3);assert.equal(LUMIERE_CITY.ja,'ルミエールシティ');
console.log('v62 systems tests passed');

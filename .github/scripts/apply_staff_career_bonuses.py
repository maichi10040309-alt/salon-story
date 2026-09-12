from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'target not found: {label}')
    s=s.replace(old,new,1)

# Career bonus helpers: promotions now create practical gameplay effects.
anchor="const promotionNeeds={スタッフ:{level:3,bond:20,treatments:10},主任:{level:6,bond:40,treatments:25},店長候補:{level:8,bond:60,treatments:40},店長:{level:10,bond:70,treatments:50,service:70}};"
helpers=r'''const promotionNeeds={スタッフ:{level:3,bond:20,treatments:10},主任:{level:6,bond:40,treatments:25},店長候補:{level:8,bond:60,treatments:40},店長:{level:10,bond:70,treatments:50,service:70}};
function staffRoleIndex(member){return Math.max(0,roles.indexOf(member?.role||'新人'))}
function staffCareerBonus(member,s=state){
  const rank=staffRoleIndex(member),profile={...(staffProfiles[member?.id]||{}),...(member?.profile||{})};
  const result={specialty:[0,1,2,3,4][rank]||0,recovery:[0,0,2,4,6][rank]||0,training:rank>=2?1:0,satisfaction:0,trust:0,socialMultiplier:1,socialPopularity:0,branchMultiplier:1,labels:[]};
  if(rank>=1)result.labels.push(`得意施術 +${result.specialty}`);
  if(rank>=2)result.labels.push(`後輩研修 +${result.training}`);
  if(rank>=3)result.labels.push(`翌日Energy回復 +${result.recovery}`);
  if(rank>=4){result.branchMultiplier=1.12;result.labels.push('支店売上 +12%')}
  if(member?.id==='akari'&&rank>=3){result.satisfaction+=2;result.trust+=1;result.labels.push('夢：安心できる店長（満足度+2・信頼+1）')}
  if(member?.id==='mizuki'&&rank>=2){result.training+=2;result.labels.push('夢：技術講師（研修効果+2）')}
  if(member?.id==='sakura'&&rank>=2){result.socialMultiplier=1.25;result.socialPopularity=2;result.labels.push('夢：人気店の店長（SNS効果+25%）')}
  if(profile.best)result.best=profile.best;
  return result
}
function staffTrainingBonus(trainee,s=state){let bonus=staffCareerBonus(trainee,s).training;const mentor=employedStaffRoster(s).find(member=>member.id!==trainee?.id&&member.id==='mizuki'&&staffRoleIndex(member)>=2);if(mentor)bonus+=2;return bonus}
function promotionSkillFor(member,role){const generic={スタッフ:'得意施術強化',主任:'後輩指導',店長候補:'店舗運営',店長:'支店経営'}[role];const dream=member.id==='mizuki'&&staffRoleIndex(member)>=2?'技術講師':member.id==='akari'&&staffRoleIndex(member)>=3?'安心店長':member.id==='sakura'&&staffRoleIndex(member)>=2?'人気店プロデュース':null;return[generic,dream].filter(Boolean)}'''
rep(anchor,helpers,'career helpers')

old="function promoteStaff(){if(!canPromote())return false;state.staff.role=roles[roles.indexOf(state.staff.role)+1];state.specialOverlay={type:'promotion',title:'STAFF PROMOTION!',big:state.staff.role,text:`${state.staff.name}が「${state.staff.role}」に昇格しました！`};return true}"
new="function promoteStaff(){if(!canPromote())return false;state.staff.role=roles[roles.indexOf(state.staff.role)+1];const perks=promotionSkillFor(state.staff,state.staff.role);state.staff.skills=state.staff.skills||[];for(const perk of perks)if(!state.staff.skills.includes(perk))state.staff.skills.push(perk);if(state.staff.role==='スタッフ')state.staff.tech=clamp(Number(state.staff.tech||0)+2,0,100);if(state.staff.role==='主任')state.staff.management=clamp(Number(state.staff.management||0)+5,0,100);if(state.staff.role==='店長候補'){state.staff.service=clamp(Number(state.staff.service||0)+3,0,100);state.staff.sales=clamp(Number(state.staff.sales||0)+3,0,100)}if(state.staff.role==='店長')state.staff.management=clamp(Number(state.staff.management||0)+10,0,100);const active=state.staffRoster?.find(x=>x.id===state.staff.id);if(active&&active!==state.staff)Object.assign(active,state.staff);const bonus=staffCareerBonus(state.staff);state.specialOverlay={type:'promotion',title:'STAFF PROMOTION!',big:state.staff.role,text:`${state.staff.name}が「${state.staff.role}」に昇格しました！\\n${bonus.labels.join('・')}`};state.news.unshift(`${state.staff.name}が${state.staff.role}へ昇格：${bonus.labels.join('・')}`);return true}"
rep(old,new,'promoteStaff practical rewards')

# Promotion improves real treatment performance.
old="const conditionBonus=conditionServiceBonus(condition,s,c),dayModifier=Number(policy.effects.satisfaction||0)+Number(state.session.eventModifiers.satisfaction||0)+Number(state.session.treatmentBonus||0),planModifier=Number(plan.satisfactionModifier||0),autoModifier=auto?-6:2,specialty=staffSpecialtyAdjustment(state.staff,baseService,plan),customerFit=staffCustomerAffinity(state.staff,c);"
new="const career=staffCareerBonus(state.staff),conditionBonus=conditionServiceBonus(condition,s,c),dayModifier=Number(policy.effects.satisfaction||0)+Number(state.session.eventModifiers.satisfaction||0)+Number(state.session.treatmentBonus||0),planModifier=Number(plan.satisfactionModifier||0),autoModifier=auto?-6:2,specialty=staffSpecialtyAdjustment(state.staff,baseService,plan)+career.specialty+career.satisfaction,customerFit=staffCustomerAffinity(state.staff,c);"
rep(old,new,'treatment career bonus')

old="c.trust=clamp(c.trust+(score>=90?5:score>=75?3:score<40?-4:score<60?-1:1)+(auto?0:2)+Number(plan.trustModifier||0)+Number(state.session.eventModifiers.trust||0),0,100);c.visits++;c.lastVisitDay=state.day;"
new="c.trust=clamp(c.trust+(score>=90?5:score>=75?3:score<40?-4:score<60?-1:1)+(auto?0:2)+Number(plan.trustModifier||0)+Number(state.session.eventModifiers.trust||0)+career.trust,0,100);c.visits++;c.lastVisitDay=state.day;"
rep(old,new,'career trust bonus')

# Higher roles recover better between days.
old="function recoverStaffForNewDay(s=state,restDay=false){for(const member of employedStaffRoster(s)){const off=restDay||isStaffOffToday(member,s.day),gain=off?45:12;member.energy=clamp(Number(member.energy??100)+gain,0,100);if(off){member.consecutiveWorkDays=0;member.lastRestDay=s.day}}if(s.staff){const active=s.staffRoster?.find(x=>x.id===s.staff.id);if(active)s.staff=active}return s.staffRoster}"
new="function recoverStaffForNewDay(s=state,restDay=false){for(const member of employedStaffRoster(s)){const off=restDay||isStaffOffToday(member,s.day),career=staffCareerBonus(member,s),gain=(off?45:12)+career.recovery;member.energy=clamp(Number(member.energy??100)+gain,0,100);if(off){member.consecutiveWorkDays=0;member.lastRestDay=s.day}}if(s.staff){const active=s.staffRoster?.find(x=>x.id===s.staff.id);if(active)s.staff=active}return s.staffRoster}"
rep(old,new,'career recovery')

# Mizuki's instructor dream improves training, and promotions make training more valuable.
old="document.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>{const x=trainingCourses.find(y=>y.id===b.dataset.course);if(!spend(x.cost))return;state.staff[x.stat]=clamp((state.staff[x.stat]||0)+x.gain,0,x.stat==='popularity'?999:100);if(!state.staff.skills.includes(x.skill))state.staff.skills.push(x.skill);state.ownerEnergy=clamp(state.ownerEnergy-5,0,100);save();notify(`${x.skill}を習得！`)});"
new="document.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>{const x=trainingCourses.find(y=>y.id===b.dataset.course);if(!spend(x.cost))return;const trainingBonus=staffTrainingBonus(state.staff);state.staff[x.stat]=clamp((state.staff[x.stat]||0)+x.gain+trainingBonus,0,x.stat==='popularity'?999:100);if(!state.staff.skills.includes(x.skill))state.staff.skills.push(x.skill);state.ownerEnergy=clamp(state.ownerEnergy-5,0,100);save();notify(`${x.skill}を習得！${trainingBonus?` 研修ボーナス +${trainingBonus}`:''}`)});"
rep(old,new,'training bonus handler')

# Sakura's career makes social marketing materially stronger.
old="document.querySelectorAll('[data-social-post]').forEach(b=>b.onclick=()=>{const x=socialPostTypes.find(y=>y.id===b.dataset.socialPost);state.socialFollowers+=x.followers;state.popularity+=x.popularity;state.socialPosts.push({day:state.day,type:x.id});state.news.unshift(`${x.name}をSNSへ投稿しました`);save();notify(`フォロワー +${x.followers}`)});"
new="document.querySelectorAll('[data-social-post]').forEach(b=>b.onclick=()=>{const x=socialPostTypes.find(y=>y.id===b.dataset.socialPost),producer=employedStaffRoster().find(member=>member.id==='sakura'&&staffRoleIndex(member)>=2),career=producer?staffCareerBonus(producer):{socialMultiplier:1,socialPopularity:0},followers=Math.round(x.followers*career.socialMultiplier);state.socialFollowers+=followers;state.popularity+=x.popularity+career.socialPopularity;state.socialPosts.push({day:state.day,type:x.id});state.news.unshift(`${x.name}をSNSへ投稿しました${producer?`（${producer.name}のプロデュース）`:''}`);save();notify(`フォロワー +${followers}`)});"
rep(old,new,'social career bonus')

# Branch sales use the actual manager, not whichever staff happens to be active.
old="function runAutoStore(){const branch=state.stores.find(x=>x.id!=='main');if(!branch||!branch.manager){state.lastAutoStoreReport=null;return 0}const management=state.staff?.management||20,base=15000+branch.popularity*18+management*350,area=secondStoreAreas.find(x=>x.id===branch.area),sales=Math.round(base*(area?.multiplier||1)*(.85+Math.random()*.3)),profit=sales-branch.rent/30;branch.dailySales=sales;branch.sales+=sales;branch.popularity+=2+Math.floor(management/20);state.money+=profit;state.cumulativeSales+=sales;state.lastAutoStoreReport={name:branch.name,sales,profit};return sales}"
new="function runAutoStore(){const branch=state.stores.find(x=>x.id!=='main');if(!branch||!branch.manager){state.lastAutoStoreReport=null;return 0}const manager=employedStaffRoster().find(x=>x.name===branch.manager)||state.staff,management=manager?.management||20,career=staffCareerBonus(manager),base=15000+branch.popularity*18+management*350,area=secondStoreAreas.find(x=>x.id===branch.area),sales=Math.round(base*(area?.multiplier||1)*career.branchMultiplier*(.85+Math.random()*.3)),profit=sales-branch.rent/30;branch.dailySales=sales;branch.sales+=sales;branch.popularity+=2+Math.floor(management/20);state.money+=profit;state.cumulativeSales+=sales;state.lastAutoStoreReport={name:branch.name,sales,profit,manager:manager?.name||branch.manager};return sales}"
rep(old,new,'branch manager career bonus')

# Show current/next career effects directly in staff UI.
old="<div class=\"card\"><h3>昇格</h3>${next?`<p>次の役職：<b>${next}</b></p>${Object.entries(need).map(([k,v])=>`<div class=\"row\"><span>${{level:'Lv.',bond:'仲良し度',treatments:'施術人数',service:'接客'}[k]}</span><b>${state.staff[k]||0} / ${v}</b></div>`).join('')}<button class=\"primary wide\" data-action=\"promote\" ${canPromote()?'':'disabled'}>${next}へ昇格</button>`:'<div class=\"goal-complete\">🏆 店長資格を取得済み</div>'}</div>"
new="<div class=\"card\"><h3>昇格</h3><div class=\"career-bonus\"><b>現在のキャリアボーナス</b>${staffCareerBonus(state.staff).labels.length?staffCareerBonus(state.staff).labels.map(x=>`<div class=\"row\"><span>✦</span><b>${x}</b></div>`).join(''):'<p>昇格すると得意施術や運営ボーナスが増えます</p>'}</div>${next?`<p>次の役職：<b>${next}</b></p>${Object.entries(need).map(([k,v])=>`<div class=\"row\"><span>${{level:'Lv.',bond:'仲良し度',treatments:'施術人数',service:'接客'}[k]}</span><b>${state.staff[k]||0} / ${v}</b></div>`).join('')}<button class=\"primary wide\" data-action=\"promote\" ${canPromote()?'':'disabled'}>${next}へ昇格</button>`:'<div class=\"goal-complete\">🏆 店長資格を取得済み</div>'}</div>"
rep(old,new,'staff page career bonus UI')

# Test API.
rep("coordinateBonus,canPromote,promoteStaff,nextCustomerStory",
    "coordinateBonus,staffRoleIndex,staffCareerBonus,staffTrainingBonus,promotionSkillFor,canPromote,promoteStaff,nextCustomerStory",
    'career test exports')

p.write_text(s)

# Regression tests.
t=Path('tests/v06-systems.test.mjs')
ts=t.read_text()
marker='// Staff career bonuses: promotions affect treatments, training, social, recovery and branch operations.'
if marker not in ts:
    ts += r'''

// Staff career bonuses: promotions affect treatments, training, social, recovery and branch operations.
const careerState=api.migrate({...api.freshState(),staff:{...staffTemplates[1],role:'主任',level:7,bond:50,treatments:30,energy:50},staffRoster:[{...staffTemplates[1],role:'主任',level:7,bond:50,treatments:30,energy:50},{...staffTemplates[0],role:'新人',energy:50}]});
api.setState(careerState);
const mizukiCareer=api.staffCareerBonus(careerState.staff,careerState);
assert.equal(mizukiCareer.training>=3,true,'主任の美月は技術講師ボーナスを持つ');
assert.equal(mizukiCareer.specialty,2,'主任は得意施術補正を得る');
assert.equal(api.staffTrainingBonus(careerState.staffRoster[1],careerState)>=2,true,'美月主任が他スタッフの研修効率を上げる');
careerState.day=2;api.recoverStaffForNewDay(careerState,false);
assert.equal(careerState.staff.energy,64,'主任は通常回復12+キャリア回復2');

const promotionState=api.migrate({...api.freshState(),staff:{...staffTemplates[0],role:'主任',level:8,bond:65,treatments:45,service:75,sales:60,management:30},staffRoster:[{...staffTemplates[0],role:'主任',level:8,bond:65,treatments:45,service:75,sales:60,management:30}]});
api.setState(promotionState);
assert.equal(api.canPromote(),true,'店長候補への昇格条件を満たす');
api.promoteStaff();
assert.equal(promotionState.staff.role,'店長候補');
assert.equal(promotionState.staff.skills.includes('店舗運営'),true,'昇格で実利スキルを獲得');
assert.equal(promotionState.staff.skills.includes('安心店長'),true,'あかりの夢がキャリアスキルになる');
assert.equal(promotionState.staff.service,78,'店長候補で接客能力が上がる');
assert.equal(api.staffCareerBonus(promotionState.staff).trust,1,'あかりの夢で信頼ボーナス');

const sakuraCareer=api.staffCareerBonus({...staffTemplates[2],role:'主任'});
assert.equal(sakuraCareer.socialMultiplier,1.25,'さくら主任はSNS効果25%増');
const managerCareer=api.staffCareerBonus({...staffTemplates[0],role:'店長'});
assert.equal(managerCareer.branchMultiplier,1.12,'店長は支店売上補正を持つ');
'''
    t.write_text(ts)

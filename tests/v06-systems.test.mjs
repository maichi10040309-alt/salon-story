import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{dailyPolicies,weatherTypes,customerConditions,businessEvents,treatmentEvents}from'../src/data/v06.js';
import{applyEventEffects,conditionServiceBonus,createDailyWeather,dailyGuestAdjustment,dayAtmosphere,effectiveBudget,nextDayPreview,pickCustomerCondition,seasonForDay,selectBusinessEvents}from'../src/v06-systems.js';
import{staff as staffTemplates}from'../src/data/staff.js';

assert.equal(dailyPolicies.length,6,'営業方針は6種類');
assert.equal(weatherTypes.length,6,'天気は6種類');
assert.equal(customerConditions.length,20,'日替わりコンディションは20種類');
assert.equal(businessEvents.length>=50,true,'営業イベントは50種類以上');
assert.equal(businessEvents.every(event=>event.choices.length===3),true,'営業イベントは全て3択');
assert.equal(treatmentEvents.length>=8,true,'施術中イベントを用意');
assert.equal(seasonForDay(1),'春');
assert.equal(seasonForDay(31),'夏');
assert.equal(createDailyWeather(1,()=>0).id,'sunny');
assert.equal(createDailyWeather(31,()=>.99).id,'hot');
assert.match(dayAtmosphere(27,'金曜日'),/給料日後/);
assert.equal(dailyGuestAdjustment({weekday:'月曜日',weather:{guest:-1},policy:{effects:{guest:1}}}),-1);
assert.equal(dailyGuestAdjustment({weekday:'土曜日',weather:{guest:0},policy:{effects:{guest:1}}}),2);

const customer={id:'test',concern:'小顔',budget:10000};
const dateCondition=customerConditions.find(x=>x.id==='before-date');
assert.equal(effectiveBudget(customer,dateCondition),12000,'コンディションで予算が変動');
assert.equal(conditionServiceBonus(dateCondition,{matches:['小顔']},customer),10,'対象施術へ補正');
assert.equal(conditionServiceBonus(dateCondition,{matches:['体型改善']},customer),3,'非対象時は基礎補正');
assert.equal(typeof pickCustomerCondition(customer,()=>0).line,'string','来店時会話を保持');

const selected=selectBusinessEvents({day:12,rng:()=>.99,max:3});
assert.equal(selected.length,3,'1日最大3イベント');
assert.equal(new Set(selected.map(x=>x.id)).size,3,'同じ営業イベントを重複させない');
assert.equal(selected.every(x=>x.day===12),true);
assert.equal(selectBusinessEvents({day:12,rng:()=>.99,max:3,rivalsUnlocked:false}).every(x=>x.category!=='rival'),true,'ライバル未解放時はライバル営業イベントを除外');
const eventState={money:1000,popularity:10,staff:{energy:50}};
const applied=applyEventEffects(eventState,{money:-2000,popularity:3,energy:80,satisfaction:2});
assert.equal(eventState.money,0,'イベント支出で所持金を負にしない');
assert.equal(eventState.popularity,13);
assert.equal(eventState.staff.energy,100,'Energyを0〜100に収める');
assert.equal(applied.satisfaction,2);
assert.match(nextDayPreview({day:5,reservations:[{time:'10:00'}]}),/10:00/);
assert.match(nextDayPreview({day:6}),/日曜日/);

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};
globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};
globalThis.window=globalThis;
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
await import('../src/game-v03.js?v06-tests');
const api=window.__SALON_STORY_TEST__;

const legacy=api.freshState();
legacy.gameVersion='0.5';legacy.version=5;legacy.money=321000;legacy.day=19;legacy.storeRank='C';
delete legacy.dailyPolicy;delete legacy.dailyWeather;delete legacy.customerConditions;delete legacy.eventHistory;delete legacy.autoServiceSettings;
const migrated=api.migrate(legacy);
assert.equal(migrated.gameVersion,'0.6');
assert.equal(migrated.money,321000,'v0.5の所持金を維持');
assert.equal(migrated.day,19,'v0.5の日数を維持');
assert.equal(migrated.storeRank,'C','v0.5の店舗Rankを維持');
assert.equal(migrated.dailyPolicy,null);
assert.equal(typeof migrated.dailyWeather.id,'string');
assert.deepEqual(migrated.customerConditions,{});
assert.deepEqual(migrated.eventHistory,[]);
assert.equal(migrated.autoServiceSettings.enabled,true);

const play=api.freshState();
play.staff={...staffTemplates[0],level:1,xp:0,energy:100,bond:0,role:'スタッフ',management:20,treatments:0,skills:[],nominations:0,monthlySales:0,monthlyPerfect:0};
play.staffRoster=[play.staff,{...staffTemplates[1],level:1,xp:0,energy:88,bond:0,role:'スタッフ',management:20,treatments:0,skills:[],nominations:0,monthlySales:0,monthlyPerfect:0}];
play.dailyPolicy=dailyPolicies.find(x=>x.id==='reviews');
play.storeRank='C';
api.setState(api.migrate(play));
api.startDay();
const started=api.getState();
assert.equal(started.screen,'play');
assert.equal(started.session.queue.length>0,true,'営業日の顧客を選出');
assert.equal(started.session.eventQueue.length>=1,true,'毎日最低1つの出来事');
assert.equal(started.session.eventQueue.length<=3,true);
assert.equal(started.session.queue.every(id=>started.customerConditions[id]),true,'来店客ごとにコンディションを設定');
assert.equal(started.session.policyId,'reviews');

const normal=started.customers.find(c=>c.id===started.session.queue[0]);
started.encounteredCustomers.push(normal.id);normal.visits=1;
const ordinary={id:'ordinary-test',visits:1,trust:30,concern:'肩こり',job:'会社員'};
started.encounteredCustomers.push(ordinary.id);
assert.equal(api.manualServiceRequired(ordinary),false,'通常の既存客はおまかせ可能');
started.session.phase='treatment';
api.prepareAutoService();
started.session.phase='treatment';
const activeEnergyBefore=started.staff.energy,inactiveEnergyBefore=started.staffRoster.find(x=>x.id==='mizuki').energy;
const autoResult=api.autoServeCurrent(true);
assert.equal(autoResult.auto,true,'スタッフおまかせ結果として記録');
assert.equal(started.session.results.length,1);
assert.ok(started.staff.energy<activeEnergyBefore,'担当スタッフだけEnergyを消費');
assert.equal(started.staffRoster.find(x=>x.id==='mizuki').energy,inactiveEnergyBefore,'非担当スタッフのEnergyは減らない');

const assignmentState=api.migrate({...api.freshState(),staff:{...staffTemplates[0],energy:82},staffRoster:[{...staffTemplates[0],energy:82},{...staffTemplates[1],energy:67}]});
assignmentState.session={queue:[assignmentState.customers[0].id],index:0,results:[],phase:'assign',staffAssignments:{}};api.setState(assignmentState);
const assigned=api.assignStaffForCurrentCustomer(staffTemplates[1].id);
assert.equal(assigned.id,staffTemplates[1].id,'顧客ごとに担当スタッフを選択できる');
assert.equal(assignmentState.staff,assignmentState.staffRoster[1],'選択したスタッフをactive参照へ接続');
assert.equal(assignmentState.session.assignedStaffId,staffTemplates[1].id,'現在顧客の担当スタッフIDを保持');
assert.equal(assignmentState.session.staffAssignments[assignmentState.customers[0].id],staffTemplates[1].id,'顧客別担当履歴を保持');
assert.equal(api.assignedStaffForCurrentCustomer().id,staffTemplates[1].id,'現在顧客の担当スタッフを取得できる');

const scheduleState=api.migrate({...api.freshState(),day:1,staff:{...staffTemplates[0],energy:55},staffRoster:[{...staffTemplates[0],energy:55},{...staffTemplates[1],energy:40}]});
api.setState(scheduleState);
assert.equal(api.toggleStaffDayOff(staffTemplates[0].id,0),true,'公休を設定できる');
assert.equal(api.isStaffOffToday(scheduleState.staffRoster[0],1),true,'設定曜日は公休になる');
assert.equal(api.staffAvailableToday(scheduleState.staffRoster[0],1),false,'公休スタッフは担当不可');
assert.equal(api.toggleStaffDayOff(staffTemplates[0].id,1),true);
assert.equal(api.toggleStaffDayOff(staffTemplates[0].id,2),false,'公休は週2日まで');
api.markStaffWorked(scheduleState.staffRoster[1],1);api.markStaffWorked(scheduleState.staffRoster[1],1);
assert.equal(scheduleState.staffRoster[1].consecutiveWorkDays,1,'同一日は連勤日数を重複加算しない');
scheduleState.staffRoster[1].lastWorkedDay=4;scheduleState.staffRoster[1].consecutiveWorkDays=5;api.markStaffWorked(scheduleState.staffRoster[1],5);
assert.equal(scheduleState.staffRoster[1].consecutiveWorkDays,6,'連続勤務を記録');
assert.equal(api.staffFatiguePenalty(scheduleState.staffRoster[1]),4,'5日超の連勤に疲労補正');
scheduleState.day=8;scheduleState.staffRoster[0].energy=30;scheduleState.staffRoster[0].weeklyOff=[0];api.recoverStaffForNewDay(scheduleState,false);
assert.equal(scheduleState.staffRoster[0].energy,75,'公休日はEnergyを大きく回復');
assert.equal(scheduleState.staffRoster[0].consecutiveWorkDays,0,'公休日に連勤をリセット');
const cautiousCustomer={...assignmentState.customers[0],personality:'慎重',concern:'毛穴',budget:12000,favoriteStaff:staffTemplates[0].name,staffScores:{[staffTemplates[0].id]:2}};
const favoriteFit=api.staffCustomerAffinity(staffTemplates[0],cautiousCustomer),otherFit=api.staffCustomerAffinity(staffTemplates[1],cautiousCustomer);
assert.ok(favoriteFit.score>otherFit.score,'指名スタッフは担当相性が高くなる');
assert.equal(favoriteFit.favorite,true,'お気に入りスタッフを指名として判定');
assert.match(api.assignmentPageV6(cautiousCustomer),/指名/,'担当選択UIに指名状態を表示');
assert.match(api.assignmentPageV6(cautiousCustomer),/相性/,'担当選択UIにスタッフ相性を表示');
const minami=api.normalizeStaffMember({id:'minami'}),vipFit=api.staffCustomerAffinity(minami,{id:'vip-fit',visits:10,trust:95,budget:30000,personality:'結果重視',concern:'小顔'});
assert.ok(vipFit.score>=3,'VIP型スタッフはVIP顧客との相性が上がる');
const relationCustomer={staffRelations:{}};api.setState({...assignmentState,day:12});const relation=api.updateStaffCustomerRelation(relationCustomer,staffTemplates[0],92);
assert.equal(relation.points,2,'高満足度でスタッフ顧客関係が成長');
assert.equal(relation.visits,1,'スタッフ別担当回数を記録');

const rivalState=api.migrate({...api.freshState(),day:20,rivalsUnlocked:true,popularity:900,rivalBattle:{wins:0,losses:0,draws:0,streak:0,lastDay:10,history:[]},staff:{...staffTemplates[0],tech:95,service:92,sales:90,energy:100},staffRoster:[{...staffTemplates[0],tech:95,service:92,sales:90,energy:100}]});
api.setState(rivalState);
assert.equal(api.rivalChallengeAvailable(rivalState),true,'7日以上空くとライバル対決可能');
assert.ok(api.rivalChallengeTarget(rivalState),'対戦相手を選出');
const battle=api.resolveRivalChallenge('tech',rivalState);assert.ok(battle,'ライバル対決を実行');
assert.equal(rivalState.rivalBattle.history.length,1,'対決履歴を保存');
assert.equal(rivalState.rivalBattle.lastDay,20,'対決日を保存');
assert.equal(api.rivalChallengeAvailable(rivalState),false,'同日再戦は不可');

const payrollState={day:30,stores:[{rent:70000}],staffRoster:[
 {...staffTemplates[0],energy:80},
 {...staffTemplates[1],energy:90},
 {...staffTemplates[2],retired:true},
 {name:'invalid',salary:999999}
]};
assert.equal(api.monthlyStaffPayroll(payrollState),staffTemplates[0].salary+staffTemplates[1].salary,'在籍2名分の給与を合算');
assert.equal(api.monthlyOperatingExpenses(payrollState),staffTemplates[0].salary+staffTemplates[1].salary+70000,'月次経費へ全スタッフ給与と家賃を反映');
assert.equal(api.monthlyOperatingExpenses({...payrollState,day:29}),0,'月末以外は月次経費なし');
const monthlyClose=api.migrate({...api.freshState(),day:30,money:1000000,staff:{...staffTemplates[0],energy:80},staffRoster:[{...staffTemplates[0],energy:80},{...staffTemplates[1],energy:90}],session:{queue:[],index:0,results:[],phase:'idleDay',xp:0,newCustomers:0,eventModifiers:{review:0}},activeBusinessSession:null});
monthlyClose.dailyPolicy=dailyPolicies[1];api.setState(monthlyClose);api.closeDay();
assert.equal(monthlyClose.history.at(-1).expenses,staffTemplates[0].salary+staffTemplates[1].salary,'closeDayで全スタッフ給与を控除');
assert.equal(monthlyClose.staff.energy,80,'閉店後も担当スタッフ固有のEnergyを保持');
assert.equal(monthlyClose.staffRoster.find(x=>x.id==='mizuki').energy,90,'閉店後も非担当スタッフのEnergyを保持');
const reportState=api.migrate({...api.freshState(),day:30,money:500000,staff:{...staffTemplates[0],energy:80},staffRoster:[{...staffTemplates[0],energy:80}],stores:[{id:'main',name:'本店',rent:70000,dailySales:0,sales:0}],monthlyStats:{sales:320000,reviews:6,perfect:9,newCustomers:3}});
reportState.monthlyGoals.forEach(g=>g.progress=reportState.monthlyStats[g.type]||0);reportState.history=Array.from({length:30},(_,i)=>({day:i+1,sales:i===29?30000:10000,autoSales:0,expenses:i===29?staffTemplates[0].salary+70000:0,guests:2,reviews:i===29?6:0,perfect:i===29?9:0,newCustomers:i===29?3:0}));api.setState(reportState);const report=api.finalizeMonthlyReport(reportState);
assert.equal(report.month,1,'Day30で月次決算を確定');
assert.equal(report.sales,320000,'月間売上を30日分集計');
assert.equal(report.payroll,staffTemplates[0].salary,'月次決算に給与を表示');
assert.equal(report.rent,70000,'月次決算に家賃を表示');
assert.equal(report.goals.every(g=>g.achieved),true,'達成済み月間目標を確定');
assert.equal(report.rewardMoney,120000,'月間目標報酬を合算');
assert.equal(reportState.monthlyReports.length,1,'月次結果を履歴保存');
assert.equal(api.finalizeMonthlyReport(reportState).rewardMoney,120000,'同月再確定でも同じレポートを返す');
assert.equal(reportState.monthlyReports.length,1,'同じ月を二重保存しない');

const endlessLegacy=api.migrate({...api.freshState(),day:75,completedChapters:[1,2,3,4,5],chapter:5,cumulativeSales:1500000,popularity:2500,endlessMode:false,endlessTier:1,endlessCycle:null});
assert.equal(api.endlessModeActive(endlessLegacy),true,'旧Chapter5クリア済みセーブはEndless Modeへ移行');
assert.ok(endlessLegacy.endlessCycle,'旧セーブにも長期目標を自動生成');
api.setState(endlessLegacy);const cycle=endlessLegacy.endlessCycle;endlessLegacy.cumulativeSales=cycle.startedSales+cycle.salesTarget;endlessLegacy.popularity=cycle.startedPopularity+cycle.popularityTarget;for(let i=0;i<cycle.vipTarget;i++){if(endlessLegacy.customers[i]){endlessLegacy.customers[i].visits=10;endlessLegacy.customers[i].trust=95;if(!endlessLegacy.encounteredCustomers.includes(endlessLegacy.customers[i].id))endlessLegacy.encounteredCustomers.push(endlessLegacy.customers[i].id)}}endlessLegacy.monthlyReports.push({month:99,profit:cycle.profitTarget+50000,sales:999999});
assert.equal(api.endlessCycleReady(endlessLegacy),true,'売上・人気・VIP・月間利益を満たすとMaster Goal達成可能');
const moneyBeforeEndless=endlessLegacy.money,tierBefore=endlessLegacy.endlessTier,reward=cycle.reward;assert.equal(api.completeEndlessCycle(),true,'Master Goalを完了できる');
assert.equal(endlessLegacy.money,moneyBeforeEndless+reward,'Endless達成報酬を付与');
assert.equal(endlessLegacy.endlessTier,tierBefore+1,'達成後にMaster Lv.が上がる');
assert.equal(endlessLegacy.endlessCycle.tier,tierBefore+1,'次の長期目標を生成');
const highStamina=api.treatmentEnergyCost({stamina:90,speed:50},1,16),lowStamina=api.treatmentEnergyCost({stamina:20,speed:50},1,16);
assert.ok(highStamina<lowStamina,'staminaが高いほどEnergy消費が少ない');
assert.ok(api.treatmentEnergyCost({stamina:100,speed:100},.25,1)>=5,'Energy最低消費量を維持');
assert.ok(api.treatmentEnergyCost({stamina:50,speed:90},1,16)<api.treatmentEnergyCost({stamina:50,speed:20},1,16),'speedが高いほど疲労消費が軽い');
assert.equal(api.staffSpecialtyAdjustment(staffTemplates[0],{id:'facial',name:'フェイシャルケア',time:30},{id:'standard',time:30}),4,'best施術に小さなプラス補正');
assert.equal(api.staffSpecialtyAdjustment(staffTemplates[1],{id:'facial',name:'フェイシャルケア',time:30},{id:'premium',time:40}),-3,'weak施術に小さなマイナス補正');

const proposalService={id:'facial',name:'フェイシャルケア',price:4500,time:30,matches:['毛穴'],base:15},proposalCustomer={id:'proposal',visits:1,trust:20,budget:10000,concern:'毛穴'};
const lowSalesPremium=api.createTreatmentPlans(proposalService,proposalCustomer,{customerConditions:{}},{sales:20,energy:100}).find(x=>x.id==='premium');
const highSalesPremium=api.createTreatmentPlans(proposalService,proposalCustomer,{customerConditions:{}},{sales:90,energy:100}).find(x=>x.id==='premium');
assert.ok(highSalesPremium.priceScore>lowSalesPremium.priceScore,'salesは高単価提案へ軽く作用');

const oldSave=api.freshState();oldSave.staff={...staffTemplates[0]};delete oldSave.staff.energy;delete oldSave.staff.sales;delete oldSave.staff.speed;delete oldSave.staff.stamina;delete oldSave.staffRoster;
const restoredStaff=api.migrate(oldSave);
assert.equal(restoredStaff.staff.energy,100,'旧セーブの欠損Energyは100へfallback');
assert.equal(restoredStaff.staff.sales,staffTemplates[0].sales);assert.equal(restoredStaff.staff.speed,staffTemplates[0].speed);assert.equal(restoredStaff.staff.stamina,staffTemplates[0].stamina);
assert.equal(restoredStaff.staffRoster.length,1,'旧セーブのactive staffからrosterを復元');
assert.equal(restoredStaff.staff,restoredStaff.staffRoster[0],'active staffとrosterは同じ個別Energyを参照');

for(const day of [30,60]){const longPlay=api.freshState();longPlay.day=day;longPlay.staff={...staffTemplates[0],energy:70};longPlay.staffRoster=[longPlay.staff];longPlay.storeRank='C';api.setState(api.migrate(longPlay));api.startDay();assert.equal(api.getState().session!==null,true,`Day${day}でも営業開始できる`);assert.equal(api.getState().staff.energy,70,`Day${day}でもEnergyを保持`)}

api.setState(started);
const eventBefore=started.eventHistory.length,moneyBefore=started.money;
started.session.eventCursor=0;started.session.afterEvent='batch';started.session.eventQueue=[businessEvents.find(x=>x.category==='lucky')];
api.resolveBusinessEvent(2);
assert.equal(started.eventHistory.length,eventBefore+1,'イベント選択を履歴へ保存');
assert.notEqual(started.money,moneyBefore,'イベント効果を即時反映');
assert.equal(started.session.phase,'businessEventResult','選択後にRESULT画面へ進む');
assert.ok(started.session.eventResult.changes.length>=1,'RESULTに数値変化を保持');

const source=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
const css=await readFile(new URL('../src/v06.css',import.meta.url),'utf8');
const baseCss=await readFile(new URL('../src/v05.css',import.meta.url),'utf8');
assert.match(source,/function todayPageV6/,'TODAY画面');
assert.match(source,/function policyPageV6/,'営業方針画面');
assert.match(source,/function autoServeRemaining/,'残りをまとめて任せる');
assert.match(source,/data-assign-staff/,'顧客ごとのスタッフ担当選択UI');
assert.match(source,/週間シフト・休養/,'スタッフシフトUI');
assert.match(source,/data-staff-off/,'公休設定UI');
assert.match(source,/function treatmentDecisionPageV6/,'施術中判断');
assert.match(source,/function dayResultPageV6/,'営業結果演出');
for(const stage of ['arrival','waiting','treatment','checkout','exit'])assert.match(css,new RegExp(`stage-${stage}`),`${stage}移動スタイル`);
assert.match(css,/@media\(max-width:720px\)/,'iPhone向けレイアウト');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'動きを減らす設定');
assert.match(baseCss,/overflow-x:clip/,'横スクロールを防止');

console.log(`Salon Story Ver.0.6 systems tests: OK (${businessEvents.length} events)`);


// Regression: staff assignment stays available and stale owner-only flags are cleared per customer.
const staffSelectSource=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
assert.match(staffSelectSource,/state\.session\.ownerForced=false/,'顧客切替時にownerForcedを解除');
assert.match(staffSelectSource,/state\.session\.phase='service';save\(\);render\(\)/,'スタッフ選択後に施術選択へ進む');

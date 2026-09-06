const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const round100=value=>Math.max(1000,Math.round(value/100)*100);

export const LUMIERE_CITY={ja:'ルミエールシティ',en:'Lumière City',ranking:'LUMIÈRE BEAUTY RANKING',areas:['Lumière Central','Rose Avenue','Belle District','Harbor Side','Garden Quarter']};

export function treatmentAffinity(service,customer,condition={}){
  const concern=(service.matches||[]).includes(customer.concern);
  const daily=(condition.targets||[]).some(target=>(service.matches||[]).includes(target));
  return concern?{label:'◎ 相性良好',score:24,className:'great'}:daily?{label:'○ 今日の状態に合う',score:14,className:'good'}:{label:'△ 悩みとは少し違う',score:0,className:'warn'};
}

export function createTreatmentPlans(service,customer,state,staff){
  const condition=state.customerConditions?.[customer.id]||{},rank=customer.visits>=10&&customer.trust>=90?'VIP':customer.visits>=5?'常連':customer.visits>=2?'リピーター':'一般客';
  const effective=Math.max(1000,round100(Number(customer.budget||0)*Number(condition.budget||1)));
  const specs=[
    {id:'light',name:'ライト',multiplier:.72,time:.76,cap:92,base:2,description:'短時間・低価格で無理なく受けられる'},
    {id:'standard',name:'スタンダード',multiplier:1,time:1,cap:100,base:6,description:'効果と価格のバランスが良い基本プラン'},
    {id:'premium',name:'プレミアム',multiplier:1.48,time:1.3,cap:100,base:11,description:'美容機器と追加ケアで高い効果を狙う'}
  ];
  return specs.map(spec=>{
    const price=round100(service.price*spec.multiplier),time=Math.max(20,Math.round(service.time*spec.time/5)*5),ratio=price/effective;
    let priceScore=ratio<=.8?10:ratio<=1.1?6:ratio<=1.3?-3:-12;
    if(spec.id==='light'&&condition.id==='before-payday')priceScore+=15;
    if(spec.id==='premium'&&(['after-bonus','reward','birthday'].includes(condition.id)||rank==='VIP'))priceScore+=16;
    if(spec.id==='premium'&&condition.id==='sudden-plan')priceScore-=20;
    if(spec.id==='premium'&&Number(staff?.energy||100)<40)priceScore-=12;
    const affinity=treatmentAffinity(service,customer,condition),score=clamp(50+affinity.score+priceScore+spec.base,0,spec.cap);
    const budgetLabel=ratio<=.8?'◎ 余裕あり':ratio<=1.1?'○ 予算内':ratio<=1.3?'△ 少し高め':'！予算オーバー';
    const reaction=score>=86?'これなら今日の私にぴったりです！':ratio>1.3?'少し予算が心配です…。':spec.id==='light'?'これなら気軽にお願いできそうです。':'効果と価格のバランスが良さそうです。';
    return{...spec,price,time,score,priceScore,budgetLabel,affinity,reaction,risk:spec.id==='premium'?(ratio>1.3?'予算超過で満足度が下がる可能性':'時間とEnergyを多く使う'):spec.id==='light'?'満足度の上限は少し低め':'安定した提案',satisfactionModifier:Math.round((score-65)/5),trustModifier:score>=82?3:score<50?-2:1};
  });
}

export function canPauseBusiness(session){return!!session&&['assign','counsel','service','plan','serviceResult','idleDay','between'].includes(session.phase)}
export function resumableSession(session){return!!session&&Array.isArray(session.queue)&&Number.isInteger(session.index)&&Array.isArray(session.results)&&session.phase!=='complete'}

export function calculateDailyVisitorCount({rank='D',popularity=100,rating=3,reviews=0,ads=[],weekday='月曜日',weather='sunny',policy=null,reservations=0,zeroGuestStreak=0,rng=Math.random}){
  const ranges={D:[0,3],C:[1,5],B:[2,7],A:[3,10]},[min,max]=ranges[rank]||ranges.D;
  let score=(popularity-100)/500+(rating-3)*.45+Math.min(1.4,reviews/20)+(weekday==='月曜日'?-0.65:['金曜日','土曜日','日曜日'].includes(weekday)?.55:0)+(weather==='rain'?-.55:weather==='storm'?-1.15:0)+(policy?.effects?.guest||0)+ads.reduce((sum,ad)=>sum+Number(ad.min||0),0);
  let count=Math.round(min+(max-min)*rng()+score);
  if(rank==='D'&&reservations===0&&popularity<500&&zeroGuestStreak<2&&rng()<clamp(.2-(popularity-100)/4000,.1,.2))count=0;
  if(zeroGuestStreak>=2)count=Math.max(1,count);
  return clamp(Math.max(reservations,rank==='D'?count:Math.max(min,count)),0,max+2);
}

export function visitorForecast(count){return count<=0?'かなり少なそう':count<=2?'少なめ':count<=4?'普通':count<=6?'混みそう':'かなり混雑'}

export function eventResultSummary(event,choice,effects,state){
  const labels={money:'売上・支出',popularity:'人気',energy:'スタッフEnergy',satisfaction:'満足度',trust:'信頼',repeat:'次回来店',review:'口コミ'};
  const changes=Object.entries(effects||{}).filter(([key,value])=>labels[key]&&Number(value)!==0).map(([key,value])=>({label:labels[key],value:Number(value)}));
  const positive=changes.reduce((sum,item)=>sum+item.value,0)>=0;
  return{title:positive?'良い判断になりました':'少し注意が必要です',message:`「${choice.label}」を選び、${event.title}に対応しました。`,reaction:positive?'落ち着いて対応してもらえて安心しました。':'次はもう少し余裕があるとうれしいです。',changes,positive,staffName:state.staff?.name||'スタッフ'};
}

export function createBeforeAfterRecord({day,customer,service,plan,score,staff}){
  const type=service.id==='smallface'?'輪郭・むくみ':service.id==='facial'||service.id==='pore'?'肌ツヤ・明るさ':service.id==='slimming'||service.id==='luxurySlimming'?'姿勢・ボディライン':service.id==='bust'?'姿勢・デコルテ':'疲労感・表情';
  return{id:`beauty-${day}-${customer.id}-${Date.now()}`,day,customerId:customer.id,customerName:customer.name,serviceId:service.id,service:`${service.name} ${plan.name}`,plan:plan.id,price:plan.price,score,staff,type,beforeExpression:score<60?'worried':'normal',afterExpression:score>=90?'joy':score>=75?'happy':score<40?'confused':'smile'};
}

export function inferCustomerMemory(customer){return{lastService:customer.lastService||null,lastPlan:customer.lastPlan||null,lastPrice:Number(customer.lastPrice||0),lastStaff:customer.lastStaff||null,lastScore:Number(customer.lastScore||0),lastReview:customer.lastReview||null,lastWaitTime:Number(customer.lastWaitTime||0),lastEvent:customer.lastEvent||null}}

export function nextVisitMemoryLine(memory){if(!memory)return'';if(memory.lastScore>=90)return'前回すごく良かったです！';if(memory.lastPrice>0&&memory.lastScore<60)return'今日は少し予算を抑えたいです。';if(memory.lastWaitTime>=15)return'今日は時間通りだとうれしいです。';if(memory.lastStaff&&memory.lastScore>=80)return`前回の${memory.lastStaff}さんにお願いしたいです。`;return memory.lastService?`前回の${memory.lastService}も良かったです。`:''}

export const idleDayActions=[
 {id:'social',name:'SNS投稿',description:'新しいお客様へサロンを発信',effects:{followers:25,popularity:5}},
 {id:'training',name:'スタッフ研修',description:'空き時間を技術練習に使う',effects:{tech:2,energy:-8}},
 {id:'clean',name:'店内清掃',description:'次の営業へ向けて空間を整える',effects:{popularity:2,satisfaction:3}},
 {id:'maintenance',name:'設備点検',description:'美容機器と設備を丁寧に点検',effects:{energy:-3,machineCare:1}},
 {id:'town',name:'街へ出る',description:'買い物や交流を楽しむ',effects:{}},
 {id:'rest',name:'早仕舞い',description:'Energyを回復して明日に備える',effects:{energy:25}}
];

export const decorItems=[
 {id:'sofa-luxe',name:'高級ソファ',price:80000,effect:'待ち時間不満軽減',icon:'🛋'},
 {id:'mirror-rose',name:'ローズミラー',price:60000,effect:'若年層の来店補正',icon:'🪞'},
 {id:'aroma',name:'アロマディフューザー',price:45000,effect:'リラク満足度UP',icon:'🌿'},
 {id:'counter-gold',name:'上品な受付カウンター',price:140000,effect:'VIP満足度UP',icon:'✦'},
 {id:'flower',name:'季節の装花',price:30000,effect:'口コミ発生率UP',icon:'🌸'}
];

export function createMonthlyGoals(month=1){return[
 {id:`sales-${month}`,type:'sales',title:'月間売上',target:300000,progress:0,reward:'限定服'},
 {id:`reviews-${month}`,type:'reviews',title:'口コミ',target:5,progress:0,reward:'限定メイク'},
 {id:`perfect-${month}`,type:'perfect',title:'PERFECT',target:8,progress:0,reward:'限定家具'}
]}

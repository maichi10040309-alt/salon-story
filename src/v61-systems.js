const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const round100=value=>Math.max(1000,Math.round(value/100)*100);

export function customerTier(customer,state){
  if(!(state?.encounteredCustomers||[]).includes(customer.id))return'新規顧客';
  if(customer.visits>=10&&customer.trust>=90)return'VIP';
  if(customer.visits>=5&&customer.trust>=60)return'常連';
  if(customer.visits>=2)return'リピーター';
  return'一般客';
}

export function treatmentBudget(customer,condition){return Math.max(1000,round100(Number(customer.budget||0)*Number(condition?.budget||1)))}
export function budgetCompatibility(price,budget,customer,condition,rank='一般客'){
  const allowance=['VIP'].includes(rank)||['after-bonus','reward','birthday'].includes(condition?.id)?1.25:1;
  const ratio=price/(budget*allowance);
  if(ratio<=.8)return{label:'余裕あり',className:'great',score:10};
  if(ratio<=1.1)return{label:'予算内',className:'good',score:5};
  if(ratio<=1.3)return{label:'少し高め',className:'warn',score:-5};
  return{label:'予算オーバー',className:'danger',score:-14};
}

const serviceMatches=(service,targets=[])=>targets.some(target=>(service.matches||[]).includes(target));
const conditionNames={
 'work-tired':'首肩集中ケア','before-date':'小顔集中＋フェイスラインケア','reunion':'イベント前集中ケア','travel':'旅行前リフレッシュケア','skin-trouble':'毛穴・肌荒れ集中ケア','swelling':'むくみ集中ケア','sleepy':'疲労回復リラックスケア','before-payday':'無理なく続けるケア','after-bonus':'ご褒美プレミアムケア','sudden-plan':'30分クイック集中ケア','stress':'深呼吸リラクゼーション','refresh':'気分転換リフレッシュケア','reward':'自分へのご褒美ケア','referral':'紹介限定お悩みケア','social':'トレンド美容ケア','event':'イベント前集中ケア','birthday':'バースデー美容ケア','photo':'写真映え小顔ケア','wedding-guest':'お呼ばれ美容ケア','long-time':'じっくり相談ケア'
};

function matchValue(service,customer,condition,state){
  let value=(service.matches||[]).includes(customer.concern)?28:0;
  if(serviceMatches(service,condition?.targets))value+=24;
  if(serviceMatches(service,state?.dailyTrend?.targets))value+=10;
  if(customer.lastService&&customer.lastService!==service.name)value+=3;
  return value+Number(service.base||0);
}
function selectBaseServices(customer,state,availableServices,condition,budget){
  const pool=[...availableServices];
  const stable=pool.filter(service=>(service.matches||[]).includes(customer.concern)||serviceMatches(service,condition?.targets));
  const safe=[...(stable.length?stable:pool)].sort((a,b)=>{
    const af=a.price<=budget?0:1,bf=b.price<=budget?0:1;
    return af-bf||a.price-b.price||a.time-b.time;
  })[0];
  const main=[...pool].sort((a,b)=>matchValue(b,customer,condition,state)-matchValue(a,customer,condition,state)||a.price-b.price)[0]||safe;
  const premium=[...pool].sort((a,b)=>matchValue(b,customer,condition,state)-matchValue(a,customer,condition,state)||b.base-a.base)[0]||main;
  return{safe,main,premium};
}
function proposalName(role,base,customer,condition,rank,hasMachine){
  if(role==='safe'){
    if(condition?.id==='before-payday'||customer.job==='学生')return`ライト${base.name}`;
    if(customer.lastService===base.name)return`いつもの${base.name}`;
    return`定番${base.name}`;
  }
  if(role==='main'){
    if(customer.concern==='ブライダル美容')return'ブライダル集中ケア';
    return conditionNames[condition?.id]||`${base.name}集中ケア`;
  }
  if(rank==='VIP')return'VIPプレミアムフルコース';
  if(customer.concern==='ブライダル美容')return'ブライダルプレミアム';
  return hasMachine?`${base.name}＋美容機器オプション`:`${base.name}プレミアムセット`;
}
function reactionFor(value,budgetFit,role,condition){
  if(budgetFit.className==='danger'&&value<68)return{kind:'予算心配',face:'confused',text:'思ったより高いですね…。今日は少し迷います。'};
  if(condition?.id==='sudden-plan'&&role==='bold')return{kind:'拒否',face:'confused',text:'今日は時間がないので、短い方が助かります。'};
  if(value>=86)return{kind:'大喜び',face:'joy',text:'せっかくなので、それにしてみます！'};
  if(value>=76)return{kind:'期待',face:'happy',text:'今の私には、これが一番良さそう！'};
  if(role==='safe')return{kind:'安心',face:'happy',text:'これなら安心してお願いできそうです。'};
  if(value>=62)return{kind:'興味あり',face:'normal',text:'それ、今の悩みに合いそうです。'};
  return{kind:'迷い',face:'confused',text:'良さそうですが、少し考えたいです。'};
}

export function calculateTreatmentChoiceScore(choice,customer,state,staff){
  const condition=state?.customerConditions?.[customer.id],rank=customerTier(customer,state),budget=treatmentBudget(customer,condition);
  const fit=budgetCompatibility(choice.price,budget,customer,condition,rank);
  let score=Number(choice.baseValue||55)+fit.score;
  if(choice.role==='safe'&&condition?.id==='before-payday')score+=18;
  if(choice.role==='safe'&&customer.job==='学生')score+=10;
  if(choice.role==='main'&&choice.conditionMatch)score+=10;
  if(choice.role==='main'&&condition?.id==='sudden-plan'&&choice.time<=35)score+=15;
  if(choice.role==='bold'&&['VIP','常連'].includes(rank))score+=rank==='VIP'?20:8;
  if(choice.role==='bold'&&['after-bonus','reward','birthday'].includes(condition?.id))score+=18;
  if(choice.role==='bold'&&condition?.id==='before-payday')score-=22;
  if(choice.role==='bold'&&condition?.id==='sudden-plan')score-=24;
  if(choice.role==='bold'&&Number(staff?.energy||100)<45)score-=16;
  if(choice.trendBonus>0)score+=8;
  if(choice.role!=='safe'&&Number(customer.trust||0)<30)score-=5;
  return clamp(Math.round(score),0,100);
}

export function getTreatmentChoices(customer,state,staff,availableServices=[]){
  if(!availableServices.length)return[];
  const condition=state?.customerConditions?.[customer.id]||{},rank=customerTier(customer,state),budget=treatmentBudget(customer,condition),bases=selectBaseServices(customer,state,availableServices,condition,budget);
  const machineOwned=Object.values(state?.machines||{}).some(machine=>machine?.owned),trendMatch=serviceMatches(bases.main,state?.dailyTrend?.targets),conditionMatch=serviceMatches(bases.main,condition.targets);
  const rotation=state?.dailyPolicy?.id==='rotation',reviewPolicy=state?.dailyPolicy?.id==='reviews',salesPolicy=state?.dailyPolicy?.id==='sales';
  const specs=[
    {role:'safe',type:'安心',base:bases.safe,multiplier:.8,time:Math.max(25,bases.safe.time-(condition.id==='sudden-plan'?15:5)),bonus:condition.id==='before-payday'?7:2,tags:[condition.id==='before-payday'||customer.job==='学生'?'低予算':'安定',rank==='新規顧客'?'新規向け':'安心'],baseValue:60},
    {role:'main',type:'本命',base:bases.main,multiplier:1.18,time:condition.id==='sudden-plan'?Math.min(35,bases.main.time):bases.main.time+5,bonus:conditionMatch?10:7,tags:[rotation?'時短':reviewPolicy?'口コミ向け':trendMatch?'トレンド':'本命',condition.id==='event'||condition.id==='before-date'||condition.id==='photo'?'イベント前':'安定'],baseValue:68,conditionMatch},
    {role:'bold',type:'攻め',base:bases.premium,multiplier:rank==='VIP'?2.05:1.65,time:bases.premium.time+20,bonus:14,tags:[rank==='VIP'?'VIP向け':salesPolicy?'高単価':'攻め',machineOwned?'美容機器':'セット提案'],baseValue:58,conditionMatch:serviceMatches(bases.premium,condition.targets)}
  ];
  return specs.map((spec,index)=>{
    const premiumTarget=rank==='VIP'||['after-bonus','reward','birthday'].includes(condition.id)?budget*.95:budget*1.18;
    const price=round100(spec.role==='bold'?Math.max(spec.base.price*spec.multiplier,premiumTarget):spec.base.price*spec.multiplier),fit=budgetCompatibility(price,budget,customer,condition,rank),trendBonus=serviceMatches(spec.base,state?.dailyTrend?.targets)?Number(state.dailyTrend?.bonus||0):0,staffBonus=Math.round((Number(staff?.tech||0)+Number(staff?.service||0))/35)+(staff?.skills?.length||0),machineBonus=spec.role==='bold'&&machineOwned?8:0;
    const draft={id:`proposal-${index}`,serviceId:spec.base.id,role:spec.role,type:spec.type,name:proposalName(spec.role,spec.base,customer,condition,rank,machineOwned),price,time:spec.time,tags:[...new Set(spec.tags)],baseValue:spec.baseValue,conditionMatch:spec.conditionMatch,trendBonus,staffBonus,machineBonus,budgetFit:fit,concernFit:(spec.base.matches||[]).includes(customer.concern)?'◎':'△',conditionFit:serviceMatches(spec.base,condition.targets)?'◎':'○'};
    const value=calculateTreatmentChoiceScore(draft,customer,state,staff),reaction=reactionFor(value,fit,spec.role,condition),stars=Math.max(1,Math.min(5,Math.ceil(value/20)));
    const risk=spec.role==='bold'?(fit.score<0?'予算を超えると不満の可能性':Number(staff?.energy||100)<45?'スタッフEnergy低下で効果が不安定':`時間が${draft.time}分と長め`):spec.role==='main'&&rotation&&draft.time>40?'回転重視の方針とは相性△':'失敗しにくい安定提案';
    const reason=spec.role==='safe'?`${fit.label}で無理なく受けられる`:spec.role==='main'?`${condition.name||customer.concern}と今日のお悩みを優先`:`${machineOwned?'美容機器と':''}追加ケアで高い効果を狙う`;
    return{...draft,value,stars,reaction,risk,reason,satisfactionModifier:spec.bonus+(value>=80?3:value<55?-5:0),trustModifier:spec.role==='main'&&value>=75?3:spec.role==='bold'&&value<55?-3:1,reviewModifier:reviewPolicy&&spec.role==='main'?1:0};
  });
}

export function deriveOwnerAppearance(state){const player=state?.player||{},equipped=state?.wardrobe?.equipped||{};return{skin:player.skin||'ナチュラル',hairStyle:player.hairStyle||'ボブ',hairColor:player.hairColor||'ダークブラウン',makeup:state?.wardrobe?.makeup||'natural',tops:equipped.tops||null,bottoms:equipped.bottoms||null,dress:equipped.dresses||null,outer:equipped.outer||null,shoes:equipped.shoes||null,bag:equipped.bags||null,accessories:equipped.accessories||null}}
export function normalizeOwnerAppearance(appearance,state){return{...deriveOwnerAppearance(state),...(appearance||{})}}
export function appearanceToLegacy(state,appearance){const a=normalizeOwnerAppearance(appearance,state);state.ownerAppearance={...a};state.player={...(state.player||{}),skin:a.skin,hairStyle:a.hairStyle,hairColor:a.hairColor};state.wardrobe={...(state.wardrobe||{}),makeup:a.makeup,equipped:{...(state.wardrobe?.equipped||{}),tops:a.tops,bottoms:a.bottoms,dresses:a.dress,outer:a.outer,shoes:a.shoes,bags:a.bag,accessories:a.accessories}};return a}
export function previewFashionAppearance(current,item){const next={...current};const key={dresses:'dress',bags:'bag'}[item.category]||item.category;next[key]=item.id;if(item.category==='dresses'){next.tops=null;next.bottoms=null}else if(['tops','bottoms'].includes(item.category))next.dress=null;return next}

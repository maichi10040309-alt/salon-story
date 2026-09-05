const rankOf=c=>c.visits>=10&&c.trust>=90?'VIP':c.visits>=5&&c.trust>=60?'常連':c.visits>=2?'リピーター':'初回来店';

export function customerVisitWeight({customer,day,recentHistory=[],encounteredCustomers=[],trend=null}){
  const last=customer.lastVisitDay??[...recentHistory].reverse().find(x=>x.ids?.includes(customer.id))?.day;
  const gap=last==null?99:day-last;
  if(gap<=1)return 0;
  let weight=100*(gap===2?.35:gap===3?.65:1);
  const unseen=!encounteredCustomers.includes(customer.id);
  if(unseen)weight*=3;
  if(day<=10&&unseen)weight*=1.45;
  const rank=rankOf(customer);
  if(rank==='リピーター')weight*=1.15;
  if(rank==='常連')weight*=1.3;
  if(rank==='VIP')weight*=1.5;
  weight*=.8+Math.min(90,customer.repeatChance??20)/100;
  if(trend?.targets?.includes(customer.concern))weight*=1.15;
  return Math.max(0,weight);
}

function weightedPick(pool,getWeight,rng){
  const weighted=pool.map(item=>({item,weight:getWeight(item)})).filter(x=>x.weight>0);
  const total=weighted.reduce((sum,x)=>sum+x.weight,0);
  if(!total)return null;
  let cursor=rng()*total;
  for(const entry of weighted){cursor-=entry.weight;if(cursor<=0)return entry.item}
  return weighted.at(-1).item;
}

export function selectDailyCustomers({day,availableCustomers,recentHistory=[],encounteredCustomers=[],reservationIds=[],desiredCount,trend=null,store={},rng=Math.random}){
  const byId=new Map(availableCustomers.map(c=>[c.id,c]));
  const selected=[];
  for(const id of reservationIds){if(byId.has(id)&&!selected.includes(id)&&selected.length<desiredCount)selected.push(id)}
  const candidates=availableCustomers.filter(c=>!selected.includes(c.id));
  const unseen=candidates.filter(c=>!encounteredCustomers.includes(c.id)&&customerVisitWeight({customer:c,day,recentHistory,encounteredCustomers,trend})>0);
  if(day<=7&&unseen.length&&selected.length<desiredCount){
    const first=weightedPick(unseen,c=>customerVisitWeight({customer:c,day,recentHistory,encounteredCustomers,trend})*2,rng);
    if(first)selected.push(first.id);
  }
  while(selected.length<desiredCount){
    const remaining=candidates.filter(c=>!selected.includes(c.id));
    const picked=weightedPick(remaining,c=>customerVisitWeight({customer:c,day,recentHistory,encounteredCustomers,trend}),rng);
    if(!picked)break;
    selected.push(picked.id);
  }
  return selected;
}

export function visitReason({customer,encounteredCustomers=[],reservationIds=[],trend=null,referrer=null}){
  if(reservationIds.includes(customer.id))return'ご予約で来店';
  if(referrer)return`${referrer}さんの紹介`;
  if(!encounteredCustomers.includes(customer.id))return customer.socialInfluence>=4?'SNSを見て初来店':'口コミを見て初来店';
  if(trend?.targets?.includes(customer.concern))return`本日の「${trend.name}」に興味を持って来店`;
  if((customer.visits||0)>=2)return'前回よかったので再来店';
  return'サロンの口コミを見て来店';
}

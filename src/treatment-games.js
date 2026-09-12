const clamp=(value,min=0,max=100)=>Math.max(min,Math.min(max,value));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const pointInEllipse=(point,region)=>((point.x-region.x)/region.rx)**2+((point.y-region.y)/region.ry)**2<=1;

export const treatmentGameSpecs={
  facial:{kind:'serumSpread',imagePath:'assets/treatment-games/facial.png',width:1145,height:1374,title:'フェイシャルケア',instruction:'5つの部位へ美容液をやさしく塗ってください'},
  pore:{kind:'poreClean',imagePath:'assets/treatment-games/pore.png',width:1199,height:1312,title:'毛穴洗浄',instruction:'鼻と頬の小さな角栓を見つけて除去してください'},
  smallface:{kind:'liftSwipe',imagePath:'assets/treatment-games/smallface.png',width:1145,height:1374,title:'小顔フェイシャル',instruction:'あご下からこめかみへ引き上げてください'},
  relax:{kind:'massageHold',imagePath:'assets/treatment-games/relax.png',width:1164,height:1351,title:'リラクゼーション',instruction:'首・肩は長押し、肩甲骨は円を描いてほぐしてください'},
  slimming:{kind:'machineTrace',imagePath:'assets/treatment-games/slimming.png',width:1024,height:1536,title:'痩身ケア',instruction:'機械ヘッドをガイドに沿って動かしてください'},
  luxurySlimming:{kind:'machineTraceAdvanced',imagePath:'assets/treatment-games/slimming.png',width:1024,height:1536,title:'高級痩身ケア',instruction:'細いガイドを2周ずつ丁寧に施術してください'},
  bust:{kind:'decolleteLift',imagePath:'assets/treatment-games/bust.png',width:1237,height:1272,title:'デコルテケア',instruction:'左右のラインを矢印の方向へなぞってください'},
  headspa:{kind:'scalpMassage',imagePath:'assets/treatment-games/headspa.png',width:1199,height:1312,title:'ヘッドスパ',instruction:'表示された方法で頭皮を順番にほぐしてください'}
};

const serumRegions=[
  {id:'forehead',label:'額',x:50,y:29,rx:18,ry:9},
  {id:'leftCheek',label:'左頬',x:35,y:51,rx:13,ry:11},
  {id:'rightCheek',label:'右頬',x:65,y:51,rx:13,ry:11},
  {id:'nose',label:'鼻',x:50,y:49,rx:7,ry:13},
  {id:'chin',label:'あご',x:50,y:66,rx:11,ry:7}
];
const poreTargets=[
  {x:47,y:48},{x:52,y:47},{x:44,y:52},{x:56,y:52},{x:49,y:55},{x:53,y:57},
  {x:37,y:49},{x:33,y:54},{x:40,y:57},{x:63,y:49},{x:67,y:54},{x:60,y:57}
];
const liftLines={
  left:[{x:49,y:70},{x:38,y:64},{x:29,y:55},{x:25,y:42}],
  right:[{x:51,y:70},{x:62,y:64},{x:71,y:55},{x:75,y:42}]
};
const relaxPoints=[
  {id:'neck',label:'首',x:50,y:39,type:'hold',duration:900},
  {id:'leftShoulder',label:'左肩',x:31,y:48,type:'hold',duration:1000},
  {id:'rightShoulder',label:'右肩',x:69,y:48,type:'hold',duration:1000},
  {id:'leftScapula',label:'左肩甲骨',x:39,y:61,type:'circle',turns:1.2},
  {id:'rightScapula',label:'右肩甲骨',x:61,y:61,type:'circle',turns:1.2}
];
const slimmingRoutes=[
  {id:'abdomen',label:'お腹',shape:'circle',points:[{x:50,y:31},{x:58,y:35},{x:50,y:41},{x:42,y:35},{x:50,y:31}]},
  {id:'waist',label:'腰回り',shape:'line',points:[{x:38,y:42},{x:50,y:45},{x:62,y:42}]},
  {id:'leftArm',label:'左二の腕',shape:'line',points:[{x:27,y:36},{x:30,y:22},{x:33,y:13}]},
  {id:'rightArm',label:'右二の腕',shape:'line',points:[{x:73,y:36},{x:70,y:22},{x:67,y:13}]},
  {id:'leftThigh',label:'左太もも',shape:'line',points:[{x:43,y:68},{x:42,y:57},{x:42,y:47}]},
  {id:'rightThigh',label:'右太もも',shape:'line',points:[{x:57,y:68},{x:58,y:57},{x:58,y:47}]}
];
const decolleteRoutes=[
  {id:'leftCollar',label:'左鎖骨',points:[{x:18,y:36},{x:33,y:32},{x:48,y:35}]},
  {id:'rightCollar',label:'右鎖骨',points:[{x:82,y:36},{x:67,y:32},{x:52,y:35}]},
  {id:'leftLift',label:'左デコルテ',points:[{x:32,y:61},{x:35,y:49},{x:40,y:38}]},
  {id:'rightLift',label:'右デコルテ',points:[{x:68,y:61},{x:65,y:49},{x:60,y:38}]},
  {id:'centerOut',label:'胸上部',points:[{x:50,y:50},{x:37,y:48},{x:24,y:51}]},
  {id:'centerOutRight',label:'胸上部',points:[{x:50,y:50},{x:63,y:48},{x:76,y:51}]}
];
const scalpSteps=[
  {id:'crown',label:'頭頂',x:50,y:62,type:'hold',duration:900},
  {id:'leftTemple',label:'左側頭',x:25,y:53,type:'circle',turns:1},
  {id:'rightTemple',label:'右側頭',x:75,y:53,type:'circle',turns:1},
  {id:'back',label:'後頭',x:50,y:82,type:'hold',duration:1000},
  {id:'hairline',label:'生え際',x:50,y:22,type:'hold',duration:800},
  {id:'crownFinish',label:'仕上げ・頭頂',x:50,y:62,type:'hold',duration:800}
];

export function createTreatmentGame(serviceId,{assisted=false,tech=0}={}){
  const spec=treatmentGameSpecs[serviceId]||treatmentGameSpecs.facial;
  return{
    serviceId:spec===treatmentGameSpecs.facial&&!treatmentGameSpecs[serviceId]?'facial':serviceId,
    kind:spec.kind,score:0,mistakes:0,progress:0,completed:false,pointerActive:false,
    pointerStart:null,pointerLast:null,pointerPath:[],pathLength:0,coveredTargets:[],startedAt:Date.now(),
    targetProgress:{},outsideDistance:0,totalDistance:0,successfulActions:0,attempts:0,streak:0,bestStreak:0,
    assisted:!!assisted,tech:clamp(Number(tech)||0),activeTarget:null,activeStartedAt:0,circleTravel:0,lastAngle:null,holdDrift:0,
    speedSamples:[],speedLabel:'適正',completedAt:null
  };
}

export function treatmentGamePage(game){
  const spec=treatmentGameSpecs[game.serviceId]||treatmentGameSpecs.facial;
  return`<section class="treatment-game" data-treatment-game="${spec.kind}">
    <header class="treatment-game__header"><small>TREATMENT</small><h1>${spec.title}</h1><p data-game-instruction>${spec.instruction}</p></header>
    <div class="treatment-game__stage" data-game-stage style="--game-ratio:${spec.width/spec.height}">
      <img src="${spec.imagePath}" alt="${spec.title}の施術部位" draggable="false">
      <svg class="treatment-game__overlay" data-game-overlay viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="施術操作エリア"></svg>
      <div class="machine-head" data-machine-head hidden><i></i></div>
      <div class="treatment-feedback" data-game-feedback aria-live="polite"></div>
    </div>
    <footer class="treatment-game__footer">
      <div class="treatment-progress"><div><span>進行率</span><b data-game-progress>${Math.round(game.progress)}%</b></div><div class="bar"><i data-game-progress-bar style="width:${game.progress}%"></i></div></div>
      <div class="treatment-rating"><span>現在評価</span><strong data-game-rating>${ratingForBonus(estimateBonus(game))}</strong></div>
      <div class="speed-meter" data-speed-meter hidden><span>施術スピード</span><b data-speed-label>適正</b><i></i></div>
      <button class="soft treatment-skip" data-action="skipTreatment">スキップ</button>
    </footer>
  </section>`;
}

const svgElement=(name,attrs={})=>{
  const element=document.createElementNS('http://www.w3.org/2000/svg',name);
  Object.entries(attrs).forEach(([key,value])=>element.setAttribute(key,String(value)));
  return element;
};
const polylinePoints=points=>points.map(point=>`${point.x},${point.y}`).join(' ');
const pathDistance=(point,points)=>Math.min(...points.map(candidate=>distance(point,candidate)));
const pathQuality=(path,guide,width)=>{
  if(path.length<2)return 0;
  const near=path.filter(point=>pathDistance(point,guide)<=width).length/path.length;
  const start=distance(path[0],guide[0])<=width*1.35;
  const end=distance(path.at(-1),guide.at(-1))<=width*1.55;
  return near*.65+(start ? .17 : 0)+(end ? .18 : 0);
};

function drawGuides(overlay,game){
  overlay.replaceChildren();
  const defs=svgElement('defs'),marker=svgElement('marker',{id:'treatment-arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:4,markerHeight:4,orient:'auto-start-reverse'});marker.append(svgElement('path',{d:'M 0 0 L 10 5 L 0 10 z',class:'guide-arrowhead'}));defs.append(marker);overlay.append(defs);
  if(game.kind==='serumSpread'){
    serumRegions.forEach(region=>overlay.append(svgElement('ellipse',{cx:region.x,cy:region.y,rx:region.rx,ry:region.ry,class:`serum-zone ${Number(game.targetProgress[region.id]||0)>=(game.assisted?60:70)?'done':''}`,'data-zone':region.id})));
  }else if(game.kind==='poreClean'){
    poreTargets.forEach((target,index)=>{if(!game.coveredTargets.includes(String(index)))overlay.append(svgElement('circle',{cx:target.x,cy:target.y,r:1.15,class:'pore-target','data-target':index}))});
  }else if(game.kind==='liftSwipe'){
    Object.entries(liftLines).forEach(([side,points])=>overlay.append(svgElement('polyline',{points:polylinePoints(points),class:`treatment-guide arrow ${Number(game.targetProgress[side]||0)>=2?'done':''}`,'data-line':side,'marker-end':'url(#treatment-arrow)'})));
  }else if(game.kind==='massageHold'){
    relaxPoints.forEach(point=>{if(!game.coveredTargets.includes(point.id)){overlay.append(svgElement('circle',{cx:point.x,cy:point.y,r:point.type==='hold'?5:7,class:`massage-target ${point.type}`,'data-target':point.id}));overlay.append(svgElement('circle',{cx:point.x,cy:point.y,r:point.type==='hold'?6.5:8.5,class:'hold-progress','data-progress-ring':point.id}))}});
  }else if(game.kind==='machineTrace'||game.kind==='machineTraceAdvanced'){
    slimmingRoutes.forEach(route=>overlay.append(svgElement('polyline',{points:polylinePoints(route.points),class:`treatment-guide machine-route ${game.coveredTargets.includes(route.id)?'done':''}`,'data-route':route.id,'marker-end':'url(#treatment-arrow)'})));
  }else if(game.kind==='decolleteLift'){
    decolleteRoutes.forEach(route=>overlay.append(svgElement('polyline',{points:polylinePoints(route.points),class:`treatment-guide decollete-route ${game.coveredTargets.includes(route.id)?'done':''}`,'data-route':route.id,'marker-end':'url(#treatment-arrow)'})));
  }else if(game.kind==='scalpMassage'){
    const step=scalpSteps[Math.min(game.coveredTargets.length,scalpSteps.length-1)];
    overlay.append(svgElement('circle',{cx:step.x,cy:step.y,r:step.type==='hold'?6:8,class:`massage-target scalp ${step.type}`,'data-target':step.id}));
    overlay.append(svgElement('circle',{cx:step.x,cy:step.y,r:step.type==='hold'?7.5:9.5,class:'hold-progress','data-progress-ring':step.id}));
  }
}

function eventPoint(event,stage){
  const rect=stage.getBoundingClientRect();
  return{x:clamp((event.clientX-rect.left)/rect.width*100),y:clamp((event.clientY-rect.top)/rect.height*100),time:event.timeStamp||performance.now()};
}
function feedback(root,text,tone='good'){
  const node=root.querySelector('[data-game-feedback]');if(!node)return;
  node.textContent=text;node.className=`treatment-feedback show ${tone}`;
  clearTimeout(node._timer);node._timer=setTimeout(()=>node.className='treatment-feedback',650);
}
function updateUi(root,game){
  root.querySelector('[data-game-progress]').textContent=`${Math.round(game.progress)}%`;
  root.querySelector('[data-game-progress-bar]').style.width=`${clamp(game.progress)}%`;
  root.querySelector('[data-game-rating]').textContent=ratingForBonus(estimateBonus(game));
  const speed=root.querySelector('[data-speed-label]');if(speed)speed.textContent=game.speedLabel;
}
function setInstruction(root,text){const node=root.querySelector('[data-game-instruction]');if(node)node.textContent=text}
function finishIfReady(root,game,onComplete){
  if(game.completed||game.progress<100)return;
  game.completed=true;game.completedAt=Date.now();game.score=estimateScore(game);updateUi(root,game);feedback(root,'施術完了 ✓','complete');
  setTimeout(()=>onComplete({bonus:treatmentBonusFromGame(game),score:game.score,game}),500);
}
function markSuccess(game,id){if(!game.coveredTargets.includes(String(id)))game.coveredTargets.push(String(id));game.successfulActions++;game.streak++;game.bestStreak=Math.max(game.bestStreak,game.streak)}
function markMistake(game){game.mistakes++;game.streak=0}
function nearestTarget(point,targets,remaining,width=8){let best=null,bestDistance=Infinity;targets.forEach((target,index)=>{const id=target.id??String(index);if(!remaining(id,index))return;const d=distance(point,target);if(d<bestDistance&&d<=width){best={...target,index,id:String(id)};bestDistance=d}});return best}

function startSerum(root,game,point){game.pointerPath=[point];game.pointerStart=point;game.pointerLast=point}
function moveSerum(root,game,point){
  const previous=game.pointerLast||point,step=distance(previous,point);if(step<.35)return;
  game.totalDistance+=step;game.pathLength+=step;game.pointerPath.push(point);game.pointerLast=point;
  const region=serumRegions.find(candidate=>pointInEllipse(point,candidate));
  if(region){
    const gx=Math.floor((point.x-(region.x-region.rx))/(region.rx*2)*5),gy=Math.floor((point.y-(region.y-region.ry))/(region.ry*2)*5),key=`${region.id}:${gx}:${gy}`;
    if(!game.coveredTargets.includes(key))game.coveredTargets.push(key);
    const cells=new Set(game.coveredTargets.filter(value=>value.startsWith(`${region.id}:`))).size;
    game.targetProgress[region.id]=clamp(cells/14*100);
  }else game.outsideDistance+=step;
  const overlay=root.querySelector('[data-game-overlay]');
  const stroke=svgElement('line',{x1:previous.x,y1:previous.y,x2:point.x,y2:point.y,class:'serum-stroke'});overlay.append(stroke);
  const complete=serumRegions.filter(candidate=>Number(game.targetProgress[candidate.id]||0)>=(game.assisted?60:70)).length;
  game.progress=clamp(complete/serumRegions.length*100);updateUi(root,game);
}

function startPore(root,game,point){
  game.attempts++;
  const target=nearestTarget(point,poreTargets,(id,index)=>!game.coveredTargets.includes(String(index)),game.assisted?6.5:5);
  if(target){markSuccess(game,target.index);feedback(root,'CLEAN ✓');drawGuides(root.querySelector('[data-game-overlay]'),game)}else{markMistake(game);feedback(root,'もう少し中心を狙って','miss')}
  game.progress=clamp(game.coveredTargets.length/poreTargets.length*100);updateUi(root,game);
}

function startPath(game,point){game.pointerStart=point;game.pointerLast=point;game.pointerPath=[point];game.pathLength=0;game.speedSamples=[];game.attempts++}
function movePath(game,point){const previous=game.pointerLast||point,step=distance(previous,point);if(step<.25)return;const elapsed=Math.max(8,point.time-(previous.time||point.time-16));game.speedSamples.push(step/elapsed);game.totalDistance+=step;game.pathLength+=step;game.pointerPath.push(point);game.pointerLast=point}
function finishLift(root,game){
  const side=game.pointerStart?.x<50?'left':'right',guide=liftLines[side],quality=pathQuality(game.pointerPath,guide,game.assisted?11:9),vertical=(game.pointerStart?.y||0)-(game.pointerLast?.y||0),longEnough=game.pathLength>25;
  if(quality>=.67&&vertical>18&&longEnough){game.targetProgress[side]=Number(game.targetProgress[side]||0)+1;game.successfulActions++;feedback(root,`${side==='left'?'左':'右'}ライン UP ✓`)}else{markMistake(game);feedback(root,'あご下から上へゆっくり','miss')}
  game.progress=clamp((Math.min(2,game.targetProgress.left||0)+Math.min(2,game.targetProgress.right||0))/4*100);drawGuides(root.querySelector('[data-game-overlay]'),game);updateUi(root,game);
}

function startMassage(root,game,point,points){
  const target=nearestTarget(point,points,(id)=>!game.coveredTargets.includes(id),game.assisted?11:9);
  if(!target){markMistake(game);feedback(root,'光っているポイントを押して','miss');return}
  game.activeTarget=target.id;game.activeStartedAt=performance.now();game.circleTravel=0;game.lastAngle=Math.atan2(point.y-target.y,point.x-target.x);game.holdDrift=0;game.pointerLast=point;game.attempts++;
  setInstruction(root,target.type==='hold'?`${target.label}をそのまま長押し`:`${target.label}で小さく円を描く`);
  if(target.type==='hold'){
    const ring=root.querySelector(`[data-progress-ring="${target.id}"]`),duration=(target.duration||900)*(game.assisted ? .82 : 1);
    if(ring){ring.style.transition=`stroke-dashoffset ${duration}ms linear`;requestAnimationFrame(()=>ring.style.setProperty('--hold-progress','100'))}
  }
}
function moveMassage(root,game,point,points){
  const target=points.find(candidate=>candidate.id===game.activeTarget);if(!target)return;
  if(target.type==='circle'){
    const radius=distance(point,target),angle=Math.atan2(point.y-target.y,point.x-target.x);let delta=Math.abs(angle-(game.lastAngle??angle));if(delta>Math.PI)delta=Math.PI*2-delta;
    if(radius>=2.5&&radius<=12)game.circleTravel+=delta;game.lastAngle=angle;
    const pct=clamp(game.circleTravel/(Math.PI*2*(game.assisted ? .8 : target.turns||1))*100);setRing(root,target.id,pct);
  }else{
    game.holdDrift=Math.max(game.holdDrift||0,distance(point,target));
    const required=(target.duration||900)*(game.assisted?.82:1),pct=clamp((performance.now()-game.activeStartedAt)/required*100);setRing(root,target.id,pct);
  }
  game.pointerLast=point;
}
function finishMassage(root,game,points){
  const target=points.find(candidate=>candidate.id===game.activeTarget);if(!target)return;
  const success=target.type==='circle'?game.circleTravel>=Math.PI*2*(game.assisted?.75:target.turns||1):performance.now()-game.activeStartedAt>=(target.duration||900)*(game.assisted?.82:1)&&(game.holdDrift||0)<=(game.assisted?14:11);
  if(success){markSuccess(game,target.id);feedback(root,'RELAX ✓');drawGuides(root.querySelector('[data-game-overlay]'),game)}else{markMistake(game);feedback(root,target.type==='hold'?'もう少し長く押して':'円をもう少し描いて','miss')}
  game.activeTarget=null;game.progress=clamp(game.coveredTargets.length/points.length*100);updateUi(root,game);
}
function setRing(root,id,pct){const ring=root.querySelector(`[data-progress-ring="${id}"]`);if(ring)ring.style.setProperty('--hold-progress',`${pct}`)}

function routeForStart(point,routes,game,width,passes=1){return nearestTarget(point,routes.map(route=>({...route,x:route.points[0].x,y:route.points[0].y})),id=>Number(game.targetProgress[id]||0)<passes,width)}
function startTrace(root,game,point,routes,width,passes=1){const route=routeForStart(point,routes,game,width,passes);game.activeTarget=route?.id||null;startPath(game,point);if(!route){markMistake(game);feedback(root,'ガイドの始点から始めて','miss')}}
function moveTrace(root,game,point){movePath(game,point);const head=root.querySelector('[data-machine-head]');if(head){head.hidden=false;head.style.left=`${point.x}%`;head.style.top=`${point.y}%`}}
function speedStatus(samples){if(!samples.length)return'遅すぎ';const average=samples.reduce((sum,value)=>sum+value,0)/samples.length;return average<.012?'遅すぎ':average>.095?'速すぎ':'適正'}
function finishTrace(root,game,routes,{advanced=false,decollete=false}={}){
  const route=routes.find(candidate=>candidate.id===game.activeTarget),width=decollete?(game.assisted?10:8):advanced?(game.assisted?7.5:6):(game.assisted?10:8);
  game.speedLabel=speedStatus(game.speedSamples.slice(-Math.max(1,game.pointerPath.length)));
  const quality=route?pathQuality(game.pointerPath,route.points,width):0,direction=route&&distance(game.pointerPath[0],route.points[0])<distance(game.pointerPath[0],route.points.at(-1)),speedOk=decollete||game.speedLabel==='適正';
  const passes=advanced?2:1;
  if(route&&quality>=(advanced ? .72 : .65)&&direction&&game.pathLength>12){game.targetProgress[route.id]=Number(game.targetProgress[route.id]||0)+1;if(game.targetProgress[route.id]>=passes)markSuccess(game,route.id);else game.successfulActions++;feedback(root,speedOk?'きれいなライン ✓':game.speedLabel, speedOk?'good':'warn');drawGuides(root.querySelector('[data-game-overlay]'),game)}else{markMistake(game);feedback(root,'矢印に沿って最後まで','miss')}
  const done=routes.reduce((sum,item)=>sum+Math.min(passes,Number(game.targetProgress[item.id]||0)),0);game.progress=clamp(done/(routes.length*passes)*100);game.activeTarget=null;updateUi(root,game);
}

function completePointer(root,game,onComplete){
  if(game.kind==='liftSwipe')finishLift(root,game);
  else if(game.kind==='massageHold')finishMassage(root,game,relaxPoints);
  else if(game.kind==='machineTrace')finishTrace(root,game,slimmingRoutes);
  else if(game.kind==='machineTraceAdvanced')finishTrace(root,game,slimmingRoutes,{advanced:true});
  else if(game.kind==='decolleteLift')finishTrace(root,game,decolleteRoutes,{decollete:true});
  else if(game.kind==='scalpMassage'){finishMassage(root,game,scalpSteps);game.progress=clamp(game.coveredTargets.length/scalpSteps.length*100);updateUi(root,game)}
  finishIfReady(root,game,onComplete);
}

export function bindTreatmentGame({root=document,game,onComplete,onUpdate=()=>{}}){
  const container=root.querySelector('.treatment-game'),stage=root.querySelector('[data-game-stage]'),overlay=root.querySelector('[data-game-overlay]');if(!container||!stage||!overlay)return()=>{};
  drawGuides(overlay,game);updateUi(container,game);
  const machine=container.querySelector('[data-machine-head]'),speed=container.querySelector('[data-speed-meter]');
  if(['machineTrace','machineTraceAdvanced'].includes(game.kind)){machine.hidden=false;speed.hidden=false}
  const down=event=>{
    if(game.completed)return;event.preventDefault();game.pointerActive=true;stage.setPointerCapture?.(event.pointerId);const point=eventPoint(event,stage);
    if(game.kind==='serumSpread')startSerum(container,game,point);
    else if(game.kind==='poreClean'){startPore(container,game,point);finishIfReady(container,game,onComplete)}
    else if(game.kind==='liftSwipe')startPath(game,point);
    else if(game.kind==='massageHold')startMassage(container,game,point,relaxPoints);
    else if(game.kind==='machineTrace'||game.kind==='machineTraceAdvanced')startTrace(container,game,point,slimmingRoutes,game.kind==='machineTraceAdvanced'?8:11,game.kind==='machineTraceAdvanced'?2:1);
    else if(game.kind==='decolleteLift')startTrace(container,game,point,decolleteRoutes,11);
    else if(game.kind==='scalpMassage'){const current=scalpSteps[Math.min(game.coveredTargets.length,scalpSteps.length-1)];startMassage(container,game,point,[current])}
  };
  const move=event=>{
    if(!game.pointerActive||game.completed)return;event.preventDefault();const point=eventPoint(event,stage);
    if(game.kind==='serumSpread')moveSerum(container,game,point);
    else if(game.kind==='liftSwipe')movePath(game,point);
    else if(game.kind==='massageHold')moveMassage(container,game,point,relaxPoints);
    else if(game.kind==='machineTrace'||game.kind==='machineTraceAdvanced'||game.kind==='decolleteLift')moveTrace(container,game,point);
    else if(game.kind==='scalpMassage'){const current=scalpSteps[Math.min(game.coveredTargets.length,scalpSteps.length-1)];moveMassage(container,game,point,[current])}
    finishIfReady(container,game,onComplete);
  };
  const up=event=>{if(!game.pointerActive)return;event.preventDefault();game.pointerActive=false;try{stage.releasePointerCapture?.(event.pointerId)}catch{}completePointer(container,game,onComplete);onUpdate(game)};
  const cancel=event=>{if(!game.pointerActive)return;event.preventDefault();game.pointerActive=false;game.activeTarget=null;markMistake(game);feedback(container,'指を戻してもう一度','miss');updateUi(container,game);onUpdate(game)};
  stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',cancel);
  return()=>{stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',up);stage.removeEventListener('pointercancel',cancel)};
}

export function estimateScore(game){
  const completion=clamp(game.progress)/100,accuracy=game.attempts?clamp(game.successfulActions/Math.max(1,game.attempts),0,1):completion,outside=game.totalDistance?game.outsideDistance/game.totalDistance:0,control=game.totalDistance?1-outside:completion,mistakePenalty=Math.min(.35,game.mistakes*.045),speedPenalty=['machineTrace','machineTraceAdvanced'].includes(game.kind)&&game.speedLabel!=='適正'?.08:0;
  return Math.round(clamp((completion*.62+accuracy*.28+control*.1-mistakePenalty-speedPenalty)*100));
}
export function treatmentBonusFromGame(game){return clamp(Math.round(estimateScore(game)/12.5),0,8)}
export function estimateBonus(game){return treatmentBonusFromGame(game)}
export function ratingForBonus(bonus){return bonus>=7?'PERFECT':bonus>=4?'GOOD':bonus>=1?'OK':'MISS'}

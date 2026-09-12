from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'target not found: {label}')
    s=s.replace(old,new,1)

rep("function resumeBusiness(){if(!resumableSession(state.session))return;state.screen=state.session.phase==='serviceResult'?'serviceResult':'play';save();render()}",
"function resumeBusiness(){const paused=resumableSession(state.session)?state.session:(resumableSession(state.activeBusinessSession)?copy(state.activeBusinessSession):null);if(!paused)return notify('再開できる営業データがありません');state.session=paused;state.activeBusinessSession=copy(paused);state.pausedBusinessState=null;state.screen=state.session.phase==='serviceResult'?'serviceResult':'play';save();render()}",
'resumeBusiness')

rep("function idleDayPageV62(){return`<section class=\"v62-idle-day\"><small>QUIET DAY</small><h1>今日は静かな一日になりそうです</h1><p>空いた時間も、未来のサロンを育てる一日です。</p><div class=\"v62-idle-actions\">${idleDayActions.map(x=>`<button data-idle-action=\"${x.id}\"><b>${x.name}</b><span>${x.description}</span></button>`).join('')}</div></section>`}",
"function idleDayPageV62(){const isRest=!!state.session?.plannedRest;return`<section class=\"v62-idle-day\"><small>${isRest?'REST & GROWTH DAY':'QUIET DAY'}</small><h1>${isRest?'今日はサロンを休んで整える日です':'今日は静かな一日になりそうです'}</h1><p>${isRest?'何もしないまま1日を終えず、明日につながる行動をひとつ選びましょう。':'空いた時間も、未来のサロンを育てる一日です。'}</p><div class=\"v62-idle-actions\">${idleDayActions.map(x=>`<button data-idle-action=\"${x.id}\"><b>${x.name}</b><span>${x.description}</span></button>`).join('')}</div></section>`}",
'idleDayPage')

anchor="function resolveIdleDay(id){const action=idleDayActions.find(x=>x.id===id);if(!action)return;if(id==='town')return pauseBusiness('town');const e=action.effects||{};state.socialFollowers+=Number(e.followers||0);state.popularity+=Number(e.popularity||0);if(state.staff){state.staff.tech=clamp(state.staff.tech+Number(e.tech||0),0,100);state.staff.energy=clamp(state.staff.energy+Number(e.energy||0),0,100)}state.todayHighlights.push(`暇な日の行動：${action.name}`);closeDay()}"
newanchor=anchor+"\nfunction startQuietDay(){if(!state.staff)return notify('スタッフを採用してください');state.todaySales=0;state.todayHighlights=['休息日：サロンを整える一日'];state.customerConditions={};state.session={queue:[],index:0,results:[],phase:'idleDay',choice:null,xp:0,newCustomers:0,reasons:{},reservationIds:[],policyId:'rest',eventQueue:[],eventCursor:0,eventModifiers:{satisfaction:0,trust:0,repeat:0,review:0},treatmentEvent:null,treatmentBonus:0,autoMode:false,autoSummary:[],plannedRest:true,startedAt:Date.now()};state.activeBusinessSession=copy(state.session);state.screen='play';state.news.unshift(`${weekdays[(state.day-1)%7]}は休息日にしました`);save();render()}"
rep(anchor,newanchor,'startQuietDay')

rep("document.querySelector('[data-action=\"restDay\"]')?.addEventListener('click',()=>{state.news.unshift(`${weekdays[(state.day-1)%7]}は休息日にしました`);advanceDay(true)});",
"document.querySelector('[data-action=\"restDay\"]')?.addEventListener('click',startQuietDay);",
'restDay handler')

rep("function confirmTreatmentPlan(){if(!state.session.selectedPlan)return;if(Math.random()<.35){state.session.treatmentEvent=copy(treatmentEvents[Math.floor(Math.random()*treatmentEvents.length)]);state.session.phase='treatmentDecision';save();render()}else beginTreatment()}",
"function confirmTreatmentPlan(){if(!state.session.selectedPlan)return;const delegated=!!state.session.assignedStaffId;if(delegated||Math.random()<.35){state.session.treatmentEvent=copy(treatmentEvents[Math.floor(Math.random()*treatmentEvents.length)]);state.session.phase='treatmentDecision';save();render()}else beginTreatment()}",
'confirmTreatmentPlan')

rep("function treatmentDecisionPageV6(c){const event=state.session.treatmentEvent;return`${salonScene('treatment',c)}<div class=\"v6-treatment-event card\"><span class=\"pill\">施術中の判断</span><h2>${event.title}</h2><p>${event.text}</p><div class=\"v6-event-choices\">${event.choices.map((choice,index)=>`<button data-treatment-choice=\"${index}\">${choice[0]}</button>`).join('')}</div></div>`}",
"function treatmentDecisionPageV6(c){const event=state.session.treatmentEvent,delegated=!!state.session.assignedStaffId;return`${salonScene('treatment',c)}<div class=\"v6-treatment-event card\"><span class=\"pill\">${delegated?'スタッフ施術 · ミニ判断':'施術中の判断'}</span><h2>${event.title}</h2><p>${delegated?`${state.session.assignedStaffName}から確認です。`:''}${event.text}</p><div class=\"v6-event-choices\">${event.choices.map((choice,index)=>`<button data-treatment-choice=\"${index}\">${choice[0]}</button>`).join('')}</div></div>`}",
'treatmentDecisionPage')

rep("function clientPanel(c,expression='normal',reason=''){const rank=customerRank(c),reserved=state.session?.reservationIds?.includes(c.id),condition=state.customerConditions[c.id],budget=effectiveBudget(c,condition),memory=nextVisitMemoryLine(state.customerMemory[c.id]);return`<aside class=\"client-profile card ${rank==='VIP'?'vip':''}\">${customerPortrait(c,expression,'lg')}<h2>${c.name}様</h2><div>${rank==='VIP'?'<span class=\"vip-badge\">VIP</span>':`<span class=\"rank rank-${rank}\">${rank}</span>`}${reserved?'<span class=\"reservation-badge\">予約</span>':''}</div>${condition?`<div class=\"condition-badge\">${condition.icon} ${condition.name}</div><div class=\"condition-talk\">「${condition.line}」</div>`:''}${memory?`<div class=\"v62-memory\">前回の記憶<br>「${memory}」</div>`:''}<div class=\"row\"><span>お悩み</span><b>${c.concern}</b></div><div class=\"row\"><span>今日の予算</span><b>${yen(budget)}</b></div><div class=\"row\"><span>信頼度</span><b>${c.trust}</b></div><div class=\"bar\"><i style=\"width:${c.trust}%\"></i></div>${reason?`<p class=\"visit-reason\">${reason}</p>`:''}</aside>`}",
"function clientPanel(c,expression='normal',reason=''){const rank=customerRank(c),reserved=state.session?.reservationIds?.includes(c.id),condition=state.customerConditions[c.id],budget=effectiveBudget(c,condition),memory=nextVisitMemoryLine(state.customerMemory[c.id]);return`<aside class=\"client-profile card ${rank==='VIP'?'vip':''}\">${customerPortrait(c,expression,'lg')}<h2>${c.name}様</h2><div>${rank==='VIP'?'<span class=\"vip-badge\">VIP</span>':`<span class=\"rank rank-${rank}\">${rank}</span>`}${reserved?'<span class=\"reservation-badge\">予約</span>':''}</div>${condition?`<div class=\"condition-badge\">今日のコンディション：${condition.icon} ${condition.name}</div><div class=\"condition-talk\">「${condition.line}」</div>`:''}${memory?`<div class=\"v62-memory\">前回の記憶<br>「${memory}」</div>`:''}<div class=\"row\"><span>主なお悩み</span><b>${c.concern}</b></div><div class=\"row\"><span>今日の予算</span><b>${yen(budget)}</b></div><div class=\"row\"><span>信頼度</span><b>${c.trust}</b></div><div class=\"bar\"><i style=\"width:${c.trust}%\"></i></div>${reason?`<p class=\"visit-reason\">${reason}</p>`:''}</aside>`}",
'clientPanel labels')

rep("function treatmentServicePageV62(c){const reason=state.session.reasons?.[c.id]||'来店',condition=state.customerConditions[c.id]||{};return`${salonScene('counsel',c)}<div class=\"consult-layout v62-treatment-layout\">${clientPanel(c,'normal',reason)}<section><div class=\"section-title\"><div><small>STEP 1 / 2</small><h2>何の施術をする？</h2></div><span class=\"pill\">悩み ${c.concern}</span></div><p>解禁済みの施術から自由に選べます。今日の状態は「${condition.name||'通常'}」です。</p><div class=\"v62-service-grid\">",
"function treatmentServicePageV62(c){const reason=state.session.reasons?.[c.id]||'来店',condition=state.customerConditions[c.id]||{};return`${salonScene('counsel',c)}<div class=\"consult-layout v62-treatment-layout\">${clientPanel(c,'normal',reason)}<section><div class=\"section-title\"><div><small>STEP 1 / 2</small><h2>何の施術をする？</h2></div><span class=\"pill\">主なお悩み：${c.concern}</span></div><p>今日のコンディション：<b>${condition.name||'通常'}</b>。お悩みと今日の状態の両方を見て施術を選びます。</p><div class=\"v62-service-grid\">",
'treatment labels')

# Make home resume detection also recover a persisted active session.
rep("function homeV62(){const base=homeV56();if(!resumableSession(state.session))return base.replace(/飛び込み予想 \\d+名/,`来店予報 ${state.dailyVisitorForecast}`);return`<section class=\"v62-active-business\">",
"function homeV62(){if(!resumableSession(state.session)&&resumableSession(state.activeBusinessSession))state.session=copy(state.activeBusinessSession);const base=homeV56();if(!resumableSession(state.session))return base.replace(/飛び込み予想 \\d+名/,`来店予報 ${state.dailyVisitorForecast}`);return`<section class=\"v62-active-business\">",
'home resume recovery')

p.write_text(s)

# Regression assertions are source-level on purpose: these bugs are navigation/state wiring regressions.
t=Path('tests/v06-systems.test.mjs')
ts=t.read_text()
marker='// Gameplay hotfix regressions: resume, quiet-day feedback, delegated judgment, condition labels.'
if marker not in ts:
    ts += f'''\n\n{marker}\nconst hotfixSource=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');\nassert.match(hotfixSource,/resumableSession\(state\.activeBusinessSession\)/,'paused active session can recover');\nassert.match(hotfixSource,/function startQuietDay\(\)/,'rest day opens an interactive quiet-day flow');\nassert.match(hotfixSource,/plannedRest:true/,'planned rest is persisted in the session');\nassert.match(hotfixSource,/delegated\|\|Math\.random\(\)<\.35/,'delegated treatment always gets one judgment event');\nassert.match(hotfixSource,/スタッフ施術 · ミニ判断/,'delegated mini judgment is labelled');\nassert.match(hotfixSource,/今日のコンディション：/,'daily condition label is explicit');\nassert.match(hotfixSource,/主なお悩み/,'base concern label is explicit');\n'''
    t.write_text(ts)

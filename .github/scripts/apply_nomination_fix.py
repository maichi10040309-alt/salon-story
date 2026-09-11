from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()

old="function assignmentPageV6(c){const required=manualServiceRequired(c),roster=employedStaffRoster();return`${salonScene('waiting',c)}<div class=\"v6-assignment card\"><div><small>WHO WILL SERVE?</small><h2>${c.name}様を誰が担当しますか？</h2><p>${state.customerConditions[c.id]?.icon||'♡'} ${state.customerConditions[c.id]?.line||'今日もよろしくお願いします。'}</p>${required?'<span class=\"important-customer\">✦ このストーリーはオーナー対応</span>':''}</div><div class=\"v6-assign-actions\"><button class=\"primary\" data-action=\"manualService\">自分で接客する<small>信頼・ストーリー・満足度上限UP</small></button>${roster.map(member=>{const fit=staffCustomerAffinity(member,c),off=isStaffOffToday(member),tired=Number(member.energy)<10,unavailable=off||tired,prefix=fit.favorite?'★ 指名 · ':fit.score>=5?'◎ おすすめ · ':'';return`<button class=\"soft\" data-assign-staff=\"${member.id}\" ${required||unavailable?'disabled':''}>${member.name}に任せる<small>${off?'本日休み · ':tired?'要休養 · ':''}${prefix}相性${fit.label} ${fit.score>0?`+${fit.score}`:fit.score||''} · Energy ${member.energy}% · 連勤${member.consecutiveWorkDays||0}日</small></button>`}).join('')}</div>${!roster.length?'<p class=\"important-customer\">担当できるスタッフがいません</p>':''}<button class=\"soft wide\" data-action=\"pauseTown\">顧客の合間に街へ出る</button></div>`}"
new="function assignmentPageV6(c){const required=manualServiceRequired(c),roster=employedStaffRoster(),nominated=c.favoriteStaff||null;return`${salonScene('waiting',c)}<div class=\"v6-assignment card\"><div><small>WHO WILL SERVE?</small><h2>${c.name}様を誰が担当しますか？</h2><p>${state.customerConditions[c.id]?.icon||'♡'} ${state.customerConditions[c.id]?.line||'今日もよろしくお願いします。'}</p>${nominated?`<div class=\"important-customer\">★ 指名スタッフ：<strong>${nominated}</strong><br><small>指名スタッフ以外を選ぶとPERFECT評価は出ません</small></div>`:''}${required?'<span class=\"important-customer\">✦ このストーリーはオーナー対応</span>':''}</div><div class=\"v6-assign-actions\"><button class=\"primary\" data-action=\"manualService\">自分で接客する<small>${nominated?'指名外 · PERFECT不可 · ':''}信頼・ストーリー・満足度上限UP</small></button>${roster.map(member=>{const fit=staffCustomerAffinity(member,c),off=isStaffOffToday(member),tired=Number(member.energy)<10,unavailable=off||tired,isNominee=nominated===member.name,prefix=isNominee?'★ 指名スタッフ · ':fit.score>=5?'◎ おすすめ · ':'',nominationNote=nominated&&!isNominee?'指名外 · PERFECT不可 · ':'';return`<button class=\"soft ${isNominee?'is-nominated-staff':''}\" data-assign-staff=\"${member.id}\" ${required||unavailable?'disabled':''}>${member.name}に任せる<small>${off?'本日休み · ':tired?'要休養 · ':''}${nominationNote}${prefix}相性${fit.label} ${fit.score>0?`+${fit.score}`:fit.score||''} · Energy ${member.energy}% · 連勤${member.consecutiveWorkDays||0}日</small></button>`}).join('')}</div>${!roster.length?'<p class=\"important-customer\">担当できるスタッフがいません</p>':''}<button class=\"soft wide\" data-action=\"pauseTown\">顧客の合間に街へ出る</button></div>`}"
assert old in s, 'assignmentPageV6 target not found'
s=s.replace(old,new,1)

old2="const fatiguePenalty=staffFatiguePenalty(state.staff),score=clamp(Math.min(plan.cap||100,Math.round(s.base+state.staff.service*.22+state.staff.tech*.22+match+equipmentBonus(c)+fashion+machine+trend+skillBonus+affinity+specialty+customerFit.score+choice.satisfaction+conditionBonus+dayModifier+planModifier+autoModifier-pricePenalty-energyPenalty-fatiguePenalty)),0,100);"
new2="const fatiguePenalty=staffFatiguePenalty(state.staff),nominatedStaff=c.favoriteStaff||null,servedBy=state.session.assignedStaffName||null,nominationMiss=!!nominatedStaff&&servedBy!==nominatedStaff,effectiveCap=nominationMiss?Math.min(Number(plan.cap||100),89):Number(plan.cap||100),score=clamp(Math.min(effectiveCap,Math.round(s.base+state.staff.service*.22+state.staff.tech*.22+match+equipmentBonus(c)+fashion+machine+trend+skillBonus+affinity+specialty+customerFit.score+choice.satisfaction+conditionBonus+dayModifier+planModifier+autoModifier-pricePenalty-energyPenalty-fatiguePenalty)),0,100);"
assert old2 in s, 'score target not found'
s=s.replace(old2,new2,1)

# Add result metadata for UI/debugging.
old3="condition:condition?.name||'',auto,treatmentBonus:state.session.treatmentBonus||0,beforeAfter:beauty}"
new3="condition:condition?.name||'',auto,treatmentBonus:state.session.treatmentBonus||0,nominatedStaff,nominationMiss,beforeAfter:beauty}"
assert old3 in s, 'result metadata target not found'
s=s.replace(old3,new3,1)

p.write_text(s)

p=Path('tests/v06-systems.test.mjs')
s=p.read_text()
append="""
\n// Regression: nomination is visible at assignment and non-nominated service cannot become PERFECT.
const nominationSource=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
assert.match(nominationSource,/指名スタッフ：<strong>\$\{nominated\}<\\\/strong>/,'担当選択画面に指名スタッフ名を表示');
assert.match(nominationSource,/指名外 · PERFECT不可/,'指名外の注意を担当選択画面に表示');
assert.match(nominationSource,/nominationMiss=!!nominatedStaff&&servedBy!==nominatedStaff/,'指名外判定を実装');
assert.match(nominationSource,/effectiveCap=nominationMiss\?Math\.min\(Number\(plan\.cap\|\|100\),89\)/,'指名外はスコア上限89でPERFECT不可');
"""
if 'nomination is visible at assignment' not in s:s+=append
p.write_text(s)

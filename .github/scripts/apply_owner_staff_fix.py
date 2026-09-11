from pathlib import Path

p=Path('src/game-v03.js')
s=p.read_text()
old="function enterCurrent(){const c=currentCustomer();if(!c){state.session.phase='idleDay';save();return render()}state.session.choice=null;state.session.treatmentBonus=0;state.session.selectedProposal=null;state.session.selectedPlan=null;state.session.treatmentChoices=null;state.session.autoMode=false;state.session.assignedStaffId=null;state.session.assignedStaffName=null;if(isNewCustomer(c)){"
new="function enterCurrent(){const c=currentCustomer();if(!c){state.session.phase='idleDay';save();return render()}state.session.choice=null;state.session.treatmentBonus=0;state.session.selectedProposal=null;state.session.selectedPlan=null;state.session.treatmentChoices=null;state.session.autoMode=false;state.session.ownerForced=false;state.session.assignedStaffId=null;state.session.assignedStaffName=null;if(isNewCustomer(c)){"
assert old in s, 'enterCurrent target not found'
s=s.replace(old,new,1)
old2="document.querySelectorAll('[data-assign-staff]').forEach(b=>b.onclick=()=>{const member=assignStaffForCurrentCustomer(b.dataset.assignStaff);if(!member)return notify('担当スタッフを選べませんでした');autoServeCurrent(false)});"
new2="document.querySelectorAll('[data-assign-staff]').forEach(b=>b.onclick=()=>{const member=assignStaffForCurrentCustomer(b.dataset.assignStaff);if(!member)return notify('担当スタッフを選べませんでした');const c=currentCustomer();state.session.autoMode=false;state.session.choice={response:`${member.name}が担当します。`,trust:0,satisfaction:Math.round(member.service/30),face:'normal',beforeTrust:c?.trust||0};state.session.phase='service';save();render()});"
assert old2 in s, 'staff click target not found'
s=s.replace(old2,new2,1)
p.write_text(s)

p=Path('src/owner-avatar.js')
s=p.read_text()
old="if(options.fashionPreview)layers.push(img(TRYON_HAIR_PATH,'owner-hair owner-hair-initial',TRYON_HAIR_STYLE));\n  else layers.push(img(`hair/styles/${a.hairStyle}.png`,'owner-hair owner-hair-generated',`filter:${filter}`,ownerLayerTransform('hair',a.hairStyle)));"
new="if(options.fashionPreview||a.hairStyle==='HAIR_15')layers.push(img(TRYON_HAIR_PATH,'owner-hair owner-hair-initial',TRYON_HAIR_STYLE));\n  else layers.push(img(`hair/styles/${a.hairStyle}.png`,'owner-hair owner-hair-generated',`filter:${filter}`,ownerLayerTransform('hair',a.hairStyle)));"
assert old in s, 'owner hair target not found'
s=s.replace(old,new,1)
p.write_text(s)

p=Path('tests/v06-systems.test.mjs')
s=p.read_text()
append="""
\n// Regression: stale ownerForced must not lock every customer to owner-only service.
const staffSelectState=api.migrate({...api.freshState(),staff:{...staffTemplates[0],energy:80},staffRoster:[{...staffTemplates[0],energy:80}]});
staffSelectState.session={queue:[staffSelectState.customers[0].id],index:0,results:[],phase:'assign',ownerForced:true,staffAssignments:{}};
api.setState(staffSelectState);
const staffPage=api.assignmentPageV6(staffSelectState.customers[0]);
assert.match(staffPage,/data-assign-staff=/,'担当スタッフ選択ボタンを表示');
"""
if 'Regression: stale ownerForced' not in s:s+=append
p.write_text(s)

p=Path('tests/owner-assets.test.mjs')
s=p.read_text()
append="""
\n// Regression: saved HAIR_15 on purchased outfits must reuse the exact try-on hair geometry.
assert.match(ownerAvatarSource,/options\.fashionPreview\|\|a\.hairStyle==='HAIR_15'/,'保存後の初期髪も試着と同じ専用髪配置を使う');
"""
# ownerAvatarSource exists in this suite; if not, skip adding to avoid breaking unrelated test harness.
if 'saved HAIR_15' not in s and 'ownerAvatarSource' in s:s+=append
p.write_text(s)

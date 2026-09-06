import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{services}from'../src/data/services.js';
import{fashionItems,hairstyles20,makeupStyles}from'../src/data/v04.js';
import{dailyPolicies,customerConditions}from'../src/data/v06.js';
import{appearanceToLegacy,budgetCompatibility,deriveOwnerAppearance,getTreatmentChoices,normalizeOwnerAppearance,previewFashionAppearance}from'../src/v61-systems.js';

const condition=id=>customerConditions.find(x=>x.id===id);
const policy=id=>dailyPolicies.find(x=>x.id===id);
const customer={id:'choice-test',name:'テスト',age:29,job:'会社員',concern:'小顔',budget:24000,visits:1,trust:55,lastService:'小顔フェイシャル'};
const staff={tech:72,service:75,energy:90,skills:['聞き上手']};
const choiceState=(conditionId,extra={})=>({encounteredCustomers:[customer.id],customerConditions:{[customer.id]:condition(conditionId)},dailyTrend:{targets:['小顔'],bonus:8},dailyPolicy:policy('reviews'),machines:{rf:{owned:true,level:1}},...extra});

const dateChoices=getTreatmentChoices(customer,choiceState('before-date'),staff,services);
assert.equal(dateChoices.length,3,'施術提案は毎回3択');
assert.deepEqual(dateChoices.map(x=>x.role),['safe','main','bold'],'安心・本命・攻めの役割を保持');
assert.equal(new Set(dateChoices.map(x=>x.name)).size,3,'3案の名前が明確に異なる');
assert.equal(dateChoices.every(x=>x.reason&&x.reaction?.text&&x.budgetFit?.label),true,'理由・予算相性・予想反応を表示できる');
assert.equal(dateChoices[1].conditionMatch,true,'コンディション一致を本命へ反映');

const payday=getTreatmentChoices(customer,choiceState('before-payday'),staff,services);
assert.equal(payday[0].value>payday[2].value,true,'給料日前は低予算の安心案が有力');
assert.equal(payday[2].budgetFit.score<0,true,'予算超過リスクを算出');
const bonus=getTreatmentChoices(customer,choiceState('after-bonus'),staff,services);
assert.equal(bonus[2].value>payday[2].value,true,'ボーナス後は攻め案の受け入れが上がる');

const urgent=getTreatmentChoices(customer,choiceState('sudden-plan'),staff,services);
assert.equal(urgent[1].time<=35,true,'急な予定では本命を時短化');
assert.equal(urgent[1].value>urgent[2].value,true,'急ぎでは長時間の攻め案を抑制');

const vip={...customer,id:'vip-test',visits:12,trust:96,budget:40000};
const vipState={...choiceState('reward'),encounteredCustomers:[vip.id],customerConditions:{[vip.id]:condition('reward')}};
const vipChoices=getTreatmentChoices(vip,vipState,staff,services);
assert.match(vipChoices[2].name,/VIP/,'VIP専用プレミアム提案');
assert.equal(vipChoices[2].value>=vipChoices[0].value,true,'VIPでは高級案が有力');

const trendChoices=getTreatmentChoices(customer,choiceState('refresh'),staff,services);
assert.equal(trendChoices.some(x=>x.trendBonus>0),true,'トレンド一致を提案へ反映');
const tired=getTreatmentChoices(customer,choiceState('after-bonus'),{...staff,energy:25},services);
assert.equal(tired[2].value<bonus[2].value,true,'スタッフEnergy低下で長時間案のリスク増');
assert.equal(budgetCompatibility(8000,10000,customer,condition('refresh')).label,'余裕あり');

const legacyAppearance=deriveOwnerAppearance({player:{skin:'色白',hairStyle:'ロング',hairColor:'ブラウン'},wardrobe:{makeup:'mode',equipped:{tops:'tops-silk',bottoms:'bottoms-slacks',shoes:'shoes-heels'}}});
assert.equal(legacyAppearance.hairStyle,'ロング');
assert.equal(legacyAppearance.makeup,'mode');
const dress=fashionItems.find(x=>x.category==='dresses');
const dressed=previewFashionAppearance(legacyAppearance,dress);
assert.equal(dressed.dress,dress.id);
assert.equal(dressed.tops,null,'ワンピース試着時はトップスを外す');
assert.equal(dressed.bottoms,null,'ワンピース試着時はボトムスを外す');
const legacyState={player:{},wardrobe:{equipped:{}}};
appearanceToLegacy(legacyState,dressed);
assert.equal(legacyState.ownerAppearance.dress,dress.id);
assert.equal(legacyState.wardrobe.equipped.dresses,dress.id);
assert.equal(normalizeOwnerAppearance({hairColor:'ピンクブラウン'},legacyState).hairColor,'ピンクブラウン');

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};
globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};
globalThis.window=globalThis;
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
await import('../src/game-v03.js?v61-tests');
const api=window.__SALON_STORY_TEST__;

const fresh=api.freshState();
assert.equal(fresh.gameVersion,'0.6');
assert.equal(fresh.ownerAppearance.hairStyle,'ボブ','新規ゲームに見た目正本を作成');
const v60=api.freshState();
v60.gameVersion='0.6';v60.version=6;delete v60.ownerAppearance;
v60.money=432100;v60.player.hairStyle='ウェーブ';v60.player.hairColor='ベージュ';v60.wardrobe.makeup='feminine';
const migrated=api.migrate(v60);
assert.equal(migrated.money,432100,'v60所持金を維持');
assert.equal(migrated.ownerAppearance.hairStyle,'ウェーブ','旧playerから髪型を移行');
assert.equal(migrated.ownerAppearance.hairColor,'ベージュ','旧playerから髪色を移行');
assert.equal(migrated.ownerAppearance.makeup,'feminine','旧wardrobeからメイクを移行');

const shop=api.freshState();api.setState(shop);
const item=fashionItems.find(x=>!shop.wardrobe.owned.includes(x.id));
const savedBefore={...api.getOwnerAppearance()};
assert.equal(api.applyFashionPreview(item.id),true);
assert.equal(api.displayedOwnerAppearance()[item.category==='dresses'?'dress':item.category],item.id,'試着を即時反映');
api.cancelAppearancePreview();
assert.deepEqual(api.getOwnerAppearance(),savedBefore,'試着キャンセルで保存状態へ復帰');
api.applyFashionPreview(item.id);
const moneyBefore=shop.money;
assert.equal(api.commitAppearancePreview(),true,'服を購入・決定');
assert.equal(shop.wardrobe.owned.includes(item.id),true,'購入済みへ追加');
assert.equal(shop.money,moneyBefore-item.price,'購入代金を一度だけ減算');

const targetHair=hairstyles20.find(x=>!shop.wardrobe.hairOwned.includes(x));
api.applyBeautyPreview('hairStyle',targetHair);
api.applyBeautyPreview('hairColor','ピンクブラウン');
api.applyBeautyPreview('makeup',makeupStyles.find(x=>x.id==='cool').id);
assert.equal(api.displayedOwnerAppearance().hairColor,'ピンクブラウン','髪色を即時プレビュー');
assert.equal(api.commitAppearancePreview(),true,'Beauty変更を保存');
assert.equal(shop.ownerAppearance.hairStyle,targetHair);
assert.equal(shop.ownerAppearance.hairColor,'ピンクブラウン');
assert.equal(shop.ownerAppearance.makeup,'cool');
const reloaded=api.migrate(JSON.parse(storage.get('salon-story-v01')));
assert.equal(reloaded.ownerAppearance.hairStyle,targetHair,'再読み込み後も髪型を保持');
assert.equal(reloaded.ownerAppearance.makeup,'cool','再読み込み後もメイクを保持');
api.setState(reloaded);
const homeMarkup=api.homeV62();
assert.match(homeMarkup,new RegExp(`data-owner-hair="${targetHair}"`),'ホームで保存済み髪型を描画');
assert.match(homeMarkup,/data-owner-color="ピンクブラウン"/,'ホームで保存済み髪色を描画');
assert.match(homeMarkup,/data-owner-makeup="cool"/,'ホームで保存済みメイクを描画');
assert.match(homeMarkup,/owner-home-avatar/,'ホームは共通ownerAppearance描画を使用');
assert.match(homeMarkup,/owner-official-fixed/,'ホームは添付の正式オーナー画像を使用');
const paused=api.freshState();paused.session={queue:['misaki','ai'],index:1,results:[],phase:'assign'};paused.activeBusinessSession=paused.session;paused.todaySales=33000;
const resumed=api.migrate(paused);assert.equal(resumed.screen,'businessResume','営業途中セーブを再開画面へ移行');assert.equal(resumed.session.index,1);assert.equal(resumed.todaySales,33000);
assert.equal(api.manualServiceRequired({id:'rena',visits:12,trust:95}),false,'通常VIPもスタッフ接客可能');

const source=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
const css=await readFile(new URL('../src/v61.css',import.meta.url),'utf8');
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
const serviceWorker=await readFile(new URL('../sw.js',import.meta.url),'utf8');
const v62css=await readFile(new URL('../src/v62.css',import.meta.url),'utf8');
for(const screen of ['homeV56','townPageV5','salonScene','fashionShopPageV5','beautyShopPageV5'])assert.match(source,new RegExp(`function ${screen}`),`${screen}を維持`);
assert.match(source,/getTreatmentChoices\(c,state,state\.staff,availableServices\(\)\)/,'接客画面を動的3択へ接続');
assert.match(source,/\['play','store','serviceResult'\]\.includes\(state\.screen\)/,'店舗・営業・結果で現在の主人公を表示');
assert.match(css,/@media\(max-width:720px\)/,'iPhone向けレイアウト');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'reduced motion対応');
assert.match(index,/v61\.css\?v=(?:61|62|63|64)/,'v61 CSS互換レイヤーを読み込む');
assert.match(serviceWorker,/salon-story-v(?:61|62|63|64)/,'v61以降の公開キャッシュを使用');
assert.match(source,/function treatmentServicePageV62/,'施術内容選択を独立');
assert.match(source,/function treatmentPlanPageV62/,'価格プラン選択を独立');
assert.match(source,/function businessEventResultPageV62/,'営業イベント結果を表示');
assert.match(source,/function businessResumePageV62/,'営業再開UIを実装');
assert.match(source,/officialPortrait\('owner','owner'/,'全画面のオーナーを正式画像へ統一');
assert.match(source,/beautyPortrait\(c,ba,'before','md'\)/,'結果画面でBefore差分を描画');
assert.match(source,/beautyPortrait\(c,ba,'after','md'\)/,'結果画面でAfter差分を描画');
assert.match(source,/albumVisualCard/,'Beauty AlbumでもBefore\/Afterを描画');
for(const kind of ['smallface','facial','slimming','bust','relax'])assert.match(v62css,new RegExp(`treatment-${kind}`),`${kind}専用の見た目差分`);

console.log('Salon Story v61 proposal and appearance tests: OK');

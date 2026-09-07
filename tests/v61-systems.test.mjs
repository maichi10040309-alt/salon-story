import assert from'node:assert/strict';
import{access,readFile,stat}from'node:fs/promises';
import{services}from'../src/data/services.js';
import{fashionItems,hairstyles20,makeupStyles}from'../src/data/v04.js';
import{dailyPolicies,customerConditions}from'../src/data/v06.js';
import{appearanceToLegacy,budgetCompatibility,deriveOwnerAppearance,getTreatmentChoices,normalizeOwnerAppearance,previewFashionAppearance}from'../src/v61-systems.js';
import{DEFAULT_OWNER_APPEARANCE,ownerAssetBoundsForItem,ownerAssetForItem,ownerAssetPathForItem}from'../src/owner-avatar.js';
import{OWNER_ALPHA_BOUNDS,OWNER_CANVAS,ownerLayerCalibration}from'../src/owner-asset-metadata.js';

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
assert.equal(legacyAppearance.hairStyle,'HAIR_04');
assert.equal(legacyAppearance.makeup,'MAKEUP_04');
const dress=fashionItems.find(x=>x.category==='dresses');
const dressed=previewFashionAppearance(legacyAppearance,dress);
assert.equal(dressed.dress,ownerAssetForItem(dress));
assert.equal(dressed.tops,null,'ワンピース試着時はトップスを外す');
assert.equal(dressed.bottoms,null,'ワンピース試着時はボトムスを外す');
const legacyState={player:{},wardrobe:{equipped:{}}};
appearanceToLegacy(legacyState,dressed);
assert.equal(legacyState.ownerAppearance.dress,ownerAssetForItem(dress));
assert.equal(normalizeOwnerAppearance({hairColor:'ピンクブラウン'},legacyState).hairColor,'COLOR_09');
for(const item of fashionItems){assert.ok(ownerAssetForItem(item),`${item.id}を正式オーナー素材へ割り当て`);const asset=new URL('../assets/owner/'+ownerAssetPathForItem(item),import.meta.url);await access(asset);assert.equal((await stat(asset)).size>0,true,`${item.id}の商品画像を空ファイルにしない`)}
for(const category of ['tops','bottoms','dresses','outer','shoes','bags','accessories']){const item=fashionItems.filter(x=>x.category===category).at(-1),preview=previewFashionAppearance(DEFAULT_OWNER_APPEARANCE,item),key={dresses:'dress',bags:'bag'}[category]||category;assert.equal(preview[key],ownerAssetForItem(item),`${category}の最終商品も試着可能`)}

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
assert.equal(fresh.ownerAppearance.hairStyle,'HAIR_05','新規ゲームに正式見た目正本を作成');
const v60=api.freshState();
v60.gameVersion='0.6';v60.version=6;delete v60.ownerAppearance;
v60.money=432100;v60.player.hairStyle='ウェーブ';v60.player.hairColor='ベージュ';v60.wardrobe.makeup='feminine';
const migrated=api.migrate(v60);
assert.equal(migrated.money,432100,'v60所持金を維持');
assert.equal(migrated.ownerAppearance.hairStyle,'HAIR_11','旧playerから髪型を移行');
assert.equal(migrated.ownerAppearance.hairColor,'COLOR_05','旧playerから髪色を移行');
assert.equal(migrated.ownerAppearance.makeup,'MAKEUP_02','旧wardrobeからメイクを移行');
const savedOwner=api.freshState();
savedOwner.wardrobe.owned.push('tops-silk');
savedOwner.ownedAppearanceItems.tops.push('TOPS_03');
savedOwner.ui.previewAppearance={...savedOwner.ownerAppearance,hairStyle:'HAIR_09'};
savedOwner.ui.previewContext={type:'beauty'};
const preservedOwner=api.migrate(savedOwner);
assert.equal(preservedOwner.ui.previewAppearance.hairStyle,'HAIR_09','既存セーブの試着中Appearanceを維持');
assert.equal(preservedOwner.wardrobe.owned.includes('tops-silk'),true,'既存セーブのwardrobe購入情報を維持');
assert.equal(preservedOwner.ownedAppearanceItems.tops.includes('TOPS_03'),true,'既存セーブの正式owner所持品を維持');

const shop=api.freshState();api.setState(shop);
const item=fashionItems.find(x=>!shop.wardrobe.owned.includes(x.id));
const savedBefore={...api.getOwnerAppearance()};
assert.equal(api.applyFashionPreview(item.id),true);
assert.equal(api.displayedOwnerAppearance()[item.category==='dresses'?'dress':item.category],ownerAssetForItem(item),'試着を即時反映');
api.cancelAppearancePreview();
assert.deepEqual(api.getOwnerAppearance(),savedBefore,'試着キャンセルで保存状態へ復帰');
api.applyFashionPreview(item.id);
const moneyBefore=shop.money;
assert.equal(api.commitAppearancePreview(),true,'服を購入・決定');
assert.equal(shop.wardrobe.owned.includes(item.id),true,'購入済みへ追加');
assert.equal(shop.money,moneyBefore-item.price,'購入代金を一度だけ減算');

const targetHair=hairstyles20.find(x=>!shop.wardrobe.hairOwned.includes(x));
api.applyBeautyPreview('hairStyle',targetHair);
api.applyBeautyPreview('hairColor','COLOR_09');
api.applyBeautyPreview('makeup','MAKEUP_05');
assert.equal(api.displayedOwnerAppearance().hairStyle,targetHair,'髪色・メイク選択後も試着中の髪型を維持');
assert.equal(api.displayedOwnerAppearance().hairColor,'COLOR_09','髪色を即時プレビュー');
assert.equal(api.commitAppearancePreview(),true,'Beauty変更を保存');
assert.equal(shop.ownerAppearance.hairStyle,targetHair);
assert.equal(shop.ownerAppearance.hairColor,'COLOR_09');
assert.equal(shop.ownerAppearance.makeup,'MAKEUP_05');
const reloaded=api.migrate(JSON.parse(storage.get('salon-story-v01')));
assert.equal(reloaded.ownerAppearance.hairStyle,targetHair,'再読み込み後も髪型を保持');
assert.equal(reloaded.ownerAppearance.makeup,'MAKEUP_05','再読み込み後もメイクを保持');
api.setState(reloaded);
const homeMarkup=api.homeV62();
assert.match(homeMarkup,new RegExp(`data-owner-hair="${targetHair}"`),'ホームで保存済み髪型を描画');
assert.match(homeMarkup,/data-owner-color="COLOR_09"/,'ホームで保存済み髪色を描画');
assert.match(homeMarkup,/data-owner-makeup="MAKEUP_05"/,'ホームで保存済みメイクを描画');
assert.match(homeMarkup,/owner-home-avatar/,'ホームは共通ownerAppearance描画を使用');
assert.match(homeMarkup,/owner-layer-avatar/,'ホームは正式レイヤーオーナーを使用');
assert.match(homeMarkup,/data-owner-stage="shared"/,'Homeは共通avatar stageを使用');
for(const [screen,renderPage] of [['fashionShop',api.fashionShopPageV5],['beautyShop',api.beautyShopPageV5],['owner',api.ownerPageV5]]){reloaded.screen=screen;const markup=renderPage();assert.match(markup,new RegExp(`data-owner-hair="${targetHair}"`),`${screen}で保存済みownerAppearanceを使用`);assert.match(markup,/owner-layer-avatar/)}
reloaded.screen='town';const townMarkup=api.townPageV5();assert.doesNotMatch(townMarkup,/town-player|owner-layer-avatar|data-owner-hair=/,'TownはオーナーをHTML生成しない');
for(const building of ['salon','fashionShop','beautyShop','cafe','school'])assert.match(townMarkup,new RegExp(`data-town="${building}"`),`Townに${building}施設を表示`);
reloaded.ui.previewAppearance=null;
reloaded.ui.beautyTab='hair';
assert.equal((api.beautyShopPageV5().match(/data-preview-hair=/g)||[]).length,20,'Hair Style 20件を空白にせず表示');
reloaded.ui.beautyTab='color';
assert.equal((api.beautyShopPageV5().match(/data-preview-color=/g)||[]).length,12,'Hair Color 12件を空白にせず表示');
reloaded.ui.beautyTab='makeup';
assert.equal((api.beautyShopPageV5().match(/data-preview-makeup=/g)||[]).length,6,'Makeup 6件を空白にせず表示');
for(const tab of ['hair','color','makeup']){reloaded.ui.beautyTab=tab;const markup=api.beautyShopPageV5();assert.match(markup,/Beautyプレビュー/);assert.equal((markup.match(/owner-avatar-canvas/g)||[]).length>1,true,`${tab}一覧とowner previewをレイヤー表示`)}
reloaded.ui.beautyTab='invalid';assert.equal((api.beautyShopPageV5().match(/data-preview-hair=/g)||[]).length>=3,true,'不正なBeautyタブ状態でもHair Styleへfallback');
const fashionMarkup=api.fashionShopPageV5();for(const category of ['tops','bottoms','dresses','outer','shoes','bags','accessories'])assert.match(fashionMarkup,new RegExp(`fashion-thumb--${category}`),`${category}の商品画像へ拡大classを付与`);
assert.match(fashionMarkup,/owner-display--shop-preview/,'Fashion試着を専用の大きいpreview領域へ分離');
assert.match(fashionMarkup,/data-owner-stage="shared"/,'Fashion試着もHomeと同じavatar stageを使用');
assert.match(api.beautyShopPageV5(),/owner-display--beauty-preview/,'Beauty previewを専用領域へ分離');
const bodyCenter=OWNER_ALPHA_BOUNDS.BODY.x+OWNER_ALPHA_BOUNDS.BODY.width/2;
for(const id of ['TOPS_01','TOPS_02','TOPS_04','BOTTOMS_01','BOTTOMS_02','STYLE_01','STYLE_02']){const b=OWNER_ALPHA_BOUNDS[id];assert.equal(Math.abs(b.x+b.width/2-bodyCenter)<=1.5,true,`${id}はbody中心線と整合`)}
for(const id of ['SHOES_01','SHOES_02']){const b=OWNER_ALPHA_BOUNDS[id],c=ownerLayerCalibration('shoes',id);assert.equal(Math.abs(b.x+b.width/2+c.x*OWNER_CANVAS.width-494)<=1,true,`${id}はbody足元中心へ実測補正`)}
for(const itemId of ['tops-lace','tops-ribbon','tops-turtle','bottoms-flare','bottoms-tweed','dresses-flower','dresses-pinkdress','shoes-pumps','shoes-heels']){const item=fashionItems.find(x=>x.id===itemId),meta=ownerAssetBoundsForItem(item),match=fashionMarkup.match(new RegExp(`aria-label="${item.name}を試着"><svg[^>]+viewBox="([^"]+)"`));assert.ok(match,`${itemId}のalpha viewportを描画`);const [x,y,w,h]=match[1].split(' ').map(Number),b=meta.bounds;assert.equal(x<=b.x&&y<=b.y&&x+w>=b.x+b.width&&y+h>=b.y+b.height,true,`${itemId}のalpha全体を切らずに表示`)}
reloaded.screen='store';assert.match(api.salonScene(),new RegExp(`data-owner-hair="${targetHair}"`),'店舗でも保存済みownerAppearanceを使用');
const paused=api.freshState();paused.session={queue:['misaki','ai'],index:1,results:[],phase:'assign'};paused.activeBusinessSession=paused.session;paused.todaySales=33000;
const resumed=api.migrate(paused);assert.equal(resumed.screen,'businessResume','営業途中セーブを再開画面へ移行');assert.equal(resumed.session.index,1);assert.equal(resumed.todaySales,33000);
assert.equal(api.manualServiceRequired({id:'rena',visits:12,trust:95}),false,'通常VIPもスタッフ接客可能');

const source=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
const css=await readFile(new URL('../src/v61.css',import.meta.url),'utf8');
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
const serviceWorker=await readFile(new URL('../sw.js',import.meta.url),'utf8');
const v62css=await readFile(new URL('../src/v62.css',import.meta.url),'utf8');
const ownerCss=await readFile(new URL('../src/owner-avatar.css',import.meta.url),'utf8');
for(const screen of ['homeV56','townPageV5','salonScene','fashionShopPageV5','beautyShopPageV5'])assert.match(source,new RegExp(`function ${screen}`),`${screen}を維持`);
assert.match(source,/getTreatmentChoices\(c,state,state\.staff,availableServices\(\)\)/,'接客画面を動的3択へ接続');
assert.match(source,/\['play','store','serviceResult'\]\.includes\(state\.screen\)/,'店舗・営業・結果で現在の主人公を表示');
assert.match(css,/@media\(max-width:720px\)/,'iPhone向けレイアウト');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'reduced motion対応');
assert.match(index,/owner-avatar\.css\?v=67/,'v67正式オーナーCSSを読み込む');
assert.match(serviceWorker,/salon-story-v67/,'v67公開キャッシュを使用');
assert.match(serviceWorker,/owner-asset-metadata\.js\?v=67/,'alpha解析metadataを公開キャッシュへ含める');
assert.match(source,/function treatmentServicePageV62/,'施術内容選択を独立');
assert.match(source,/function treatmentPlanPageV62/,'価格プラン選択を独立');
assert.match(source,/function businessEventResultPageV62/,'営業イベント結果を表示');
assert.match(source,/function businessResumePageV62/,'営業再開UIを実装');
assert.match(source,/renderOwnerAvatar\(appearance/,'全画面のオーナーを正式レイヤー画像へ統一');
assert.match(source,/function beautyOptionAvatar[\s\S]*renderOwnerAvatar/,'Beauty一覧を完成済みownerプレビューで表示');
assert.match(source,/data-preview-hair[\s\S]*beautyOptionAvatar/,'髪型一覧を表示');
assert.match(source,/data-preview-color[\s\S]*beautyOptionAvatar/,'髪色一覧を表示');
assert.match(source,/data-preview-makeup[\s\S]*beautyOptionAvatar/,'メイク一覧を表示');
assert.match(css,/@media\(max-width:430px\)\{\.home-stage-v56,\.v5-town,\.v61-shop-layout,\.v61-beauty-preview\{width:100%;max-width:100%;overflow-x:clip\}/,'320〜430pxの主要画面で横スクロールを防止');
assert.match(css,/@media\(max-width:350px\)[\s\S]*\.v61-shop-layout \.fashion-scroll,\.v61-beauty-options,\.v61-color-options,\.v61-makeup-options\{grid-template-columns:1fr\}/,'320pxではFashionとBeautyを1列表示');
assert.match(css,/@media\(max-width:720px\)[\s\S]*\.v61-shop-layout \.fashion-scroll\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'375・390・430pxではFashion商品を収まる2列表示');
assert.match(css,/\.fashion-thumb-viewport\{display:block;width:90%;height:90%;overflow:visible\}/,'Fashion商品をalpha bbox viewport内へ約90%で表示');
assert.match(css,/@media\(max-width:430px\)[\s\S]*\.v61-shop-layout \.tryon-panel,\.v61-beauty-preview \.tryon-panel\{grid-template-columns:1fr/,'430px以下では試着previewを1カラム表示');
assert.match(css,/\.home-stage-v56\{display:grid;grid-template-columns:/,'Homeをカード基準のgridで配置');
assert.match(ownerCss,/\.owner-avatar-canvas>\.owner-layer\{position:absolute;inset:0;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;object-position:50% 100%/,'bodyと衣装を共通stage座標へ統一');
assert.match(ownerCss,/transform-origin:var\(--layer-origin-x,50%\) var\(--layer-origin-y,100%\)/,'alpha実測anchorを変形原点に使用');assert.match(ownerCss,/\.owner-shoes-left\{clip-path:[^}]+\}\.owner-shoes-right\{clip-path:/,'左右の靴を同一assetから別々に足へ配置');
assert.match(ownerCss,/\.owner-avatar-canvas\{[^}]*aspect-ratio:2\/3;[^}]*overflow:hidden\}/,'avatar stage内に全レイヤーを収める');
assert.match(source,/beautyPortrait\(c,ba,'before','md'\)/,'結果画面でBefore差分を描画');
assert.match(source,/beautyPortrait\(c,ba,'after','md'\)/,'結果画面でAfter差分を描画');
assert.match(source,/albumVisualCard/,'Beauty AlbumでもBefore\/Afterを描画');
for(const kind of ['smallface','facial','slimming','bust','relax'])assert.match(v62css,new RegExp(`treatment-${kind}`),`${kind}専用の見た目差分`);

console.log('Salon Story v61 proposal and appearance tests: OK');

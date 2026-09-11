import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';
import{fashionItems,hairstyles20}from'../src/data/v04.js';
import{appearanceToLegacy,deriveOwnerAppearance,normalizeOwnerAppearance,previewFashionAppearance}from'../src/v61-systems.js';
import{DEFAULT_OWNER_APPEARANCE,OWNER_HAIR_NAMES,OWNER_HAIR_COLORS,OWNER_MAKEUPS,ownerAssetBoundsForItem,ownerAssetForItem}from'../src/owner-avatar.js';

assert.equal(fashionItems.length,13,'完成コーデ13点');
assert.equal(fashionItems.every(x=>x.category==='dresses'),true,'Fashion商品を完成コーデへ統一');
assert.equal(new Set(fashionItems.map(ownerAssetForItem)).size,13,'OUTFIT ID重複なし');
assert.equal(hairstyles20.length,17,'hair17種類を維持');

const legacy=deriveOwnerAppearance({player:{hairStyle:'ウェーブ',hairColor:'ピンクブラウン'},wardrobe:{makeup:'cool',equipped:{tops:'tops-silk',bottoms:'bottoms-slacks',shoes:'shoes-heels'}}});
assert.equal(legacy.hairStyle,'HAIR_11');
assert.equal(legacy.hairColor,'COLOR_09');
assert.equal(legacy.makeup,'MAKEUP_05');
assert.equal(legacy.outfit,'OUTFIT_01','旧セーブは安全な完成コーデへfallback');
for(const item of fashionItems){
 const preview=previewFashionAppearance(legacy,item);
 assert.equal(preview.outfit,item.asset,`${item.asset}を試着`);
 assert.equal(preview.dress,item.asset);
 for(const slot of ['tops','bottoms','outer','shoes','bag','accessories'])assert.equal(preview[slot],null,`${slot}旧layerを重複させない`);
}
const legacyState={player:{},wardrobe:{equipped:{}}};
appearanceToLegacy(legacyState,previewFashionAppearance(legacy,fashionItems[3]));
assert.equal(legacyState.ownerAppearance.outfit,'OUTFIT_04');
assert.equal(normalizeOwnerAppearance({outfit:'missing'},legacyState).outfit,'OUTFIT_01');

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
const root={innerHTML:''};
globalThis.document={querySelector:selector=>selector==='#app'?root:null,querySelectorAll:()=>[]};
globalThis.window=globalThis;
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
await import('../src/game-v03.js?v95-owner-audit');
const api=window.__SALON_STORY_TEST__;

const state=api.freshState();state.money=999999;api.setState(state);
assert.equal(state.ownerAppearance.outfit,'OUTFIT_01');
assert.equal(api.applyFashionPreview(fashionItems[12].id),true);
assert.equal(api.displayedOwnerAppearance().outfit,'OUTFIT_13','TRY ONを即時反映');
api.cancelAppearancePreview();
assert.equal(api.getOwnerAppearance().outfit,'OUTFIT_01','キャンセルで保存済みコーデへ復帰');
api.applyFashionPreview(fashionItems[1].id);
assert.equal(api.commitAppearancePreview(),true,'完成コーデを購入・決定');
assert.equal(state.ownerAppearance.outfit,'OUTFIT_02');
assert.ok(state.wardrobe.owned.includes(fashionItems[1].id));
const reloaded=api.migrate(JSON.parse(storage.get('salon-story-v01')));
assert.equal(reloaded.ownerAppearance.outfit,'OUTFIT_02','再読込後も完成コーデを維持');
api.setState(reloaded);

const fashionMarkup=api.fashionShopPageV5();
assert.equal((fashionMarkup.match(/class="card fashion-item/g)||[]).length,13,'Fashion一覧に13商品を表示');
assert.equal((fashionMarkup.match(/fashion-thumb--dresses/g)||[]).length,13);
assert.match(fashionMarkup,/EQUIPPED/,'装備中商品を表示');
for(const item of fashionItems){
 const b=ownerAssetBoundsForItem(item).bounds,padX=b.width*.05,padY=b.height*.05;
 const viewBox=`${b.x-padX} ${b.y-padY} ${b.width+padX*2} ${b.height+padY*2}`;
 assert.ok(fashionMarkup.includes(`viewBox="${viewBox}"`),`${item.asset}を実alpha範囲+5%余白で中央表示`);
}

reloaded.ui.previewAppearance=null;reloaded.ui.previewContext=null;
for(const [tab,attr,count] of [['hair','data-preview-hair',OWNER_HAIR_NAMES.length],['color','data-preview-color',OWNER_HAIR_COLORS.length],['makeup','data-preview-makeup',OWNER_MAKEUPS.length]]){
 reloaded.ui.beautyTab=tab;const markup=api.beautyShopPageV5();
 assert.equal((markup.match(new RegExp(attr,'g'))||[]).length,count,`${tab}を空欄なく表示`);
 assert.match(markup,/selected|equipped/,`${tab}の選択中状態を表示`);
 assert.match(markup,/owner-display--beauty-preview/);
 assert.match(markup,/data-owner-outfit="OUTFIT_02"/,`${tab}でもFashion確定コーデを維持`);
}
reloaded.ui.beautyTab='invalid';
assert.equal((api.beautyShopPageV5().match(/data-preview-hair/g)||[]).length,17,'不正BeautyタブはHair Styleへfallback');

const home=api.homeV62();
assert.match(home,/owner-display--home/);
assert.match(home,/owner-home-avatar/);
assert.match(home,/data-owner-outfit="OUTFIT_02"/,'Homeで同じコーデを表示');
assert.match(home,/<figcaption>オーナー<\/figcaption>/,'名前ラベルを維持');
assert.match(home,/営業開始|営業を再開/);
assert.match(home,/home-stage-bottom"><p>[^<]+<\/p>/,'Home案内文を維持');
const town=api.townPageV5();
assert.doesNotMatch(town,/owner-layer-avatar|town-player|data-owner-outfit/,'Town owner非表示を維持');

const source=await readFile(new URL('../src/game-v03.js',import.meta.url),'utf8');
const ownerSource=await readFile(new URL('../src/owner-avatar.js',import.meta.url),'utf8');
const css=await readFile(new URL('../src/v61.css',import.meta.url),'utf8');
const baseCss=await readFile(new URL('../src/style.css',import.meta.url),'utf8');
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
const serviceWorker=await readFile(new URL('../sw.js',import.meta.url),'utf8');
assert.match(ownerSource,/left:39\.74609375%;top:\.5208333%;width:17\.08984375%;height:16\.40625%/,'Fashion共通髪配置は現行のtop=8px相当');
assert.match(ownerSource,/layers\.push\(img\(`outfits\/\$\{a\.outfit\}\.png`,'owner-outfit'\)\)[\s\S]*layers\.push\(img\(TRYON_HAIR_PATH/,'outfit→hairの順で描画');
assert.doesNotMatch(ownerSource,/layers\.push\(img\(`(?:shoes|bags|outer|accessories)/,'旧小物layerを合成しない');
assert.match(source,/function townPageV5\(\)[\s\S]*town-map/);
assert.match(css,/@media\(max-width:430px\)\{\.home-stage-v56,\.v5-town,\.v61-shop-layout,\.v61-beauty-preview\{width:100%;max-width:100%;overflow-x:clip\}/,'iPhone主要画面の横はみ出し防止');
assert.match(css,/@media\(max-width:350px\)[\s\S]*fashion-scroll[^}]*grid-template-columns:1fr/,'320px級は商品を1列表示');
assert.match(css,/@media\(max-width:720px\)[\s\S]*fashion-scroll\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'375〜430pxは商品を2列表示');
assert.match(css,/\.fashion-thumb-viewport\{display:block;width:90%;height:90%/,'商品を枠内約90%で表示');
assert.match(css,/\.home-stage-v56\{display:grid;grid-template-columns:/,'Home右下owner配置を維持');
assert.match(baseCss,/env\(safe-area-inset-top\)/);
assert.match(baseCss,/env\(safe-area-inset-bottom\)/);
assert.match(index,/v=95/,'更新asset metadataをcache bust');
assert.match(serviceWorker,/salon-story-v95/,'service worker cacheを更新');

console.log('Salon Story v61 owner final-audit tests: OK');

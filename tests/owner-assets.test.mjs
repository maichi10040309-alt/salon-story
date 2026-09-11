import assert from'node:assert/strict';
import{access,readFile}from'node:fs/promises';
import{fashionItems}from'../src/data/v04.js';
import{renderOwnerAvatar,DEFAULT_OWNER_APPEARANCE,normalizeOwnerAssetAppearance,ownerAssetBoundsForItem,ownerAssetPathForItem}from'../src/owner-avatar.js';
import{OWNER_ALPHA_BOUNDS,OWNER_CANVAS}from'../src/owner-asset-metadata.js';

const manifest=JSON.parse(await readFile(new URL('../assets/owner/ownerManifest.json',import.meta.url),'utf8'));
assert.deepEqual(manifest.canvas,OWNER_CANVAS,'owner asset canvasは1024×1536');
assert.equal(manifest.hairStyles.length,17,'hairは17種類を維持');
assert.equal(manifest.hairColors.length,12);
assert.equal(manifest.makeups.length,6);
assert.equal(manifest.shoes.length,8);
assert.equal(manifest.bags.length,8);
assert.equal(manifest.outer.length,5);
assert.equal(manifest.accessories.length,10);

for(const group of ['hairStyles','makeups','tops','bottoms','dress','outer','shoes','bags','accessories']){
 for(const item of manifest[group])for(const key of ['path','front','back'])if(item[key])await access(new URL('../'+item[key],import.meta.url));
}

const pngSize=async path=>{const png=await readFile(path);assert.equal(png.subarray(1,4).toString(),'PNG');return{width:png.readUInt32BE(16),height:png.readUInt32BE(20)}};
for(const item of fashionItems){
 const path=new URL('../assets/owner/'+ownerAssetPathForItem(item),import.meta.url);
 assert.deepEqual(await pngSize(path),OWNER_CANVAS,`${item.asset}は共通canvas`);
 const meta=ownerAssetBoundsForItem(item),expected=OWNER_ALPHA_BOUNDS[item.asset];
 assert.deepEqual(meta.bounds,expected,`${item.asset}の実alpha範囲を商品表示へ使用`);
 assert.ok(expected.x>=0&&expected.y>=0&&expected.x+expected.width<=OWNER_CANVAS.width&&expected.y+expected.height<=OWNER_CANVAS.height);
}

for(let i=1;i<=8;i++){
 const n=String(i).padStart(2,'0');
 assert.deepEqual(await pngSize(new URL(`../assets/owner/shoes/SHOES_${n}.png`,import.meta.url)),OWNER_CANVAS);
 const shoe=OWNER_ALPHA_BOUNDS[`SHOES_${n}`];
 assert.equal(shoe.y,1320,`SHOES_${n}の足元基準Yを維持`);
 assert.ok(Math.abs(shoe.x+shoe.width/2-480)<=1.5,`SHOES_${n}の左右中心を統一`);
 assert.deepEqual(await pngSize(new URL(`../assets/owner/bags/BAG_${n}.png`,import.meta.url)),OWNER_CANVAS);
}

const initial=renderOwnerAvatar(DEFAULT_OWNER_APPEARANCE,{home:true});
assert.match(initial,/outfits\/OUTFIT_01\.png/);
assert.equal((initial.match(/<img class="owner-layer /g)||[]).length,1,'初期完成コーデを1枚だけ描画');
assert.doesNotMatch(initial,/owner-shoes|owner-bag|owner-outer|owner-accessory/,'旧小物layerを重ねず二重表示を防止');
const fashionPreview=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,outfit:'OUTFIT_13',dress:'OUTFIT_13'},{fashionPreview:true});
assert.equal((fashionPreview.match(/<img class="owner-layer owner-outfit/g)||[]).length,1);
assert.equal((fashionPreview.match(/INITIAL_TRYON_HAIR_ONLY\.png/g)||[]).length,1,'試着用共通髪を1枚だけ描画');
assert.match(fashionPreview,/left:39\.74609375%;top:-\.2604167%;width:17\.08984375%;height:16\.40625%/,'固定髪配置を維持');
assert.doesNotMatch(fashionPreview,/SHOES_|BAG_|OUTER_|ACC_/,'完成コーデへ旧assetを重複描画しない');

assert.equal(normalizeOwnerAssetAppearance({outfit:'OUTFIT_99'}).outfit,'OUTFIT_01','無効outfitは安全にfallback');
assert.equal(normalizeOwnerAssetAppearance({hairStyle:'HAIR_99'}).hairStyle,'HAIR_05','無効hairは安全にfallback');
assert.equal(normalizeOwnerAssetAppearance({hairColor:'COLOR_99'}).hairColor,'COLOR_02');
assert.equal(normalizeOwnerAssetAppearance({makeup:'MAKEUP_99'}).makeup,'MAKEUP_01');

console.log('Salon Story owner completed-outfit asset tests: OK');

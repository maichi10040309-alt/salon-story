import assert from'node:assert/strict';
import{access,readFile}from'node:fs/promises';
import{createHash}from'node:crypto';
import{renderOwnerAvatar,DEFAULT_OWNER_APPEARANCE,normalizeOwnerAssetAppearance,ownerAssetPathForItem}from'../src/owner-avatar.js';
const manifest=JSON.parse(await readFile(new URL('../assets/owner/ownerManifest.json',import.meta.url),'utf8'));
assert.equal(manifest.hairStyles.length,20);assert.equal(manifest.hairColors.length,12);assert.equal(manifest.makeups.length,6);assert.equal(manifest.tops.length,12);assert.equal(manifest.bottoms.length,8);assert.equal(manifest.dress.length,5);assert.equal(manifest.outer.length,5);assert.equal(manifest.shoes.length,8);assert.equal(manifest.bags.length,8);assert.equal(manifest.accessories.length,10);
for(const group of ['hairStyles','makeups','tops','bottoms','dress','outer','shoes','bags','accessories'])for(const item of manifest[group])for(const key of ['path','front','back'])if(item[key])await access(new URL('../'+item[key],import.meta.url));
for(const path of Object.values(manifest.base))await access(new URL('../'+path,import.meta.url));
const html=renderOwnerAvatar(DEFAULT_OWNER_APPEARANCE,{home:true});assert.match(html,/owner-layer-avatar/);assert.match(html,/HAIR_05_front\.png/);assert.match(html,/TOPS_01\.png/);assert.match(html,/BOTTOMS_01\.png/);assert.doesNotMatch(html,/SHOES_01\.png|owner-shoes/,'未対応shoesは装備データがあっても描画しない');
assert.doesNotMatch(html,/base\/(skin|face_base|eyes_default|eyebrows_default|mouth_default)\.png/,'顔付き新bodyへ旧顔layerを重ねない');
assert.equal((html.match(/ACC_01\.png/g)||[]).length,1,'ピアスを片耳用layerとして1回だけ描画');assert.match(html,/owner-earring-single/);assert.equal((html.match(/ACC_09\.png/g)||[]).length,1,'腕時計を手首補正付きで描画');assert.match(html,/owner-wrist-accessory/);assert.match(html,/ACC_03\.png/);assert.match(html,/ACC_10\.png/,'整合するaccessoryは維持');
const bodyPng=await readFile(new URL('../assets/owner/base/body.png',import.meta.url));assert.equal(bodyPng.readUInt32BE(16),1024);assert.equal(bodyPng.readUInt32BE(20),1536);assert.equal(createHash('sha256').update(bodyPng).digest('hex'),'0d40fa7d834cc1a691d589ef0b37b90c707ab01e89b978b72692499279927793','衣服付き旧bodyを着せ替え素体へ置換');
assert.equal(normalizeOwnerAssetAppearance({hairStyle:'ウェーブ',hairColor:'ピンクブラウン',makeup:'cool'}).hairStyle,'HAIR_11');
assert.equal(normalizeOwnerAssetAppearance({hairStyle:'HAIR_99'}).hairStyle,'HAIR_05');
assert.equal(normalizeOwnerAssetAppearance({hairColor:'COLOR_99'}).hairColor,'COLOR_02');
assert.equal(normalizeOwnerAssetAppearance({tops:'TOPS_99'}).tops,'TOPS_01');
assert.equal(normalizeOwnerAssetAppearance({shoes:null}).shoes,null,'靴なしは裸足を維持');assert.doesNotMatch(renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,shoes:null}),/owner-shoes/);
assert.equal(ownerAssetPathForItem({id:'accessories-pearl',category:'accessories'}),'accessories/earrings/ACC_01.png');
const dress=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,dress:'STYLE_02'});assert.match(dress,/STYLE_02\.png/);assert.doesNotMatch(dress,/TOPS_01\.png|BOTTOMS_01\.png/);
const tops02=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,tops:'TOPS_02',bottoms:'BOTTOMS_01'});assert.match(tops02,/TOPS_02\.png/);assert.match(tops02,/BOTTOMS_01\.png/);
const dress01=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,dress:'STYLE_01'});assert.match(dress01,/STYLE_01\.png/);assert.doesNotMatch(dress01,/TOPS_01\.png|BOTTOMS_01\.png/);
const outer01=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,outer:'OUTER_01'});assert.match(outer01,/OUTER_01\.png/);
const shoes02=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,shoes:'SHOES_02'});assert.doesNotMatch(shoes02,/SHOES_02\.png|owner-shoes/,'別shoe装備でもowner layer表示を抑止');
const calibratedAccessories=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,earrings:'ACC_02',accessoryWrist:'ACC_08'});assert.equal((calibratedAccessories.match(/ACC_02\.png/g)||[]).length,1,'別ピアスも片耳用layerで描画');assert.equal((calibratedAccessories.match(/ACC_08\.png/g)||[]).length,1,'別手首accessoryも補正付きで描画');
const dedupedAccessory=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,necklace:'ACC_03',accessories:'ACC_03'});assert.equal((dedupedAccessory.match(/ACC_03\.png/g)||[]).length,1,'同一accessory IDを重複描画しない');
for(let i=1;i<=20;i++){const id=`HAIR_${String(i).padStart(2,'0')}`,markup=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,hairStyle:id});assert.match(markup,new RegExp(`${id}_front\\.png`));assert.match(markup,new RegExp(`${id}_back\\.png`))}
for(let i=1;i<=12;i++){const id=`COLOR_${String(i).padStart(2,'0')}`,markup=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,hairColor:id});assert.match(markup,new RegExp(`data-owner-color="${id}"`))}
for(let i=1;i<=6;i++){const id=`MAKEUP_${String(i).padStart(2,'0')}`,markup=renderOwnerAvatar({...DEFAULT_OWNER_APPEARANCE,makeup:id});assert.match(markup,new RegExp(`${id}\\.png`))}
console.log('Salon Story owner layered asset tests: OK');

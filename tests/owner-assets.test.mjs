import assert from'node:assert/strict';
import{access,readFile}from'node:fs/promises';
import{renderOwnerAvatar,DEFAULT_OWNER_APPEARANCE,normalizeOwnerAssetAppearance}from'../src/owner-avatar.js';
const manifest=JSON.parse(await readFile(new URL('../assets/owner/ownerManifest.json',import.meta.url),'utf8'));
assert.equal(manifest.hairStyles.length,20);assert.equal(manifest.hairColors.length,12);assert.equal(manifest.makeups.length,6);assert.equal(manifest.tops.length,12);assert.equal(manifest.bottoms.length,8);assert.equal(manifest.dress.length,5);assert.equal(manifest.outer.length,5);assert.equal(manifest.shoes.length,8);assert.equal(manifest.bags.length,8);assert.equal(manifest.accessories.length,10);
for(const group of ['hairStyles','makeups','tops','bottoms','dress','outer','shoes','bags','accessories'])for(const item of manifest[group])for(const key of ['path','front','back'])if(item[key])await access(new URL('../'+item[key],import.meta.url));
const html=renderOwnerAvatar(DEFAULT_OWNER_APPEARANCE,{home:true});assert.match(html,/owner-layer-avatar/);assert.match(html,/HAIR_05_front\.png/);assert.match(html,/TOPS_01\.png/);assert.match(html,/BOTTOMS_01\.png/);assert.match(html,/SHOES_01\.png/);
assert.equal(normalizeOwnerAssetAppearance({hairStyle:'ウェーブ',hairColor:'ピンクブラウン',makeup:'cool'}).hairStyle,'HAIR_11');
console.log('Salon Story owner layered asset tests: OK');

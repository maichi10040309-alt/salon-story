import assert from'node:assert/strict';
import{layeredPortrait,customerPortrait,staffPortrait,rivalPortrait}from'../src/portraits.js';
import{customerAppearances,staffAppearances,rivalAppearances,assetSlots}from'../src/data/v05.js';
const wardrobe={equipped:{tops:'tops-lace',bottoms:'bottoms-flare',dresses:null,shoes:'shoes-pumps',bags:null,accessories:'accessories-pearl'},makeup:'feminine'};
const owner=layeredPortrait({player:{skin:'ナチュラル',hairStyle:'ボブ',hairColor:'ダークブラウン'},wardrobe,expression:'happy',preview:{player:{hairStyle:'ロング'},makeup:'mode'}});
assert.match(owner,/class="layer backHair"/);assert.match(owner,/class="layer makeup"/);assert.match(owner,/expression-happy/);assert.match(owner,/characters\/owner/);
assert.equal(Object.keys(customerAppearances).length,10,'主要顧客10名');assert.equal(Object.keys(staffAppearances).length,3,'初期スタッフ3名');assert.equal(Object.keys(rivalAppearances).length,3,'ライバル3名');
assert.match(customerPortrait({id:'misaki',name:'美咲',appearance:customerAppearances.misaki},'joy'),/美咲/);assert.match(staffPortrait({id:'akari',name:'あかり',role:'店長'},'confident'),/role-店長/);assert.match(rivalPortrait('luxe','神崎レイナ'),/神崎レイナ/);assert.equal(assetSlots.stores,'assets/stores/');
console.log('Salon Story Ver.0.5 visual tests: OK');

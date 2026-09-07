const ROOT='./assets/owner/';

export const OWNER_HAIR_NAMES=['ショート','ショートボブ','ソフトボブ','ミディアムストレート','ミディアムウェーブ','ロングストレート','ロングウェーブ','ポニーテール','ローポニーテール','ハーフアップ','お団子','ツインブレイド','サイドブレイド','レイヤーミディアム','ウルフカット','姫カット','エレガントアップ','リボンハーフアップ','ルーズカール','サロンブロー'];
export const OWNER_HAIR_COLORS=[['ブラック','#2f2b2d','brightness(.55) saturate(.75)'],['ダークブラウン','#5b4636','brightness(.72) saturate(.9)'],['モカブラウン','#795c50','sepia(.2) brightness(.82)'],['チョコレートブラウン','#69463c','sepia(.28) brightness(.72) saturate(1.05)'],['チェスナット','#855f4d','sepia(.35) brightness(.86) saturate(1.08)'],['ミルクティーベージュ','#aa8d7e','sepia(.25) brightness(1.08) saturate(.72)'],['グレージュ','#857873','grayscale(.24) brightness(.91)'],['アッシュブラウン','#726561','grayscale(.18) brightness(.78)'],['ピンクブラウン','#9a6467','sepia(.22) hue-rotate(318deg) saturate(1.08)'],['ラベンダーブラウン','#765e70','sepia(.16) hue-rotate(280deg) saturate(.9)'],['ワインブラウン','#713f49','sepia(.2) hue-rotate(320deg) saturate(1.25) brightness(.76)'],['ハイトーンベージュ','#bea190','sepia(.18) brightness(1.18) saturate(.68)']];
export const OWNER_MAKEUPS=['Natural','Feminine','Korean','Mode','Cool','Glamorous'];

export const DEFAULT_OWNER_APPEARANCE={skin:'natural',hairStyle:'HAIR_05',hairColor:'COLOR_02',makeup:'MAKEUP_01',tops:'TOPS_01',bottoms:'BOTTOMS_01',dress:null,outer:null,shoes:'SHOES_01',bag:null,earrings:'ACC_01',necklace:'ACC_03',accessoryHead:null,accessoryWrist:'ACC_09',brooch:'ACC_10'};
export const DEFAULT_OWNED_APPEARANCE={hairStyles:['HAIR_05'],hairColors:['COLOR_02'],makeups:['MAKEUP_01'],tops:['TOPS_01'],bottoms:['BOTTOMS_01'],dress:[],outer:[],shoes:['SHOES_01'],bags:[],accessories:['ACC_01','ACC_03','ACC_09','ACC_10']};

const oldHair=['ショート','ボブ','ミディアム','ロング','ポニーテール','巻き髪','お団子','ハーフアップ','外ハネボブ','韓国風ロング','ウェーブ','編み込み','シニヨン','ツインテール','レイヤーミディアム','ストレートロング','ウルフ','くびれボブ','サイドポニー','編みおろし'];
const oldColors=['ブラック','ダークブラウン','ブラウン','ライトブラウン','ベージュ','グレージュ','アッシュ','ピンクブラウン','ワイン'];
const makeupAliases={natural:'MAKEUP_01',feminine:'MAKEUP_02',korean:'MAKEUP_03',mode:'MAKEUP_04',cool:'MAKEUP_05',glamorous:'MAKEUP_06'};
const itemAliases={
 tops:['tops-lace','tops-ribbon','tops-silk','tops-turtle','tops-linen','tops-cardigan','tops-crop','tops-logo','tops-peplum','tops-sheer'],
 bottoms:['bottoms-flare','bottoms-tweed','bottoms-slacks','bottoms-tight','bottoms-cotton','bottoms-longskirt','bottoms-cargo','bottoms-mini'],
 dress:['dresses-flower','dresses-pinkdress','dresses-blackdress','dresses-jacketdress','dresses-apron','dresses-knitdress','dresses-color','dresses-korean'],
 outer:['outer-long-cardigan','outer-short-jacket','outer-trench','outer-elegant-coat','outer-casual'],
 shoes:['shoes-pumps','shoes-heels','shoes-loafers','shoes-boots','shoes-flats','shoes-sneakers'],
 bag:['bags-miniBag','bags-chain','bags-leather','bags-canvas'],
 accessories:['accessories-pearl','accessories-ribbonPin','accessories-gold','accessories-watch','accessories-wood','accessories-scarf','accessories-heart','accessories-colorPin']
};
const prefixes={tops:'TOPS',bottoms:'BOTTOMS',dress:'STYLE',outer:'OUTER',shoes:'SHOES',bag:'BAG',accessories:'ACC'};
const id=(prefix,index)=>`${prefix}_${String(index+1).padStart(2,'0')}`;
const resolvePart=(value,key,fallback)=>{if(!value)return fallback;if(/^[A-Z]+_\d\d$/.test(value))return value;const i=(itemAliases[key]||[]).indexOf(value);return i<0?fallback:id(prefixes[key],i%(key==='dress'?5:key==='outer'?5:key==='shoes'?8:key==='bag'?8:key==='accessories'?10:99))};
export function normalizeOwnerAssetAppearance(raw={}){
 const a={...DEFAULT_OWNER_APPEARANCE,...raw};
 if(!/^HAIR_\d\d$/.test(a.hairStyle)){let i=OWNER_HAIR_NAMES.indexOf(a.hairStyle);if(i<0)i=oldHair.indexOf(a.hairStyle);a.hairStyle=id('HAIR',i<0?4:i)}
 if(!/^COLOR_\d\d$/.test(a.hairColor)){let i=OWNER_HAIR_COLORS.findIndex(x=>x[0]===a.hairColor);if(i<0)i=oldColors.indexOf(a.hairColor);a.hairColor=id('COLOR',i<0?1:Math.min(i,11))}
 if(!/^MAKEUP_\d\d$/.test(a.makeup))a.makeup=makeupAliases[a.makeup]||'MAKEUP_01';
 for(const key of ['tops','bottoms','dress','outer','shoes','bag','accessories'])a[key]=resolvePart(a[key],key,DEFAULT_OWNER_APPEARANCE[key]);
 if(a.dress){a.tops=null;a.bottoms=null}
 return a;
}
export function ownerAssetForItem(item){if(!item)return null;const key={dresses:'dress',bags:'bag'}[item.category]||item.category;return resolvePart(item.id,key,null)}
export function ownerHairLabel(value){const a=normalizeOwnerAssetAppearance({hairStyle:value});return OWNER_HAIR_NAMES[Number(a.hairStyle.slice(-2))-1]||OWNER_HAIR_NAMES[4]}
export function ownerColorLabel(value){const a=normalizeOwnerAssetAppearance({hairColor:value});return OWNER_HAIR_COLORS[Number(a.hairColor.slice(-2))-1]?.[0]||OWNER_HAIR_COLORS[1][0]}

const img=(path,cls,style='')=>path?`<img class="owner-layer ${cls}" src="${ROOT}${path}" alt="" draggable="false" ${style?`style="${style}"`:''} onerror="this.hidden=true">`:'';
const accPath=id=>{const n=Number(id?.slice(-2));if(n<=2)return`accessories/earrings/${id}.png`;if(n<=4)return`accessories/necklace/${id}.png`;if(n<=7)return`accessories/head/${id}.png`;if(n<=9)return`accessories/wrist/${id}.png`;return`accessories/brooch/${id}.png`};
export function renderOwnerAvatar(appearance={},options={}){
 const a=normalizeOwnerAssetAppearance(appearance),n=Number(a.hairColor.slice(-2))-1,filter=OWNER_HAIR_COLORS[n]?.[2]||'';
 const showBag=options.showBag!==false,showAccessory=options.showAccessory!==false,size=options.size||'lg',name=options.name||'オーナー';
 const layers=[img('hair/styles/'+a.hairStyle+'_back.png','owner-hair owner-hair-back',`filter:${filter}`),img('base/body.png','owner-base'),img('base/skin.png','owner-skin'),img('base/face_base.png','owner-face'),img('base/eyes_default.png','owner-eyes'),img('base/eyebrows_default.png','owner-eyebrows'),img('makeup/'+a.makeup+'.png','owner-makeup'),img('base/mouth_default.png','owner-mouth'),img('hair/styles/'+a.hairStyle+'_front.png','owner-hair owner-hair-front',`filter:${filter}`)];
 if(a.dress)layers.push(img('dress/'+a.dress+'.png','owner-dress'));else layers.push(img('tops/'+a.tops+'.png','owner-tops'),img('bottoms/'+a.bottoms+'.png','owner-bottoms'));
 layers.push(img(a.outer?'outer/'+a.outer+'.png':null,'owner-outer'),img('shoes/'+a.shoes+'.png','owner-shoes'),img(showBag&&a.bag?'bags/'+a.bag+'.png':null,'owner-bag'));
 if(showAccessory)layers.push(img(a.earrings?accPath(a.earrings):null,'owner-accessory'),img(a.necklace?accPath(a.necklace):null,'owner-accessory'),img(a.accessoryHead?accPath(a.accessoryHead):null,'owner-accessory'),img(a.accessoryWrist?accPath(a.accessoryWrist):null,'owner-accessory'),img(a.brooch?accPath(a.brooch):null,'owner-accessory'),img(a.accessories?accPath(a.accessories):null,'owner-accessory'));
 return`<figure class="portrait portrait-owner portrait-${size} owner-layer-avatar ${options.home?'owner-home-avatar':''} ${options.mode?'owner-mode-'+options.mode:''}" data-owner-hair="${a.hairStyle}" data-owner-color="${a.hairColor}" data-owner-makeup="${a.makeup}"><div class="owner-avatar-canvas">${layers.join('')}</div>${options.caption===false?'':`<figcaption>${name}</figcaption>`}</figure>`;
}

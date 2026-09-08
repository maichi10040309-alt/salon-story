import{OWNER_CANVAS,ownerAlphaBounds,ownerLayerCalibration}from'./owner-asset-metadata.js';

const ROOT='./assets/owner/';
const OWNER_ASSET_RENDER_FALLBACKS={BOTTOMS_08:'BOTTOMS_07'};

export const OWNER_HAIR_NAMES=['ショート','ショートボブ','ソフトボブ','ミディアムストレート','ミディアムウェーブ','ロングストレート','ロングウェーブ','ポニーテール','ローポニーテール','ハーフアップ','お団子','ツインブレイド','サイドブレイド','レイヤーミディアム','ウルフカット','姫カット','エレガントアップ','リボンハーフアップ','ルーズカール','サロンブロー'];
export const OWNER_HAIR_COLORS=[['ブラック','#2f2b2d','brightness(.55) saturate(.75)'],['ダークブラウン','#5b4636','brightness(.72) saturate(.9)'],['モカブラウン','#795c50','sepia(.2) brightness(.82)'],['チョコレートブラウン','#69463c','sepia(.28) brightness(.72) saturate(1.05)'],['チェスナット','#855f4d','sepia(.35) brightness(.86) saturate(1.08)'],['ミルクティーベージュ','#aa8d7e','sepia(.25) brightness(1.08) saturate(.72)'],['グレージュ','#857873','grayscale(.24) brightness(.91)'],['アッシュブラウン','#726561','grayscale(.18) brightness(.78)'],['ピンクブラウン','#9a6467','sepia(.22) hue-rotate(318deg) saturate(1.08)'],['ラベンダーブラウン','#765e70','sepia(.16) hue-rotate(280deg) saturate(.9)'],['ワインブラウン','#713f49','sepia(.2) hue-rotate(320deg) saturate(1.25) brightness(.76)'],['ハイトーンベージュ','#bea190','sepia(.18) brightness(1.18) saturate(.68)']];
export const OWNER_MAKEUPS=['Natural','Feminine','Korean','Mode','Cool','Glamorous'];

export const DEFAULT_OWNER_APPEARANCE={skin:'natural',hairStyle:'HAIR_05',hairColor:'COLOR_02',makeup:'MAKEUP_01',tops:'TOPS_01',bottoms:'BOTTOMS_01',dress:null,outer:null,shoes:'SHOES_01',bag:null,earrings:'ACC_01',necklace:'ACC_03',accessoryHead:null,accessoryWrist:'ACC_09',brooch:'ACC_10'};
export const DEFAULT_OWNED_APPEARANCE={hairStyles:['HAIR_05'],hairColors:['COLOR_02'],makeups:['MAKEUP_01'],tops:['TOPS_01'],bottoms:['BOTTOMS_01'],dress:[],outer:[],shoes:['SHOES_01'],bags:[],accessories:['ACC_01','ACC_03','ACC_09','ACC_10']};

const oldHair=['ショート','ボブ','ミディアム','ロング','ポニーテール','巻き髪','お団子','ハーフアップ','外ハネボブ','韓国風ロング','ウェーブ','編み込み','シニヨン','ツインテール','レイヤーミディアム','ストレートロング','ウルフ','くびれボブ','サイドポニー','編みおろし'];
const oldColors=['ブラック','ダークブラウン','ブラウン','ライトブラウン','ベージュ','グレージュ','アッシュ','ピンクブラウン','ワイン'];
const makeupAliases={natural:'MAKEUP_01',feminine:'MAKEUP_02',korean:'MAKEUP_03',mode:'MAKEUP_04',cool:'MAKEUP_05',glamorous:'MAKEUP_06'};
const itemAliases={
 tops:['tops-lace','tops-ribbon','tops-silk','tops-turtle','tops-linen','tops-cardigan','tops-crop','tops-logo','tops-peplum','tops-sheer','tops-border','tops-short'],
 bottoms:['bottoms-flare','bottoms-tweed','bottoms-slacks','bottoms-tight','bottoms-cotton','bottoms-longskirt','bottoms-cargo','bottoms-mini'],
 dress:['dresses-flower','dresses-pinkdress','dresses-blackdress','dresses-jacketdress','dresses-apron','dresses-knitdress','dresses-color','dresses-korean'],
 outer:['outer-long-cardigan','outer-short-jacket','outer-trench','outer-elegant-coat','outer-casual'],
 shoes:['shoes-pumps','shoes-heels','shoes-loafers','shoes-boots','shoes-flats','shoes-sneakers','shoes-mule','shoes-brown-boots'],
 bag:['bags-miniBag','bags-chain','bags-leather','bags-canvas','bags-mini-shoulder','bags-black-tote','bags-clutch','bags-two-way'],
 accessories:['accessories-pearl','accessories-ribbonPin','accessories-gold','accessories-watch','accessories-wood','accessories-scarf','accessories-heart','accessories-colorPin','accessories-rose-watch','accessories-brooch']
};
const prefixes={tops:'TOPS',bottoms:'BOTTOMS',dress:'STYLE',outer:'OUTER',shoes:'SHOES',bag:'BAG',accessories:'ACC'};
const limits={HAIR:20,COLOR:12,MAKEUP:6,TOPS:12,BOTTOMS:8,STYLE:5,OUTER:5,SHOES:8,BAG:8,ACC:10};
const id=(prefix,index)=>`${prefix}_${String(index+1).padStart(2,'0')}`;
const validId=(value,prefix)=>{const match=String(value||'').match(new RegExp(`^${prefix}_(\\d\\d)$`)),n=Number(match?.[1]);return!!match&&n>=1&&n<=limits[prefix]};
const resolvePart=(value,key,fallback)=>{if(!value)return fallback;const prefix=prefixes[key];if(validId(value,prefix))return value;const i=(itemAliases[key]||[]).indexOf(value);return i<0?fallback:id(prefix,i)};
export function normalizeOwnerAssetAppearance(raw={}){
 const a={...DEFAULT_OWNER_APPEARANCE,...raw};
 if(!validId(a.hairStyle,'HAIR')){let i=OWNER_HAIR_NAMES.indexOf(a.hairStyle);if(i<0)i=oldHair.indexOf(a.hairStyle);a.hairStyle=id('HAIR',i<0?4:i)}
 if(!validId(a.hairColor,'COLOR')){let i=OWNER_HAIR_COLORS.findIndex(x=>x[0]===a.hairColor);if(i<0)i=oldColors.indexOf(a.hairColor);a.hairColor=id('COLOR',i<0?1:Math.min(i,11))}
 if(!validId(a.makeup,'MAKEUP'))a.makeup=makeupAliases[a.makeup]||'MAKEUP_01';
 for(const key of ['tops','bottoms','dress','outer','shoes','bag','accessories'])a[key]=resolvePart(a[key],key,DEFAULT_OWNER_APPEARANCE[key]);
 if(Object.hasOwn(raw,'shoes')&&raw.shoes===null)a.shoes=null;
 for(const key of ['earrings','necklace','accessoryHead','accessoryWrist','brooch'])if(a[key]&&!validId(a[key],'ACC'))a[key]=DEFAULT_OWNER_APPEARANCE[key]||null;
 if(a.dress){a.tops=null;a.bottoms=null}
 return a;
}
export function ownerAssetForItem(item){if(!item)return null;const key={dresses:'dress',bags:'bag'}[item.category]||item.category;return resolvePart(item.id,key,null)}
export function ownerAssetPathForItem(item){let asset=ownerAssetForItem(item);if(!asset)return null;asset=OWNER_ASSET_RENDER_FALLBACKS[asset]||asset;if(item.category==='accessories')return accPath(asset);const folder={dresses:'dress',bags:'bags'}[item.category]||item.category;return`${folder}/${asset}.png`}
export function ownerAssetBoundsForItem(item){const asset=ownerAssetForItem(item),renderAsset=OWNER_ASSET_RENDER_FALLBACKS[asset]||asset;return{canvas:OWNER_CANVAS,bounds:ownerAlphaBounds(renderAsset),asset:renderAsset}}
export function ownerHairLabel(value){const a=normalizeOwnerAssetAppearance({hairStyle:value});return OWNER_HAIR_NAMES[Number(a.hairStyle.slice(-2))-1]||OWNER_HAIR_NAMES[4]}
export function ownerColorLabel(value){const a=normalizeOwnerAssetAppearance({hairColor:value});return OWNER_HAIR_COLORS[Number(a.hairColor.slice(-2))-1]?.[0]||OWNER_HAIR_COLORS[1][0]}

const img=(path,cls,style='',calibration=null)=>{if(!path)return'';const c=calibration?`--layer-x:${calibration.x*100}%;--layer-y:${calibration.y*100}%;--layer-scale:${calibration.scale};--layer-origin-x:${calibration.originX*100}%;--layer-origin-y:${calibration.originY*100}%`:'',inline=[style,c].filter(Boolean).join(';');return`<img class="owner-layer ${cls}" src="${ROOT}${path}" alt="" draggable="false" ${inline?`style="${inline}"`:''} onerror="this.hidden=true">`};
const accPath=id=>{const n=Number(id?.slice(-2));if(n<=2)return`accessories/earrings/${id}.png`;if(n<=4)return`accessories/necklace/${id}.png`;if(n<=7)return`accessories/head/${id}.png`;if(n<=9)return`accessories/wrist/${id}.png`;return`accessories/brooch/${id}.png`};
const ownerPartPath=(folder,id)=>`${folder}/${OWNER_ASSET_RENDER_FALLBACKS[id]||id}.png`;
export function renderOwnerAvatar(appearance={},options={}){
 const a=normalizeOwnerAssetAppearance(appearance),n=Number(a.hairColor.slice(-2))-1,filter=OWNER_HAIR_COLORS[n]?.[2]||'';
 const showBag=options.showBag!==false,showAccessory=options.showAccessory!==false,size=options.size||'lg',name=options.name||'オーナー';
 const hairCalibration=ownerLayerCalibration('hair',a.hairStyle);
 const layers=[img('hair/styles/'+a.hairStyle+'_back.png','owner-hair owner-hair-back',`filter:${filter}`,hairCalibration),img('base/body.png','owner-base'),img('makeup/'+a.makeup+'.png','owner-makeup'),img('hair/styles/'+a.hairStyle+'_front.png','owner-hair owner-hair-front',`filter:${filter}`,hairCalibration)];
 if(a.dress)layers.push(img(ownerPartPath('dress',a.dress),'owner-dress','',ownerLayerCalibration('dress',a.dress)));else layers.push(img(ownerPartPath('tops',a.tops),'owner-tops','',ownerLayerCalibration('tops',a.tops)),img(ownerPartPath('bottoms',a.bottoms),'owner-bottoms','',ownerLayerCalibration('bottoms',a.bottoms)));
 layers.push(img(a.outer?ownerPartPath('outer',a.outer):null,'owner-outer','',ownerLayerCalibration('outer',a.outer)),img(showBag&&a.bag?ownerPartPath('bags',a.bag):null,'owner-bag','',ownerLayerCalibration('bag',a.bag)));
 if(showAccessory){
  const used=new Set(),addAccessory=(id,cls='owner-accessory')=>{if(!id||used.has(id))return;used.add(id);layers.push(img(accPath(id),cls,'',ownerLayerCalibration('accessory',id)))};
  addAccessory(a.earrings,'owner-accessory owner-earring-single');
  addAccessory(a.necklace);
  addAccessory(a.accessoryHead);
  addAccessory(a.accessoryWrist,'owner-accessory owner-wrist-accessory');
  addAccessory(a.brooch);
  addAccessory(a.accessories);
 }
 return`<figure class="portrait portrait-owner portrait-${size} owner-layer-avatar ${options.home?'owner-home-avatar':''} ${options.mode?'owner-mode-'+options.mode:''}" data-owner-stage="shared" data-owner-hair="${a.hairStyle}" data-owner-color="${a.hairColor}" data-owner-makeup="${a.makeup}"><div class="owner-avatar-canvas avatar-stage">${layers.join('')}</div>${options.caption===false?'':`<figcaption>${name}</figcaption>`}</figure>`;
}

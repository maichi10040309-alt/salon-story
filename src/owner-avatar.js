import{OWNER_CANVAS,ownerAlphaBounds,ownerLayerAnchorSpec}from'./owner-asset-metadata.js?v=95';

const ROOT='./assets/owner/';
const OUTFIT_COUNT=13;
const TRYON_HAIR_PATH='hair/INITIAL_TRYON_HAIR_ONLY.png';
const TRYON_HAIR_STYLE='z-index:20;inset:auto;left:39.74609375%;top:-.2604167%;width:17.08984375%;height:16.40625%;max-width:none;max-height:none;object-fit:fill;object-position:0 0;transform:none;filter:none';

export const OWNER_HAIR_NAMES=['ショートボブ','ナチュラルボブ','ミディアムストレート','ミディアムウェーブ','エアリーミディアム','ロングストレート','ロングウェーブ','サイドポニー','ハーフアップ','ルーズアップ','ツインブレイド','サイドブレイド','レイヤーミディアム','スーパーロング','エレガントアップ','リボンブレイド','ソフトカール'];
export const OWNER_HAIR_COLORS=[['ブラック','#2f2b2d','brightness(.55) saturate(.75)'],['ダークブラウン','#5b4636','brightness(.72) saturate(.9)'],['モカブラウン','#795c50','sepia(.2) brightness(.82)'],['チョコレートブラウン','#69463c','sepia(.28) brightness(.72) saturate(1.05)'],['チェスナット','#855f4d','sepia(.35) brightness(.86) saturate(1.08)'],['ミルクティーベージュ','#aa8d7e','sepia(.25) brightness(1.08) saturate(.72)'],['グレージュ','#857873','grayscale(.24) brightness(.91)'],['アッシュブラウン','#726561','grayscale(.18) brightness(.78)'],['ピンクブラウン','#9a6467','sepia(.22) hue-rotate(318deg) saturate(1.08)'],['ラベンダーブラウン','#765e70','sepia(.16) hue-rotate(280deg) saturate(.9)'],['ワインブラウン','#713f49','sepia(.2) hue-rotate(320deg) saturate(1.25) brightness(.76)'],['ハイトーンベージュ','#bea190','sepia(.18) brightness(1.18) saturate(.68)']];
export const OWNER_MAKEUPS=['Natural','Feminine','Korean','Mode','Cool','Glamorous'];

export const DEFAULT_OWNER_APPEARANCE={skin:'natural',hairStyle:'HAIR_15',hairColor:'COLOR_02',makeup:'MAKEUP_01',dress:'OUTFIT_01',outfit:'OUTFIT_01',tops:null,bottoms:null,outer:null,shoes:null,bag:null,accessories:null,earrings:null,necklace:null,accessoryHead:null,accessoryWrist:null,brooch:null};
export const DEFAULT_OWNED_APPEARANCE={hairStyles:['HAIR_15'],hairColors:['COLOR_02'],makeups:['MAKEUP_01'],dress:['OUTFIT_01'],outfits:['OUTFIT_01'],tops:[],bottoms:[],outer:[],shoes:[],bags:[],accessories:[]};

const oldHair=['ショート','ボブ','ミディアム','ロング','ポニーテール','巻き髪','お団子','ハーフアップ','外ハネボブ','韓国風ロング','ウェーブ','編み込み','シニヨン','ツインテール','レイヤーミディアム','ストレートロング','ウルフ'];
const oldColors=['ブラック','ダークブラウン','ブラウン','ライトブラウン','ベージュ','グレージュ','アッシュ','ピンクブラウン','ワイン'];
const makeupAliases={natural:'MAKEUP_01',feminine:'MAKEUP_02',korean:'MAKEUP_03',mode:'MAKEUP_04',cool:'MAKEUP_05',glamorous:'MAKEUP_06'};
const id=(prefix,index)=>`${prefix}_${String(index+1).padStart(2,'0')}`;
const validNumbered=(value,prefix,max)=>{const m=String(value||'').match(new RegExp(`^${prefix}_(\\d\\d)$`));const n=Number(m?.[1]);return!!m&&n>=1&&n<=max};
const outfitId=value=>{
 if(validNumbered(value,'OUTFIT',OUTFIT_COUNT))return value;
 const m=String(value||'').match(/(?:outfit|dresses-outfit)[_-]?(\d{1,2})$/i);if(m){const n=Number(m[1]);if(n>=1&&n<=OUTFIT_COUNT)return`OUTFIT_${String(n).padStart(2,'0')}`}
 return'OUTFIT_01';
};

export function normalizeOwnerAssetAppearance(raw={}){
 const a={...DEFAULT_OWNER_APPEARANCE,...raw};
 if(!validNumbered(a.hairStyle,'HAIR',17)){let i=OWNER_HAIR_NAMES.indexOf(a.hairStyle);if(i<0)i=oldHair.indexOf(a.hairStyle);a.hairStyle=id('HAIR',i<0||i>=17?4:i)}
 if(!validNumbered(a.hairColor,'COLOR',12)){let i=OWNER_HAIR_COLORS.findIndex(x=>x[0]===a.hairColor);if(i<0)i=oldColors.indexOf(a.hairColor);a.hairColor=id('COLOR',i<0?1:Math.min(i,11))}
 if(!validNumbered(a.makeup,'MAKEUP',6))a.makeup=makeupAliases[a.makeup]||'MAKEUP_01';
 const selected=raw.dress??raw.outfit??a.dress??a.outfit;
 a.outfit=outfitId(selected);a.dress=a.outfit;
 a.tops=null;a.bottoms=null;a.outer=null;a.shoes=null;a.bag=null;a.accessories=null;
 a.earrings=null;a.necklace=null;a.accessoryHead=null;a.accessoryWrist=null;a.brooch=null;
 return a;
}

export function ownerAssetForItem(item){if(!item)return null;if(item.asset)return outfitId(item.asset);if(item.category==='dresses'||item.category==='outfits')return outfitId(item.id);return null}
export function ownerAssetPathForItem(item){const asset=ownerAssetForItem(item);return asset?`outfits/${asset}.png`:null}
export function ownerAssetBoundsForItem(item){const asset=ownerAssetForItem(item);return{canvas:OWNER_CANVAS,bounds:ownerAlphaBounds(asset)||{x:0,y:0,width:OWNER_CANVAS.width,height:OWNER_CANVAS.height},asset}}
export function ownerHairLabel(value){const a=normalizeOwnerAssetAppearance({hairStyle:value});return OWNER_HAIR_NAMES[Number(a.hairStyle.slice(-2))-1]||OWNER_HAIR_NAMES[4]}
export function ownerColorLabel(value){const a=normalizeOwnerAssetAppearance({hairColor:value});return OWNER_HAIR_COLORS[Number(a.hairColor.slice(-2))-1]?.[0]||OWNER_HAIR_COLORS[1][0]}

export function ownerLayerTransform(slot,value){if(slot!=='hair')return{x:0,y:0,scaleX:1,scaleY:1,originX:.5,originY:.5};const fit=ownerLayerAnchorSpec('hair',value),{source,target}=fit;return{x:(target.x-source.x)/OWNER_CANVAS.width,y:(target.y-source.y)/OWNER_CANVAS.height,scaleX:fit.scaleX,scaleY:fit.scaleY,originX:source.x/OWNER_CANVAS.width,originY:source.y/OWNER_CANVAS.height}}
const img=(path,cls,style='',transform=null)=>{if(!path)return'';const c=transform?`--layer-x:${transform.x*100}%;--layer-y:${transform.y*100}%;--layer-scale-x:${transform.scaleX};--layer-scale-y:${transform.scaleY};--layer-origin-x:${transform.originX*100}%;--layer-origin-y:${transform.originY*100}%`:'',inline=[style,c].filter(Boolean).join(';');return`<img class="owner-layer ${cls}" src="${ROOT}${path}?v=95" alt="" draggable="false" ${inline?`style="${inline}"`:''} onerror="this.hidden=true">`};

export function renderOwnerAvatar(appearance={},options={}){
 const a=normalizeOwnerAssetAppearance(appearance),n=Number(a.hairColor.slice(-2))-1,filter=OWNER_HAIR_COLORS[n]?.[2]||'';
 const size=options.size||'lg',name=options.name||'オーナー',layers=[];
 layers.push(img(`outfits/${a.outfit}.png`,'owner-outfit'));
 // Fashion preview never replaces or moves the selected outfit's face/neck/body.
 // A dedicated transparent crop containing only the initial up-do hair is placed
 // at the shared preview coordinates (x=407,y=-4,w=175,h=252).
 if(a.outfit!=='OUTFIT_01'){
  if(options.fashionPreview)layers.push(img(TRYON_HAIR_PATH,'owner-hair owner-hair-initial',TRYON_HAIR_STYLE));
  else layers.push(img(`hair/styles/${a.hairStyle}.png`,'owner-hair owner-hair-generated',`filter:${filter}`,ownerLayerTransform('hair',a.hairStyle)));
 }
 return`<figure class="portrait portrait-owner portrait-${size} owner-layer-avatar ${options.home?'owner-home-avatar':''} ${options.mode?'owner-mode-'+options.mode:''}" data-owner-stage="shared" data-owner-outfit="${a.outfit}" data-owner-hair="${a.hairStyle}" data-owner-color="${a.hairColor}" data-owner-makeup="${a.makeup}"><div class="owner-avatar-canvas avatar-stage">${layers.join('')}</div>${options.caption===false?'':`<figcaption>${name}</figcaption>`}</figure>`;
}

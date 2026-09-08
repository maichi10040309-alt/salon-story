export const OWNER_CANVAS={width:1024,height:1536};

export const OWNER_ALPHA_BOUNDS={
 BODY:{x:225,y:10,width:574,height:1494},
 TOPS_01:{x:338,y:225,width:347,height:339},TOPS_02:{x:331,y:225,width:362,height:341},TOPS_03:{x:331,y:225,width:362,height:362},TOPS_04:{x:336,y:225,width:351,height:337},TOPS_05:{x:331,y:225,width:362,height:362},TOPS_06:{x:331,y:225,width:362,height:361},TOPS_07:{x:331,y:225,width:362,height:362},TOPS_08:{x:337,y:225,width:349,height:361},TOPS_09:{x:338,y:225,width:347,height:322},TOPS_10:{x:331,y:225,width:362,height:315},TOPS_11:{x:331,y:225,width:362,height:362},TOPS_12:{x:336,y:225,width:352,height:362},
 BOTTOMS_01:{x:410,y:485,width:203,height:372},BOTTOMS_02:{x:326,y:485,width:371,height:436},BOTTOMS_03:{x:410,y:485,width:204,height:435},BOTTOMS_04:{x:379,y:485,width:265,height:472},BOTTOMS_05:{x:417,y:485,width:190,height:472},BOTTOMS_06:{x:388,y:485,width:248,height:470},BOTTOMS_07:{x:340,y:485,width:343,height:477},
 STYLE_01:{x:409,y:220,width:206,height:443},STYLE_02:{x:370,y:220,width:284,height:458},STYLE_03:{x:367,y:220,width:290,height:468},STYLE_04:{x:392,y:220,width:239,height:463},STYLE_05:{x:384,y:220,width:256,height:469},
 OUTER_01:{x:377,y:220,width:270,height:463},OUTER_02:{x:381,y:220,width:262,height:406},OUTER_03:{x:375,y:220,width:274,height:487},OUTER_04:{x:364,y:220,width:296,height:479},OUTER_05:{x:376,y:220,width:271,height:467},
 SHOES_01:{x:364,y:1320,width:232,height:106},SHOES_02:{x:359,y:1320,width:243,height:105},SHOES_03:{x:361,y:1320,width:238,height:106},SHOES_04:{x:359,y:1320,width:243,height:102},SHOES_05:{x:360,y:1320,width:241,height:99},SHOES_06:{x:362,y:1320,width:236,height:108},SHOES_07:{x:357,y:1320,width:247,height:93},SHOES_08:{x:363,y:1320,width:235,height:108},
 BAG_01:{x:740,y:749,width:99,height:107},BAG_02:{x:739,y:743,width:102,height:113},BAG_03:{x:740,y:743,width:96,height:113},BAG_04:{x:741,y:743,width:90,height:113},BAG_05:{x:737,y:743,width:87,height:113},BAG_06:{x:734,y:743,width:96,height:113},BAG_07:{x:734,y:786,width:102,height:70},BAG_08:{x:734,y:746,width:96,height:110},
 ACC_01:{x:429,y:205,width:66,height:76},ACC_02:{x:422,y:225,width:81,height:41},ACC_03:{x:442,y:335,width:78,height:66},ACC_04:{x:442,y:335,width:79,height:66},ACC_05:{x:412,y:74,width:76,height:79},ACC_06:{x:412,y:72,width:72,height:79},ACC_07:{x:412,y:82,width:71,height:66},ACC_08:{x:742,y:658,width:78,height:75},ACC_09:{x:760,y:592,width:55,height:82},ACC_10:{x:672,y:374,width:81,height:71}
};

const bodyBounds=OWNER_ALPHA_BOUNDS.BODY,bodyCenterX=bodyBounds.x+bodyBounds.width/2;
export const OWNER_ALPHA_ANALYSIS=Object.fromEntries(Object.entries(OWNER_ALPHA_BOUNDS).map(([id,bounds])=>[id,{centerXDelta:bounds.x+bounds.width/2-bodyCenterX,topYDelta:bounds.y-bodyBounds.y,bottomYDelta:bounds.y+bounds.height-(bodyBounds.y+bodyBounds.height),widthRatio:bounds.width/bodyBounds.width,heightRatio:bounds.height/bodyBounds.height}]));
export const OWNER_INVALID_ASSETS={BOTTOMS_08:'zero-byte / empty PNG fallback to BOTTOMS_07'};

export const OWNER_BODY_ANCHORS={
 head:{faceCenterX:512,headTopY:10,neckTopY:220},
 shoulder:{x:512,y:225,width:259},
 waist:{x:512,y:485,width:166},
 hip:{x:512,y:600,width:258},
 rightWrist:{x:737.5,y:660},
 leftEar:{x:444,y:150}
};
const point=(x,y,details={})=>({x,y,...details});
export const OWNER_LAYER_ANCHORS={
 default:{source:point(512,768),target:point(512,768),scaleX:1,scaleY:1},
 slots:{
  hair:{source:point(512,220,{faceCenterX:512,headTopY:10,neckTopY:220}),target:point(OWNER_BODY_ANCHORS.head.faceCenterX,OWNER_BODY_ANCHORS.head.neckTopY,{headTopY:OWNER_BODY_ANCHORS.head.headTopY}),scaleX:1,scaleY:1},
  tops:{source:point(512,485,{shoulderY:225,waistY:485}),target:point(OWNER_BODY_ANCHORS.waist.x,OWNER_BODY_ANCHORS.waist.y,{shoulderWidth:OWNER_BODY_ANCHORS.shoulder.width,waistWidth:OWNER_BODY_ANCHORS.waist.width}),scaleX:1.1,scaleY:1},
  bottoms:{source:point(512,485,{waistY:485,hipY:600}),target:point(OWNER_BODY_ANCHORS.waist.x,OWNER_BODY_ANCHORS.waist.y,{waistWidth:OWNER_BODY_ANCHORS.waist.width,hipWidth:OWNER_BODY_ANCHORS.hip.width}),scaleX:1,scaleY:1},
  dress:{source:point(512,485,{shoulderY:220,waistY:485,hipY:600}),target:point(OWNER_BODY_ANCHORS.waist.x,OWNER_BODY_ANCHORS.waist.y,{shoulderWidth:OWNER_BODY_ANCHORS.shoulder.width,waistWidth:OWNER_BODY_ANCHORS.waist.width,hipWidth:OWNER_BODY_ANCHORS.hip.width}),scaleX:1,scaleY:1},
  outer:{source:point(512,220),target:point(OWNER_BODY_ANCHORS.shoulder.x,220),scaleX:1,scaleY:1},
  bag:{source:point(512,1536),target:point(512,1536),scaleX:1,scaleY:1},
  accessory:{source:point(512,768),target:point(512,768),scaleX:1,scaleY:1}
 },
 assets:{
  BOTTOMS_01:{scaleX:280/200},BOTTOMS_02:{scaleX:292/209},BOTTOMS_03:{scaleX:280/201},BOTTOMS_04:{scaleX:292/186},BOTTOMS_05:{scaleX:292/183},BOTTOMS_06:{scaleX:280/238},BOTTOMS_07:{scaleX:292/172},BOTTOMS_08:{scaleX:300/172},
  STYLE_01:{scaleX:280/124,scaleY:260/265},STYLE_02:{scaleX:300/269,scaleY:260/265},STYLE_03:{scaleX:300/267,scaleY:260/265},STYLE_04:{scaleX:280/159,scaleY:260/265},STYLE_05:{scaleX:292/244,scaleY:260/265},
  OUTER_01:{scaleX:347/270,scaleY:347/270},OUTER_02:{scaleX:347/262,scaleY:347/262},OUTER_03:{scaleX:347/274,scaleY:347/274},OUTER_04:{scaleX:347/296,scaleY:347/296},OUTER_05:{scaleX:347/271,scaleY:347/271},
  ACC_01:{source:point(462,211),target:OWNER_BODY_ANCHORS.leftEar,scaleX:.55,scaleY:.55},ACC_02:{source:point(462.5,245),target:OWNER_BODY_ANCHORS.leftEar,scaleX:.5,scaleY:.5},
  ACC_08:{source:point(781,695.5),target:OWNER_BODY_ANCHORS.rightWrist,scaleX:.55,scaleY:.55},ACC_09:{source:point(787.5,633),target:OWNER_BODY_ANCHORS.rightWrist,scaleX:.6,scaleY:.6}
 }
};
export function ownerLayerAnchorSpec(slot,id){const base=OWNER_LAYER_ANCHORS.slots[slot]||OWNER_LAYER_ANCHORS.default,asset=OWNER_LAYER_ANCHORS.assets[id]||{};return{...OWNER_LAYER_ANCHORS.default,...base,...asset,source:{...OWNER_LAYER_ANCHORS.default.source,...base.source,...asset.source},target:{...OWNER_LAYER_ANCHORS.default.target,...base.target,...asset.target}}}
export function ownerAlphaBounds(id){return OWNER_ALPHA_BOUNDS[id]||null}

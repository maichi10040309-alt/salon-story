export const OWNER_CANVAS={width:1024,height:1536};

export const OWNER_ALPHA_BOUNDS={
 BODY:{x:225,y:10,width:574,height:1494},
 HAIR_01:{x:395,y:10,width:233,height:234},HAIR_02:{x:392,y:9,width:228,height:235},HAIR_03:{x:398,y:8,width:230,height:250},HAIR_04:{x:399,y:5,width:218,height:244},HAIR_05:{x:384,y:4,width:247,height:259},HAIR_06:{x:399,y:6,width:237,height:302},HAIR_07:{x:397,y:9,width:275,height:350},HAIR_08:{x:390,y:6,width:296,height:391},HAIR_09:{x:344,y:3,width:338,height:372},
 HAIR_10:{x:249,y:2,width:534,height:799},HAIR_11:{x:404,y:3,width:219,height:366},HAIR_12:{x:407,y:6,width:355,height:765},HAIR_13:{x:251,y:11,width:531,height:783},HAIR_14:{x:279,y:5,width:484,height:791},HAIR_15:{x:412,y:3,width:196,height:268},HAIR_16:{x:255,y:3,width:526,height:768},HAIR_17:{x:383,y:5,width:273,height:314},
 TOPS_01:{x:144,y:374,width:736,height:636},TOPS_02:{x:57,y:269,width:910,height:788},TOPS_03:{x:123,y:286,width:778,height:630},TOPS_04:{x:71,y:383,width:885,height:681},TOPS_05:{x:67,y:372,width:891,height:716},TOPS_06:{x:66,y:342,width:897,height:798},TOPS_07:{x:311,y:383,width:406,height:616},TOPS_08:{x:110,y:356,width:808,height:721},TOPS_09:{x:171,y:456,width:682,height:495},TOPS_10:{x:145,y:396,width:736,height:685},
 BOTTOMS_01:{x:2,y:76,width:852,height:1386},BOTTOMS_02:{x:0,y:94,width:1024,height:1298},BOTTOMS_03:{x:0,y:96,width:964,height:1338},BOTTOMS_04:{x:49,y:28,width:861,height:1442},BOTTOMS_05:{x:71,y:55,width:791,height:1420},BOTTOMS_06:{x:65,y:36,width:945,height:1468},BOTTOMS_07:{x:58,y:67,width:908,height:1339},BOTTOMS_08:{x:169,y:41,width:767,height:1432},
 STYLE_01:{x:409,y:220,width:206,height:443},STYLE_02:{x:370,y:220,width:284,height:458},STYLE_03:{x:367,y:220,width:290,height:468},STYLE_04:{x:392,y:220,width:239,height:463},STYLE_05:{x:384,y:220,width:256,height:469},
 OUTER_01:{x:377,y:220,width:270,height:463},OUTER_02:{x:381,y:220,width:262,height:406},OUTER_03:{x:375,y:220,width:274,height:487},OUTER_04:{x:364,y:220,width:296,height:479},OUTER_05:{x:376,y:220,width:271,height:467},
 SHOES_01:{x:364,y:1320,width:232,height:106},SHOES_02:{x:359,y:1320,width:243,height:105},SHOES_03:{x:361,y:1320,width:238,height:106},SHOES_04:{x:359,y:1320,width:243,height:102},SHOES_05:{x:360,y:1320,width:241,height:99},SHOES_06:{x:362,y:1320,width:236,height:108},SHOES_07:{x:357,y:1320,width:247,height:93},SHOES_08:{x:363,y:1320,width:235,height:108},
 BAG_01:{x:740,y:749,width:99,height:107},BAG_02:{x:739,y:743,width:102,height:113},BAG_03:{x:740,y:743,width:96,height:113},BAG_04:{x:741,y:743,width:90,height:113},BAG_05:{x:737,y:743,width:87,height:113},BAG_06:{x:734,y:743,width:96,height:113},BAG_07:{x:734,y:786,width:102,height:70},BAG_08:{x:734,y:746,width:96,height:110},
 ACC_01:{x:429,y:205,width:66,height:76},ACC_02:{x:422,y:225,width:81,height:41},ACC_03:{x:442,y:335,width:78,height:66},ACC_04:{x:442,y:335,width:79,height:66},ACC_05:{x:412,y:74,width:76,height:79},ACC_06:{x:412,y:72,width:72,height:79},ACC_07:{x:412,y:82,width:71,height:66},ACC_08:{x:742,y:658,width:78,height:75},ACC_09:{x:760,y:592,width:55,height:82},ACC_10:{x:672,y:374,width:81,height:71}
};

export const OWNER_INVALID_ASSETS={};

const bodyBounds=OWNER_ALPHA_BOUNDS.BODY;
const bodyCenterX=bodyBounds.x+bodyBounds.width/2;
const bodyBottomY=bodyBounds.y+bodyBounds.height;
export const OWNER_ALPHA_ANALYSIS=Object.fromEntries(Object.entries(OWNER_ALPHA_BOUNDS).map(([id,bounds])=>[id,{
 imageWidth:OWNER_CANVAS.width,imageHeight:OWNER_CANVAS.height,
 ...bounds,centerX:bounds.x+bounds.width/2,bottomY:bounds.y+bounds.height,
 centerXDelta:bounds.x+bounds.width/2-bodyCenterX,
 topYDelta:bounds.y-bodyBounds.y,
 bottomYDelta:bounds.y+bounds.height-bodyBottomY,
 widthRatio:bounds.width/bodyBounds.width,
 heightRatio:bounds.height/bodyBounds.height
}]));

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
  TOPS_01:{source:point(512,374),target:point(512,225),scaleX:382/736,scaleY:339/636},
  TOPS_02:{source:point(512,269),target:point(512,225),scaleX:398/910,scaleY:341/788},
  TOPS_03:{source:point(512,286),target:point(512,225),scaleX:398/778,scaleY:362/630},
  TOPS_04:{source:point(513.5,383),target:point(512,225),scaleX:386/885,scaleY:337/681},
  TOPS_05:{source:point(512.5,372),target:point(512,225),scaleX:398/891,scaleY:362/716},
  TOPS_06:{source:point(514.5,342),target:point(512,225),scaleX:398/897,scaleY:361/798},
  TOPS_07:{source:point(514,383),target:point(512,225),scaleX:398/406,scaleY:362/616},
  TOPS_08:{source:point(514,356),target:point(512,225),scaleX:384/808,scaleY:361/721},
  TOPS_09:{source:point(512,456),target:point(512,225),scaleX:382/682,scaleY:322/495},
  TOPS_10:{source:point(513,396),target:point(512,225),scaleX:398/736,scaleY:315/685},
  BOTTOMS_01:{source:point(428,76),scaleX:.4,scaleY:.4},
  BOTTOMS_02:{source:point(512,94),scaleX:.52,scaleY:.52},
  BOTTOMS_03:{source:point(482,96),scaleX:.42,scaleY:.42},
  BOTTOMS_04:{source:point(479.5,28),scaleX:.7,scaleY:.7},
  BOTTOMS_05:{source:point(466.5,55),scaleX:.7,scaleY:.7},
  BOTTOMS_06:{source:point(537.5,36),scaleX:.69,scaleY:.69},
  BOTTOMS_07:{source:point(512,67),scaleX:.68,scaleY:.68},
  BOTTOMS_08:{source:point(552.5,41),scaleX:.7,scaleY:.7},
  STYLE_01:{scaleX:280/124,scaleY:260/265},STYLE_02:{scaleX:300/269,scaleY:260/265},STYLE_03:{scaleX:300/267,scaleY:260/265},STYLE_04:{scaleX:280/159,scaleY:260/265},STYLE_05:{scaleX:292/244,scaleY:260/265},
  OUTER_01:{scaleX:347/270,scaleY:347/270},OUTER_02:{scaleX:347/262,scaleY:347/262},OUTER_03:{scaleX:347/274,scaleY:347/274},OUTER_04:{scaleX:347/296,scaleY:347/296},OUTER_05:{scaleX:347/271,scaleY:347/271},
  ACC_01:{source:point(462,211),target:OWNER_BODY_ANCHORS.leftEar,scaleX:.55,scaleY:.55},ACC_02:{source:point(462.5,245),target:OWNER_BODY_ANCHORS.leftEar,scaleX:.5,scaleY:.5},
  ACC_08:{source:point(781,695.5),target:OWNER_BODY_ANCHORS.rightWrist,scaleX:.55,scaleY:.55},ACC_09:{source:point(787.5,633),target:OWNER_BODY_ANCHORS.rightWrist,scaleX:.6,scaleY:.6}
 }
};

export function ownerLayerAnchorSpec(slot,id){const base=OWNER_LAYER_ANCHORS.slots[slot]||OWNER_LAYER_ANCHORS.default,asset=OWNER_LAYER_ANCHORS.assets[id]||{};return{...OWNER_LAYER_ANCHORS.default,...base,...asset,source:{...OWNER_LAYER_ANCHORS.default.source,...base.source,...asset.source},target:{...OWNER_LAYER_ANCHORS.default.target,...base.target,...asset.target}}}
export function ownerAlphaBounds(id){return OWNER_ALPHA_BOUNDS[id]||null}

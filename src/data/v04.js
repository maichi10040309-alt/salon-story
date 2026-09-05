const brands={LUNA:{style:'feminine',name:'LUNA',label:'フェミニン'},MODE:{style:'luxury',name:'MODE',label:'高級感'},MIEL:{style:'natural',name:'MIEL',label:'ナチュラル'},POPPY:{style:'trend',name:'POPPY',label:'トレンド'}};
const specs={
 tops:[['lace','レースブラウス'],['ribbon','リボンニット'],['silk','シルクシャツ'],['turtle','上品タートル'],['linen','リネンシャツ'],['cardigan','やわらかカーデ'],['crop','クロップドトップス'],['logo','ロゴTシャツ'],['peplum','ペプラムトップス'],['sheer','シアーブラウス']],
 bottoms:[['flare','フレアスカート'],['tweed','ツイードスカート'],['slacks','美脚スラックス'],['tight','タイトスカート'],['cotton','コットンパンツ'],['longskirt','ロングスカート'],['cargo','カラーカーゴ'],['mini','プリーツミニ']],
 dresses:[['flower','花柄ワンピース'],['pinkdress','ピンクドレス'],['blackdress','ブラックドレス'],['jacketdress','ジャケットワンピ'],['apron','ナチュラルワンピ'],['knitdress','ニットワンピ'],['color','カラーワンピ'],['korean','韓国風ワンピ']],
 shoes:[['pumps','リボンパンプス'],['heels','パールヒール'],['loafers','レザーローファー'],['boots','ショートブーツ'],['flats','やわらかフラット'],['sneakers','厚底スニーカー']],
 bags:[['miniBag','ミニバッグ'],['chain','チェーンバッグ'],['leather','レザートート'],['canvas','キャンバストート']],
 accessories:[['pearl','パールピアス'],['ribbonPin','リボンピン'],['gold','ゴールドネックレス'],['watch','クラシック時計'],['wood','ウッドバングル'],['scarf','ナチュラルスカーフ'],['heart','ハートチョーカー'],['colorPin','カラーヘアピン']]
};
const brandCycle=['LUNA','LUNA','MODE','MODE','MIEL','MIEL','POPPY','POPPY'];
export const fashionItems=Object.entries(specs).flatMap(([category,items])=>items.map(([id,name],i)=>{const brand=brandCycle[i%brandCycle.length],style=brands[brand].style;return{id:`${category}-${id}`,name,category,brand,price:6000+i*3500,style,points:8+(i%4)*4,icon:category==='tops'?'👚':category==='bottoms'?'👗':category==='dresses'?'👘':category==='shoes'?'👠':category==='bags'?'👜':'💎'}}));
export{brands};
export const makeupStyles=[
 {id:'natural',name:'ナチュラル',price:0,style:'natural',points:8,icon:'🌿'},
 {id:'feminine',name:'フェミニン',price:12000,style:'feminine',points:12,icon:'🌸'},
 {id:'mode',name:'モード',price:18000,style:'luxury',points:14,icon:'🖤'},
 {id:'korean',name:'韓国風',price:20000,style:'trend',points:15,icon:'🫧'},
 {id:'glamorous',name:'華やか',price:28000,style:'feminine',points:18,icon:'✨'},
 {id:'cool',name:'クール',price:24000,style:'luxury',points:17,icon:'💄'}
];
export const hairstyles20=['ショート','ボブ','ミディアム','ロング','ポニーテール','巻き髪','お団子','ハーフアップ','外ハネボブ','韓国風ロング','ウェーブ','編み込み','シニヨン','ツインテール','レイヤーミディアム','ストレートロング','ウルフ','くびれボブ','サイドポニー','編みおろし'];
export const townBuildings=[
 {id:'salon',name:'Salon Story',icon:'🌸',subtitle:'本店へ戻る'},
 {id:'fashionShop',name:'Fashion Shop',icon:'👗',subtitle:'服と小物を買う'},
 {id:'beautyShop',name:'Beauty Shop',icon:'💄',subtitle:'髪型とメイク'},
 {id:'cafe',name:'Cafe',icon:'☕',subtitle:'仲間と過ごす'},
 {id:'school',name:'Training School',icon:'🎓',subtitle:'技術とスキルを学ぶ'}
];
export const trainingCourses=[
 {id:'serviceBasic',name:'接客基礎',cost:10000,stat:'service',gain:4,skill:'聞き上手'},
 {id:'servicePro',name:'接客上級',cost:30000,stat:'service',gain:7,requiredLevel:4,skill:'おもてなし'},
 {id:'slimMaster',name:'痩身技術',cost:25000,stat:'tech',gain:5,skill:'痩身マスター'},
 {id:'facialMaster',name:'フェイシャル技術',cost:25000,stat:'tech',gain:5,skill:'美肌マスター'},
 {id:'counseling',name:'カウンセリング',cost:18000,stat:'service',gain:5,skill:'信頼カウンセリング'},
 {id:'management',name:'マネジメント',cost:50000,stat:'management',gain:8,requiredLevel:6,skill:'店舗管理'},
 {id:'sns',name:'SNS運用',cost:20000,stat:'popularity',gain:5,skill:'SNS上手'}
];
export const staffProfiles={
 akari:{age:24,personality:'明るく聞き上手',likes:'カフェ巡り',dislikes:'強引な接客',dream:'お客様が安心できる店長',best:'フェイシャル',weak:'高額提案'},
 mizuki:{age:29,personality:'まじめな技術職人',likes:'美容機器の研究',dislikes:'雑な仕事',dream:'技術講師になること',best:'痩身',weak:'営業トーク'},
 sakura:{age:26,personality:'前向きなムードメーカー',likes:'SNSとファッション',dislikes:'単調な作業',dream:'人気店の店長',best:'カウンセリング',weak:'長時間施術'}
};
export const customerStoryIds=['misaki','saori','ai','yumi','aoi','kaori','rena','mayu','hikari','riko'];
export const customerStorySteps=[
 {step:1,title:'はじめての一歩',need:{visits:1},trust:2,reward:{popularity:5}},
 {step:2,title:'本当の悩み',need:{trust:40},trust:4,reward:{money:3000}},
 {step:3,title:'変わりたい理由',need:{trust:60,visits:3},trust:5,reward:{popularity:15}},
 {step:4,title:'大切な日の前に',need:{rank:'常連'},trust:6,reward:{money:10000}},
 {step:5,title:'自信をくれた場所',need:{rank:'VIP'},trust:8,reward:{popularity:50}}
];
export const storyText={
 misaki:['脚の悩みを打ち明けてくれた。','「実は同窓会があって…」','好きな服をきれいに着たいと話した。','同窓会前の特別ケアを任された。','「自信を持って同窓会に行けました！」'],
 hikari:['結婚式に向けた相談が始まった。','ドレス姿への不安を話してくれた。','挙式までの集中プランを決めた。','結婚式直前の仕上げを任された。','「無事に最高の結婚式を迎えました！」']
};
export const secondStoreAreas=[
 {id:'station',name:'駅前店',cost:1500000,rent:120000,audience:'若者・会社員',multiplier:1.25,icon:'🚉'},
 {id:'residential',name:'住宅街店',cost:1000000,rent:70000,audience:'主婦・子育て層',multiplier:1.05,icon:'🏘️'},
 {id:'luxury',name:'高級エリア店',cost:2500000,rent:220000,audience:'富裕層',multiplier:1.55,icon:'🌃'}
];
export const rivalOwners={luxe:{name:'神崎レイナ',face:'👩🏻‍💼',personality:'自信家・結果重視',line:'小さなサロンがどこまで来られるか、見せてもらうわ。'},pop:{name:'星野ミミ',face:'👩🏼‍🎤',personality:'友好的・SNS上手',line:'今度、SNS人気対決しようよ！'},slim:{name:'白石トワ',face:'👩🏻‍🔬',personality:'研究肌・技術重視',line:'施術結果は数字で比べましょう。'}};

export const initialCustomerIds=['misaki','saori','ai','yumi','megumi','aoi','kaori','rena','mayu','hikari'];

export const storeRanks={
  D:{name:'小さな個人サロン',slots:4,beds:1,cost:0,requirements:{}},
  C:{name:'地域の人気サロン',slots:6,beds:2,cost:300000,requirements:{popularity:500,sales:500000}},
  B:{name:'有名サロン',slots:9,beds:3,cost:800000,requirements:{popularity:1500,sales:2000000,rating:4}},
  A:{name:'高級サロン',slots:12,beds:3,cost:2000000,requirements:{popularity:3000,sales:5000000,vip:5}}
};

export const chapters=[
  {id:1,title:'小さなサロンの第一歩',requirements:{salonLevel:2,sales:100000,repeaters:1},reward:{money:50000},unlock:'学生・働く女性のお客様'},
  {id:2,title:'口コミで人気のお店へ',requirements:{popularity:500,rating:4,repeaters:5},reward:{money:100000},unlock:'ライバルサロン'},
  {id:3,title:'ライバル登場',requirements:{popularity:850,sales:1000000},reward:{money:100000},unlock:'地域No.1への挑戦'},
  {id:4,title:'地域No.1を目指して',requirements:{storeRank:'B',popularity:2000,beatRivals:true},reward:{money:300000},unlock:'高級サロンへの道'},
  {id:5,title:'憧れの高級サロン',requirements:{storeRank:'A',vip:5,sales:5000000},reward:{money:500000},unlock:'エンドレス経営'}
];

export const rivals=[
  {id:'luxe',name:'LUXE BEAUTY',type:'高級志向',popularity:850,icon:'💎',growth:[3,10]},
  {id:'pop',name:'Beauty Pop',type:'若者・SNS',popularity:620,icon:'📱',growth:[4,12]},
  {id:'slim',name:'Slim Lab',type:'痩身専門',popularity:700,icon:'🔥',growth:[2,11]}
];

export const outfits=[
  {id:'natural',name:'ナチュラル制服',price:0,rarity:'NORMAL',effect:'慎重タイプの信頼 +5%',kind:'natural',icon:'🤍'},
  {id:'feminine',name:'フェミニン',price:15000,rarity:'NORMAL',effect:'ブライダル客満足度 +8',kind:'feminine',icon:'🎀'},
  {id:'simple',name:'シンプル',price:8000,rarity:'NORMAL',effect:'疲労ペナルティ -2',kind:'simple',icon:'🤎'},
  {id:'luxury',name:'高級感コーデ',price:65000,rarity:'PREMIUM',effect:'富裕層満足度 +8',kind:'luxury',icon:'🖤'},
  {id:'trend',name:'トレンドコーデ',price:35000,rarity:'RARE',effect:'若年層満足度 +8',kind:'trend',icon:'💗'},
  {id:'sporty',name:'スポーティ',price:25000,rarity:'RARE',effect:'痩身客満足度 +5',kind:'sporty',icon:'💚'}
];

export const machines=[
  {id:'cavitation',name:'キャビテーション',price:300000,target:['下半身太り','体型改善','産後体型'],bonus:8,icon:'〽️'},
  {id:'ems',name:'EMS',price:250000,target:['体型改善','産後体型'],bonus:6,icon:'⚡'},
  {id:'poreMachine',name:'毛穴洗浄機',price:200000,target:['毛穴','毛穴・肌荒れ','ニキビ'],bonus:10,icon:'💧'},
  {id:'rf',name:'RF',price:500000,target:['たるみ','フェイスライン','エイジング'],bonus:12,icon:'✨'},
  {id:'premiumMachine',name:'高級美容機器',price:1200000,target:['エイジング','シミ・くすみ'],bonus:16,requiredRank:'B',icon:'💎'}
];

export const extraEquipment=[
  {id:'mirror',name:'高級ミラー',price:80000,effect:'若年層満足度 +5',icon:'🪞'},
  {id:'drinks',name:'ドリンクサービス',price:120000,effect:'全施術満足度 +2',icon:'☕'},
  {id:'towels',name:'高級タオル',price:50000,effect:'全施術満足度 +2',icon:'🧺'},
  {id:'counselSeat',name:'カウンセリング席',price:200000,effect:'信頼度獲得 +10%',icon:'🪑'},
  {id:'vipSofa',name:'VIPソファ',price:300000,effect:'富裕層満足度 +8',requiredRank:'A',icon:'🛋️'}
];

export const trends=[
  {id:'smallface',name:'小顔ブーム',icon:'✨',targets:['小顔','フェイスライン'],sales:1.2,bonus:5},
  {id:'slimming',name:'痩身ブーム',icon:'🔥',targets:['下半身太り','体型改善','産後体型'],sales:1.2,bonus:5},
  {id:'pore',name:'毛穴ケア特集',icon:'🫧',targets:['毛穴','毛穴・肌荒れ','ニキビ'],sales:1.2,bonus:5},
  {id:'bridal',name:'ブライダルシーズン',icon:'💐',targets:['ブライダル美容'],sales:1.2,bonus:6},
  {id:'relax',name:'ごほうびリラックス',icon:'🌿',targets:['肩こり・疲労','むくみ・疲労'],sales:1.15,bonus:4}
];

export const hairstyles=['ショート','ボブ','ミディアム','ロング','ポニーテール','巻き髪','お団子','ハーフアップ'];
export const hairColors=['ブラック','ダークブラウン','ブラウン','ライトブラウン','ベージュ','ピンクブラウン'];
export const skinColors=['ライト','ナチュラル','ウォーム','ディープ'];

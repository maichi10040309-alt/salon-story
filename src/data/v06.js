export const dailyPolicies=[
 {id:'sales',name:'売上重視',icon:'¥',description:'客単価を伸ばす攻めの営業',effects:{sales:1.1,satisfaction:-3,guest:0,newWeight:1,repeatWeight:1,energy:1}},
 {id:'reviews',name:'口コミ重視',icon:'★',description:'丁寧な体験で評判を育てる',effects:{sales:1,satisfaction:1,review:1.45,guest:0,newWeight:1,repeatWeight:1,energy:1.05}},
 {id:'new',name:'新規客重視',icon:'✦',description:'新しい出会いを増やす',effects:{sales:1,satisfaction:0,guest:0,newWeight:1.65,repeatWeight:.8,energy:1}},
 {id:'regulars',name:'常連重視',icon:'♡',description:'大切なお客様との関係を深める',effects:{sales:1,satisfaction:2,guest:0,newWeight:.75,repeatWeight:1.55,energy:1}},
 {id:'relaxed',name:'ゆったり営業',icon:'☕',description:'人数を絞って疲労を抑える',effects:{sales:1,satisfaction:4,guest:-1,newWeight:1,repeatWeight:1,energy:.65}},
 {id:'rotation',name:'回転重視',icon:'↻',description:'より多くのお客様を迎える',effects:{sales:1,satisfaction:-4,guest:1,newWeight:1,repeatWeight:1,energy:1.2}}
];

export const weatherTypes=[
 {id:'sunny',name:'晴れ',icon:'☀️',guest:0,targets:[],description:'明るい一日。街の人出も安定しています。'},
 {id:'cloudy',name:'曇り',icon:'☁️',guest:0,targets:['リラクゼーション'],description:'落ち着いた美容日和です。'},
 {id:'rain',name:'雨',icon:'🌧️',guest:-1,targets:['肩こり・疲労'],description:'飛び込み客は少なめ。予約のお客様を大切に。'},
 {id:'storm',name:'大雨',icon:'⛈️',guest:-2,targets:['肩こり・疲労'],description:'キャンセルに注意。店内はゆったりしそうです。'},
 {id:'hot',name:'暑い',icon:'🌤️',guest:0,targets:['下半身太り','体型改善','毛穴','肌荒れ'],description:'痩身と毛穴ケアの需要が高まっています。'},
 {id:'cold',name:'寒い',icon:'❄️',guest:0,targets:['肩こり・疲労','肌荒れ'],description:'保湿とリラクゼーションが人気です。'}
];

export const customerConditions=[
 {id:'work-tired',name:'仕事疲れ',icon:'💼',budget:1,bonus:0,repeat:4,targets:['肩こり・疲労'],serviceBonus:12,line:'最近仕事が忙しくて、少し疲れがたまっているんです。'},
 {id:'before-date',name:'デート前',icon:'♡',budget:1.2,bonus:3,repeat:2,targets:['小顔','フェイスライン','毛穴'],serviceBonus:10,line:'明日ちょっと大切な予定があるんです。'},
 {id:'reunion',name:'同窓会前',icon:'✨',budget:1.25,bonus:4,repeat:3,targets:['下半身太り','体型改善','小顔'],serviceBonus:9,line:'久しぶりに友達と会うので、きれいにしておきたくて。'},
 {id:'travel',name:'旅行前',icon:'👜',budget:1.15,bonus:2,repeat:2,targets:['小顔','毛穴','肩こり・疲労'],serviceBonus:7,line:'旅行で写真をたくさん撮る予定なんです！'},
 {id:'skin-trouble',name:'肌荒れ気味',icon:'🫧',budget:1,bonus:-1,repeat:4,targets:['毛穴','ニキビ','肌荒れ'],serviceBonus:12,line:'急に肌の調子が気になってきて…。'},
 {id:'swelling',name:'むくみ',icon:'💧',budget:1,bonus:0,repeat:3,targets:['小顔','フェイスライン','肩こり・疲労'],serviceBonus:11,line:'今日はいつもより、むくんでいる気がします。'},
 {id:'sleepy',name:'寝不足',icon:'🌙',budget:.95,bonus:-2,repeat:2,targets:['肩こり・疲労','肌荒れ'],serviceBonus:9,line:'昨日あまり眠れなくて、顔が疲れて見えるんです。'},
 {id:'before-payday',name:'給料日前',icon:'🪙',budget:.7,bonus:-1,repeat:0,targets:[],serviceBonus:0,pricePenalty:5,line:'今日は予算を抑えめにしたくて…。'},
 {id:'after-bonus',name:'ボーナス後',icon:'🎁',budget:1.3,bonus:2,repeat:2,targets:[],serviceBonus:4,line:'今日は自分に少し贅沢してもいいかなって。'},
 {id:'sudden-plan',name:'急な予定',icon:'!',budget:1.1,bonus:0,repeat:1,targets:['小顔','フェイスライン','毛穴'],serviceBonus:8,line:'急に予定が入って、今日中に整えたくて！'},
 {id:'stress',name:'ストレス気味',icon:'🍃',budget:1,bonus:-1,repeat:5,targets:['肩こり・疲労'],serviceBonus:12,line:'少し気分を切り替えたくて来ました。'},
 {id:'refresh',name:'気分転換',icon:'🌸',budget:1,bonus:3,repeat:4,targets:[],serviceBonus:3,line:'今日は自分のための時間を過ごしたいです。'},
 {id:'reward',name:'自分へのご褒美',icon:'✦',budget:1.25,bonus:4,repeat:4,targets:[],serviceBonus:5,line:'頑張った自分へのご褒美に来ました。'},
 {id:'referral',name:'友人の紹介',icon:'🤝',budget:1,bonus:1,trust:10,repeat:5,targets:[],serviceBonus:3,line:'友達から、ここが良いって聞いたんです。'},
 {id:'social',name:'SNSを見た',icon:'📱',budget:1.05,bonus:1,repeat:3,targets:['小顔','毛穴'],serviceBonus:5,line:'SNSの投稿を見て、気になっていました！'},
 {id:'event',name:'イベント前',icon:'🎀',budget:1.2,bonus:2,repeat:3,targets:['小顔','フェイスライン','体型改善'],serviceBonus:9,line:'今度イベントがあるので、少しでもきれいにしたくて。'},
 {id:'birthday',name:'誕生日',icon:'🎂',budget:1.3,bonus:5,repeat:5,targets:[],serviceBonus:5,line:'実はもうすぐ誕生日なんです。'},
 {id:'photo',name:'写真撮影前',icon:'📷',budget:1.2,bonus:1,repeat:2,targets:['小顔','フェイスライン','毛穴'],serviceBonus:12,line:'来週、写真をたくさん撮る予定なんです。'},
 {id:'wedding-guest',name:'結婚式参列前',icon:'💐',budget:1.25,bonus:3,repeat:3,targets:['小顔','フェイスライン','肌荒れ'],serviceBonus:10,line:'友人の結婚式までに整えておきたいんです。'},
 {id:'long-time',name:'久しぶりの美容',icon:'🪞',budget:1.1,bonus:2,repeat:6,targets:[],serviceBonus:4,line:'久しぶりなので、今日はゆっくり相談したいです。'}
];

const eventGroups={
 customer:['予約なしの新規客','常連客が友人を紹介','メニュー変更の相談','予算より高い施術を相談','急いでいるお客様','静かに過ごしたい','スタッフ指名','オーナー指名','商品について質問','次回予約の希望'],
 staff:['スタッフが疲れている','スタッフが絶好調','新しい施術の提案','スタッフ同士の会話','技術について相談','小さな接客ミス','指名が重なった','休憩を求めている','突然スキル発動','スタッフの成長'],
 store:['美容機器が不調','タオルが残りわずか','予約時間が重なった','待合スペースが混雑','予約キャンセル','突然の空き時間','商品の在庫切れ','設備の点検サイン','店内BGMが好評','新設備への問い合わせ'],
 social:['SNS投稿がバズる','口コミ★5投稿','少し厳しい口コミ','インフルエンサーが紹介','ビフォーアフターが話題','新規予約が急増'],
 rival:['ライバルが割引開始','ライバルが新メニュー開始','ライバルの口コミ急上昇','ライバルオーナーから挑戦状','コンテストへの招待','スタッフ引き抜きの噂'],
 special:['インフルエンサー来店','モデル来店','ブライダル緊急予約','有名人らしきお客様','美容業界関係者来店','雑誌取材'],
 lucky:['顧客から差し入れ','常連客から口コミ紹介','機械メーカーのサンプル','スタッフからプレゼント','SNSフォロワー急増','突然の団体予約']
};
const categoryNames={customer:'顧客',staff:'スタッフ',store:'店舗',social:'SNS・口コミ',rival:'ライバル',special:'特殊客',lucky:'ラッキー'};
const icons={customer:'♡',staff:'✦',store:'🏠',social:'📱',rival:'⚡',special:'★',lucky:'🎁'};
const choiceSets={
 customer:[['すぐ丁寧に対応する',{money:4000,popularity:2,energy:-5,satisfaction:3}],['状況を聞いて調整する',{popularity:3,trust:2}],['次回につながる案内をする',{money:1000,repeat:6}]],
 staff:[['今は任せて励ます',{energy:8,satisfaction:1}],['短い休憩を入れる',{energy:15,money:-1000}],['役割を組み替える',{popularity:2,energy:5}]],
 store:[['すぐ対処する',{money:-3000,satisfaction:3}],['営業を続けながら対応',{money:2000,satisfaction:-2}],['スタッフと工夫する',{energy:-4,popularity:3}]],
 social:[['投稿を広げる',{popularity:18,money:-1000}],['お礼を丁寧に返す',{popularity:10,review:1}],['次回企画につなげる',{popularity:6,repeat:5}]],
 rival:[['自店の強みで対抗',{popularity:10,energy:-4}],['今日は接客に集中',{satisfaction:3}],['トレンドを研究する',{money:-2000,popularity:5}]],
 special:[['オーナーが対応する',{money:10000,popularity:16,energy:-8}],['得意スタッフに任せる',{money:7000,popularity:10,energy:-4}],['特別プランを提案する',{money:14000,satisfaction:-2}]],
 lucky:[['みんなで喜ぶ',{popularity:8,energy:8}],['お客様へ還元する',{money:-1500,satisfaction:5}],['明日のために活かす',{money:3000,repeat:3}]]
};
export const businessEvents=Object.entries(eventGroups).flatMap(([category,titles])=>titles.map((title,index)=>({
 id:`${category}-${index+1}`,category,categoryName:categoryNames[category],icon:icons[category],title,
 text:`営業中に「${title}」が起こりました。サロンの方針を決めましょう。`,
 choices:choiceSets[category].map(([label,effects],choiceIndex)=>({label,effects:{...effects,variation:(index+choiceIndex)%3}}))
})));

export const treatmentEvents=[
 {id:'pressure',title:'少し強く感じるみたい',text:'力加減をどうしますか？',choices:[['弱めて丁寧に',4],['様子を聞きながら続ける',3],['効果を優先する',0]]},
 {id:'focus',title:'重点的にしてほしい場所',text:'どこを中心にケアしますか？',choices:[['お悩みの場所',5],['首・肩まわり',3],['全体を均等に',2]]},
 {id:'temperature',title:'室温が気になるみたい',text:'快適に過ごしてもらうには？',choices:[['ブランケットを用意',4],['温度を調整',4],['そのまま進める',0]]},
 {id:'talk',title:'会話のペース',text:'お客様は少し目を閉じています。',choices:[['静かに施術する',4],['美容情報を伝える',2],['次回提案をする',0]]},
 {id:'machine',title:'機器の強さを調整',text:'効果と心地よさ、どちらを優先？',choices:[['心地よさを優先',3],['反応を見て微調整',5],['最大出力で進める',-1]]},
 {id:'aroma',title:'香りを選ぶ',text:'今日の気分に合う香りは？',choices:[['やさしいフローラル',3],['落ち着くハーブ',3],['無香料',2]]},
 {id:'time',title:'残り時間の使い方',text:'あと少しだけ施術時間があります。',choices:[['悩み部分をもう一度',5],['リラックスタイム',3],['早めに仕上げる',1]]},
 {id:'perfect-zone',title:'PERFECT ZONE',text:'光が中央に来たタイミングでタップ！',timing:true,choices:[['今タップする',5],['少し待つ',3],['スキップ',0]]}
];

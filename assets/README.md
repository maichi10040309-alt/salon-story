# Salon Story art assets

Ver.0.5の正式アート基準を反映する差し替え可能なアセット領域です。

- `characters/owner/`: 主人公の基準立ち絵
- `characters/staff/`: あかり・美月・さくらの基準立ち絵
- `characters/customers/<id>/normal.webp`: 主要顧客10名の個別立ち絵。表情画像追加時も同じ顧客フォルダへ配置
- `characters/rivals/`: 将来のライバル個別立ち絵
- `stores/rank-d/`〜`rank-a/`: 店舗背景
- `stores/rank-*/background.webp`: Rank別店舗背景。未配置時はCSSサロンを表示
- `town/map/background.webp`: 街全体背景。未配置時はCSSマップを表示
- `town/{salon,fashion,beauty,cafe,school}/building.webp`: 施設画像。未配置時はCSS建物を表示
- `fashion/`: トップス等の着せ替えパーツ
- `beauty/`: 髪型・メイクパーツ
- `ui/`: アイコン・バッジ・演出

正式画像がない表示はSVG/CSSフォールバックを使用します。画像ファイルを追加した後も、ゲームの状態データとセーブ構造は変更不要です。

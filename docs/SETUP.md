# セットアップ手順（Web MVP）

この手順でローカル開発を開始できます。

## 1) 依存関係のインストール
- Node.js 18+ を用意
- コマンド: `npm install`

## 2) 環境変数の設定
- ルート直下に `.env.local` を作成（`.env.example` をコピー）
- 次を設定:
  - `NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...（Anon 公開鍵）`
- 保存後、開発サーバーを再起動してください

## 3) Supabase スキーマ/RLS
- Supabase の SQL エディタで `supabase/migrations/0001_create_tasks.sql` を実行
- RLS が有効化され、ポリシー `owner_all` が存在することを確認
- 認証: Email+Password または Magic Link を有効化
- Realtime を使う場合: `tasks` テーブルを Realtime 対象に追加

## 4) 開発サーバー起動
- `npm run dev`
- ブラウザで `http://localhost:3000` を開く

## よくあるエラー
- `Error: supabaseUrl is required.`
  - `.env.local` の `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` 未設定が原因です
  - 値を設定し、サーバーを再起動してください


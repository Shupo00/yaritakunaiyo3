# 要件定義書

要件定義書（最新版：Web版＋将来モバイル対応）

プロジェクト名（仮）： やりたくないよ！
対象プラットフォーム（初期）： Web（Next.js / Supabase）
将来拡張： モバイル版（Expo React Native）と同一バックエンドを利用

1. プロジェクト概要

目的
行動（やること）と感情（やりたくない理由）を一体で記録し、自己管理をポジティブに偽装するのではなく、ありのままの「やりたくなさ」を可視化する。

特徴

タスクごとに「やること」「やりたくない理由」「やりたくない度」をセットで記録

本音の「毒」をそのまま残す仕組み

やりたくない度メーターで直感的に可視化

モノトーン＋毒色のUIデザイン

2. 想定ユーザー

自己分析・内省に興味のある人

ToDoアプリが長続きしなかった人

ネガティブな感情をSNSに書けずに溜めてしまう人

3. 機能要件（MVP）
3.1 タスク管理

追加：行動（必須）、理由（任意）、やりたくない度（0〜100）、タグ（任意）

一覧：行動・理由要約・やりたくない度バー・表情アイコン

詳細：全文表示、編集、削除

検索/フィルタ：キーワード検索、タグフィルタ、やりたくない度ソート

3.2 可視化（Stats）

週/月単位で平均・最大やりたくない度

タグ別平均（例：仕事は平均80%、家事は60%など）

3.3 認証

Supabase Auth（メール+パスワード or Magic Link）

3.4 バックアップ / 同期

SupabaseをメインDBとし、自動的にクラウド同期

将来はモバイル版（Expo）からも同じアカウントで利用可能

4. 非機能要件

オフライン（Web）：IndexedDBキャッシュを利用（再接続時に同期）

パフォーマンス：1000件以上でも一覧スクロール快適

セキュリティ：Supabase RLS（行レベルセキュリティ）必須

デザイン：モバイルファースト、モノトーン＋毒色アクセント

アクセシビリティ：やりたくない度は色＋数値＋アイコンで表示

5. データモデル
table tasks {
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (length(action) between 1 and 120),
  reason text,
  dislike_level int not null check (dislike_level between 0 and 100),
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
}


RLSポリシー：auth.uid() = user_id のみアクセス可能

6. UI仕様

色

背景: #121212、カード: #1E1E1E、文字: #E0E0E0

メーター色：0–20灰色 → 21–60紫 → 61–80濃赤 → 81–100鮮赤（脈動）

表情アイコン

0–20🙂

21–60😐

61–80😒

81–100🤬

アニメーション

やりたくない度 81%以上でメーターが微脈動

設定でアニメ低減可

7. 技術スタック

フロント：Next.js（App Router） / TypeScript / Tailwind CSS

DB：Supabase（Postgres + Auth）

グラフ：Recharts

状態管理：React Query + Zustand（軽量状態）

ホスティング：Vercel

8. 開発ステップ（Web MVP）

Next.js プロジェクト初期化（Tailwind, ESLint, Prettier）

Supabase テーブル作成 + RLS設定

認証（/auth ページ）

タスク追加フォーム（/add）

一覧（/） + フィルタ・ソート

詳細/編集/削除（/task/[id]）

Stats（/stats）平均/最大/タグ別表示

UI磨き（毒色テーマ、脈動アニメ、設定ページ）

9. 将来拡張

モバイル版（Expo RN）追加 → 同じ Supabase を利用

AI要約（理由の自動要約 / 週報）

感情ヒートマップ（曜日・時間帯ごとのやりたくなさ）

SNS共有モード（匿名で「みんなの毒」を共有）
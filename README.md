# TODO API - DDD Tutorial

DDD（ドメイン駆動設計）を学ぶための TODO API 教材です。

## 技術スタック

- **TypeScript** - 型安全な開発
- **Fastify** - 高速な Web フレームワーク
- **Kysely** - 型安全な SQL クエリビルダー
- **Zod** - リクエストバリデーション
- **Vitest** - テストフレームワーク
- **PostgreSQL** - データベース
- **Docker** - コンテナ化

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   (Fastify Routes, Zod Schemas)         │
│   HTTP リクエスト/レスポンスの処理          │
├─────────────────────────────────────────┤
│           Application Layer             │
│   (Use Cases)                           │
│   ビジネスロジックのオーケストレーション      │
├─────────────────────────────────────────┤
│            Domain Layer                 │
│   (Entities, Repository Interface)      │
│   ビジネスルール、外部依存なし              │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│   (Kysely Repository, DB Connection)    │
│   データベースアクセスの具体的な実装         │
└─────────────────────────────────────────┘
```

**依存の方向**: Presentation → Application → Domain ← Infrastructure

Domain 層は外部ライブラリに一切依存しません。Infrastructure 層が Domain 層の Repository インターフェースを実装します（依存性逆転の原則）。

## セットアップ

### 前提条件

- Docker & Docker Compose
- [GitHub CLI (gh)](https://cli.github.com/)（`gh auth login` 済み）

### 起動手順

```bash
# 初期セットアップ（Dockerfile.dev, docker-entrypoint.sh のダウンロード + .env 生成）
./setup.sh

# 開発コンテナ起動（PostgreSQL + dev コンテナ）
docker compose --profile dev up -d

# dev コンテナに入る
docker compose exec dev bash

# 以降は dev コンテナ内で実行

# 依存関係インストール
npm install

# TypeScript ビルド
npm run build

# マイグレーション実行
npm run migrate

# サーバー起動
npm start
```

サーバーは `http://localhost:3000` で起動します。

## API エンドポイント

### ヘルスチェック

```bash
curl -s http://localhost:3000/health | jq
```

### TODO 作成

```bash
curl -s -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn DDD"}' | jq
```

レスポンス:
```json
{
  "id": 1,
  "title": "Learn DDD",
  "isCompleted": false,
  "createdAt": "2026-04-07T12:00:00.000Z",
  "updatedAt": "2026-04-07T12:00:00.000Z"
}
```

### TODO 一覧取得

```bash
# 全件取得
curl -s http://localhost:3000/todos | jq

# 完了済みのみ
curl -s "http://localhost:3000/todos?isCompleted=true" | jq

# 未完了のみ
curl -s "http://localhost:3000/todos?isCompleted=false" | jq
```

### TODO 個別取得

```bash
curl -s http://localhost:3000/todos/1 | jq
```

### TODO 更新

```bash
# タイトル変更
curl -s -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn DDD patterns"}' | jq

# 完了にする
curl -s -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"isCompleted": true}' | jq
```

### TODO 削除

```bash
curl -s -X DELETE http://localhost:3000/todos/1 -w "\nHTTP Status: %{http_code}\n"
```

## エラーレスポンス

| HTTP Status | 説明 |
|-------------|------|
| 400 | バリデーションエラー（空のタイトル、不正な ID など） |
| 404 | 指定された TODO が見つからない |
| 500 | 内部サーバーエラー |

```bash
# 400 の例: 空のタイトル
curl -s -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": ""}' | jq

# 404 の例: 存在しない ID
curl -s http://localhost:3000/todos/999 | jq
```

## テスト

```bash
# 全テスト実行
npm test

# Unit テスト（ドメイン層 + アプリケーション層、DB 不要）
npm run test:unit

# Integration テスト（インフラ層、PostgreSQL 必要）
npm run test:integration

# E2E テスト（プレゼンテーション層、PostgreSQL 必要）
npm run test:e2e
```

## DDD 各層の説明

### Domain 層 (`src/domain/`)

- `todo.ts` - Todo エンティティの型定義
- `todo-repository.ts` - Repository インターフェース（Port）
- `errors.ts` - ドメイン固有のエラークラス

外部ライブラリへの依存なし。純粋な TypeScript の型とクラスのみ。

### Application 層 (`src/application/`)

- 各ユースケースが 1 ファイル 1 クラス
- コンストラクタで `TodoRepository` インターフェースを受け取る（DI）
- Domain 層のみに依存

### Infrastructure 層 (`src/infrastructure/`)

- `connection.ts` - Kysely DB 接続ファクトリ
- `database.ts` - Kysely 用のテーブル型定義
- `kysely-todo-repository.ts` - `TodoRepository` の Kysely 実装（Adapter）
- `migrations/` - データベースマイグレーション

Domain 層の `TodoRepository` インターフェースを実装（依存性逆転）。

### Presentation 層 (`src/presentation/`)

- `todo-routes.ts` - Fastify ルート定義
- `schemas.ts` - Zod バリデーションスキーマ
- `error-handler.ts` - ドメインエラー → HTTP レスポンス変換
- `format.ts` - Todo エンティティ → JSON レスポンス変換

### Composition Root (`src/main.ts`)

全層を組み立てるエントリーポイント。DI コンテナの役割を果たす。

## 本番ビルド

```bash
docker compose --profile prod up -d
```

Multi-stage ビルドで distroless イメージを使用した軽量な本番コンテナが起動します。

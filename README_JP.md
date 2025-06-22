# GitHub Followex

**GitHubのフォロワー・フォロー関係を可視化するネットワーク分析ツール**

![GitHub Followex Demo](https://img.shields.io/badge/D3.js-v7-orange) ![Node.js](https://img.shields.io/badge/Node.js-v18+-green) ![License](https://img.shields.io/badge/License-MIT-blue)

**言語**: [English](README.md) | [日本語](README_JP.md)

## このツールについて

GitHub FollowexはGitHubのフォロワー・フォロー関係をインタラクティブなグラフとして可視化するツールです。GitHub APIからデータを収集し、ユーザーをノードとして、フォロー関係を線で結んで表示します。

### 機能

- ズーム・パン・ドラッグ操作が可能なインタラクティブなグラフ表示
- ノードにGitHubプロフィールアバターを表示
- フォロワー数に基づくノードサイズと色の変更
- ホバー時のユーザー情報ツールチップ表示
- 最適化技術による大規模ネットワークのサポート

## 始め方

### 1. 環境の準備

```bash
# Node.js (v18以上) がインストールされているか確認
node --version

# 必要なパッケージをインストール
npm install
```

### 2. GitHubトークンの設定

1. [GitHub設定 > 開発者設定 > パーソナルアクセストークン](https://github.com/settings/tokens) にアクセス
2. 「新しいトークンを生成 (classic)」をクリック
3. 以下の権限を選択:
   - `read:user` - ユーザー情報の読み取り
   - `user:follow` - フォロー関係の読み取り
4. トークンをコピーして `.env` ファイルを作成:

```bash
# .env ファイルを作成
GITHUB_TOKEN=あなたのGitHubトークンをここに貼り付け
```

### 3. データ収集と表示

```bash
# 1. GitHubからデータを収集してグラフデータを生成
node index.js

# 2. ブラウザでindex.htmlを開いて結果を確認
```

## ファイル構成

```
Followex/
├── index.js          # データ収集のメインプログラム
├── graph.js           # D3.jsを使った可視化処理
├── index.html         # ブラウザで表示するページ
├── package.json       # プロジェクトの設定ファイル
├── .env              # 環境変数（GitHubトークン）
├── graph.json        # 生成されるグラフデータ
└── README.md         # このファイル（使い方説明）
```

## 設定方法

### 分析したいユーザーを変更する

`index.js` ファイルの以下の部分を編集してください:

```javascript
// 分析の起点となるユーザー名
const rootUsername = "あなたのユーザー名";
```

### ネットワークの大きさを調整する

探索の深さを調整してネットワークサイズを制御できます:

```javascript
// buildGraph関数内で調整
const MAX_DEPTH = 2; // 探索の深さ（デフォルト: 2階層）
```

### 処理するユーザー数を制限する

パフォーマンス向上のため、各ユーザーから取得する人数を制限できます:

```javascript
// buildGraph関数内で調整
for (const follower of followers.slice(0, 10)) { // 最大10人まで処理
```

## グラフの見方

### ノード（円）の意味
- 大きさ: フォロワー数に比例（中央値基準の2段階スケール）
- 色: フォロワー数に応じたグラデーション（Viridisカラースケール）
- 画像: GitHubのプロフィール画像（円形クリッピング）

### 線（エッジ）の意味
- 矢印の方向: フォロー関係を表示
- 色: 薄いグレー（透明度60%）

### 操作方法
- ズーム: マウスホイールで拡大・縮小
- 移動: 背景をドラッグして全体を移動
- ノードの移動: ノードをドラッグして位置を調整
- 詳細表示: ノードにマウスを重ねると詳細情報を表示

## 使用している技術

- サーバー側: Node.js
- グラフ処理: graphlib ライブラリ
- HTTP通信: axios
- ブラウザ側: D3.js v7
- データ取得: GitHub REST API v3

## 最適化の工夫

### API制限への対策
- キャッシュ機能で同じデータの再取得を防止
- 重複処理の回避で処理済みユーザーをスキップ
- 制限付き探索で深さとユーザー数に上限を設定

### 表示の最適化
- 衝突検出と力学モデルを使った物理シミュレーション
- ズームレベルに応じたラベル表示制御
- レンダリング用にSVG要素を最適化

## よくある問題と解決方法

### アバター画像が表示されない場合

GitHubアバターの読み込みに失敗した場合は、自動的にデフォルトアイコンが表示されます。ネットワーク接続を確認してください。

### API制限エラーが出る場合

```
Error: Request failed with status code 403
```

このエラーが出た場合:
- GitHubトークンが正しく設定されているか確認
- API制限に達した場合は少し時間をおいて再実行

### データが表示されない場合

```
No nodes data found!
```

このメッセージが出た場合:
- 指定したユーザー名が存在するか確認
- プライベートアカウントの場合は情報が取得できない可能性があります

### メモリ不足になる場合

- 探索深度を1に下げる（MAX_DEPTH = 1）
- 取得ユーザー数を5人程度に制限

## 出力されるデータの形式

`graph.json` ファイルの構造例:

```json
{
  "nodes": [
    {
      "id": "ユーザー名",
      "followers_count": 1250,
      "following_count": 180,
      "public_repos": 45
    }
  ],
  "links": [
    {
      "source": "フォローしているユーザー名",
      "target": "フォローされているユーザー名"
    }
  ]
}
```

## 貢献について

このプロジェクトへの貢献を歓迎します：

1. このリポジトリをフォーク
2. 新機能ブランチを作成 (`git checkout -b feature/新機能`)
3. 変更をコミット (`git commit -m '新機能を追加'`)
4. ブランチにプッシュ (`git push origin feature/新機能`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスで公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 謝辞

このプロジェクトは以下のオープンソースライブラリを使用しています：

- [D3.js](https://d3js.org/) - データ可視化ライブラリ
- [GitHub API](https://docs.github.com/en/rest) - データ提供
- [graphlib](https://github.com/dagrejs/graphlib) - グラフデータ構造の処理

---

**開発者**: Nanashi_pi  
**バージョン**: 1.0.0  
**最終更新**: 2025年6月23日

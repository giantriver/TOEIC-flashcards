# TOEIC Flashcards

將 Markdown 單字筆記轉為可翻面的 TOEIC 複習卡。資料儲存在使用者自己的 Firebase Firestore 路徑中，使用 Google 帳號登入。

## 開始使用

1. 安裝套件：`npm install`
2. 將 `.env.example` 複製為 `.env`，填入 Firebase 網頁應用程式設定。
3. 執行：`npm run dev`

## Firebase 設定

在 Firebase Console 建立專案並新增 Web App，將設定值填入 `.env`：

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

接著在 Authentication 啟用 Google 登入，並建立 Firestore Database。筆記會存放在：

```
users/{uid}/notes/{noteId}
```

待加強單字的個人狀態會存放在：

```
users/{uid}/notes/{noteId}/progress/{cardId}
```

本機測試與 GitHub Pages 網域都必須加入 Firebase Authentication 的 Authorized domains。Firestore Rules 也需要允許擁有者存取 `progress` 子集合。

## 單字卡格式

只有符合下列格式的 Markdown 項目會被轉為單字卡：

```md
- **allocate** `v.` 分配、撥出
  > The manager allocated more time to the project.
- **agenda** `n.` 議程
  > Please review the meeting agenda before Friday.
```

卡片正面是單字與詞性；背面是中文意思與緊接在項目後方的引用例句。一般 Markdown 內容仍會保留在筆記預覽中，但不會被猜測成卡片。

## 待加強單字

複習卡片右上角的星星可將答不出來的單字標示為待加強。切換到「待加強」模式即可只複習已標記的卡片；再次點選星星會移除標記。星號狀態會儲存在 Firestore，並在不同裝置間同步。

卡片右上角的播放按鈕會在新分頁開啟 YouGlish，直接搜尋目前單字或片語的英文發音與真實影片例句。

## 建置與部署

```bash
npm run build
```

專案已設定 GitHub Pages workflow。推送到 `main` 後，請在 repository 的 Settings > Pages 選擇 GitHub Actions，並於 Actions secrets 新增所有 `VITE_FIREBASE_*` 環境變數。Vite base 已設定為 `/TOEIC-flashcards/`，路由採用 Hash History 以支援靜態部署。

# 🐍 PyJudge — 瀏覽器端 Python 線上評測系統

PyJudge 是一個純靜態的 Online Judge，使用 **Pyodide**（Python in WebAssembly）在瀏覽器內直接執行 Python 程式碼，無需任何後端伺服器，可直接部署到 **GitHub Pages**。

## ✨ 功能特色

- 🐍 在瀏覽器內執行 Python 3（Pyodide）
- 🎨 CodeMirror 程式碼編輯器（Dracula 深色主題）
- 📋 題目資料獨立為 JSON 檔，易於新增與維護
- ✅ 自動評測所有測資，顯示 AC / WA / TLE / RE 結果
- 💾 解題紀錄存於本地（localStorage）
- 🚀 純靜態，可直接部署到 GitHub Pages

---

## 📁 專案結構

```
pyjudge/
├── index.html          ← 主程式（UI 邏輯，不含題目資料）
│
├── problems/
│   ├── index.json      ← 題目清單（id、標題、難度、標籤）
│   ├── 001.json        ← 題目 001 完整資料（含測資）
│   ├── 002.json
│   └── ...
│
└── solutions/
    ├── 001.py          ← 題目 001 參考解答（不會自動載入）
    ├── 002.py
    └── ...
```

> **分工說明**
> - **`problems/*.json`** — 維護者只需編輯這裡就能新增或修改題目
> - **`solutions/*.py`** — 參考解答，不會自動顯示給學生
> - **`index.html`** — 除非要改功能，否則不需要動

---

## ➕ 新增題目（不需要 AI，3 步驟完成）

### 步驟 1：在 `problems/index.json` 加入清單項目

```json
[
  { "id": 1, "title": "A+B 問題", "difficulty": "Easy", "tags": ["數學"] },
  { "id": 8, "title": "你的新題目", "difficulty": "Easy", "tags": ["字串"] }
]
```

`difficulty` 只能填 `"Easy"`、`"Medium"`、`"Hard"` 三種。

### 步驟 2：建立 `problems/008.json`

（檔名要和 `id` 對應，補零到三位數）

```json
{
  "id": 8,
  "title": "你的新題目",
  "difficulty": "Easy",
  "tags": ["字串"],
  "description": "<p>題目說明，支援 HTML 標籤。</p>",
  "inputFormat": "<p>輸入格式說明。</p>",
  "outputFormat": "<p>輸出格式說明。</p>",
  "constraints": "<ul><li>1 ≤ N ≤ 100</li></ul>",
  "timeLimit": 1,
  "memoryLimit": 256,
  "sampleInput": "hello",
  "sampleOutput": "olleh",
  "testCases": [
    { "input": "hello",  "output": "olleh"  },
    { "input": "world",  "output": "dlrow"  },
    { "input": "12345",  "output": "54321"  }
  ]
}
```

### 步驟 3：（可選）建立 `solutions/008.py`

```python
# 008. 你的新題目（參考解答）
s = input()
print(s[::-1])
```

這個檔案**不會自動載入**到編輯器，只做為題目出題者的參考。

---

## 🚀 部署到 GitHub Pages（5 分鐘完成）

### 步驟 1：建立 GitHub Repository

1. 前往 [github.com](https://github.com) 並登入
2. 點擊右上角 **+** → **New repository**
3. 輸入倉庫名稱，例如：`pyjudge`，選擇 **Public**
4. 點擊 **Create repository**

### 步驟 2：上傳所有檔案

**方法 A：在 GitHub 網頁上傳（最簡單）**

1. 在倉庫頁面點擊 **Add file** → **Upload files**
2. 將 `index.html` 及整個 `problems/`、`solutions/` 資料夾一起上傳
3. 點擊 **Commit changes**

**方法 B：使用 Git**

```bash
git init
git add .
git commit -m "Initial PyJudge"
git branch -M main
git remote add origin https://github.com/你的帳號/pyjudge.git
git push -u origin main
```

### 步驟 3：啟用 GitHub Pages

1. 倉庫頁面 → **Settings** → **Pages**
2. Source 選 **Deploy from a branch**，Branch 選 **main / (root)**
3. 點擊 **Save**，等待 1～3 分鐘

你的網站網址：`https://你的帳號.github.io/pyjudge/`

---

## 💡 本機預覽（開發用）

因為 `fetch()` 在 `file://` 協定下受瀏覽器限制，本機測試需要啟動簡易 HTTP 伺服器：

```bash
# 在 pyjudge/ 資料夾下執行
python3 -m http.server 8080
# 然後開啟瀏覽器前往 http://localhost:8080
```

> **備注**：直接用瀏覽器開啟 `index.html`（`file://` 協定）時，系統會自動 fallback 使用內嵌在 HTML 裡的備份資料，功能仍然正常運作。

---

## ⚠️ 已知限制

| 限制 | 說明 |
|------|------|
| 僅支援 Python | Pyodide 只執行 Python 3 |
| TLE 為近似值 | 無法強制中止無窮迴圈（瀏覽器會卡住）|
| 首次載入較慢 | Pyodide 約 30MB，視網速需等 10～30 秒 |
| 需要網路連線 | CDN 資源需要網路 |

---

## 🛠 技術棧

- **[Pyodide](https://pyodide.org/)** — Python 3 in WebAssembly
- **[CodeMirror 5](https://codemirror.net/)** — 程式碼編輯器
- **GitHub Pages** — 免費靜態網頁託管

# SkillLab (Pyjudge) 動態架構升級實施計畫

## 一、專案背景與升級目標

SkillLab 目前為純靜態網站（託管於 GitHub Pages），核心優勢為**客戶端評測**（Python/Blockly 透過 Pyodide WebAssembly，Scratch 透過獨立 Web Worker）。所有程式碼草稿與通關紀錄目前暫存於瀏覽器的 `localStorage`。

為了提升教學與自學體驗，本計畫將專案升級為**非靜態動態架構（Serverless BaaS）**，達成以下四大目標：

1. **非靜態動態架構**：不需維護昂貴的伺服器，利用 Google Firebase 免費額度（Spark 方案）實現動態身分驗證與雲端資料存取。
2. **Google 帳號登入**：學生與教師可直接使用 Google 帳號無縫登入。
3. **學生專屬個人儀表板**：登入後可查看個人通關率、解題語言偏好、最近作答草稿，並可輸入班級代碼加入教師班級。
4. **教師班級主控台**：教師可建立班級、取得班級邀請碼，並透過即時矩陣掌握全班每位學生的解題進度，可隨時點擊調閱學生的程式碼快照（Code Snapshot）進行課堂診斷。
5. **高規格資安與防弊機制**：透過 Firestore 伺服器端安全規則、App Check 與程式碼快照，杜絕偽造通關、竄改成績與提權漏洞。

---

## 二、技術選型與費用保證

> **Firebase Spark 方案（永久免費，不需綁定信用卡）**
>
> - 每日免費額度：50,000 次讀取、20,000 次寫入、1 GB 儲存空間。
> - 認證免費額度：每月 50,000 位活躍使用者 (MAU)。
> - 評測運算持續保留在學生瀏覽器端（Pyodide），因此雲端消耗量極低，足以應付數百至上千名學生課堂使用。

> **向下相容與漸進式同步**
>
> - 未登入的使用者依然可正常自學與評測（維持原有 `localStorage` 離線機制）。
> - 學生一旦點擊 Google 登入，系統會自動比對並將本地端的進度同步上雲端，不遺失過往練習紀錄。

---

## 三、系統架構與資料模型設計

### 3.1 系統架構圖

```text
[ 學生 / 教師 瀏覽器 ]
   │
   ├── (1) 靜態資源加載 ──> GitHub Pages / Firebase Hosting (免費 CDN)
   │
   ├── (2) Google 登入 ──> Firebase Authentication (OAuth 2.0)
   │
   ├── (3) 程式評測 ────> 瀏覽器本機 WebAssembly (Pyodide / Scratch Worker)
   │
   └── (4) 進度與班級 ───> Cloud Firestore (安全規則嚴密防護)
```

### 3.2 Firestore 資料庫結構（Schema）

#### 1. 使用者主文檔：`users/{uid}`

```json
{
  "uid": "google_uid_string",
  "displayName": "王小明",
  "email": "student@gmail.com",
  "photoURL": "https://lh3.googleusercontent.com/...",
  "role": "student",              // 預設為 "student"，經授權可為 "teacher"
  "classCode": "8A2026",          // 所屬班級代碼（若未加入則為 null）
  "createdAt": "2026-09-16T10:00:00Z",
  "lastLoginAt": "2026-09-16T12:00:00Z",
  "stats": {
    "beginnerPassedCount": 8,
    "judgePassedCount": 24,
    "lastProblemId": "018",
    "lastLanguage": "python",
    "languageUsage": { "python": 15, "scratch": 9, "blockly": 4 }
  }
}
```

#### 2. 解題紀錄子集合：`users/{uid}/submissions/{problemId}`

```json
{
  "problemId": "018",
  "status": "AC",
  "language": "python",
  "codeSnapshot": "n = int(input())\n...",
  "passedAt": "2026-09-16T11:20:00Z"
}
```

#### 3. 班級主文檔：`classrooms/{classCode}`

```json
{
  "classCode": "8A2026",
  "className": "八年甲班 資訊科技",
  "teacherUid": "teacher_google_uid",
  "teacherName": "張老師",
  "createdAt": "2026-09-01T08:00:00Z"
}
```

#### 4. 班級成員子文檔：`classrooms/{classCode}/members/{studentUid}`

```json
{
  "studentUid": "google_uid_string",
  "displayName": "王小明",
  "email": "student@gmail.com",
  "photoURL": "https://...",
  "joinedAt": "2026-09-02T09:00:00Z",
  "stats": {
    "beginnerPassedCount": 8,
    "judgePassedCount": 24
  }
}
```

### 3.3 訪客試用範圍與登入解鎖機制（Guest Trial Policy）

為兼顧「降低初次接觸門檻」與「鼓勵建立帳號記錄進度」，系統規劃清晰的訪客試用邊界：

#### 1. 訪客開放題目範圍

* **三階段自學講義（LV.1、LV.2、LV.3）**：各階段均開放**前 3 題（第 1~3 關）**供免登入體驗。
* **Judge 題庫系統**：開放**前 3 題（如 001、002、003 題）**供免登入試用。

#### 2. 訪客體驗與配額保護

* **免消耗雲端資源**：訪客在試用範圍內做題時，程式評測全在瀏覽器本機進行，草稿與通關狀態僅暫存在 `localStorage`，**完全不發送 Firestore 請求**，大幅降低免費額度的無謂消耗。
* **解鎖引導彈窗（Sign-in Modal）**：當未登入訪客點擊第 4 題或進階題目時，跳出友善引導對話框：
  > 🌟 **「喜歡 SkillLab 嗎？立即使用 Google 帳號免費登入，一鍵解鎖全站完整講義、所有題庫與班級功能，並永久保存學習歷程！」**
  >
* **無縫接軌**：學生在試用題寫下的程式草稿與通關紀錄，於點擊 Google 登入後自動同步至雲端個人儀表板，體驗不中斷。

---

## 四、三級權限架構與資料隔離規範（Three-Tier Access Control）

為貫徹非營利教育網站的簡潔與高度隱私安全，系統採用嚴格的**「三級權限隔離機制」**：

```text
┌────────────────────────────────────────────────────────┐
│  第 1 級：開發者 / 站長 (Developer / Super Admin)       │
│  - 透過指定 Google UID 鎖定唯一管理權限                 │
│  - 唯一有權生成「教師啟用金鑰 (Teacher Key)」           │
└──────────────────────────┬─────────────────────────────┘
                           │ 派發金鑰
┌──────────────────────────▼─────────────────────────────┐
│  第 2 級：教師帳號 (Teacher)                           │
│  - 必須輸入開發者配給的有效金鑰才能啟用教師身分          │
│  - 可建立班級並產生「班級邀請認證碼」                   │
│  - 【嚴格隔離】：只能看自己班級邀請到的學生，禁看他人    │
└──────────────────────────┬─────────────────────────────┘
                           │ 班級邀請碼
┌──────────────────────────▼─────────────────────────────┐
│  第 3 級：學生帳號 (Student)                           │
│  - Google 登入預設身分                                  │
│  - 輸入班級碼綁定教師，或純自學                         │
│  - 只能存取本人進度，無法查看其他同儕紀錄               │
└────────────────────────────────────────────────────────┘
```

### 1. 權限細節定義

* **第 1 級：開發者（唯一管理員）**
  * 系統內部綁定你的 Google UID（亦可在 Firebase Console 手動操作）。
  * 擁有金鑰生成權限：在資料庫 `system_keys/teacher_keys` 新增可使用的金鑰。
* **第 2 級：教師帳號**
  * **金鑰啟用機制**：登入後預設皆為學生身分，必須在個人頁面輸入「開發者配給的金鑰」才能升格為 `teacher`，金鑰一經使用立即標記失效。
  * **資料沙盒隔離（Zero Leaks）**：教師進入主控台時，Firestore 僅查詢 `classrooms` 中 `teacherUid == 本人 UID` 的班級；安全規則嚴格禁止教師查詢非其所屬班級的成員與作答代碼。
* **第 3 級：學生帳號**
  * 註冊無門檻（Google 一鍵登入）。
  * 支援輸入任一合格教師的「班級邀請碼」加入該班。加入後，該班教師即可在其主控台看見該學生的解題進度矩陣與代碼快照。

---

## 五、安全與防弊規範（Security Rules & Cheating Prevention）

### 5.1 雲端安全規則（Firestore Security Rules）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  
    // 輔助判斷函式
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    function isDeveloper() {
      // 綁定開發者專屬 Google UID
      return isAuthenticated() && request.auth.uid == "YOUR_DEVELOPER_GOOGLE_UID";
    }

    // 1. 教師金鑰庫：只有開發者能新增/查詢金鑰，一般人只能在啟用時比對
    match /system_keys/teacher_keys {
      allow read, write: if isDeveloper();
    }
  
    // 2. 使用者檔案：只能本人讀寫，且禁止前端隨意提權
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && request.resource.data.role == "student";
      // 只有原本是 teacher、或由開發者認可的金鑰程序才可變更 role
      allow update: if isOwner(userId);

      // 個人作答明細
      match /submissions/{problemId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) && request.resource.data.codeSnapshot.size() < 50000;
      }
    }

    // 3. 班級集合與嚴格教師隔離
    match /classrooms/{classCode} {
      // 學生加入時需比對邀請碼是否存在
      allow read: if isAuthenticated();
      // 只有合格教師身分才能建立班級
      allow create: if isAuthenticated() && request.resource.data.teacherUid == request.auth.uid;
      // 只有建立該班級的教師才能修改/刪除班級
      allow update, delete: if isAuthenticated() && resource.data.teacherUid == request.auth.uid;

      // 4. 班級成員名單：只有「該班教師」與「學生本人」才能讀取，其他教師完全隔離！
      match /members/{studentUid} {
        allow read: if isOwner(studentUid) 
                    || request.auth.uid == get(/databases/$(database)/documents/classrooms/$(classCode)).data.teacherUid;
        allow write: if isOwner(studentUid);
      }
    }
  }
}
```

### 5.2 誠實機制與防弊措施

1. **程式碼快照留存（Code Snapshot）**：通關時必須回傳實際執行的代碼。
2. **教師後台抽查**：教師可隨時點開學生的任一通過題目，若程式碼不合題意或作弊，可一鍵重設或課堂溝通。
3. **App Check 防護**：啟用 Firebase App Check（reCAPTCHA v3 / Cloudflare Turnstile），阻斷外掛或獨立腳本刷 API。
4. **前端限流防抖（Throttle）**：評測與存檔動作至少間隔 3 秒，避免異常高頻觸發。

---

## 六、預計新增與修改之檔案規劃

### 1. 核心認證與服務模組

* `assets/firebase-config.js` **[NEW]**：Firebase 初始化設定檔。
* `assets/firebase-service.js` **[NEW]**：封裝 Google 登入/登出、狀態監聽、進度存取、localStorage 同步與班級操作邏輯。
* `assets/navbar-auth.js` / `.css` **[NEW]**：全站通用導覽列登入元件（顯示登入按鈕、使用者大頭貼、切換至儀表板選單）。

### 2. 學生與教師專屬頁面

* `dashboard.html` **[NEW]**：學生個人學習儀表板（進度卡片、接續作答、加入班級、個人能力雷達圖）。
* `teacher.html` **[NEW]**：教師班級主控台（建立班級、生成代碼、學生進度矩陣、作答快照調閱抽查）。
* `assets/dashboard.css` **[NEW]**：儀表板視覺風格（延續 SkillLab 暗色 Dracula / 現代化卡片主題）。

### 3. 現有頁面無縫對接

* `index.html` **[MODIFY]**：導覽列加入登入狀態顯示，登入後首頁入口提示「前往個人儀表板」。
* `judge.html` **[MODIFY]**：引入 `firebase-service.js`，在測資全數通過（AC）時，非同步呼叫 `saveSubmission()` 寫入雲端。
* `beginner.html` **[MODIFY]**：關卡完成時同步回傳進度至雲端。

---

## 七、分階段實施路線（Roadmap）

```text
階段一：環境與認證底座建立
 └── 建立 Firebase 專案設定檔與 SDK 封裝 (firebase-service.js)
 └── 首頁與導覽列通用登入元件 (navbar-auth.js)

階段二：學生個人儀表板開發
 └── 建立 dashboard.html 頁面佈局與資料動態拉取
 └── 本地 localStorage 進度自動對齊與初次上傳雲端機制

階段三：解題回傳與雲端串接
 └── judge.html 與 beginner.html 在 AC 成功後自動寫入 Firestore
 └── 儀表板即時數據連動

階段四：教師主控台開發
 └── 建立 teacher.html、班級建立與邀請代碼機制
 └── 學生進度矩陣表格與「點擊檢視程式碼快照」功能

階段五：安全規則配置與上線驗收
 └── 部署 Firestore Security Rules
 └── 全端測試：學生加入班級、解題、即時更新、教師抽查
```

---

## 八、流量暴增止損與優雅降級機制（Cost Stop-Loss & Fallback）

為了確保非營利營運下的**「零財務風險」**與**「服務不中斷」**，系統建置以下三重止損機制：

### 1. 物理級硬性止損（維持 Firebase Spark 免費方案）

* **不綁定信用卡**：專案設定維持在 Spark 方案，未綁定信用卡的情況下，Google 技術與法律上皆無法扣款。
* **配額耗盡行為**：當日超過 50,000 次讀取或 20,000 次寫入時，Firebase 伺服器會返回 `RESOURCE_EXHAUSTED` (HTTP 429) 拒絕後續雲端寫入，並於隔日台灣時間 15:00（午夜 PST）自動重置，絕不產生額外帳單。

### 2. 架構級優雅降級（Fallback to LocalStorage）

* **判題完全不受影響**：由於 Python/Scratch 評測完全在學生瀏覽器端運行（Pyodide / Web Worker），無伺服器計算依賴。
* **無縫退回本機儲存**：前端代碼加入 `try/catch` 容災機制。當偵測到 Firebase 雲端配額耗盡時，自動改為儲存在本機 `localStorage`，並跳出友善提示：
  > 「💡 今日雲端同步已達上限，目前進度已為您安全儲存在本機！不影響繼續練習與正常上課。」
  >
* 待次日雲端配額重置後，學生再次登入時會自動將本地進度補傳至雲端。

### 3. 防惡意刷量機制（Firebase App Check & 前端限流）

* **啟用 Firebase App Check**：搭配 Google reCAPTCHA v3，阻斷未授權的 Python 爬蟲腳本或 Postman 惡意消耗免費配額。
* **防抖與請求冷卻（Debounce）**：同一題目評測與存檔動作至少間隔 3 秒，避免異常高頻重複送出。

---

## 九、驗證計畫 (Verification Plan)

### 1. 手動驗證流程

1. **訪客自學測試**：未登入狀態下做題，確認 `localStorage` 正常運作，無報錯。
2. **Google 登入測試**：點擊登入彈出 Google 視窗，登入後導航列正確顯示大頭貼與名字，原 `localStorage` 通關進度順利同步至 Firestore。
3. **學生儀表板測試**：進入 `dashboard.html`，檢查講義關卡與題庫通過數統計是否正確，點擊題目能正確帶參數回到編輯器。
4. **即時作答回傳測試**：在 `judge.html` 完成任一題並獲得 AC，檢查 Firestore `submissions` 是否即時寫入該題與程式碼快照。
5. **班級連動測試**：
   - 使用教師帳號建立班級取得代碼。
   - 學生帳號在儀表板輸入代碼加入。
   - 教師主控台即時刷新出該學生，且能點開查看其剛剛通過的題目的程式碼快照。
6. **安全隔離測試**：測試學生帳號無法跨權限讀取非所屬資料，且無法自行將 `role` 改為 `teacher`。
7. **斷網 / 配額耗盡降級測試**：模擬 Firebase 寫入失敗時，確認系統能平順退回 `localStorage` 且介面顯示友善提示。

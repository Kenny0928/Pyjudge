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
> - 每日免費額度：50,000 次讀取、20,000 次寫入、1 GB 儲存空間。
> - 認證免費額度：每月 50,000 位活躍使用者 (MAU)。
> - 評測運算持續保留在學生瀏覽器端（Pyodide），因此雲端消耗量極低，足以應付數百至上千名學生課堂使用。

> **向下相容與漸進式同步**
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

---

## 四、安全與防弊規範（Security Rules & Cheating Prevention）

### 4.1 雲端安全規則（Firestore Security Rules）
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 輔助判斷
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // 使用者檔案：只能本人讀寫，且禁止自我提權為 teacher
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) 
                    && request.resource.data.role == "student";
      allow update: if isOwner(userId)
                    && request.resource.data.role == resource.data.role;

      // 個人作答明細
      match /submissions/{problemId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) 
                     && request.resource.data.codeSnapshot.size() < 50000;
      }
    }

    // 班級集合
    match /classrooms/{classCode} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.teacherUid == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.teacherUid == request.auth.uid;

      // 班級成員名單
      match /members/{memberId} {
        allow read: if isAuthenticated();
        allow write: if isOwner(memberId) || request.auth.uid == get(/databases/$(database)/documents/classrooms/$(classCode)).data.teacherUid;
      }
    }
  }
}
```

### 4.2 誠實機制與防弊措施
1. **程式碼快照留存（Code Snapshot）**：通關時必須回傳實際執行的代碼。
2. **教師後台抽查**：教師可隨時點開學生的任一通過題目，若程式碼不合題意或作弊，可一鍵重設或課堂溝通。
3. **App Check 防護**：啟用 Firebase App Check（reCAPTCHA v3 / Cloudflare Turnstile），阻斷外掛或獨立腳本刷 API。
4. **前端限流防抖（Throttle）**：評測與存檔動作至少間隔 3 秒，避免異常高頻觸發。

---

## 五、預計新增與修改之檔案規劃

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

## 六、分階段實施路線（Roadmap）

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


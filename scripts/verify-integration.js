/* Manual browser E2E: serve repository at http://127.0.0.1:8081 and click Run tests.
 * All application code, editor frames, message transport and Pyodide are real.
 * There are no synthetic judge results and no runtime globals are inspected.
 */
(() => {
  'use strict';
  const button = document.getElementById('run');
  const summary = document.getElementById('summary');
  const results = document.getElementById('results');
  const pages = document.getElementById('pages');
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const limit = (promise, label, ms = 180000) => {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(label + ' 逾時')), ms);
    })]).finally(() => clearTimeout(timer));
  };
  async function until(check, label, ms = 45000) {
    const start = performance.now();
    while (performance.now() - start < ms) {
      const value = check();
      if (value) return value;
      await pause(80);
    }
    throw new Error(label + ' 逾時');
  }
  async function loadPage(name) {
    pages.replaceChildren();
    const frame = document.createElement('iframe');
    frame.title = name + ' 實際測試頁面';
    const loaded = new Promise((resolve, reject) => {
      frame.onload = resolve;
      frame.onerror = () => reject(new Error(name + ' 無法載入'));
    });
    frame.src = '../' + name;
    pages.append(frame);
    await limit(loaded, name + ' 頁面載入', 90000);
    await until(() => frame.contentDocument.querySelector('.CodeMirror')?.CodeMirror, name + ' CodeMirror 就緒');
    return frame.contentWindow;
  }
  function cm(container) {
    const value = container.querySelector('.CodeMirror')?.CodeMirror;
    assert(value, '找不到 CodeMirror 編輯器');
    return value;
  }
  async function changeLanguage(container, language) {
    const select = container.querySelector('.programming-toolbar select');
    assert(select, '找不到作答方式選單');
    await until(() => !select.disabled, '作答方式選單啟用');
    select.value = language;
    select.dispatchEvent(new container.ownerDocument.defaultView.Event('change', { bubbles: true }));
    await until(() => {
      const status = container.querySelector('.programming-status');
      const retry = container.querySelector('.programming-toolbar button');
      if (retry && !retry.hidden) throw new Error('積木初始化失敗：' + status.textContent);
      return select.value === language && status.textContent === '草稿自動保存';
    }, language + ' 編輯器就緒', 65000);
    if (language === 'blockly') {
      const frame = container.querySelector('iframe[title="Blockly 積木編輯器"]');
      await until(() => frame?.contentDocument?.querySelector('#import'), 'Blockly 匯入工具就緒');
      return frame.contentWindow;
    }
    if (language === 'scratch') return container.querySelector('iframe[title="Scratch 積木編輯器"]').contentWindow;
  }
  async function importScratch(win, fixture) {
    const response = await fetch('fixtures/' + fixture);
    assert(response.ok, 'Scratch 測試作品載入失敗');
    const transfer = new win.DataTransfer();
    transfer.items.add(new win.File([await response.text()], fixture, {type: 'application/json'}));
    const input = win.document.getElementById('file');
    input.files = transfer.files;
    input.dispatchEvent(new win.Event('change', {bubbles: true}));
    await until(() => {
      const status = win.document.getElementById('status').textContent;
      if (status.startsWith('匯入失敗')) throw new Error(status);
      return status === '已匯入 ' + fixture;
    }, 'Scratch 實際作品匯入');
  }
  async function importBlocks(blockWindow, fixture) {
    const response = await fetch('fixtures/' + fixture);
    assert(response.ok, '測試積木檔載入失敗：' + fixture);
    const text = await response.text();
    const input = blockWindow.document.getElementById('import');
    // A real File/FileList built only from the checked-in fixture. This never
    // opens a personal-file picker or accesses the user's filesystem.
    const transfer = new blockWindow.DataTransfer();
    transfer.items.add(new blockWindow.File([text], fixture, { type: 'application/json' }));
    input.files = transfer.files;
    input.dispatchEvent(new blockWindow.Event('change', { bubbles: true }));
    await until(() => {
      const message = blockWindow.document.getElementById('message').textContent;
      if (message.startsWith('匯入失敗')) throw new Error(message);
      return message === '積木已匯入並保存。';
    }, 'Blockly 實際檔案匯入');
  }
  function preview(blockWindow) {
    const document = blockWindow.document;
    if (document.getElementById('preview').hidden) document.getElementById('preview-toggle').click();
    return document.getElementById('preview').textContent;
  }
  async function openProblem(win, id) {
    await until(() => typeof win.openProblem === 'function', 'Judge 開題函式');
    await limit(win.openProblem(id), '開啟題目 ' + id, 75000);
    assert(win.document.getElementById('p-title').textContent.startsWith(String(id).padStart(3, '0') + '.'), '題目未正確切換');
    await until(() => !win.document.getElementById('submit-btn').disabled, 'Judge 提交按鈕啟用');
  }
  async function judge(win, verdict) {
    await limit(win.submitCode(), 'Judge ' + verdict + ' 評測');
    const panel = win.document.getElementById('results-panel');
    assert(panel.querySelector('.verdict-' + verdict), '預期 ' + verdict + '，實際：' + panel.textContent.trim());
    const chips = [...panel.querySelectorAll('.tc-chip')];
    assert(chips.length === 8, '題目 014 應完整執行 8 組測資，實際：' + chips.length);
    assert(chips.every(chip => chip.classList.contains('tc-' + verdict)), '並非全部測資得到 ' + verdict);
    assert(!win.document.getElementById('submit-btn').disabled, '評測後未恢復提交按鈕');
  }
  function beginnerContainer(win, key) {
    return key === 'core' ? win.document.querySelector('#programming-editor').parentElement : win.document.querySelector('article[data-task="' + key + '"]');
  }
  async function checkLesson(win, key) {
    await limit(win.checkAnswer(key), '初階 ' + key + ' 執行與評測');
    const result = key === 'core' ? win.document.getElementById('test-results') : win.document.querySelector('[data-result="' + key + '"]');
    assert(result.querySelector('.result-banner.success'), '初階 ' + key + ' 未通過：' + result.textContent.trim());
    assert(!win.document.getElementById('run-button').disabled, '初階執行完成後按鈕仍停用');
  }
  function storageKeys() {
    const keys = ['pyjudge_language', 'solved', 'pyjudge_beginner_completed', 'pyjudge_beginner_task_progress_v2'];
    for (const id of [14, 15]) for (const suffix of ['', '_blockly', '_scratch']) keys.push('pyjudge_code_' + id + suffix);
    for (const id of [1, 2]) {
      keys.push('pyjudge_beginner_draft_' + id);
      for (const key of ['core', 'a', 'b']) for (const suffix of ['', '_blockly', '_scratch']) keys.push('pyjudge_beginner_draft_' + id + '_' + key + suffix);
    }
    return keys;
  }
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname) || location.port !== '8081') {
      summary.textContent = '請依上方指示，以本機測試專用的 8081 連接埠開啟。';
      return;
    }
    button.disabled = true;
    results.replaceChildren();
    const records = [];
    const backups = new Map(storageKeys().map(key => [key, localStorage.getItem(key)]));
    async function test(name, action) {
      const row = document.createElement('li');
      row.className = 'running'; row.textContent = 'RUN ' + name; results.append(row);
      summary.textContent = '執行中：' + name;
      try {
        await action(); row.className = 'pass'; row.textContent = 'PASS ' + name;
        records.push({ name, passed: true });
        return true;
      } catch (error) {
        row.className = 'fail'; row.textContent = 'FAIL ' + name + '\n' + (error.stack || error.message || String(error));
        records.push({ name, passed: false, error: error.message || String(error) });
        return false;
      }
    }
    let judgeWindow;
    let beginnerWindow;
    try {
      backups.forEach((_, key) => localStorage.removeItem(key));
      localStorage.setItem('pyjudge_language', 'python');
      const loaded = await test('載入真正 Judge 頁面與題目 014', async () => {
        judgeWindow = await loadPage('judge.html');
        await openProblem(judgeWindow, 14);
      });
      if (!loaded) throw new Error('Judge 頁面載入失敗，後續測試無法執行。');
      const pythonSolution = 'assert "test_seen" not in globals(), "跨測資全域變數污染"\ntest_seen = True\nn = int(input())\nprint(n * (n + 1) // 2)';
      await test('Python：014 全部 8 組 AC，且每組測資使用新的全域變數', async () => {
        cm(judgeWindow.document).setValue(pythonSolution);
        await judge(judgeWindow, 'AC');
      });
      await test('Python：錯誤答案全部 WA', async () => {
        cm(judgeWindow.document).setValue('print(-999)');
        await judge(judgeWindow, 'WA');
      });
      await test('Python：例外全部 RE', async () => {
        cm(judgeWindow.document).setValue('raise ValueError("integration test")');
        await judge(judgeWindow, 'RE');
      });
      await test('Python：RE 後仍能正常重新執行並全部 AC', async () => {
        cm(judgeWindow.document).setValue(pythonSolution);
        await judge(judgeWindow, 'AC');
      });
      let generated;
      const blocksLoaded = await test('Blockly：經真正檔案匯入介面載入 014 範例，8 組全部 AC', async () => {
        const blockWindow = await changeLanguage(judgeWindow.document.getElementById('programming-editor'), 'blockly');
        await importBlocks(blockWindow, 'blockly-sum-range.json');
        generated = preview(blockWindow);
        assert(generated.includes('print('), 'Blockly 未產生 Python 程式');
        await judge(judgeWindow, 'AC');
      });
      if (blocksLoaded) await test('Judge：切題與切語言後各自草稿保留，Blockly 回來仍全部 AC', async () => {
        await openProblem(judgeWindow, 15);
        await changeLanguage(judgeWindow.document.getElementById('programming-editor'), 'python');
        cm(judgeWindow.document).setValue('print("question 15 draft")');
        await openProblem(judgeWindow, 14);
        assert(cm(judgeWindow.document).getValue() === pythonSolution, '題目 014 Python 草稿被覆蓋');
        const blockWindow = await changeLanguage(judgeWindow.document.getElementById('programming-editor'), 'blockly');
        assert(preview(blockWindow) === generated, '切題後 Blockly 程式不同');
        assert(localStorage.getItem('pyjudge_code_15') === 'print("question 15 draft")', '题目 015 草稿被覆蓋');
        await judge(judgeWindow, 'AC');
      });
      await test('Scratch：014 作品匯入後全部 8 組 AC，切題還原後仍通過', async () => {
        const scratchWindow = await changeLanguage(judgeWindow.document.getElementById('programming-editor'), 'scratch');
        await importScratch(scratchWindow, 'scratch-sum-range.json');
        await judge(judgeWindow, 'AC');
        await openProblem(judgeWindow, 15);
        await openProblem(judgeWindow, 14);
        await judge(judgeWindow, 'AC');
      });
      await changeLanguage(judgeWindow.document.getElementById('programming-editor'), 'python');
      const beginnerLoaded = await test('初階：核心題、A、B 各有 Python／Blockly／Scratch 選單', async () => {
        beginnerWindow = await loadPage('beginner.html#lesson-1');
        await until(() => beginnerWindow.document.querySelectorAll('.programming-toolbar select').length === 3 && !beginnerWindow.document.getElementById('run-button').disabled, '初階三個編輯器就緒');
        for (const key of ['core', 'a', 'b']) {
          const select = beginnerContainer(beginnerWindow, key).querySelector('.programming-toolbar select');
          assert(['python', 'blockly', 'scratch'].every(value => [...select.options].some(option => option.value === value)), key + ' 遺漏語言');
        }
      });
      if (!beginnerLoaded) throw new Error('初階講義載入失敗。');
      await test('初階核心題：Python 實際執行通過', async () => {
        cm(beginnerContainer(beginnerWindow, 'core')).setValue('print("我是小幫手")\nprint("準備完成")');
        await checkLesson(beginnerWindow, 'core');
      });
      await test('初階變體 A：Blockly 匯入與實際執行通過', async () => {
        const blockWindow = await changeLanguage(beginnerContainer(beginnerWindow, 'a'), 'blockly');
        await importBlocks(blockWindow, 'blockly-beginner-1-a.json');
        await checkLesson(beginnerWindow, 'a');
      });
      await test('初階變體 B：Python 實際執行通過，核心與 A 未被改動', async () => {
        cm(beginnerContainer(beginnerWindow, 'b')).setValue('print("***")\nprint("**")\nprint("*")');
        await checkLesson(beginnerWindow, 'b');
        const progress = JSON.parse(localStorage.getItem('pyjudge_beginner_task_progress_v2'));
        assert(['core', 'a', 'b'].every(key => progress[1][key] === true), '未分別記錄核心、A、B 完成狀態');
        assert(JSON.parse(localStorage.getItem('pyjudge_beginner_completed')).includes(1), '未記錄第一關完成');
        assert(cm(beginnerContainer(beginnerWindow, 'core')).getValue() === 'print("我是小幫手")\nprint("準備完成")', '核心 Python 草稿被變體覆蓋');
        assert(beginnerContainer(beginnerWindow, 'a').querySelector('select').value === 'blockly', '變體 A 作答方式被改動');
      });
      await test('初階核心題：Scratch 中文作品通過，Python 草稿仍保留', async () => {
        const container = beginnerContainer(beginnerWindow, 'core');
        const scratchWindow = await changeLanguage(container, 'scratch');
        await importScratch(scratchWindow, 'scratch-beginner-1-core.json');
        await checkLesson(beginnerWindow, 'core');
        await changeLanguage(container, 'python');
        assert(cm(container).getValue() === 'print("我是小幫手")\nprint("準備完成")', 'Scratch 覆蓋 Python 草稿');
      });
    } catch (error) {
      await test('測試流程前提', () => { throw error; });
    } finally {
      // Removing the actual application frames first prevents later autosaves
      // from replacing the restored values. Never clear unrelated storage.
      pages.replaceChildren();
      await pause(150);
      await test('還原本次觸及的草稿與通關紀錄', () => {
        backups.forEach((value, key) => value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value));
        backups.forEach((value, key) => assert(localStorage.getItem(key) === value, '還原失敗：' + key));
      });
      const failed = records.filter(record => !record.passed).length;
      summary.textContent = `${records.length - failed} passed; ${failed} failed`;
      summary.className = failed ? 'fail' : 'pass';
      window.integrationResults = records;
      button.disabled = false;
    }
  });
})();

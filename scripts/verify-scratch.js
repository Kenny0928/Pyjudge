/* Browser integration tests: serve the repo, open scripts/verify-scratch.html. */
(() => {
  'use strict';
  const frame = document.getElementById('scratch');
  const summary = document.getElementById('summary');
  const results = document.getElementById('results');
  const rerun = document.getElementById('rerun');
  const pending = new Map();
  let sequence = 0;
  let ready = false;
  let running = false;
  let changedState = null;
  let base;
  function rpc(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error(method + ' 回應逾時')); }, 60000);
      pending.set(id, {resolve, reject, timeout});
      frame.contentWindow.postMessage({channel: 'skilllab-editor', id, method, params}, location.origin);
    });
  }
  function assert(value, message) { if (!value) throw new Error(message); }
  function cleanProject() {
    const project = JSON.parse(JSON.stringify(base.project));
    project.targets[0].variables = {a: ['a', 0], counter: ['counter', 0]};
    project.targets[0].lists = {};
    project.targets[0].blocks = {
      hat: {opcode: 'event_whenflagclicked', next: null, parent: null, inputs: {}, fields: {}, shadow: false, topLevel: true, x: 50, y: 50}
    };
    return project;
  }
  function add(project, id, opcode, parent, next = null, inputs = {}, fields = {}) {
    project.targets[0].blocks[id] = {opcode, parent, next, inputs, fields, shadow: false, topLevel: false};
  }
  const text = value => [1, [10, String(value)]];
  const number = value => [1, [4, String(value)]];
  const ref = id => [2, id];
  function hello() {
    const p = cleanProject(); p.targets[0].blocks.hat.next = 'say';
    add(p, 'say', 'looks_say', 'hat', null, {MESSAGE: text('Hello, World!')});
    return p;
  }
  function sum() {
    const p = cleanProject(); p.targets[0].blocks.hat.next = 'askA';
    add(p, 'askA', 'sensing_askandwait', 'hat', 'saveA', {QUESTION: text('#token')});
    add(p, 'saveA', 'data_setvariableto', 'askA', 'askB', {VALUE: ref('answerA')}, {VARIABLE: ['a', 'a']});
    add(p, 'answerA', 'sensing_answer', 'saveA');
    add(p, 'askB', 'sensing_askandwait', 'saveA', 'say', {QUESTION: text('#token')});
    add(p, 'say', 'looks_say', 'askB', null, {MESSAGE: ref('plus')});
    add(p, 'plus', 'operator_add', 'say', null, {NUM1: ref('readA'), NUM2: ref('answerB')});
    add(p, 'readA', 'data_variable', 'plus', null, {}, {VARIABLE: ['a', 'a']});
    add(p, 'answerB', 'sensing_answer', 'plus');
    return p;
  }
  function loop() {
    const p = cleanProject(); p.targets[0].blocks.hat.next = 'repeat';
    add(p, 'repeat', 'control_repeat', 'hat', 'say', {TIMES: number(3), SUBSTACK: ref('increment')});
    add(p, 'increment', 'data_changevariableby', 'repeat', null, {VALUE: number(1)}, {VARIABLE: ['counter', 'counter']});
    add(p, 'say', 'looks_say', 'repeat', null, {MESSAGE: ref('readCounter')});
    add(p, 'readCounter', 'data_variable', 'say', null, {}, {VARIABLE: ['counter', 'counter']});
    return p;
  }
  function lineEcho() {
    const p = cleanProject(); p.targets[0].blocks.hat.next = 'ask';
    add(p, 'ask', 'sensing_askandwait', 'hat', 'say', {QUESTION: text('這個提示不能出現在輸出')});
    add(p, 'say', 'looks_say', 'ask', null, {MESSAGE: ref('answer')});
    add(p, 'answer', 'sensing_answer', 'say');
    return p;
  }
  function listSum() {
    const p = cleanProject(); p.targets[0].lists = {items: ['items', []]};
    p.targets[0].blocks.hat.next = 'addFirst';
    add(p, 'addFirst', 'data_addtolist', 'hat', 'addSecond', {ITEM: number(7)}, {LIST: ['items', 'items']});
    add(p, 'addSecond', 'data_addtolist', 'addFirst', 'say', {ITEM: number(5)}, {LIST: ['items', 'items']});
    add(p, 'say', 'looks_say', 'addSecond', null, {MESSAGE: ref('plus')});
    add(p, 'plus', 'operator_add', 'say', null, {NUM1: ref('first'), NUM2: ref('second')});
    add(p, 'first', 'data_itemoflist', 'plus', null, {INDEX: number(1)}, {LIST: ['items', 'items']});
    add(p, 'second', 'data_itemoflist', 'plus', null, {INDEX: number(2)}, {LIST: ['items', 'items']});
    return p;
  }
  function procedure() {
    const p = cleanProject(); p.targets[0].blocks.hat.next = 'call';
    const mutation = {tagName: 'mutation', children: [], proccode: 'double %s', argumentids: '["x"]', argumentnames: '["x"]', argumentdefaults: '[""]', warp: 'false'};
    add(p, 'call', 'procedures_call', 'hat', null, {x: number(21)});
    p.targets[0].blocks.call.mutation = {...mutation};
    add(p, 'definition', 'procedures_definition', null, 'say', {custom_block: ref('prototype')});
    Object.assign(p.targets[0].blocks.definition, {topLevel: true, x: 300, y: 50});
    add(p, 'prototype', 'procedures_prototype', 'definition', null, {x: ref('argumentLabel')});
    Object.assign(p.targets[0].blocks.prototype, {shadow: true, mutation: {...mutation}});
    add(p, 'argumentLabel', 'argument_reporter_string_number', 'prototype', null, {}, {VALUE: ['x', null]});
    p.targets[0].blocks.argumentLabel.shadow = true;
    add(p, 'say', 'looks_say', 'definition', null, {MESSAGE: ref('product')});
    add(p, 'product', 'operator_multiply', 'say', null, {NUM1: ref('argument'), NUM2: number(2)});
    add(p, 'argument', 'argument_reporter_string_number', 'product', null, {}, {VALUE: ['x', null]});
    return p;
  }
  async function execute(project, input = '', timeLimit = 1500) {
    return rpc('run', {project, input, timeLimit});
  }
  async function expectOutput(project, input, expected) {
    const result = await execute(project, input);
    assert(!result.errout, result.errout);
    assert(result.output === expected, '預期 ' + JSON.stringify(expected) + '，得到 ' + JSON.stringify(result.output));
    assert(Number.isFinite(result.elapsed), 'elapsed 應為有限數字');
  }
  async function runTests() {
    if (!ready || running) return;
    running = true; rerun.disabled = true; results.replaceChildren(); summary.textContent = '測試中…';
    let passed = 0;
    let failed = 0;
    const test = async (name, body) => {
      const item = document.createElement('li'); item.textContent = '執行中：' + name; results.append(item);
      try { await body(); passed++; item.className = 'pass'; item.textContent = 'PASS — ' + name; }
      catch (error) { failed++; item.className = 'fail'; item.textContent = 'FAIL — ' + name + '\n' + error.message; }
    };
    try {
      await rpc('init', {state: null}); base = await rpc('snapshot');
      await test('標準 Scratch Hello, World!', () => expectOutput(hello(), '', 'Hello, World!\n'));
      await test('同一行 #token A+B，含負數與多個空白', () => expectOutput(sum(), '  -12   35\n', '23\n'));
      await test('一般詢問讀一整行；提示不列入標準輸出', () => expectOutput(lineEcho(), 'hello world\nsecond\n', 'hello world\n'));
      await test('Scratch 迴圈與變數，每個測資獨立重置', async () => {
        const p = loop(); await expectOutput(p, '', '3\n'); await expectOutput(p, '', '3\n');
      });
      await test('清單新增與第 1、2 項讀取，每次執行清單獨立', async () => {
        const p = listSum(); await expectOutput(p, '', '12\n'); await expectOutput(p, '', '12\n');
      });
      await test('自訂積木參數、呼叫及載入後執行', async () => {
        await expectOutput(procedure(), '', '42\n');
        await rpc('init', {state: {project: procedure(), assets: base.assets}});
        await expectOutput((await rpc('snapshot')).project, '', '42\n');
      });
      await test('資料不足回報錯誤而非等待人工回答', async () => {
        const result = await execute(sum(), '1\n'); assert(/輸入不足/.test(result.errout), JSON.stringify(result));
      });
      await test('無窮迴圈被中止並回傳 TLE；之後仍可執行', async () => {
        const p = cleanProject(); p.targets[0].blocks.hat.next = 'forever'; add(p, 'forever', 'control_forever', 'hat');
        const result = await execute(p, '', 150); assert(result.errout.startsWith('TLE'), JSON.stringify(result));
        await expectOutput(hello(), '', 'Hello, World!\n');
      });
      await test('原生積木編輯事件會同步 Scratch VM 與草稿', async () => {
        await rpc('reset');
        const B = frame.contentWindow.Blockly;
        const ws = B.getMainWorkspace();
        const hat = ws.getAllBlocks().find(item => item.type === 'event_whenflagclicked');
        const xml = B.Xml.textToDom('<xml><block type="looks_say"><value name="MESSAGE"><shadow type="text"><field name="TEXT">edited</field></shadow></value></block></xml>');
        B.Xml.domToWorkspace(xml, ws);
        const say = ws.getAllBlocks().find(item => item.type === 'looks_say');
        hat.nextConnection.connect(say.previousConnection);
        changedState = null;
        const state = await rpc('snapshot');
        assert(changedState && changedState.project, 'snapshot 應同時推送 change 事件');
        await expectOutput(state.project, '', 'edited\n');
      });
      await test('Scratch 專案載入、快照與執行保持一致', async () => {
        await rpc('init', {state: {project: sum(), assets: base.assets}});
        const state = await rpc('snapshot'); await expectOutput(state.project, '7 8\n', '15\n');
      });
      await test('.sb3 真正編碼／解碼保留程式及造型素材', async () => {
        const buffer = await rpc('exportSb3');
        assert(buffer instanceof ArrayBuffer && buffer.byteLength > 100, 'exportSb3 必須產生 ZIP 位元資料');
        const zip = await frame.contentWindow.JSZip.loadAsync(new frame.contentWindow.Uint8Array(buffer));
        const stored = JSON.parse(await zip.file('project.json').async('string'));
        assert(zip.file(stored.targets[0].costumes[0].md5ext), '.sb3 應包含背景素材');
        await rpc('reset'); await rpc('importSb3', {data: buffer});
        const state = await rpc('snapshot'); await expectOutput(state.project, '30 12\n', '42\n');
        assert(Object.keys(state.assets).length > 0, '素材應保留在草稿');
      });
      await test('損毀 .sb3 和無效草稿不覆寫現有程式', async () => {
        let rejected = false;
        try { await rpc('importSb3', {data: new Uint8Array([1, 2, 3]).buffer}); } catch (_) { rejected = true; }
        assert(rejected, '損毀 .sb3 應拒絕');
        rejected = false;
        try { await rpc('init', {state: {invalid: true}}); } catch (_) { rejected = true; }
        assert(rejected, '無效草稿應拒絕');
        await expectOutput((await rpc('snapshot')).project, '2 3\n', '5\n');
      });
      await test('不支援的 Scratch 擴充不會載入或執行', async () => {
        const p = hello(); p.extensions = ['pen'];
        const result = await execute(p); assert(/擴充/.test(result.errout), JSON.stringify(result));
      });
      await test('重設保留單一綠旗開始積木', async () => {
        await rpc('reset'); const state = await rpc('snapshot');
        const blocks = Object.values(state.project.targets[0].blocks);
        assert(blocks.length === 1 && blocks[0].opcode === 'event_whenflagclicked', '重設後應只有綠旗積木');
      });
    } catch (error) {
      failed++; const item = document.createElement('li'); item.className = 'fail'; item.textContent = 'FAIL — 測試初始化：' + error.message; results.append(item);
    } finally {
      summary.textContent = passed + ' passed, ' + failed + ' failed';
      summary.className = failed ? 'fail' : 'pass';
      document.body.dataset.testStatus = failed ? 'failed' : 'passed';
      running = false; rerun.disabled = false;
    }
  }
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.origin !== location.origin || event.data?.channel !== 'skilllab-editor') return;
    const data = event.data;
    if (data.event === 'ready') { ready = true; runTests(); }
    else if (data.event === 'change') changedState = data.state;
    else if (data.event === 'error') { summary.textContent = 'Scratch 載入失敗：' + data.error; summary.className = 'fail'; }
    else if (pending.has(data.id)) {
      const request = pending.get(data.id); pending.delete(data.id); clearTimeout(request.timeout);
      if (data.error) request.reject(new Error(data.error)); else request.resolve(data.result);
    }
  });
  rerun.onclick = runTests;
  frame.src = '../assets/scratch-editor.html';
})();

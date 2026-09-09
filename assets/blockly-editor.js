/* Blockly 12.3.1 + the official Python generator. */
(() => {
  'use strict';
  const generator = python.pythonGenerator;
  const order = python.Order;
  const send = data => parent.postMessage({ channel: 'skilllab-editor', ...data }, location.origin === 'null' ? '*' : location.origin);
  const message = document.getElementById('message');
  let loading = true;
  const inputTypes = [
    ['judge_read_line', '讀取下一行文字', 'String', '_skilllab_line()'],
    ['judge_read_token', '讀取下一個文字（空白分隔）', 'String', '_skilllab_token()'],
    ['judge_read_number', '讀取下一個數值（空白分隔）', 'Number', 'float(_skilllab_token())'],
    ['judge_read_integer', '讀取下一個整數（空白分隔）', 'Number', 'int(_skilllab_token())'],
    ['judge_read_all', '讀取剩下所有文字', 'String', '_skilllab_stream.read()']
  ];
  const ioDefinitions = `import io as _skilllab_io\nimport sys as _skilllab_sys\n_skilllab_stream = _skilllab_io.StringIO(_skilllab_sys.stdin.read(), newline=None)\ndef _skilllab_line():\n    line = _skilllab_stream.readline()\n    if line == '':\n        raise EOFError('題目輸入已讀完')\n    return line.rstrip('\\n').rstrip('\\r')\ndef _skilllab_token():\n    token = ''\n    while True:\n        char = _skilllab_stream.read(1)\n        if not char:\n            if token: return token\n            raise EOFError('題目輸入已讀完')\n        if char.isspace():\n            if token: return token\n        else:\n            token += char\n`;
  Blockly.defineBlocksWithJsonArray([
    ...inputTypes.map(([type, message0, output]) => ({ type, message0, output, colour: 190, tooltip: '由本題測資讀取，不會跳出輸入視窗。' })),
    { type: 'judge_print', message0: '輸出 %1 %2', args0: [{ type: 'input_value', name: 'VALUE' }, { type: 'field_dropdown', name: 'END', options: [['並換行', 'NEWLINE'], ['後接空格', 'SPACE'], ['不換行', 'NONE']] }], previousStatement: null, nextStatement: null, colour: 190 },
    { type: 'judge_number', message0: '轉成 %1 %2', args0: [{ type: 'field_dropdown', name: 'KIND', options: [['整數', 'int'], ['小數', 'float']] }, { type: 'input_value', name: 'VALUE' }], output: 'Number', colour: 230 }
  ]);
  inputTypes.forEach(([type, , , code]) => {
    generator.forBlock[type] = () => { generator.definitions_['skilllab_io'] = ioDefinitions; return [code, order.FUNCTION_CALL]; };
  });
  generator.forBlock.judge_print = block => {
    const value = generator.valueToCode(block, 'VALUE', order.NONE) || "''";
    const end = { NEWLINE: '\\n', SPACE: ' ', NONE: '' }[block.getFieldValue('END')];
    return `print(${value}, end='${end}')\n`;
  };
  generator.forBlock.judge_number = block => [`${block.getFieldValue('KIND')}(${generator.valueToCode(block, 'VALUE', order.NONE) || '0'})`, order.FUNCTION_CALL];
  // Blockly's stock print block is retained for imported projects. Prompt blocks
  // deliberately read judge stdin, never an interactive browser prompt.
  ['text_prompt_ext', 'text_prompt'].forEach(type => {
    generator.forBlock[type] = block => {
      generator.definitions_['skilllab_io'] = ioDefinitions;
      return [block.getFieldValue('TYPE') === 'NUMBER' ? 'float(_skilllab_line())' : '_skilllab_line()', order.FUNCTION_CALL];
    };
  });
  const block = type => ({ kind: 'block', type });
  const category = (name, colour, types) => ({ kind: 'category', name, colour, contents: types.map(block) });
  const workspace = Blockly.inject('workspace', {
    toolbox: { kind: 'categoryToolbox', contents: [
      category('輸入／輸出', '#167a88', ['judge_read_integer', 'judge_read_number', 'judge_read_token', 'judge_read_line', 'judge_read_all', 'judge_print', 'judge_number']),
      category('判斷', '#5568a9', ['controls_if', 'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean', 'logic_ternary']),
      category('迴圈', '#408f5a', ['controls_repeat_ext', 'controls_whileUntil', 'controls_for', 'controls_forEach', 'controls_flow_statements']),
      category('數學', '#5663b0', ['math_number', 'math_arithmetic', 'math_modulo', 'math_single', 'math_round', 'math_number_property', 'math_on_list', 'math_constrain']),
      category('文字', '#258878', ['text', 'text_join', 'text_append', 'text_length', 'text_isEmpty', 'text_indexOf', 'text_charAt', 'text_getSubstring', 'text_changeCase', 'text_trim', 'text_count', 'text_replace', 'text_reverse']),
      category('清單', '#805da8', ['lists_create_with', 'lists_repeat', 'lists_length', 'lists_isEmpty', 'lists_indexOf', 'lists_getIndex', 'lists_setIndex', 'lists_getSublist', 'lists_split', 'lists_sort', 'lists_reverse']),
      { kind: 'category', name: '變數', custom: 'VARIABLE', colour: '#a05f22' },
      { kind: 'category', name: '函式', custom: 'PROCEDURE', colour: '#975a97' }
    ] },
    media: 'vendor/blockly/media/', trashcan: true,
    zoom: { controls: true, wheel: true, startScale: 0.85, maxScale: 1.5, minScale: 0.45 },
    move: { scrollbars: true, drag: true, wheel: true }
  });
  const serialize = () => ({ format: 'skilllab-blockly', version: 1, workspace: Blockly.serialization.workspaces.save(workspace) });
  const changed = () => { if (!loading) { send({ event: 'change', state: serialize() }); updatePreview(); } };
  function load(state) {
    if (state && (state.format !== 'skilllab-blockly' || state.version !== 1 || !state.workspace)) throw new Error('請選擇 SkillLab 匯出的 Blockly 積木檔。');
    loading = true;
    const before = Blockly.serialization.workspaces.save(workspace);
    try { Blockly.serialization.workspaces.load(state?.workspace || {}, workspace); }
    catch (error) { Blockly.serialization.workspaces.load(before, workspace); throw error; }
    finally { loading = false; }
    Blockly.svgResize(workspace);
    changed();
  }
  function code() { return generator.workspaceToCode(workspace); }
  function updatePreview() {
    try { document.getElementById('preview').textContent = code() || '# 從左側拖入積木開始'; }
    catch (error) { document.getElementById('preview').textContent = error.message; }
  }
  workspace.addChangeListener(event => { if (!event.isUiEvent) changed(); });
  new ResizeObserver(() => Blockly.svgResize(workspace)).observe(document.body);
  window.addEventListener('resize', () => Blockly.svgResize(workspace));
  document.getElementById('preview-toggle').onclick = event => {
    const preview = document.getElementById('preview');
    preview.hidden = !preview.hidden;
    event.target.textContent = preview.hidden ? '查看 Python' : '回到積木';
    event.target.setAttribute('aria-expanded', String(!preview.hidden));
    updatePreview();
  };
  document.getElementById('export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(serialize(), null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'skilllab-blockly.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document.getElementById('import').onchange = async event => {
    const file = event.target.files[0];
    try {
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) throw new Error('積木檔案不能超過 2 MB。');
      const state = JSON.parse(await file.text());
      if (workspace.getAllBlocks(false).length && !confirm('匯入會取代目前 Blockly 積木，確定繼續？')) return;
      load(state); message.textContent = '積木已匯入並保存。';
    } catch (error) { message.textContent = '匯入失敗：' + error.message; }
    finally { event.target.value = ''; }
  };
  window.addEventListener('message', async event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.channel !== 'skilllab-editor') return;
    const { id, method, params = {} } = event.data;
    try {
      let result = null;
      if (method === 'init') load(params.state);
      else if (method === 'reset') load(null);
      else if (method === 'snapshot') { changed(); result = { code: code() }; }
      else if (method === 'disabled') { document.getElementById('tools').inert = params.value; document.getElementById('workspace').inert = params.value; }
      else throw new Error('未知的積木操作');
      send({ id, result });
    } catch (error) { send({ id, error: error.message }); }
  });
  send({ event: 'ready' });
})();

/* Scratch VM is isolated here so an endless/warp loop can be terminated.
 * Pinned upstream: https://github.com/scratchfoundation/scratch-vm/tree/v5.0.300
 */
'use strict';

// The upstream browser bundle imports its SVG renderer even for a headless VM.
// Supply ONLY the registration facade. Any attempt to sanitize/render SVG fails
// closed; this worker never processes costume data or executes visual blocks.
self.window = self;
self.DOMPurify = {
  addHook() {},
  sanitize() { throw new Error('文字判題不支援 SVG 或舞台繪圖。'); }
};

let loadError = null;
try {
  importScripts('https://cdn.jsdelivr.net/npm/scratch-vm@5.0.300/dist/web/scratch-vm.js');
} catch (error) {
  loadError = 'Scratch 執行環境載入失敗，請檢查網路後重試：' + error.message;
}

function supported(opcode) {
  return /^(operator_|data_|procedures_|argument_)/.test(opcode) ||
    /^(math_number|math_integer|math_whole_number|math_positive_number|math_angle|text|colour_picker)$/.test(opcode) ||
    /^(event_whenflagclicked|event_broadcast|event_broadcastandwait|event_whenbroadcastreceived|event_broadcast_menu)$/.test(opcode) ||
    /^(control_repeat|control_forever|control_if|control_if_else|control_repeat_until|control_wait_until|control_wait|control_stop|control_all_at_once)$/.test(opcode) ||
    /^(sensing_askandwait|sensing_answer|sensing_timer|sensing_resettimer)$/.test(opcode) ||
    /^(looks_say|looks_sayforsecs|looks_think|looks_thinkforsecs)$/.test(opcode);
}

self.onmessage = async event => {
  const {project, input = '', timeLimit = 5000} = event.data || {};
  if (loadError) {
    self.postMessage({output: '', errout: loadError, elapsed: 0});
    return;
  }
  let vm;
  let timer;
  let poll;
  let done = false;
  let started = performance.now();
  let output = '';
  const finish = (errout = '') => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    clearInterval(poll);
    if (vm) vm.stopAll();
    self.postMessage({output, errout, elapsed: performance.now() - started});
  };
  try {
    if (!project || !Array.isArray(project.targets)) throw new Error('無效的 Scratch 專案。');
    if ((project.extensions || []).length) throw new Error('文字判題不支援 Scratch 擴充套件。請改用運算、控制、變數與清單積木。');
    let hasHat = false;
    for (const target of project.targets) {
      for (const block of Object.values(target.blocks || {})) {
        if (Array.isArray(block)) continue; // Scratch's compact variable/list reporters.
        if (block.opcode === 'event_whenflagclicked' && block.topLevel) hasHat = true;
        if (!supported(block.opcode)) throw new Error('文字判題不支援此積木：' + block.opcode);
      }
    }
    if (!hasHat) throw new Error('請將程式接在「當綠旗被點擊」下方。');
    vm = new VirtualMachine();
    // Keep valid costume descriptors for Scratch's project validator; no assets,
    // renderer, audio, cloud provider, or extension service are attached.
    await vm.loadProject(project);
    let position = 0;
    const source = String(input).replace(/\r\n?/g, '\n');
    const read = () => {
      // A Scratch question represents one input value. Treat spaces and line
      // breaks alike, so two ordinary questions can read "3 5" or "3\n5".
      while (position < source.length && /\s/.test(source[position])) position++;
      if (position >= source.length) throw new Error('輸入不足：程式詢問的資料超過題目提供的輸入。');
      const begin = position;
      while (position < source.length && !/\s/.test(source[position])) position++;
      return source.slice(begin, position);
    };
    const write = args => {
      output += String(args.MESSAGE) + '\n';
      if (output.length > 1024 * 1024) throw new Error('輸出超過 1 MB，請檢查迴圈。');
    };
    // Wrap primitives, instead of listening to SAY: Scratch also emits SAY for
    // question prompts and bubble clearing, neither of which is stdout.
    vm.runtime._primitives.looks_say = write;
    vm.runtime._primitives.looks_sayforsecs = write;
    vm.runtime._primitives.looks_think = () => {};
    vm.runtime._primitives.looks_thinkforsecs = () => {};
    vm.runtime._primitives.sensing_askandwait = () => {
      const answer = read();
      vm.runtime.emit('ANSWER', answer);
    };
    for (const opcode of Object.keys(vm.runtime._primitives)) {
      const primitive = vm.runtime._primitives[opcode];
      vm.runtime._primitives[opcode] = (args, util) => {
        try {
          const value = primitive(args, util);
          if (value && typeof value.then === 'function') {
            return value.catch(error => finish(error.message || String(error)));
          }
          return value;
        } catch (error) {
          finish(error.message || String(error));
        }
      };
    }
    vm.setTurboMode(true);
    started = performance.now();
    self.postMessage({event: 'started'});
    timer = setTimeout(() => finish('TLE：執行逾時，請檢查是否有無窮迴圈。'), Math.max(100, Math.min(30000, Number(timeLimit) || 5000)));
    vm.start();
    vm.greenFlag();
    // PROJECT_RUN_STOP can be missed when an entire script finishes in its first
    // tick; thread emptiness also handles an empty green-flag program.
    poll = setInterval(() => {
      if (!vm.runtime.threads.some(thread => !thread.updateMonitor)) finish();
    }, 10);
  } catch (error) {
    finish(error.message || String(error));
  }
};

self.postMessage({event: 'ready'});

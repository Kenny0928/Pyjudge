import {createExecution, DEFAULT_LIMITS} from './flow-core.mjs';

// The worker computes independently of playback. A yielded chunk keeps input/cancel responsive.
let execution = null, activeRunId = null, pendingInputs = [], scheduled = false;
const send = payload => self.postMessage({runId: activeRunId, ...payload});
function finish(status, error) { send({type: 'done', status, ...error && {error}}); execution = null; pendingInputs = []; }
function schedule() { if (!scheduled && execution) { scheduled = true; setTimeout(() => { scheduled = false; pump(); }, 0); } }
function pump() {
  if (!execution) return;
  const events = []; let waiting = null, done = false, error, inputError;
  try {
    for (let index = 0; index < 100 && execution; index++) {
      let result = execution.step();
      if (result.waiting && pendingInputs.length) result = execution.step(pendingInputs.shift());
      if (result.event) events.push(result.event);
      if (result.waiting) { waiting = result.waiting; inputError = result.inputError; break; }
      if (result.done) { done = true; error = result.error; break; }
    }
  } catch (cause) { done = true; error = {message: cause.message || '無法執行流程圖。', code: cause.code || 'WORKER_ERROR', ...cause.nodeId && {nodeId: cause.nodeId}}; }
  if (events.length) send({type: 'events', events});
  if (done) finish(error ? 'error' : 'completed', error);
  else if (waiting) { if (inputError) send({type: 'input-error', error: inputError}); send({type: 'waiting', waiting}); }
  else schedule();
}
self.onmessage = ({data}) => {
  if (!data || typeof data !== 'object') return;
  if (data.type === 'start') {
    execution = null; activeRunId = data.runId; pendingInputs = [];
    try {
      if (data.inputs !== undefined && (!Array.isArray(data.inputs) || data.inputs.length > DEFAULT_LIMITS.maxSteps || data.inputs.some(input => typeof input !== 'string' || input.length > DEFAULT_LIMITS.maxString) || data.inputs.reduce((total, input) => total + input.length, 0) > 1024 * 1024)) throw new Error('測試輸入過大或格式不合法。');
      pendingInputs = [...data.inputs || []]; execution = createExecution(data.graph, data.limits || {}); schedule();
    } catch (error) { finish('error', {message: error.message, code: error.code || 'INVALID_GRAPH', ...error.nodeId && {nodeId: error.nodeId}}); }
  } else if (data.runId === activeRunId && data.type === 'input' && execution?.status === 'waiting') {
    pendingInputs.unshift(data.value); schedule();
  } else if (data.runId === activeRunId && data.type === 'stop') { execution?.stop(); finish('stopped'); }
};

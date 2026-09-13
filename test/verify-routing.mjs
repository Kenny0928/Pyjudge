#!/usr/bin/env node
// Regression checks for connection geometry. Fresh browser contexts leave personal drafts untouched.
// Uses the same optional Playwright installation as verify-browser.mjs.
import assert from 'node:assert/strict';
import { access, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const url = process.argv[2] || 'http://127.0.0.1:8087/test/';
const artifacts = process.env.FLOWLAB_ARTIFACTS || join(tmpdir(), 'flowlab-routing-qa-artifacts');
await mkdir(artifacts, { recursive: true });
async function loadPlaywright() {
  for (const candidate of [process.env.FLOWLAB_PLAYWRIGHT, 'playwright', 'playwright-core', join(tmpdir(), 'flowlab-browser-qa/node_modules/playwright-core/index.mjs')].filter(Boolean)) {
    try { return await import(candidate.startsWith('/') ? pathToFileURL(candidate).href : candidate); }
    catch (error) { if (!['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(error.code)) throw error; }
  }
  throw new Error('Set FLOWLAB_PLAYWRIGHT to an installed Playwright index.mjs; see test/README.md.');
}
async function chromePath() {
  for (const candidate of [process.env.FLOWLAB_CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].filter(Boolean)) {
    try { await access(candidate); return candidate; } catch { /* Try next executable. */ }
  }
}
const { chromium } = await loadPlaywright();
const executablePath = await chromePath();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
let passed = 0;
const failures = [];
async function check(name, run) {
  const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => Boolean(window.flowLab));
    await run(page);
    assert.deepEqual(errors, [], 'Browser console must have no errors');
    passed++;
    console.log(`PASS ${name}`);
  } catch (error) {
    const file = join(artifacts, `failure-${name.replace(/[^a-z0-9]+/gi, '-')}.png`);
    await page.screenshot({ path: file, fullPage: true }).catch(() => {});
    failures.push({ name, error });
    console.error(`FAIL ${name}\n${error.stack}\nScreenshot: ${file}`);
  } finally { await context.close(); }
}

const node = (id, type, x, y, data = {}) => ({ id, type, title: { start: '開始', input: '輸入', process: '處理', decision: '判斷', end: '結束' }[type], position: { x, y }, data });
const edge = (id, source, target, branch = null) => ({ id, source, target, branch });
function countdownGraph() {
  return { version: 1, title: '同一列的迴圈連線', viewport: { x: 0, y: 0, zoom: 1 }, nodes: [
    node('start', 'start', 320, 40), node('input', 'input', 320, 145, { variable: 'N', prompt: '', inputType: 'integer' }),
    node('decision', 'decision', 310, 255, { expression: 'N > 0' }),
    node('decrement', 'process', 70, 266, { expression: 'N = N - 1' }), node('end', 'end', 585, 485)
  ], edges: [edge('start-input', 'start', 'input'), edge('input-decision', 'input', 'decision'), edge('true-work', 'decision', 'decrement', 'true'), edge('work-loop', 'decrement', 'decision'), edge('false-end', 'decision', 'end', 'false')] };
}
const load = (page, graph, input = '') => page.evaluate(({ graph, input }) => window.flowLab.loadGraph(graph, { fit: true, input }), { graph, input });
const graphState = page => page.evaluate(() => window.flowLab.getGraph());
const executionState = page => page.evaluate(() => window.flowLab.getState());
async function geometry(page) {
  return page.evaluate(() => {
    const graph = window.flowLab.getGraph();
    const shapes = graph.nodes.map(node => ({ node, shape: document.querySelector(`.fc-node[data-node-id="${node.id}"] .fc-shape`) }));
    const collisions = [], edges = {};
    for (const edge of graph.edges) {
      const path = document.querySelector(`.fc-edge[data-edge-id="${edge.id}"] .fc-edge-line`);
      const length = path.getTotalLength(), points = [];
      for (let distance = 0; distance <= length; distance += 2) {
        const point = path.getPointAtLength(distance); points.push({ x: point.x, y: point.y });
        for (const { node, shape } of shapes) {
          // Ignore only the source/target boundary. All path interiors must stay outside all shapes.
          if ((node.id === edge.source && distance < 2) || (node.id === edge.target && length - distance < 2)) continue;
          if (shape.isPointInFill(new DOMPoint(point.x - node.position.x, point.y - node.position.y))) {
            if (!collisions.some(hit => hit.edge === edge.id && hit.node === node.id)) collisions.push({ edge: edge.id, node: node.id, point: { x: point.x, y: point.y } });
          }
        }
      }
      const first = path.getPointAtLength(0), last = path.getPointAtLength(length);
      edges[edge.id] = { d: path.getAttribute('d'), length, samples: points, start: { x: first.x, y: first.y }, end: { x: last.x, y: last.y }, minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)) };
    }
    return { collisions, edges };
  });
}
async function dragNode(page, id, dx, dy) {
  const shape = page.locator(`.fc-node[data-node-id="${id}"] .fc-shape`);
  const box = await shape.boundingBox();
  assert.ok(box, `Node ${id} must be visible`);
  const zoom = (await graphState(page)).viewport.zoom;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx * zoom, box.y + box.height / 2 + dy * zoom, { steps: 12 });
  await page.mouse.up();
}
async function seekEnd(page) {
  await page.locator('#timeline').evaluate(element => { element.value = element.max; element.dispatchEvent(new Event('input', { bubbles: true })); });
}
function longestSharedRun(first, second) {
  let run = 0, longest = 0;
  for (const point of first.samples) {
    if (second.samples.some(other => Math.hypot(point.x - other.x, point.y - other.y) < 1.6)) { run += 2; longest = Math.max(run, longest); }
    else run = 0;
  }
  return longest;
}

try {
  await check('same-row loop has local branches and separate arrivals', async page => {
    await load(page, countdownGraph(), '3');
    const { edges, collisions } = await geometry(page);
    assert.deepEqual(collisions, [], 'Loop connections must not pass through a node');
    assert.ok(edges['true-work'].start.x <= 311, 'True branch must leave toward the process on the left');
    assert.ok(edges['true-work'].minX >= 248, 'True branch must reach the near side of the process without wrapping behind it');
    assert.ok(edges['work-loop'].maxX <= 511, 'Loop return must not detour around the opposite side of the decision');
    const incoming = [edges['input-decision'].end, edges['work-loop'].end];
    assert.ok(Math.hypot(incoming[0].x - incoming[1].x, incoming[0].y - incoming[1].y) >= 10, 'Initial entry and loop return need visibly separate arrowheads');
    const paths = Object.entries(edges);
    for (let first = 0; first < paths.length; first++) for (let second = first + 1; second < paths.length; second++) {
      assert.ok(longestSharedRun(paths[first][1], paths[second][1]) <= 10, `${paths[first][0]} and ${paths[second][0]} must not share a visible lane`);
    }
    await page.screenshot({ path: join(artifacts, 'same-row-loop.png'), fullPage: true });
  });

  await check('geometry updates leave graph data and countdown execution intact', async page => {
    const fixture = countdownGraph();
    await load(page, fixture, '3');
    const initial = await graphState(page);
    await page.evaluate(() => { window.flowLab.canvas.render(); window.flowLab.canvas.setExecution({}); });
    assert.deepEqual(await graphState(page), initial, 'Rendering must not persist inferred connection anchors');
    await page.locator('#run-btn').click();
    await page.waitForFunction(() => ['completed', 'error'].includes(window.flowLab.getState().engineStatus));
    await seekEnd(page);
    const completed = await executionState(page);
    assert.equal(completed.engineStatus, 'completed');
    assert.equal(completed.trace.at(-1).variablesAfter.N, 0);
    assert.equal(completed.trace.filter(event => event.nodeId === 'decrement').length, 3);
    assert.deepEqual((await graphState(page)).nodes, initial.nodes);
    assert.deepEqual((await graphState(page)).edges, initial.edges);
    await dragNode(page, 'decrement', -24, 60);
    const moved = await graphState(page), after = await executionState(page);
    assert.notDeepEqual(moved.nodes.find(n => n.id === 'decrement').position, initial.nodes.find(n => n.id === 'decrement').position);
    assert.deepEqual(after.trace, completed.trace, 'Layout changes must preserve computed events');
    assert.equal(after.cursor, completed.cursor, 'Layout changes must preserve the replay position');
    assert.deepEqual(moved.edges, initial.edges, 'Rerouting must preserve graph connectivity');
    assert.deepEqual((await geometry(page)).collisions, []);
    await page.locator('#undo-btn').click();
    assert.deepEqual((await graphState(page)).nodes, initial.nodes);
    assert.deepEqual((await executionState(page)).trace, completed.trace);
    assert.deepEqual((await geometry(page)).collisions, []);
  });

  await check('moving an unrelated node reroutes the obstructed connection', async page => {
    await load(page, { version: 1, title: '繞開移動中的節點', viewport: { x: 0, y: 0, zoom: 1 }, nodes: [node('start', 'start', 280, 40), node('end', 'end', 280, 460), node('obstacle', 'process', 30, 250, { expression: 'N = 1' })], edges: [edge('direct', 'start', 'end')] });
    const before = await geometry(page);
    assert.deepEqual(before.collisions, []);
    await dragNode(page, 'obstacle', 250, 0);
    const after = await geometry(page);
    assert.notEqual(after.edges.direct.d, before.edges.direct.d, 'Moving an obstacle must also update edges unconnected to it');
    assert.deepEqual(after.collisions, [], 'The connection must route around the newly moved obstacle');
    await page.screenshot({ path: join(artifacts, 'moved-obstacle.png'), fullPage: true });
  });

  await check('mirrored layout keeps branch meanings and avoids node interiors', async page => {
    const fixture = countdownGraph();
    fixture.nodes.find(n => n.id === 'decrement').position.x = 585;
    fixture.nodes.find(n => n.id === 'end').position.x = 70;
    await load(page, fixture, '1');
    const { edges, collisions } = await geometry(page);
    assert.deepEqual(collisions, [], 'A branch targeting the opposite side must still avoid all node interiors');
    assert.ok(edges['true-work'].start.x > edges['false-end'].start.x, 'True outlet follows the process on the right; False follows the end on the left');
    assert.ok(edges['true-work'].maxX <= 595, 'True branch must reach the near side of the process without wrapping behind it');
    assert.ok(edges['work-loop'].minX >= 309, 'Loop return must stay near the right-hand process');
    assert.match(await page.locator('.fc-node[data-node-id="decision"] .fc-port[data-branch="true"]').textContent(), /True/);
    assert.match(await page.locator('.fc-node[data-node-id="decision"] .fc-port[data-branch="false"]').textContent(), /False/);
    assert.deepEqual((await graphState(page)).edges, fixture.edges);
    await page.screenshot({ path: join(artifacts, 'mirrored-loop.png'), fullPage: true });
  });

  await check('built-in examples route without passing through nodes', async page => {
    const examples = await page.evaluate(async () => (await import('./examples.mjs')).EXAMPLES);
    for (const example of examples) {
      await load(page, example.graph, example.input);
      assert.deepEqual((await geometry(page)).collisions, [], `${example.id}: all connectors must stay outside node interiors`);
    }
  });

  await check('close aligned nodes keep short direct connectors', async page => {
    for (const gap of [8, 12, 16, 20, 24]) {
      await load(page, { version: 1, title: '緊密排列', viewport: { x: 0, y: 0, zoom: 1 }, nodes: [node('start', 'start', 200, 20), node('work', 'process', 200, 76 + gap, { expression: 'N = 1' }), node('end', 'end', 200, 152 + gap * 2)], edges: [edge('first', 'start', 'work'), edge('last', 'work', 'end')] });
      const { edges, collisions } = await geometry(page);
      assert.deepEqual(collisions, [], `A ${gap}px gap must not create a connector through its own endpoints`);
      for (const [id, path] of Object.entries(edges)) assert.ok(Math.abs(path.length - Math.hypot(path.end.x - path.start.x, path.end.y - path.start.y)) < .5, `${id}: a ${gap}px gap must keep a straight path without doubling back`);
    }
  });
} finally { await browser.close(); }
console.log(`${passed} routing browser checks passed; ${failures.length} failed. Artifacts: ${artifacts}`);
if (failures.length) process.exitCode = 1;

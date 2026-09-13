import test from 'node:test';
import assert from 'node:assert/strict';
import {createRouting,routeEdge} from './flow-routing.mjs';
import {EXAMPLES} from './examples.mjs';
const node=(id,type,x,y)=>({id,type,position:{x,y},data:{}});
const edge=(id,source,target,branch=null)=>({id,source,target,branch});
function loop(mirrored=false){return {nodes:[node('start','start',320,40),node('input','input',320,145),node('condition','decision',310,255),node('work','process',mirrored?585:70,266),node('end','end',mirrored?70:585,485)],edges:[edge('initial','start','input'),edge('entry','input','condition'),edge('yes','condition','work','true'),edge('back','work','condition'),edge('no','condition','end','false')]};}
test('left and right loop layouts use local facing branch ports and a separate return entrance',()=>{
  for(const mirror of [false,true]){
    const graph=loop(mirror),context=createRouting(graph),routes=Object.fromEntries(graph.edges.map(edge=>[edge.id,routeEdge(edge,context)]));
    assert.equal(routes.yes.sourcePort,mirror?'right':'left');
    assert.equal(routes.yes.targetPort,mirror?'left':'right');
    assert.equal(routes.no.sourcePort,mirror?'left':'right');
    assert.equal(routes.entry.targetPort,'top');assert.equal(routes.back.targetPort,'bottom');
    assert.equal(routes.back.feedback,true);assert.equal(routes.yes.feedback,false);
    assert.ok(routes.back.points.every(point=>point.y>=342));
  }
});
test('close vertical anchors produce a direct forward path without tiny reversals',()=>{
  for(const gap of [8,12,16,20,24,34,48]){
    const graph={nodes:[node('a','start',200,20),node('b','process',200,76+gap)],edges:[edge('link','a','b')]};
    const route=routeEdge(graph.edges[0],createRouting(graph));
    assert.equal(route.blocked,undefined);assert.equal(route.points.length,2);assert.ok(route.points[1].y>route.points[0].y);
  }
});
test('non-incident obstacles trigger a collision-free detour instead of changing connectivity',()=>{
  const graph={nodes:[node('a','start',280,40),node('b','end',280,460),node('obstacle','process',30,250)],edges:[edge('link','a','b')]};
  const direct=routeEdge(graph.edges[0],createRouting(graph));
  graph.nodes[2].position.x=280;
  const before=structuredClone(graph),rerouted=routeEdge(graph.edges[0],createRouting(graph));
  assert.notEqual(rerouted.path,direct.path);assert.equal(rerouted.blocked,undefined);assert.deepEqual(graph,before);
  assert.ok(rerouted.points.some(point=>point.x<280||point.x>460));
});
test('drawing remains deterministic and does not mutate graph files or write inferred ports',()=>{
  for(const graph of [...EXAMPLES.map(example=>example.graph),loop(),loop(true)]){
    const original=structuredClone(graph),first=createRouting(graph),second=createRouting(graph);
    for(const edge of graph.edges){
      const a=routeEdge(edge,first),b=routeEdge(edge,second);
      assert.deepEqual(a,b);assert.equal(a.blocked,undefined);assert.ok(a.path.startsWith('M '));
      assert.ok(!/NaN|Infinity/.test(a.path));
      for(let i=1;i<a.points.length;i++)assert.ok(a.points[i].x===a.points[i-1].x||a.points[i].y===a.points[i-1].y,'Every leg is orthogonal');
    }
    assert.deepEqual(graph,original);
  }
});
test('incomplete drafts, self loops and densely packed diagrams keep finite routes',()=>{
  const self={nodes:[node('a','process',0,0)],edges:[edge('self','a','a')]};
  const selfRoute=routeEdge(self.edges[0],createRouting(self));assert.equal(selfRoute.feedback,true);assert.equal(selfRoute.blocked,undefined);
  const bad=edge('bad','a','missing');assert.equal(routeEdge(bad,createRouting(self)),null);
  const graph={nodes:Array.from({length:200},(_,i)=>node('n'+i,i===0?'start':i===199?'end':'process',30+i%10*220,30+Math.floor(i/10)*100)),edges:Array.from({length:199},(_,i)=>edge('e'+i,'n'+i,'n'+(i+1)))};
  const context=createRouting(graph);for(const edge of graph.edges){const route=routeEdge(edge,context);assert.ok(!/NaN|Infinity/.test(route.path));assert.equal(route.blocked,undefined);}
});

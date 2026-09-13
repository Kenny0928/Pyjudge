/* Derived drawing geometry only. No route changes the saved graph or execution order. */
export const NODE_SIZES = Object.freeze({start:[180,56],end:[180,56],input:[180,76],output:[180,76],process:[180,76],decision:[200,116]});
const NORMAL = {top:{x:0,y:-1},bottom:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const MARGIN=8, LEAD=20, EPS=.01;
const equal=(a,b)=>Math.abs(a.x-b.x)<EPS&&Math.abs(a.y-b.y)<EPS;
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export function nodeBounds(node,padding=0){const [w,h]=NODE_SIZES[node.type]||NODE_SIZES.process;return {id:node.id,left:node.position.x-padding,right:node.position.x+w+padding,top:node.position.y-padding,bottom:node.position.y+h+padding};}
export function shapeAnchor(node,side){
  const [w,h]=NODE_SIZES[node.type]||NODE_SIZES.process;
  let x=side==='left'?0:side==='right'?w:w/2,y=side==='top'?0:side==='bottom'?h:h/2;
  if(['input','output'].includes(node.type)){if(side==='left')x=9;if(side==='right')x=w-9;}
  return {x:node.position.x+x,y:node.position.y+y,side,...{normal:NORMAL[side]}};
}
function simplify(points){
  const result=[];
  for(const point of points){
    if(result.length&&equal(result.at(-1),point))continue;
    while(result.length>1){const a=result.at(-2),b=result.at(-1),cross=(b.x-a.x)*(point.y-b.y)-(b.y-a.y)*(point.x-b.x),dot=(b.x-a.x)*(point.x-b.x)+(b.y-a.y)*(point.y-b.y);if(Math.abs(cross)<EPS&&dot>=0)result.pop();else break;}
    result.push({x:point.x,y:point.y});
  }
  return result;
}
export function roundedPath(points,radius=7){
  const clean=simplify(points);if(clean.length<2)return '';
  let path=`M ${clean[0].x} ${clean[0].y}`;
  for(let i=1;i<clean.length-1;i++){
    const a=clean[i-1],b=clean[i],c=clean[i+1];
    const before=distance(a,b),after=distance(b,c),r=Math.min(radius,before/2,after/2);
    const p={x:b.x+(a.x-b.x)*r/before,y:b.y+(a.y-b.y)*r/before},q={x:b.x+(c.x-b.x)*r/after,y:b.y+(c.y-b.y)*r/after};
    path+=` L ${p.x} ${p.y} Q ${b.x} ${b.y} ${q.x} ${q.y}`;
  }
  return path+` L ${clean.at(-1).x} ${clean.at(-1).y}`;
}
function intersects(a,b,box){
  if(Math.abs(a.x-b.x)<EPS)return a.x>box.left+EPS&&a.x<box.right-EPS&&Math.max(a.y,b.y)>box.top+EPS&&Math.min(a.y,b.y)<box.bottom-EPS;
  if(Math.abs(a.y-b.y)<EPS)return a.y>box.top+EPS&&a.y<box.bottom-EPS&&Math.max(a.x,b.x)>box.left+EPS&&Math.min(a.x,b.x)<box.right-EPS;
  return true;
}
class ObstacleIndex{
  constructor(nodes){this.boxes=nodes.map(n=>nodeBounds(n,MARGIN));this.cells=new Map();for(const box of this.boxes){for(let x=Math.floor(box.left/160);x<=Math.floor(box.right/160);x++)for(let y=Math.floor(box.top/160);y<=Math.floor(box.bottom/160);y++){const key=x+':'+y;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(box);}}}
  within(left,top,right,bottom){
    const x0=Math.floor(left/160),x1=Math.floor(right/160),y0=Math.floor(top/160),y1=Math.floor(bottom/160);
    if((x1-x0+1)*(y1-y0+1)>200)return this.boxes.filter(b=>b.left<=right&&b.right>=left&&b.top<=bottom&&b.bottom>=top);
    const boxes=new Set();for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(const box of this.cells.get(x+':'+y)||[])boxes.add(box);return [...boxes];
  }
  clear(a,b,ignore,endpoints=[]){return !this.within(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.max(a.x,b.x),Math.max(a.y,b.y)).some(box=>box.id!==ignore&&intersects(a,b,endpoints.includes(box.id)?{...box,left:box.left+MARGIN,right:box.right-MARGIN,top:box.top+MARGIN,bottom:box.bottom-MARGIN}:box));}
}
function feedbackEdges(graph,nodes){
  const outgoing=new Map(graph.nodes.map(n=>[n.id,[]]));for(const edge of graph.edges)if(nodes.has(edge.source)&&nodes.has(edge.target))outgoing.get(edge.source).push(edge);
  for(const edges of outgoing.values())edges.sort((a,b)=>(a.branch==='true'?0:a.branch==='false'?1:2)-(b.branch==='true'?0:b.branch==='false'?1:2)||a.id.localeCompare(b.id));
  const active=new Set(),done=new Set(),feedback=new Set();
  const visit=id=>{if(done.has(id))return;active.add(id);for(const edge of outgoing.get(id)||[]){if(active.has(edge.target))feedback.add(edge.id);else visit(edge.target);}active.delete(id);done.add(id);};
  for(const node of [...graph.nodes.filter(n=>n.type==='start'),...graph.nodes])visit(node.id);
  return {feedback,outgoing};
}
function sourceSide(node,edge,nodes,feedback,decisions){
  if(node.type==='decision')return decisions?.get(node.id)?.[edge.branch]||(edge.branch==='false'?'right':'left');
  if(!edge||feedback.has(edge.id))return 'bottom';
  const target=nodes.get(edge.target);if(!target)return 'bottom';
  const a=nodeBounds(node),b=nodeBounds(target),cy=(a.top+a.bottom)/2,ty=(b.top+b.bottom)/2;
  if(Math.abs(cy-ty)<=Math.max(a.bottom-a.top,b.bottom-b.top)*.8){if(b.left>=a.right+12)return 'right';if(b.right<=a.left-12)return 'left';}
  return 'bottom';
}
function targetSides(node,edge,context){
  if(node.type==='decision')return [context.feedback.has(edge.id)?'bottom':'top'];
  const outgoingSide=context.outputSides.get(node.id),allowed=['top','left','right','bottom'].filter(side=>side!==outgoingSide);
  const source=context.nodes.get(edge.source),a=nodeBounds(source),b=nodeBounds(node);
  let preferred='top';
  if(context.feedback.has(edge.id))preferred=a.left<b.left?'left':'right';
  else if(Math.abs((a.top+a.bottom-b.top-b.bottom)/2)<Math.max(a.bottom-a.top,b.bottom-b.top)*.8)preferred=a.right<=b.left?'left':a.left>=b.right?'right':'top';
  return allowed.sort((a,b)=>(a===preferred?-1:b===preferred?1:0));
}
function leadPoint(anchor,nodeId,index,otherId){
  let length=LEAD;
  const far={x:anchor.x+anchor.normal.x*LEAD*2,y:anchor.y+anchor.normal.y*LEAD*2};
  for(const box of index.within(Math.min(anchor.x,far.x)-1,Math.min(anchor.y,far.y)-1,Math.max(anchor.x,far.x)+1,Math.max(anchor.y,far.y)+1)){
    if(box.id===nodeId)continue;
    let gap=Infinity;
    if(anchor.normal.x&&anchor.y>box.top&&anchor.y<box.bottom)gap=anchor.normal.x>0?box.left-anchor.x:anchor.x-box.right;
    if(anchor.normal.y&&anchor.x>box.left&&anchor.x<box.right)gap=anchor.normal.y>0?box.top-anchor.y:anchor.y-box.bottom;
    if(box.id===otherId)gap+=MARGIN;
    if(gap>0)length=Math.min(length,Math.max(2,gap/2));
  }
  return {x:anchor.x+anchor.normal.x*length,y:anchor.y+anchor.normal.y*length};
}
function routeClear(points,source,target,index){
  for(let i=1;i<points.length;i++){const ignore=i===1?source:i===points.length-1?target:null;if(!index.clear(points[i-1],points[i],ignore,[source,target]))return false;}return true;
}
function score(points){let length=0;for(let i=1;i<points.length;i++)length+=distance(points[i-1],points[i]);return length+Math.max(0,simplify(points).length-2)*16;}

// Only used when the small set of direct elbow candidates meets an obstacle.
// Coordinates form an orthogonal visibility grid around nearby node boundaries.
function detour(start,end,index,endpoints){
  const nearby=index.within(Math.min(start.x,end.x)-220,Math.min(start.y,end.y)-220,Math.max(start.x,end.x)+220,Math.max(start.y,end.y)+220);
  const xs=[...new Set([start.x,end.x,...nearby.flatMap(b=>[b.left,b.right])])].sort((a,b)=>a-b);
  const ys=[...new Set([start.y,end.y,...nearby.flatMap(b=>[b.top,b.bottom])])].sort((a,b)=>a-b);
  const width=xs.length,from=ys.indexOf(start.y)*width+xs.indexOf(start.x),goal=ys.indexOf(end.y)*width+xs.indexOf(end.x);
  const point=id=>({x:xs[id%width],y:ys[Math.floor(id/width)]});
  const heap=[];
  const push=item=>{let i=heap.length;heap.push(item);while(i){const parent=(i-1)>>1;if(heap[parent].f<=item.f)break;heap[i]=heap[parent];i=parent;}heap[i]=item;};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].f<heap[child].f)child++;if(heap[child].f>=last.f)break;heap[i]=heap[child];i=child;}heap[i]=last;}return top;};
  const costs=new Map(),previous=new Map();
  for(const direction of [0,1]){const key=from*2+direction;costs.set(key,0);push({id:from,direction,g:0,f:distance(start,end)});}
  let visits=0,found=null;
  while(heap.length&&visits++<30000){
    const current=pop(),key=current.id*2+current.direction;if(current.g!==costs.get(key))continue;
    if(current.id===goal){found=key;break;}
    const x=current.id%width,y=Math.floor(current.id/width),a=point(current.id);
    for(const [dx,dy,direction] of [[-1,0,0],[1,0,0],[0,-1,1],[0,1,1]]){
      const nx=x+dx,ny=y+dy;if(nx<0||nx>=width||ny<0||ny>=ys.length)continue;
      const id=ny*width+nx,b=point(id);if(!index.clear(a,b,null,endpoints))continue;
      const g=current.g+distance(a,b)+(direction!==current.direction?16:0),next=id*2+direction;
      if(g>=(costs.get(next)??Infinity))continue;costs.set(next,g);previous.set(next,key);push({id,direction,g,f:g+distance(b,end)});
    }
  }
  if(found===null)return null;
  const result=[];let key=found;while(key!==undefined){result.push(point(Math.floor(key/2)));key=previous.get(key);}return simplify(result.reverse());
}

export function createRouting(graph){
  const nodes=new Map(graph.nodes.map(n=>[n.id,n])),{feedback,outgoing}=feedbackEdges(graph,nodes),outputSides=new Map(),decisionSides=new Map();
  for(const node of graph.nodes.filter(n=>n.type==='decision')){
    const targets=Object.fromEntries((outgoing.get(node.id)||[]).map(edge=>[edge.branch,nodes.get(edge.target)]));
    const center=target=>{const box=nodeBounds(target);return (box.left+box.right)/2;};
    const swap=targets.true&&targets.false?center(targets.true)>center(targets.false)+20:targets.true?center(targets.true)>center(node)+40:targets.false?center(targets.false)<center(node)-40:false;
    decisionSides.set(node.id,swap?{true:'right',false:'left'}:{true:'left',false:'right'});
  }
  for(const node of graph.nodes)if(node.type!=='end'&&node.type!=='decision')outputSides.set(node.id,sourceSide(node,outgoing.get(node.id)?.[0],nodes,feedback));
  return {nodes,feedback,outgoing,outputSides,decisionSides,index:new ObstacleIndex(graph.nodes),routes:new Map()};
}
export function routeEdge(edge,context){
  if(context.routes.has(edge.id))return context.routes.get(edge.id);
  const source=context.nodes.get(edge.source),target=context.nodes.get(edge.target);if(!source||!target)return null;
  const sourcePort=sourceSide(source,edge,context.nodes,context.feedback,context.decisionSides),start=shapeAnchor(source,sourcePort),s=leadPoint(start,source.id,context.index,target.id);
  let best=null;
  const ends=targetSides(target,edge,context);
  for(let preference=0;preference<ends.length;preference++){
    const targetPort=ends[preference],end=shapeAnchor(target,targetPort),t=leadPoint(end,target.id,context.index,source.id);
    // The visible arrow tip stops just outside the node's input handle.
    const tipDistance=Math.min(6,distance(end,t)/2),tip={x:end.x+end.normal.x*tipDistance,y:end.y+end.normal.y*tipDistance};
    if(best&&distance(start,tip)+preference*12>=best.cost)continue;
    const aligned=Math.abs(start.x-end.x)<EPS||Math.abs(start.y-end.y)<EPS;
    const facing=start.normal.x===-end.normal.x&&start.normal.y===-end.normal.y;
    if(aligned&&facing&&(end.x-start.x)*start.normal.x+(end.y-start.y)*start.normal.y>tipDistance){
      if(context.index.clear(start,tip,null,[source.id,target.id])){
        const local={points:[start,tip],cost:distance(start,tip)+preference*12,sourcePort,targetPort,start,end};
        if(!best||local.cost<best.cost)best=local;
        continue;
      }
    }
    const middles=[
      [s,{x:t.x,y:s.y},t],[s,{x:s.x,y:t.y},t],
      [s,{x:(s.x+t.x)/2,y:s.y},{x:(s.x+t.x)/2,y:t.y},t],
      [s,{x:s.x,y:(s.y+t.y)/2},{x:t.x,y:(s.y+t.y)/2},t],
    ];
    let local=null;
    for(const middle of middles){
      const points=[start,...middle,tip];
      if(!routeClear(points,source.id,target.id,context.index))continue;
      const cost=score(points)+preference*12;
      if(!local||cost<local.cost)local={points,cost,sourcePort,targetPort,start,end};
    }
    if(!local){
      const middle=detour(s,t,context.index,[source.id,target.id]);
      if(middle){const points=[start,...middle,tip];if(routeClear(points,source.id,target.id,context.index))local={points,cost:score(points)+preference*12,sourcePort,targetPort,start,end};}
    }
    if(local&&(!best||local.cost<best.cost))best=local;
  }
  if(!best){
    // Overlapping nodes can leave no collision-free route. Keep a finite visible
    // connector, allowing the student to separate the nodes and recover instantly.
    const end=shapeAnchor(target,ends[0]||'top');
    best={points:[start,{x:start.x+start.normal.x*24,y:start.y+start.normal.y*24},{x:end.x+end.normal.x*24,y:start.y+start.normal.y*24},{x:end.x+end.normal.x*24,y:end.y+end.normal.y*24},{x:end.x+end.normal.x*6,y:end.y+end.normal.y*6}],sourcePort,targetPort:end.side,start,end,blocked:true};
  }
  const route={...best,points:simplify(best.points),feedback:context.feedback.has(edge.id),path:roundedPath(best.points)};
  context.routes.set(edge.id,route);return route;
}

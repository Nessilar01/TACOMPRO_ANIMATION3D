/* =====================================================================
   3D viewer. The clip engine (p2.js, p3*.js) is shared with the 2D page: it already knows where every
   actor is at any time t. This file only turns that state into three.js meshes.
   World units: 1 unit = 1 photo pixel (about 2.8 mm). x = photo x, z = photo y, y = height.
   ===================================================================== */
const D2R=Math.PI/180;
const MATCHES=[['full-clean','Ranking match · clean run'],['full-drops','Ranking match · two drops'],['final','Final match · 8 robots']];
const PLATH=105, STRIPH=56, CUBE=22;                       /* Cube Base top (320 mm), central strip top, cube edge */
const $=id=>document.getElementById(id);

/* ---------- renderer, scene, camera ---------- */
const stage=$('stage'),cv=$('cv');
const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});
R.outputEncoding=THREE.sRGBEncoding;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x070b10).convertSRGBToLinear();
const cam=new THREE.PerspectiveCamera(38,1.6,8,7000);
const ctl=new THREE.OrbitControls(cam,cv);ctl.enableDamping=true;ctl.dampingFactor=.1;ctl.maxPolarAngle=Math.PI/2-.03;ctl.minDistance=80;ctl.maxDistance=3200;
scene.add(new THREE.HemisphereLight(0xc7d8ff,0x251c14,.95));
const sun=new THREE.DirectionalLight(0xffffff,.85);sun.position.set(-260,900,420);sun.target.position.set(373,0,741);
sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-900,right:900,top:900,bottom:-900,near:100,far:2400});sun.shadow.bias=-.0006;
scene.add(sun,sun.target);

/* small mesh helpers; every material is created per actor so opacity can be set independently */
const mats=[];
const C=h=>new THREE.Color(h).convertSRGBToLinear();                  /* hex colours are sRGB, three r128 wants linear */
function M(color,o={}){const m=new THREE.MeshStandardMaterial(Object.assign({color:C(color),roughness:.7,metalness:.05},o));mats.push(m);return m}
function box(w,h,d,color,o){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(color,o));m.castShadow=true;m.receiveShadow=true;return m}
function cyl(rt,rb,h,color,seg=20,o){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(color,o));m.castShadow=true;m.receiveShadow=true;return m}
function at(m,x,y,z){m.position.set(x,y,z);return m}

/* ---------- static world: field photo, maze walls, arena rails, central strip, goals ---------- */
const world=new THREE.Group();scene.add(world);
(function buildWorld(){
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshStandardMaterial({color:new THREE.Color(0x0b1118).convertSRGBToLinear(),roughness:1}));
  floor.rotation.x=-Math.PI/2;floor.position.set(373,-1,741);floor.receiveShadow=true;world.add(floor);
  const tex=new THREE.TextureLoader().load(FIELD,()=>{need=true});tex.encoding=THREE.sRGBEncoding;tex.anisotropy=R.capabilities.getMaxAnisotropy();
  const fm=new THREE.Mesh(new THREE.PlaneGeometry(IW,IH),new THREE.MeshStandardMaterial({map:tex,roughness:.85,metalness:0}));
  fm.rotation.x=-Math.PI/2;fm.position.set(IW/2,0,IH/2);fm.receiveShadow=true;world.add(fm);
  /* border frame around the whole field */
  const fr=0x0f151c;
  [[IW/2,-8,IW+24,16],[IW/2,IH+8,IW+24,16]].forEach(([x,z,w,d])=>world.add(at(box(w,26,d,fr),x,13,z)));
  [[-8,IH/2,16,IH],[IW+8,IH/2,16,IH]].forEach(([x,z,w,d])=>world.add(at(box(w,26,d,fr),x,13,z)));
  /* maze walls (top maze as traced from the photo, bottom maze is its mirror in y) */
  const WALL=0x6b4426,WH=30;
  const wall=(x1,y1,x2,y2)=>{const w=Math.abs(x2-x1)+5,d=Math.abs(y2-y1)+5;world.add(at(box(w,WH,d,WALL),(x1+x2)/2,WH/2,(y1+y2)/2))};
  const x0=cx(0)-P/2,x1=cx(9)+P/2,y0=cy(0)-P/2,y1=cy(4)+P/2;
  [false,true].forEach(fl=>{
    const Y=y=>fl?IH-y:y;
    wall(x0,Y(y0),x1,Y(y0));wall(x0,Y(y1),x1,Y(y1));wall(x0,Y(y0),x0,Y(y1));wall(x1,Y(y0),x1,Y(y1));
    MAZE.vw.forEach((row,r)=>row.forEach((v,c)=>{if(v){const x=cx(c)+P/2;wall(x,Y(cy(r)-P/2),x,Y(cy(r)+P/2))}}));
    MAZE.hw.forEach((row,r)=>row.forEach((v,c)=>{if(v){const y=cy(r)+P/2;wall(cx(c)-P/2,Y(y),cx(c)+P/2,Y(y))}}));
  });
  /* Manual arena rails */
  const ay0=396,ay1=1086;
  world.add(at(box(IW,22,6,fr),IW/2,11,ay0));world.add(at(box(IW,22,6,fr),IW/2,11,ay1));
  world.add(at(box(6,22,ay1-ay0,fr),1,11,(ay0+ay1)/2));world.add(at(box(6,22,ay1-ay0,fr),IW-1,11,(ay0+ay1)/2));
  /* central ball platform: a low raised strip, robots cannot cross it */
  world.add(at(box(36,STRIPH,690,0x3d403f),373,STRIPH/2,740));
  world.add(at(box(30,3,684,0x55585a),373,STRIPH+1.5,740));
  /* goals: floor frame, posts, crossbar that carries the pins, and a translucent net behind it */
  [[84,-1,0xd93a30],[662,1,0x2169c9]].forEach(([gx,sg,col])=>{
    const gy=74,z0=575,z1=912,fx=gx+sg*58,bx=gx-sg*42;
    const bar=(w,h,d,x,y,z)=>world.add(at(box(w,h,d,0xdfe5ec,{metalness:.4,roughness:.4}),x,y,z));
    bar(5,5,z1-z0,gx,gy,(z0+z1)/2);                                            /* crossbar, pins stand on it */
    [z0,z1].forEach(z=>{bar(5,gy,5,gx,gy/2,z);bar(100,4,5,gx+sg*8,2,z);bar(5,gy,5,fx,gy/2,z)});
    bar(5,5,z1-z0,fx,gy,(z0+z1)/2);bar(5,4,z1-z0,fx,2,(z0+z1)/2);bar(5,4,z1-z0,bx,2,(z0+z1)/2);
    const net=new THREE.Mesh(new THREE.BoxGeometry(100,gy,z1-z0),new THREE.MeshStandardMaterial({color:C(col),transparent:true,opacity:.14,roughness:1,depthWrite:false}));
    net.position.set(gx+sg*8,gy/2,(z0+z1)/2);world.add(net);
  });
})();

/* ---------- actor builders ---------- */
function setOpacity(g,o){g.visible=o>.01;for(const m of g.userData.m||[]){m.transparent=o<.99;m.opacity=o}}
function track(g){const l=[];g.traverse(n=>{if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>{if(!l.includes(m))l.push(m)})});g.userData.m=l;return g}
/* arm tip height for a given extension: stowed, low reach (floor / hand-off), high reach (platform) */
function tipH(e){const pts=[[0,34],[.3,34],[.4,20],[.8,20],[.92,PLATH+10],[1,PLATH+10]];
  for(let i=1;i<pts.length;i++)if(e<=pts[i][0]){const[a,b]=pts[i-1],[c,d]=pts[i];return b+(d-b)*(e-a)/(c-a)}return PLATH+10}
const TEAM={r:{body:0x7d1f1f,top:0xa82a2a},b:{body:0x1b3b78,top:0x2a5fb0}};
const B={
 manual(a){const t=TEAM[a.init.team==='b'?'b':'r'],g=new THREE.Group();
  g.add(at(box(86,20,86,t.body),0,22,0));g.add(at(box(52,10,30,t.top),0,37,8));
  const wm=M(0x07090c);[[-48,-17],[48,-17],[-48,23],[48,23]].forEach(([x,z])=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(13,13,9,18),wm);w.rotation.z=Math.PI/2;w.position.set(x,13,z);w.castShadow=true;g.add(w)});
  g.add(at(box(22,6,12,0xffc21a),0,34,-34));
  const piv=new THREE.Group();piv.position.set(0,33,-40);g.add(piv);
  const boom=box(12,9,1,0xcfd8e1,{metalness:.5,roughness:.35});piv.add(boom);
  const fingers=new THREE.Group();piv.add(fingers);
  fingers.add(at(box(4,16,12,0xe8eef4),-12,0,0));fingers.add(at(box(4,16,12,0xe8eef4),12,0,0));
  g.userData.upd=(v)=>{const D=49+62*v.ext,h=tipH(v.ext),dz=D-40,dy=h-33,L=Math.hypot(dz,dy)+4;
    boom.scale.z=L;boom.position.set(0,dy/2,-dz/2);boom.rotation.x=Math.atan2(dy,dz);
    fingers.position.set(0,dy,-dz)};
  return track(g)},
 auto(a){const t=TEAM[a.init.team==='b'?'b':'r'],g=new THREE.Group();
  g.add(at(box(54,14,54,0x1c2733),0,15,0));g.add(at(box(40,6,40,t.top),0,25,0));g.add(at(box(14,8,10,0xffc21a),0,27,-18));g.add(at(cyl(5,5,8,0xffffff,14),0,32,4));
  const wm=M(0x07090c);[[-30,-13],[30,-13],[-30,15],[30,15]].forEach(([x,z])=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(9,9,7,16),wm);w.rotation.z=Math.PI/2;w.position.set(x,9,z);w.castShadow=true;g.add(w)});
  return track(g)},
 cube(){const g=new THREE.Group(),m=box(CUBE,CUBE,CUBE,0xffd21a,{roughness:.5});g.add(m);
  const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:C(0x8a6a00)}));g.add(e);return track(g)},
 ball(a){const gr=a.init.c==='g',r=gr?14:10,g=new THREE.Group(),m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),M(gr?0x3fcf5f:0xffd21a,{roughness:.35}));m.castShadow=true;g.add(m);g.userData.r=r;return track(g)},
 pin(a){const g=new THREE.Group();g.add(at(cyl(5,7,60,a.init.c==='r'?0xd93a30:0x2169c9,16),0,30,0));g.add(at(new THREE.Mesh(new THREE.SphereGeometry(7,16,10),M(0xffffff)),0,64,0));g.userData.upd2=true;return track(g)},
 flag(){const g=new THREE.Group();g.add(at(cyl(17,17,5,0x2b2f36,28),0,2.5,0));
  const arrow=new THREE.Group(),s=new THREE.Shape();s.moveTo(0,32);s.lineTo(15,9);s.lineTo(6,9);s.lineTo(6,-18);s.lineTo(-6,-18);s.lineTo(-6,9);s.lineTo(-15,9);s.closePath();
  const ar=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:4,bevelEnabled:false}),M(0xffffff,{roughness:.4}));ar.rotation.x=-Math.PI/2;ar.position.y=5;ar.castShadow=true;arrow.add(ar);
  arrow.add(at(cyl(4,4,7,0xffc21a,12),0,9,0));arrow.add(at(box(12,2,26,0x9b2434),0,5.2,2));g.add(arrow);g.userData.arrow=arrow;g.userData.base=STRIPH;return track(g)},
 plat(a){const g=new THREE.Group(),red=a.init.x<373;
  g.add(at(box(44,3,44,red?0xc9a0a0:0x9fb4d6,{opacity:1}),0,1.5,0));g.add(at(box(8,PLATH-4,8,0xaab2bd),0,PLATH/2,0));
  g.add(at(box(31,5,31,0xe8e2cf),0,PLATH-2.5,0));g.add(at(box(25,1,25,0xf6f1e0),0,PLATH+.5,0));return track(g)},
 person(){const g=new THREE.Group();g.add(at(cyl(7,12,28,0x2f6fe0,16),0,14,0));g.add(at(new THREE.Mesh(new THREE.SphereGeometry(8,16,12),M(0xf3c9a1)),0,36,0));return track(g)},
 ref(){const g=new THREE.Group();g.add(at(cyl(7,12,28,0x111111,16),0,14,0));
  [-5,0,5].forEach(x=>g.add(at(box(1.6,12,1.4,0xffffff),x,17,9)));g.add(at(new THREE.Mesh(new THREE.SphereGeometry(8,16,12),M(0xf3c9a1)),0,36,0));return track(g)},
 shape(a){const i=a.init,g=new THREE.Group(),m=/rgba?\(([^)]+)\)/.exec(i.fill||'rgba(255,255,255,.1)')[1].split(',').map(s=>parseFloat(s)),
    col=new THREE.Color(m[0]/255,m[1]/255,m[2]/255).convertSRGBToLinear(),al=m.length>3?m[3]:1;
  const geo=i.shape==='circle'?new THREE.CircleGeometry(i.w/2,40):new THREE.PlaneGeometry(i.w,i.h);
  const fm=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:Math.min(.5,al+.12),depthWrite:false}));fm.rotation.x=-Math.PI/2;fm.position.y=1.2;g.add(fm);
  const ed=new THREE.EdgesGeometry(geo),ln=new THREE.LineSegments(ed,new THREE.LineBasicMaterial({color:new THREE.Color(i.stroke||'#ffffff').convertSRGBToLinear(),transparent:true}));ln.rotation.x=-Math.PI/2;ln.position.y=1.5;g.add(ln);
  g.userData.m=[fm.material,ln.material];return g}
};

/* ---------- scene state for the current clip ---------- */
let clip=null,OBJ={},LAB={},T=0,playing=false,lastTs=0,speed=1,voice=true,showLabels=true,need=true;
let speaking=false,spkId=0,spkTimer=0,capEnd=null,lastCap='',lastBan=-2,boardKey='';
const actorGroup=new THREE.Group();scene.add(actorGroup);
const TONES={info:['#1f6fd1','#fff'],warn:['#c9302a','#fff'],ok:['#1f8a43','#fff'],yel:['#ffd21a','#111'],dark:['#10161c','#fff']};

function clearActors(){while(actorGroup.children.length){const g=actorGroup.children.pop();g.traverse(n=>{if(n.geometry)n.geometry.dispose()})}OBJ={};LAB={};$('labs').innerHTML='';$('lines').innerHTML=''}
function buildActors(c){
  clearActors();
  for(const id of c.order){const a=c.A[id];
    if(a.type==='label'){
      const t=TONES[a.init.tone]||TONES.info,d=document.createElement('div');d.className='lab';d.textContent=String(a.init.text).replace(/\n/g,' ');d.style.background=t[0];d.style.color=t[1];$('labs').appendChild(d);
      const ln=document.createElementNS('http://www.w3.org/2000/svg','line');ln.setAttribute('stroke',t[0]);ln.setAttribute('stroke-width','2');$('lines').appendChild(ln);
      LAB[id]={d,ln,a};continue}
    if(a.type==='dim'||!B[a.type])continue;
    const g=B[a.type](a);actorGroup.add(g);OBJ[id]={g,a}}
  /* every ball slot of the central platform is filled (13 slots: Y G Y Y flag Y G Y flag Y Y G Y). A slot is skipped when the clip already has its own ball there, so a ball that is thrown leaves an empty slot. */
  const KIND='YGYYFYGYFYYGY',balls=c.order.map(i=>c.A[i]).filter(a=>a.type==='ball');
  for(let k=0;k<13;k++){if(KIND[k]==='F')continue;const y=436+51*k;
    if(balls.some(a=>Math.abs(a.init.x-373)<10&&Math.abs(a.init.y-y)<9))continue;
    const a={init:{c:KIND[k]==='G'?'g':'y'}},g=B.ball(a);g.position.set(373,STRIPH+3+g.userData.r,y);actorGroup.add(g)}
}
/* which follow entry (carry) is active for an actor at time t */
function carry(a,t){for(const f of a.fol)if(t>=f.t0&&t<f.t1)return f;return null}
function restH(a,v){
  if(a.type==='cube'){for(const p of PLATS)if(Math.hypot(v.x-p[0],v.y-p[1])<16)return PLATH+CUBE/2;return CUBE/2}
  if(a.type==='ball'){const r=OBJ[a.id].g.userData.r;return Math.abs(v.x-373)<24?STRIPH+3+r:r}
  return 0}
function place(t){
  for(const id in OBJ){
    const {g,a}=OBJ[id],v=clip.val(id,t);let o=v.o;if(a.init.pulse)o*=.72+.28*Math.sin(t*6);
    let y=0;
    if(a.type==='cube'||a.type==='ball'){
      const f=carry(a,t);y=restH(a,v);
      if(f){const tg=clip.A[f.tgt];
        if(f.arm)y=tipH(clip.val(f.tgt,t).ext)+(a.type==='ball'?-4:0);
        else if(tg.type==='auto')y=34;else if(tg.type==='person')y=36;else y=40}
      y+=Math.max(0,v.s-1)*(a.type==='ball'?60:46);
      g.scale.setScalar(1);
    }else if(a.type==='manual'||a.type==='auto'){
      const f=carry(a,t);if(f&&clip.A[f.tgt].type==='person')y=26;
      g.scale.setScalar(v.s);
    }else if(a.type==='flag'){y=STRIPH+3;g.scale.setScalar(v.s);g.userData.arrow.rotation.y=-v.r*D2R}
    else if(a.type==='pin'){
      const tf=Math.min(1,Math.abs(v.r)/85),dx=v.x-a.init.x;y=74*(1-tf)+7*tf;g.rotation.z=-Math.sign(dx||1)*tf*85*D2R;
    }
    g.position.set(v.x,y,v.y);
    if(a.type!=='flag'&&a.type!=='pin'&&a.type!=='person'&&a.type!=='ref'&&a.type!=='shape'&&a.type!=='plat')g.rotation.y=-v.r*D2R;
    if(g.userData.upd)g.userData.upd(v);
    setOpacity(g,o);
  }
  /* labels: HTML boxes joined by a line to the object they point at */
  const w=stage.clientWidth,h=stage.clientHeight;
  for(const id in LAB){const {d,ln,a}=LAB[id],v=clip.val(id,t),show=showLabels&&v.o>.05&&a.init.tx!==undefined;
    d.style.display=show?'block':'none';ln.style.display=show?'block':'none';if(!show)continue;
    const p=new THREE.Vector3(v.x,10,v.y).project(cam),q=new THREE.Vector3(a.init.tx,16,a.init.ty).project(cam);
    const sx=(p.x*.5+.5)*w,sy=(-p.y*.5+.5)*h,tx=(q.x*.5+.5)*w,ty=(-q.y*.5+.5)*h,beh=p.z>1||q.z>1;
    d.style.left=sx+'px';d.style.top=sy+'px';d.style.opacity=Math.min(1,v.o)*(beh?0:1);
    ln.setAttribute('x1',sx);ln.setAttribute('y1',sy);ln.setAttribute('x2',tx);ln.setAttribute('y2',ty);ln.style.opacity=Math.min(1,v.o)*(beh?0:1)}
}

/* ---------- camera: guided (follows the clip's own view window) or free ---------- */
let camMode='guided',tween=null;
const dir=new THREE.Vector3(.0,.82,.58).normalize();
function fitDist(vw,vh,elev){const th=Math.tan(19*D2R),asp=cam.aspect;return Math.max(vh*Math.sin(elev)/(2*th),vw/(2*th*asp))*1.12}
function setCamMode(m){camMode=m;const g=m==='guided';ctl.enablePan=!g;ctl.enableZoom=!g;
  document.querySelectorAll('#cams button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m?'true':'false'))}
function preset(m){
  const tgt=new THREE.Vector3(373,0,741);let d;
  if(m==='top'){d=fitDist(IW,IH,Math.PI/2)*1.04;tween={t:0,to:tgt,pos:new THREE.Vector3(373,d,741.01)}}
  else{const dr=m==='red'?new THREE.Vector3(-.78,.5,.38):m==='blue'?new THREE.Vector3(.78,.5,.38):new THREE.Vector3(0,.82,.58);dr.normalize();
    d=fitDist(IW,IH,Math.asin(dr.y))*(m==='whole'?1.0:.8);tween={t:0,to:tgt,pos:tgt.clone().add(dr.multiplyScalar(d))}}
  tween.from=ctl.target.clone();tween.p0=cam.position.clone();setCamMode('free')}
function stepCam(dt){
  if(tween){tween.t=Math.min(1,tween.t+dt/.9);const f=tween.t*tween.t*(3-2*tween.t);ctl.target.lerpVectors(tween.from,tween.to,f);cam.position.lerpVectors(tween.p0,tween.pos,f);if(tween.t>=1)tween=null}
  else if(camMode==='guided'&&clip){
    const v=clip.camAt(T),tg=new THREE.Vector3(v[0]+v[2]/2,0,v[1]+v[3]/2),k=1-Math.exp(-dt*5);
    const off=cam.position.clone().sub(ctl.target);if(off.y<20)off.y=20;const e=Math.asin(off.y/off.length());
    const want=fitDist(v[2],v[3],e);off.setLength(off.length()+(want-off.length())*k);
    ctl.target.lerp(tg,k);cam.position.copy(ctl.target).add(off)}
  ctl.update()}

/* ---------- scoreboard, chips, banner, caption (same data as the 2D page) ---------- */
function buildBoard(c){
  const b=$('board');boardKey='';
  if(!c.board||!c.sc.length){b.innerHTML='<h4>SCOREBOARD</h4><p class="empty">This clip has no score events.</p>';return}
  let h='<h4>SCOREBOARD</h4>';
  h+=c.twoSide?'<div class="btotal"><span class="sr">RED</span><b id="btR" class="sr">0</b><span class="sb">BLUE</span><b id="btB" class="sb">0</b></div>':'<div class="btotal"><span>TOTAL</span><b id="bt">0</b></div>';
  b.innerHTML=h;
  c.sc.forEach(e=>{const r=document.createElement('div');r.className='brow';const l=document.createElement('span');
    l.textContent=(e.side==='R'?'RED · ':e.side==='B'?'BLUE · ':'')+e.label;if(e.side)l.className=e.side==='R'?'sr':'sb';
    const p=document.createElement('b');p.textContent=(e.pts>0?'+':e.pts<0?'−':'')+Math.abs(e.pts);if(e.pts<0)p.className='neg';
    r.appendChild(l);r.appendChild(p);b.appendChild(r)});
}
function hudSample(t){
  const c=clip;
  if(c.board&&c.sc.length){
    let tot=0,tR=0,tB=0,key='',nw=-1;
    c.sc.forEach((e,i)=>{if(t>=e.t){tot+=e.pts;if(e.side==='R')tR+=e.pts;if(e.side==='B')tB+=e.pts;key+=i+',';if(t-e.t<2.4)nw=i}});
    key+='|'+nw;
    if(key!==boardKey){boardKey=key;
      [...$('board').querySelectorAll('.brow')].forEach((r,i)=>{r.classList.toggle('on',t>=c.sc[i].t);r.classList.toggle('new',i===nw)});
      const bt=$('bt');if(bt)bt.textContent=tot;const br=$('btR');if(br){br.textContent=tR;$('btB').textContent=tB}
      const ts=$('toast');if(nw>=0){const e=c.sc[nw];ts.textContent=(e.pts>0?'+':'−')+Math.abs(e.pts)+' pts · '+e.label;ts.className='on'+(e.pts<0?' neg':'')}else ts.className=''}
  }else $('toast').className='';
  const keys={};for(const ch of c.chips)if(ch.t0<=t)keys[ch.key]=ch;
  let html='';for(const k in keys){const ch=keys[k];let txt=ch.text;
    if(ch.kind==='c'){const f=Math.min(1,Math.max(0,(t-ch.t0)/(ch.t1-ch.t0)));txt=`${ch.prefix} ${Math.max(0,Math.ceil(ch.from+(ch.to-ch.from)*f))} s`}
    if(txt)html+=`<span class="chip ${ch.tone}">${txt}</span>`}
  const hud=$('hud');if(hud.dataset.h!==html){hud.innerHTML=html;hud.dataset.h=html}
  let bi=-1;c.bans.forEach((b,i)=>{if(t>=b.t0&&t<b.t1)bi=i});
  if(bi!==lastBan){lastBan=bi;const bn=$('banner');if(bi<0)bn.className='banner';else{bn.textContent=c.bans[bi].text;bn.className='banner on '+c.bans[bi].tone}}
  let cp='',ce=null;for(const x of c.caps)if(t>=x.t0&&t<x.t1){cp=x.text;ce=x.t1}
  capEnd=cp?ce:null;
  if(cp!==lastCap){lastCap=cp;$('sub').textContent=cp||' ';if(voice&&cp&&playing)speak(cp)}
  $('sc').value=Math.round(t/c.dur*1000);$('tm').textContent=t.toFixed(1)+' / '+c.dur.toFixed(0)+' s';
}

/* ---------- English voice narration; the clip holds at the end of a caption until its sentence is spoken ---------- */
let VOICE=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices();if(!vs.length)return null;
  return vs.find(v=>/^en[-_]US/i.test(v.lang)&&/natural|google|samantha|aria|jenny|guy/i.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}catch(e){return null}}
function speak(txt){try{
  if(!('speechSynthesis' in window)){speaking=false;return}
  speechSynthesis.cancel();const id=++spkId,u=new SpeechSynthesisUtterance(txt);u.lang='en-US';
  const v=VOICE||(VOICE=pickVoice());if(v)u.voice=v;u.rate=Math.min(1.5,Math.max(.9,speed>1?1+(speed-1)*.5:1));
  const done=()=>{if(id!==spkId)return;speaking=false;clearTimeout(spkTimer)};u.onend=done;u.onerror=done;
  speaking=true;clearTimeout(spkTimer);spkTimer=setTimeout(done,Math.max(2500,txt.length/12*1000/u.rate+1500));speechSynthesis.speak(u)}catch(e){speaking=false}}
function stopSpeak(){try{spkId++;speaking=false;clearTimeout(spkTimer);if('speechSynthesis' in window)speechSynthesis.cancel()}catch(e){}}
if('speechSynthesis' in window){try{speechSynthesis.onvoiceschanged=()=>{VOICE=null}}catch(e){}}

/* ---------- player ---------- */
function ui(){$('pp').textContent=playing?'❚❚ Pause':(T>=clip.dur-.01?'▶ Replay':'▶ Play')}
function sample(t){place(t);hudSample(t);need=true}
function play(){if(T>=clip.dur-.01)T=0;playing=true;lastTs=performance.now();lastCap='\u0000';ui()}
function pause(){playing=false;stopSpeak();ui()}
function seek(t){stopSpeak();T=Math.max(0,Math.min(clip.dur,t));lastCap='\u0000';lastBan=-2;boardKey='';sample(T);ui()}
function openClip(id){
  stopSpeak();playing=false;clip=CLIPS[id]();buildActors(clip);buildBoard(clip);T=0;lastCap='\u0000';lastBan=-2;$('hud').dataset.h='x';sample(0);ui();
  document.querySelectorAll('#tabs .tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.id===id?'true':'false'));
  if(camMode==='guided'){const v=clip.camAt(0);ctl.target.set(v[0]+v[2]/2,0,v[1]+v[3]/2);const d=fitDist(v[2],v[3],Math.asin(dir.y));cam.position.copy(ctl.target).add(dir.clone().multiplyScalar(d))}
}
let last=performance.now(),curId=MATCHES[0][0];
function frame(ts){
  const dt=Math.min(.1,(ts-last)/1000);last=ts;
  if(playing&&clip){let adv=dt*speed;if(voice&&speaking&&capEnd!==null&&T+adv>capEnd-.02)adv=Math.max(0,capEnd-.02-T);
    T+=adv;if(T>=clip.dur){T=clip.dur;playing=false;ui()}sample(T)}
  stepCam(dt);
  if(clip)place(T);                         /* labels follow the moving camera */
  R.render(scene,cam);requestAnimationFrame(frame)
}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}

/* ---------- wiring ---------- */
MATCHES.forEach(([id,txt])=>{const b=document.createElement('button');b.className='tab';b.type='button';b.role='tab';b.dataset.id=id;b.textContent=txt;
  b.onclick=()=>{curId=id;openClip(id)};$('tabs').appendChild(b)});
['A','B','C'].forEach(k=>{const b=document.createElement('button');b.type='button';b.textContent=k;b.dataset.k=k;b.setAttribute('aria-pressed',k==='A'?'true':'false');
  b.onclick=()=>{setEnt(k);document.querySelectorAll('#ents button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.k===k?'true':'false'));openClip(curId)};$('ents').appendChild(b)});
[['guided','Guided'],['whole','Whole field'],['top','Top-down'],['red','Red side'],['blue','Blue side'],['free','Free']].forEach(([m,txt])=>{
  const b=document.createElement('button');b.type='button';b.textContent=txt;b.dataset.m=m;b.setAttribute('aria-pressed',m==='guided'?'true':'false');
  b.onclick=()=>{if(m==='guided'){tween=null;setCamMode('guided')}else if(m==='free'){setCamMode('free')}else preset(m)};$('cams').appendChild(b)});
ctl.addEventListener('start',()=>{if(camMode!=='guided')tween=null});
$('pp').onclick=()=>playing?pause():play();
$('rp').onclick=()=>{seek(0);play()};
$('sc').oninput=e=>{pause();seek(clip.dur*e.target.value/1000)};
$('sp').onchange=e=>{speed=+e.target.value};
$('vo').onchange=e=>{voice=e.target.checked;if(!voice)stopSpeak()};
$('lb').onchange=e=>{showLabels=e.target.checked;place(T)};
document.addEventListener('keydown',e=>{if(e.target.matches('input[type=range],select,input,button'))return;if(e.code==='Space'){e.preventDefault();playing?pause():play()}});
new ResizeObserver(resize).observe(stage);resize();setCamMode('guided');
openClip(curId);requestAnimationFrame(frame);
window.__v3={openClip,seek,play,pause,preset,setCamMode,get clip(){return clip},setEnt};

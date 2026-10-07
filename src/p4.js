
/* ---------- rule index ---------- */
const GROUPS=[
 {h:'Schedule and documents',r:[
  ['doc','DOCS','Schedule: competition day · report and video','Compete 19 Nov · report and video 21 Nov','1','doc-schedule'],
  ['doc','DOCS','Report','Code + flowchart · drawings · theory and sample calculations · copying penalty','1','doc-report'],
  ['doc','DOCS','SUPER COOL video','1 minute, portrait 9:16, made with AI, with sound and your whole team','1','doc-video'],
  ['doc','DOCS','Code and GitHub','Public repo of the team leader · folder structure · Auto/Manual code rules','14','doc-code']]},
 {h:'Arena and equipment',r:[
  ['auto','AUTO','Auto arena (the maze)','Red A / Blue B · 20×20 cm cells · three entrances per side · handle both sides','2','arena-auto'],
  ['man','MANUAL','Manual arena','2443 × 2215 mm · 15 cm frame · zones A and B','2–3','arena-manual'],
  ['both','BOTH','Equipment on the field','cube · Cube Base · start marker · goalpost · balls · pins · Reversed Flag · central area','6–13','components'],
  ['man','MANUAL','Central ball platform','13 ball slots, 170 mm apart · two Reverse Flags (slots 5 and 9) · robots cannot cross it','7–13','central'],
  ['man','MANUAL','Cube Base platform and goalpost size','Goal 1000 × 400 mm · pins 250 mm · platform 5 cm from the frame · 320 mm tall (300 stem + 15 + 5)','7–9','platform']]},
 {h:'Robots and inspection',r:[
  ['auto','AUTO','Auto robot requirements','16×16×∞ cm · sensors ≤ 5 · Yellow DC motors ≤ 2 · no ready-made kits','15','robot-auto'],
  ['man','MANUAL','Manual robot requirements','32×32×45 cm fully retracted · Manual set only · extra motors ≤ 1','15','robot-manual'],
  ['both','BOTH','Damaged parts and returning kits','−5 points per part · no glue, tape, cutting or drilling · return in perfect condition','15','robot-damage'],
  ['both','BOTH','Inspection before every match','Fit the acrylic sizing box (Manual: fully retracted) before each match, or fix and re-check','16','robot-inspect']]},
 {h:'Start entrance draw',r:[
  ['both','BOTH','Entrance draw: final match only','Ranking matches always start at Entrance 1 (A) · a random draw picks the entrance for the final','16','draw']]},
 {h:'Ranking match · Auto phase (90 s)',r:[
  ['auto','AUTO','Start the match and drive to the Parking Zone','Team plays alone · starts at Entrance 1 (A) holding the cube · never set it on the floor','16','auto-run'],
  ['auto','AUTO','Cube dropped before Parking → Relaunch','Relaunch at Entrance 1 (A) with a new cube · tell the referee · carry the robot back','16','relaunch'],
  ['auto','AUTO','Relaunch again, and repair the robot','As often as you like inside 90 s · the clock never stops · Manual stays still','16','relaunch2'],
  ['auto','AUTO','Cube dropped → keep going without it','You may park without the cube · Manual waits for the full 90 s','16–17','continue']]},
 {h:'Cube hand-off from Auto to Manual',r:[
  ['both','BOTH','Manual takes the cube from the Auto robot','Moves after the announcement · takes it from the mechanism · places it on the Cube Base','17','handoff'],
  ['man','MANUAL','Picking the cube up from the Auto field floor','Auto field floor, Parking Zone included · picking it up scores nothing','17','floor'],
  ['man','MANUAL','7c · Cube falls off the Cube Base platform','The Manual robot may pick it up from the Manual field floor and place it again','7c','plat-fall'],
  ['both','BOTH','7d · Cube leaves the arena','The referee places it back into the autonomous robot parked in the Parking Zone','7d','plat-out'],
  ['both','BOTH','Cube dropped in the Auto field during hand-off','PAUSE · one teammate reloads the Auto robot · Manual retakes it and still scores','17','drop-auto'],
  ['man','MANUAL','Cube dropped in the Manual field','Pick it up from the floor and place it on the Cube Base · alliance partner may help','17','drop-manual']]},
 {h:'End of Auto and the Manual phase',r:[
  ['auto','AUTO','End of the Auto phase (90 s)','No more parking points · held cube is removed · stop the robot within 10 s · nobody enters the Manual field','17','auto-end'],
  ['man','MANUAL','Manual phase (120 s)','Grab balls from the central area · shoot the goal and pins · flip the Reversed Flag','18','manual-phase']]},
 {h:'Penalties',r:[
  ['auto','AUTO','Auto robot not stopped in time','Referee orders a stop · 10 seconds · −5 points if it is still moving','17','auto-end-late'],
  ['man','MANUAL','Manual robot moves early','Moving before the referee’s announcement · −5 · return to the starting point','—','early'],
  ['both','BOTH','A person touches the cube or a robot','Platform points are void · exempt: relaunch carrying, post-time-up stopping, referee-approved reload','—','touch'],
  ['man','MANUAL','Ball penalties','Picking a ball out of the goal −5 each · balls not returned to original position −5','—','balls']]},
 {h:'Scoring and full matches',r:[
  ['score','SCORE','Scoring table','Every task value and penalty from the scoring sheet · the ranking score is the total','—','scoring'],
  ['score','MATCH','Full ranking match: clean run','Inspection → Auto → hand-off → Manual phase, with a live scoreboard','16–18','full-clean'],
  ['score','MATCH','Full ranking match: with two drops','Cube dropped in the Auto field and relaunched · cube dropped in the Manual field and recovered','16–18','full-drops'],
  ['score','MATCH','Final match: red alliance vs blue alliance','Eight robots: red 2 Auto + 2 Manual, blue 2 Auto + 2 Manual · own-side platforms · Manual robots play on right after placing · a cube is knocked off and recovered','—','final']]}
];
const $=id=>document.getElementById(id);
const listEl=$('list');
GROUPS.forEach(g=>{
  const sec=document.createElement('section');sec.className='group';
  sec.innerHTML=`<h2>${g.h}<small>${g.r.length} ${g.r.length>1?'clips':'clip'}</small></h2>`;
  g.r.forEach(r=>{
    const [cls,tag,title,desc,pg,clip]=r;
    const b=document.createElement('button');b.className='rule';
    b.innerHTML=`<span class="tag ${cls}">${tag}</span><span class="rt">${title}<span class="rd">${desc}</span></span><span class="go"><b>▶ Watch clip</b>${pg==='—'?'':'page '+pg}</span>`;
    b.onclick=()=>openClip(clip,title,desc,b);
    sec.appendChild(b);
  });
  listEl.appendChild(sec);
});
/* drawn-entrance selector */
(function(){
  const seg=$('entSeg');
  Object.keys(ENTS).forEach(k=>{
    const b=document.createElement('button');b.textContent=`Entrance ${ENTS[k].n} (${k})`;b.setAttribute('aria-pressed',k===FINAL_ENT);
    b.onclick=()=>{FINAL_ENT=k;[...seg.children].forEach(x=>x.setAttribute('aria-pressed',x===b))};
    seg.appendChild(b);
  });
})();
/* read-only scoring table */
(function(){
  const tb=$('stbl');
  Object.keys(SCORE).forEach(k=>{
    const s=SCORE[k],tr=document.createElement('tr');
    tr.innerHTML=`<td></td><td></td>`;
    tr.firstChild.textContent=s.label;
    const tag=document.createElement('span');tag.className='stag'+(s.ok?' set':'');tag.textContent=s.ok?'FROM SCORING SHEET':'DRAFT';tr.firstChild.appendChild(tag);
    const val=document.createElement('b');val.className='sval';val.textContent=(s.pts>0?'+':s.pts<0?'−':'')+Math.abs(s.pts);
    tr.lastChild.appendChild(val);tb.appendChild(tr);
  });
})();
/* sticky map */
(function(){
  const m=$('map');const img=new Image();img.src=FIELD;img.alt='Competition field: Auto maze on top, Manual arena below';m.appendChild(img);
  const s1=START_OF('A'),s2=START_OF('B'),s3=START_OF('C');
  [['Reverse Flag',373,639,-90],['Reverse Flag',373,844,90]].forEach(([t,x,y,r])=>{const a=document.createElement('span');a.className='mflag';a.style.left=(x/IW*100)+'%';a.style.top=(y/IH*100)+'%';a.style.transform='translate(-50%,-50%) rotate('+r+'deg)';a.innerHTML='<svg viewBox="-20 -34 40 56" width="100%" height="100%"><circle r="14" fill="#2b2f36" stroke="#fff" stroke-width="2.5"/><rect x="-5" y="-4" width="10" height="22" rx="2" fill="#9b2434" stroke="#fff" stroke-width="1.5"/><path d="M0 -32 L14 -9 L-14 -9Z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>';a.title=t;m.appendChild(a)});
  [['Start1 (A)',...s1],['Start2 (B)',...s2],['Start3 (C)',...s3],['Parking Zone',338,335],['Manual start',82,457],['Cube Base',84,545],['Goalpost',666,744],['Central area',373,520]].forEach(([t,x,y])=>{
    const p=document.createElement('span');p.className='pill';p.textContent=t;p.style.left=(x/IW*100)+'%';p.style.top=(y/IH*100)+'%';if(x<110)p.style.transform='translate(0,-50%)';if(x>600)p.style.transform='translate(-100%,-50%)';m.appendChild(p)});
})();

/* ---------- svg renderer ---------- */
const TONES={info:['#1f6fd1','#fff'],warn:['#c9302a','#fff'],ok:['#1f8a43','#fff'],yel:['#ffd21a','#111'],dark:['#10161c','#fff']};
function E(n,a,p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
const DR={
 auto(g,h,a){const B=a.init.team==='b';
  E('rect',{x:-32,y:-22,width:6,height:18,rx:2,fill:'#05080b'},g);E('rect',{x:26,y:-22,width:6,height:18,rx:2,fill:'#05080b'},g);
  E('rect',{x:-32,y:6,width:6,height:18,rx:2,fill:'#05080b'},g);E('rect',{x:26,y:6,width:6,height:18,rx:2,fill:'#05080b'},g);
  E('rect',{x:-27,y:-27,width:54,height:54,rx:9,fill:'#1c2733',stroke:'#fff','stroke-width':2.5},g);
  E('rect',{x:-22,y:-38,width:6,height:16,rx:2,fill:'#e8eef4'},g);E('rect',{x:16,y:-38,width:6,height:16,rx:2,fill:'#e8eef4'},g);
  E('path',{d:'M-9 -10 L0 -23 L9 -10 Z',fill:'#ffc21a'},g);
  E('rect',{x:-16,y:0,width:32,height:16,rx:3,fill:B?'#2169c9':'#d93a30'},g);E('circle',{cx:0,cy:8,r:3,fill:'#fff'},g)},
 manual(g,h,a){const B=a.init.team==='b';
  [[-52,-30],[44,-30],[-52,10],[44,10]].forEach(([x,y])=>E('rect',{x,y,width:8,height:26,rx:3,fill:'#05080b'},g));
  h.arm=E('rect',{x:-8,y:-43,width:16,height:4,fill:'#cfd8e1',stroke:'#111','stroke-width':1.5},g);
  h.cl=E('g',{},g);E('rect',{x:-13,y:-8,width:4,height:14,rx:1,fill:'#e8eef4'},h.cl);E('rect',{x:9,y:-8,width:4,height:14,rx:1,fill:'#e8eef4'},h.cl);
  E('rect',{x:-43,y:-43,width:86,height:86,rx:12,fill:B?'#1b3b78':'#7d1f1f',stroke:'#fff','stroke-width':3},g);
  E('path',{d:'M-14 -26 L0 -40 L14 -26 Z',fill:'#ffc21a'},g);E('rect',{x:-26,y:-8,width:52,height:30,rx:5,fill:B?'#2a5fb0':'#a82a2a'},g);E('circle',{cx:0,cy:7,r:5,fill:'#fff'},g)},
 cube(g){E('rect',{x:-11,y:-11,width:22,height:22,rx:3,fill:'#ffd21a',stroke:'#8a6a00','stroke-width':2},g)},
 ball(g,h,a){const r=a.init.c==='g'?14:10;E('circle',{r,fill:a.init.c==='g'?'#3fcf5f':'#ffd21a',stroke:'#17331f','stroke-width':1.5},g);E('circle',{cx:-r*.3,cy:-r*.3,r:r*.28,fill:'rgba(255,255,255,.55)'},g)},
 pin(g,h,a){E('circle',{r:9,fill:a.init.c==='r'?'#d93a30':'#2169c9',stroke:'#fff','stroke-width':2},g);E('circle',{r:3,fill:'#fff'},g)},
 flag(g){E('circle',{r:17,fill:'#2b2f36',stroke:'#fff','stroke-width':2.5},g);
  E('rect',{x:-6,y:-6,width:12,height:26,rx:2,fill:'#9b2434',stroke:'#fff','stroke-width':1.5},g);
  E('path',{d:'M0 -32 L15 -9 L-15 -9 Z',fill:'#ffffff',stroke:'#111','stroke-width':1.5,'stroke-linejoin':'round'},g);E('circle',{r:4,fill:'#ffc21a',stroke:'#111','stroke-width':1.2},g)},
 plat(g){E('rect',{x:-22,y:-22,width:44,height:44,rx:3,fill:'rgba(205,210,218,.55)',stroke:'#fff','stroke-width':1.5},g);E('rect',{x:-15.5,y:-15.5,width:31,height:31,fill:'#e8e2cf',stroke:'#5d5640','stroke-width':2},g);E('rect',{x:-13.3,y:-13.3,width:26.6,height:26.6,fill:'#f6f1e0'},g)},
 person(g){E('path',{d:'M-13 14 Q0 -6 13 14 Z',fill:'#2f6fe0',stroke:'#fff','stroke-width':1.5},g);E('circle',{cy:-7,r:8,fill:'#f3c9a1',stroke:'#222','stroke-width':1.5},g)},
 ref(g){E('path',{d:'M-13 14 Q0 -6 13 14 Z',fill:'#111',stroke:'#fff','stroke-width':1.5},g);E('path',{d:'M-6 10 L-4 2 M0 10 L0 0 M6 10 L4 2',stroke:'#fff','stroke-width':2},g);E('circle',{cy:-7,r:8,fill:'#f3c9a1',stroke:'#222','stroke-width':1.5},g)},
 shape(g,h,a){const i=a.init;if(i.shape==='circle')E('circle',{r:i.w/2,fill:i.fill,stroke:i.stroke||'none','stroke-width':i.sw||0,'stroke-dasharray':i.dash||''},g);
  else E('rect',{x:-i.w/2,y:-i.h/2,width:i.w,height:i.h,rx:i.rx||4,fill:i.fill,stroke:i.stroke||'none','stroke-width':i.sw||0,'stroke-dasharray':i.dash||''},g)},
 raw(g,h,a){a.init.draw(g,h,a)},
 label(g,h,a){
  const i=a.init,t=TONES[i.tone]||TONES.info;
  h.ln=E('line',{x1:0,y1:0,x2:0,y2:0,stroke:t[0],'stroke-width':2.5},g);h.dot=E('circle',{r:4.5,fill:t[0]},g);
  const bg=E('rect',{rx:7,fill:t[0],stroke:'rgba(255,255,255,.7)','stroke-width':1},g);
  const tx=E('text',{'text-anchor':'middle','font-size':i.size||13,'font-weight':600,fill:t[1],style:"font-family:'IBM Plex Sans',system-ui,sans-serif"},g);
  String(i.text).split('\n').forEach((ln,k)=>{const s=E('tspan',{x:0,dy:k?(i.size||13)*1.25:0},tx);s.textContent=ln});
  h.bg=bg;h.tx=tx;h.pending=true},
 dim(g,h,a){const i=a.init,dx=i.x2-i.x,dy=i.y2-i.y;
  E('line',{x1:0,y1:0,x2:dx,y2:dy,stroke:'#ffd21a','stroke-width':3},g);
  const L=Math.hypot(dx,dy),nx=-dy/L*9,ny=dx/L*9;
  E('line',{x1:-nx,y1:-ny,x2:nx,y2:ny,stroke:'#ffd21a','stroke-width':3},g);E('line',{x1:dx-nx,y1:dy-ny,x2:dx+nx,y2:dy+ny,stroke:'#ffd21a','stroke-width':3},g);
  const bg=E('rect',{rx:6,fill:'#ffd21a'},g);const tx=E('text',{x:dx/2,y:dy/2+5,'text-anchor':'middle','font-size':14,'font-weight':700,fill:'#111',style:"font-family:'IBM Plex Mono',monospace"},g);tx.textContent=i.text;h.bg=bg;h.tx=tx;h.cx=dx/2;h.cy=dy/2;h.pending=true}
};
const ZORD={shape:1,plat:1,raw:1,pin:2,flag:2,manual:3,auto:4,cube:5,ball:5,person:6,ref:6,dim:7,label:8};
function fitText(h){
  if(!h.pending)return;h.pending=false;
  try{const b=h.tx.getBBox();if(h.cx!==undefined){h.bg.setAttribute('x',b.x-8);h.bg.setAttribute('y',b.y-3);h.bg.setAttribute('width',b.width+16);h.bg.setAttribute('height',b.height+6)}
  else{h.bg.setAttribute('x',b.x-9);h.bg.setAttribute('y',b.y-4);h.bg.setAttribute('width',b.width+18);h.bg.setAttribute('height',b.height+8)}}catch(e){}
}

/* ---------- player ---------- */
let clip=null,H={},SV=null,T=0,playing=false,lastTs=0,speed=1,voice=true,opener=null,lastCap='',lastBan=-1,capEnd=null;
let speaking=false,spkId=0,spkTimer=0,boardKey='';
function buildStage(c){
  const old=$('stage').querySelector('svg, .cardsbody');if(old)old.remove();H={};SV=null;
  if(c.type==='cards'){
    const d=document.createElement('div');d.className='cardsbody';
    c.rows.forEach(r=>{const e=document.createElement('div');e.className='crow';e.innerHTML=`<span class="b ${r.tone}"></span><span class="x"></span>`;e.firstChild.textContent=r.badge;e.lastChild.textContent=r.text;d.appendChild(e)});
    $('stage').insertBefore(d,$('hud'));return;
  }
  const [vx,vy,vw,vh]=c.view;
  const svg=E('svg',{viewBox:`${vx} ${vy} ${vw} ${vh}`,role:'img','aria-label':'Animation on the field map',preserveAspectRatio:'xMidYMid meet'});SV=svg;
  if(c.bg){E('rect',{x:vx-50,y:vy-50,width:vw+100,height:vh+100,fill:c.bg},svg)}
  else{E('rect',{x:-100,y:-200,width:IW+200,height:IH+400,fill:'#0b1016'},svg);E('image',{x:0,y:0,width:IW,height:IH,href:FIELD},svg)}
  const layer=E('g',{},svg);
  $('stage').insertBefore(svg,$('hud'));
  const ids=c.order.slice().sort((a,b)=>(ZORD[c.A[a].type]||3)-(ZORD[c.A[b].type]||3));
  ids.forEach(id=>{const a=c.A[id],g=E('g',{},layer),h={g};H[id]=h;DR[a.type](g,h,a)});
  ids.forEach(id=>fitText(H[id]));
}
function buildBoard(c){
  const b=$('board'),w=$('stagewrap');boardKey='';
  if(!c.board||!c.sc.length){b.hidden=true;w.classList.remove('hasboard');return}
  b.hidden=false;w.classList.add('hasboard');
  const anyDraft=c.sc.some(e=>e.draft);
  b.innerHTML='<h4>SCOREBOARD</h4>';
  c.sc.forEach(e=>{const r=document.createElement('div');r.className='brow'+(e.pts<0?' negr':'');
    const l=document.createElement('span');l.textContent=(e.side==='R'?'RED · ':e.side==='B'?'BLUE · ':'')+e.label;if(e.side)l.className=e.side==='R'?'sr':'sb';if(e.draft){const d=document.createElement('span');d.className='dtag';d.textContent='DRAFT';l.appendChild(d)}
    const p=document.createElement('b');p.textContent=(e.pts>0?'+':e.pts<0?'−':'')+Math.abs(e.pts);if(e.pts<0)p.className='neg';else if(e.pts===0)p.className='zero';
    r.appendChild(l);r.appendChild(p);b.appendChild(r)});
  const tot=document.createElement('div');tot.className='btotal';tot.innerHTML=c.twoSide?'<span class="sr">RED</span><b id="btotR" class="sr">0</b><span class="sb">BLUE</span><b id="btotB" class="sb">0</b>':'<span>TOTAL</span><b id="btot">0</b>';if(c.twoSide){tot.classList.add('top');b.insertBefore(tot,b.children[1])}else b.appendChild(tot);
  if(anyDraft){const n=document.createElement('p');n.className='bnote';n.textContent='DRAFT values are placeholders.';b.appendChild(n)}
}
function sample(t){
  const c=clip;
  if(c.type==='cards'){
    [...$('stage').querySelectorAll('.crow')].forEach((e,i)=>{const r=c.rows[i],nx=c.rows[i+1];e.classList.toggle('on',t>=r.t);e.classList.toggle('now',t>=r.t&&(!nx||t<nx.t))});
  } else {
    if(c.cam&&SV)SV.setAttribute('viewBox',c.camAt(t).map(v=>v.toFixed(1)).join(' '));
    for(const id of c.order){
      const a=c.A[id],h=H[id],v=c.val(id,t);
      let o=v.o;if(a.init.pulse)o*=.72+.28*Math.sin(t*6);
      h.g.setAttribute('opacity',o.toFixed(3));
      const rr=(a.type==='person'||a.type==='ref'||a.type==='label'||a.type==='dim')?0:v.r;
      h.g.setAttribute('transform',`translate(${v.x.toFixed(1)} ${v.y.toFixed(1)}) rotate(${rr.toFixed(1)}) scale(${v.s.toFixed(3)})`);
      if(a.type==='manual'){const L=62*v.ext;h.arm.setAttribute('y',-43-L);h.arm.setAttribute('height',L+4);h.cl.setAttribute('transform',`translate(0 ${-43-L-4})`)}
      if(a.type==='label'&&a.init.tx!==undefined){h.ln.setAttribute('x2',a.init.tx-v.x);h.ln.setAttribute('y2',a.init.ty-v.y);h.dot.setAttribute('cx',a.init.tx-v.x);h.dot.setAttribute('cy',a.init.ty-v.y)}
    }
  }
  /* scoreboard + toast */
  if(c.board&&c.sc.length){
    let tot=0,tR=0,tB=0,key='',newest=-1;
    c.sc.forEach((e,i)=>{if(t>=e.t){tot+=e.pts;if(e.side==='R')tR+=e.pts;if(e.side==='B')tB+=e.pts;key+=i+',';if(t-e.t<2.4)newest=i}});
    key+='|'+newest;
    if(key!==boardKey){boardKey=key;
      [...$('board').querySelectorAll('.brow')].forEach((r,i)=>{r.classList.toggle('on',t>=c.sc[i].t);r.classList.toggle('new',i===newest)});
      const bt=$('btot');if(bt)bt.textContent=tot;const br=$('btotR');if(br){br.textContent=tR;$('btotB').textContent=tB}
      const ts=$('toast');
      if(newest>=0){const e=c.sc[newest];ts.textContent=(e.pts>0?'+':e.pts<0?'−':'')+Math.abs(e.pts)+' pts · '+e.label;ts.className='toast on'+(e.pts<0?' neg':e.pts===0?' zero':'')}
      else ts.className='toast';
    }
  } else {$('toast').className='toast'}
  /* chips */
  const keys={};for(const ch of c.chips)if(ch.t0<=t){keys[ch.key]=ch}
  const hud=$('hud');let html='';
  for(const k in keys){const ch=keys[k];let txt=ch.text;
    if(ch.kind==='c'){const f=Math.min(1,Math.max(0,(t-ch.t0)/(ch.t1-ch.t0)));txt=`${ch.prefix} ${Math.max(0,Math.ceil(ch.from+(ch.to-ch.from)*f))} s`}
    if(txt)html+=`<span class="chip ${ch.tone}">${txt}</span>`}
  if(hud.dataset.h!==html){hud.innerHTML=html;hud.dataset.h=html}
  /* banner */
  let bi=-1;c.bans.forEach((b,i)=>{if(t>=b.t0&&t<b.t1)bi=i});
  const bn=$('banner');
  if(bi!==lastBan){lastBan=bi;if(bi<0){bn.className='banner'}else{bn.textContent=c.bans[bi].text;bn.className='banner on '+c.bans[bi].tone}}
  /* caption (the last matching one wins) */
  let cp='',cpEnd=null;for(const x of c.caps)if(t>=x.t0&&t<x.t1){cp=x.text;cpEnd=x.t1}
  capEnd=cp?cpEnd:null;
  if(cp!==lastCap){lastCap=cp;$('sub').textContent=cp||' ';if(voice&&cp&&playing)speak(cp)}
  $('sc').value=Math.round(t/c.dur*1000);
  $('tm').textContent=t.toFixed(1)+' / '+c.dur.toFixed(0)+' s';
}
/* ---------- English voice narration. The clip holds at the end of a caption until its sentence has been spoken. ---------- */
let VOICE=null;
function pickVoice(){
  try{const vs=speechSynthesis.getVoices();if(!vs.length)return null;
    return vs.find(v=>/^en[-_]US/i.test(v.lang)&&/natural|google|samantha|aria|jenny|guy/i.test(v.name))||vs.find(v=>/^en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}catch(e){return null}
}
function speak(txt){
  try{
    if(!('speechSynthesis' in window)){speaking=false;return}
    speechSynthesis.cancel();
    const id=++spkId,u=new SpeechSynthesisUtterance(txt);u.lang='en-US';
    const v=VOICE||(VOICE=pickVoice());if(v)u.voice=v;
    u.rate=Math.min(1.5,Math.max(.9,speed>1?1+(speed-1)*.5:1));
    const done=()=>{if(id!==spkId)return;speaking=false;clearTimeout(spkTimer)};
    u.onend=done;u.onerror=done;
    speaking=true;clearTimeout(spkTimer);spkTimer=setTimeout(done,Math.max(2500,txt.length/12*1000/u.rate+1500));
    speechSynthesis.speak(u);
  }catch(e){speaking=false}
}
function stopSpeak(){try{spkId++;speaking=false;clearTimeout(spkTimer);if('speechSynthesis' in window)speechSynthesis.cancel()}catch(e){}}
if('speechSynthesis' in window){try{speechSynthesis.onvoiceschanged=()=>{VOICE=null}}catch(e){}}
function ui(){ $('pp').textContent=playing?'❚❚ Pause':(T>=clip.dur-.01?'▶ Replay':'▶ Play') }
function tick(ts){
  if(!playing)return;
  const dt=Math.min(.1,(ts-lastTs)/1000);lastTs=ts;
  let adv=dt*speed;
  if(voice&&speaking&&capEnd!==null&&T+adv>capEnd-.02)adv=Math.max(0,capEnd-.02-T);
  T+=adv;
  if(T>=clip.dur){T=clip.dur;playing=false}
  sample(T);ui();if(playing)requestAnimationFrame(tick)
}
function play(){if(T>=clip.dur-.01)T=0;playing=true;lastTs=performance.now();lastCap='\u0000';ui();requestAnimationFrame(tick)}
function pause(){playing=false;stopSpeak();ui()}
function seek(t){stopSpeak();T=Math.max(0,Math.min(clip.dur,t));lastCap='\u0000';lastBan=-2;boardKey='';sample(T);ui()}
function openClip(id,title,desc,btn){
  stopSpeak();opener=btn;setEnt(entFor(id));const c=CLIPS[id]();autoCover(c);clip=c;
  $('mt').textContent=title;$('mr').textContent=desc;
  $('modal').classList.add('on');document.body.style.overflow='hidden';
  buildStage(c);buildBoard(c);T=0;lastCap='\u0000';lastBan=-2;$('hud').dataset.h='x';sample(0);
  $('sp').value=String(speed);$('vo').checked=voice;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ui()}else play();
  $('mx').focus();
}
function closeClip(){pause();$('modal').classList.remove('on');document.body.style.overflow='';if(opener)opener.focus();clip=null}
$('mx').onclick=closeClip;
$('modal').addEventListener('mousedown',e=>{if(e.target===$('modal'))closeClip()});
$('pp').onclick=()=>playing?pause():play();
$('rp').onclick=()=>{stopSpeak();T=0;lastCap='\u0000';lastBan=-2;boardKey='';play()};
$('sc').oninput=e=>{pause();seek(e.target.value/1000*clip.dur)};
$('sp').onchange=e=>{speed=parseFloat(e.target.value)};
$('vo').onchange=e=>{voice=e.target.checked;if(!voice)stopSpeak();else if(playing){lastCap='\u0000'}};
document.addEventListener('keydown',e=>{
  if(!clip)return;
  if(e.key==='Escape'){closeClip();return}
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='select'||tag==='input'&&e.target.type!=='range'&&e.target.type!=='checkbox')return;
  if(e.key===' '&&tag!=='button'&&!(tag==='input'&&e.target.type==='checkbox')){e.preventDefault();playing?pause():play()}
  else if(e.key==='ArrowRight'&&tag!=='input'){seek(T+3)}
  else if(e.key==='ArrowLeft'&&tag!=='input'){seek(T-3)}
});
window.__rai={CLIPS,Clip,openClip,seek:t=>seek(t),getClip:()=>clip,setEnt,SCORE,setVoice:v=>{voice=v}};

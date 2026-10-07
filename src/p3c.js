
/* ---------- map callout clips ---------- */
function callouts(c,items,t0){
  let ts=t0;
  items.forEach((it,i)=>{
    const id='c'+i,gap=Math.max(3.2,it.cap.length/17+.9);
    c.add(id,'label',{text:it.t,x:it.x,y:it.y,o:0,tone:it.tone||'info',tx:it.tx,ty:it.ty,size:c.view===V_FULL?25:13});
    c.to(id,'o',ts,ts+.3,1);c.to(id,'o',ts+gap-.3,ts+gap,0);
    if(it.zone){const z='z'+i;c.add(z,'shape',Object.assign({shape:'rect',fill:'rgba(255,255,255,.14)',stroke:'#fff',sw:3,dash:'9 6',o:0,pulse:true},it.zone));c.vis(z,ts,ts+gap);
      if(it.zone2){const z2='y'+i;c.add(z2,'shape',Object.assign({shape:'rect',fill:'rgba(255,255,255,.14)',stroke:'#fff',sw:3,dash:'9 6',o:0,pulse:true},it.zone2));c.vis(z2,ts,ts+gap)}}
    if(it.after)it.after(c,ts,gap);
    c.cap(ts,ts+gap,it.cap);ts+=gap;
  });
  c.dur=ts+.8;
}
function mkArenaAuto(){
  const c=new Clip({view:V_AUTO});
  c.add('dim','dim',{x:cx(0)-36,y:cy(2)+22,x2:cx(0)+36,y2:cy(2)+22,text:'20 cm',o:0});
  c.add('zA','shape',{x:196,y:192,w:360,h:360,shape:'rect',fill:'rgba(217,58,48,.16)',stroke:'#ff6a60',sw:4,dash:'10 6',o:0,pulse:true});
  c.add('zB','shape',{x:550,y:192,w:360,h:360,shape:'rect',fill:'rgba(33,105,201,.2)',stroke:'#6fa8ff',sw:4,dash:'10 6',o:0,pulse:true});
  const ez=k=>{const [a,b]=ENTS[k].cell;return{x:cx(a),y:cy(b),w:70,h:70}};
  let T0=.6;
  const items=[
    {t:'A: Red alliance',x:196,y:-16,tone:'warn',tx:196,ty:20,cap:'The maze is divided into two parts, A on the left for the Red alliance…',after:(c,ts,g)=>{c.to('zA','o',ts,ts+.3,1);c.to('zA','o',ts+g-.3,ts+g,0)}},
    {t:'B: Blue alliance',x:550,y:-16,tx:550,ty:20,cap:'…and B on the right for the Blue alliance.',after:(c,ts,g)=>{c.to('zB','o',ts,ts+.3,1);c.to('zB','o',ts+g-.3,ts+g,0)}},
    {t:'Entrance 1 (A)',x:110,y:-16,tone:'dark',tx:START_OF('A')[0],ty:START_OF('A')[1]-20,zone:ez('A'),cap:'Each side has three entrances. Entrance 1 (A) is the top-left cell.'},
    {t:'Entrance 2 (B)',x:338,y:-16,tone:'dark',tx:START_OF('B')[0],ty:START_OF('B')[1]-20,zone:ez('B'),cap:'Entrance 2 (B) is the top cell beside the centre line.'},
    {t:'Entrance 3 (C)',x:110,y:410,tone:'dark',tx:START_OF('C')[0],ty:START_OF('C')[1]+22,zone:ez('C'),cap:'Entrance 3 (C) is the bottom-left cell.'},
    {t:'Draw: final match only',x:520,y:410,tone:'yel',cap:'In ranking matches the Auto robot always starts from Entrance 1 (A). Only the final match uses a random draw. The letters A, B, C name entrances, not alliances.'},
    {t:'Parking Zone',x:480,y:230,tone:'dark',tx:PARK[0]+20,ty:PARK[1],zone:{x:PARK[0],y:PARK[1],w:74,h:74},cap:'Deliver the cube to the purple Parking Zone in the bottom-right cell of your side.'},
    {t:'Black tape',x:480,y:200,tone:'dark',tx:PARK[0]+36,ty:PARK[1]-36,cap:'A strip of black tape lies across the entrance of each Parking Zone, the only open side of the cell.'},
    {t:'Every cell: 20 × 20 cm',x:260,y:560,tone:'yel',tx:cx(0),ty:cy(2),cap:'Each block of the maze is 20 by 20 centimetres.',after:(c,ts)=>{c.to('dim','o',ts+.4,ts+.7,1)}},
    {t:'Code must handle both sides',x:520,y:560,tone:'warn',cap:'Your program has to handle both sides of the arena, because you might need to play A or B.'}
  ];
  callouts(c,items,T0);
  return c;
}
function START_OF(k){const [a,b]=ENTS[k].cell;return[cx(a),cy(b)]}
function mkArenaManual(){
  const c=new Clip({view:[-50,380,IW+100,760]});
  c.add('zA','shape',{x:200,y:740,w:340,h:690,shape:'rect',fill:'rgba(217,58,48,.16)',stroke:'#ff6a60',sw:4,dash:'10 6',o:0,pulse:true});
  c.add('zB','shape',{x:548,y:740,w:340,h:690,shape:'rect',fill:'rgba(33,105,201,.2)',stroke:'#6fa8ff',sw:4,dash:'10 6',o:0,pulse:true});
  c.add('dW','dim',{x:30,y:1112,x2:716,y2:1112,text:'2443 mm',o:0});
  c.add('dH','dim',{x:-8,y:395,x2:-8,y2:1085,text:'2215 mm',o:0});
  lbl(c,'lFrame','Frame height: 15 cm',620,430,{tone:'dark',tx:712,ty:420,o:0});
  c.add('g1','shape',{x:373,y:740,w:48,h:690,shape:'rect',fill:'rgba(255,255,255,.12)',stroke:'#fff',sw:3,dash:'8 6',o:0,pulse:true});
  lbl(c,'lA','Zone A (Red)',150,1040,{tone:'warn',o:0});lbl(c,'lB','Zone B (Blue)',596,1040,{tone:'info',o:0});
  lbl(c,'lMid','Central area',230,1040,{tone:'yel',tx:373,ty:900,o:0});
  let t=narr(c,0,'The Manual arena is based on MakeX Explorer 2023: a map surrounded by a frame.');
  c.to('dW','o',t,t+.3,1);c.to('dH','o',t,t+.3,1);
  const t1=narr(c,t,'It is a rectangle of 2443 by 2215 millimetres, with a frame 15 centimetres high.');
  c.vis('lFrame',t,t1);
  const t2=narr(c,t1,'It is divided into two zones, one per alliance: zone A, Red, and zone B, Blue.');
  c.vis('zA',t1,t1+(t2-t1)/2);c.vis('zB',t1+(t2-t1)/2,t2);c.vis('lA',t1,t1+(t2-t1)/2);c.vis('lB',t1+(t2-t1)/2,t2);
  c.vis('g1',t2,t2+5.5);c.vis('lMid',t2,t2+5.5);
  const t3=narr(c,t2,'The strip down the middle is the central area, where the balls are placed for both sides to grab.');
  /* equipment that belongs to the Manual arena: four Cube Base platforms and the two Reverse Flags (always drawn, highlighted while described) */
  addPlats(c);
  c.add('flag0','flag',{x:F1[0],y:F1[1],r:-90});c.add('flag','flag',{x:F2[0],y:F2[1],r:90});   /* top flag points at red, bottom flag at blue */
  PLATS.forEach((p,i)=>{c.add('pz'+i,'shape',{x:p[0],y:p[1],w:46,h:46,shape:'rect',fill:'rgba(255,255,255,.16)',stroke:'#fff',sw:3,dash:'8 6',o:0,pulse:true})});
  lbl(c,'lPlR','Cube Base platform (Red)',250,640,{tone:'warn',tx:PLATS[0][0]+22,ty:PLATS[0][1]+14,o:0});
  lbl(c,'lPlB','Cube Base platform (Blue)',496,640,{tone:'info',tx:PLATS[2][0]-22,ty:PLATS[2][1]+14,o:0});
  const t4=narr(c,t3,'Each side has two Cube Base platforms, beside its goalpost and 5 centimetres from the frame. The Manual robot places the yellow cube on one of them to score.');
  PLATS.forEach((p,i)=>c.vis('pz'+i,t3,t4));c.vis('lPlR',t3,t4);c.vis('lPlB',t3,t4);
  [F1,F2].forEach((f,i)=>{c.add('fz'+i,'shape',{x:f[0],y:f[1],w:60,h:56,shape:'rect',fill:'rgba(255,255,255,.16)',stroke:'#fff',sw:3,dash:'8 6',o:0,pulse:true});});
  lbl(c,'lFl','Reverse Flag 1 (slot 5)',540,720,{tone:'dark',tx:F1[0]+20,ty:F1[1],o:0});
  lbl(c,'lFl2','Reverse Flag 2 (slot 9)',540,900,{tone:'dark',tx:F2[0]+20,ty:F2[1],o:0});
  const t5=narr(c,t4,'The two Reverse Flags sit in the central area, in slots 5 and 9. They start pointing at opposite sides. A thrown ball turns a flag toward the thrower, and only a tip pointing at your own side scores.');
  c.vis('fz0',t4,t5);c.vis('fz1',t4,t5);c.vis('lFl',t4,t5);c.vis('lFl2',t4,t5);
  c.dur=t5+.8;return c;
}
function mkComponents(){
  const c=new Clip({view:V_FULL});
  c.add('dim5','dim',{x:690,y:561,x2:690,y2:574,text:'5 cm',o:0});
  const it=[
    {t:'Objective Block (Auto)\n7 × 7 × 7 cm cube',x:480,y:200,tone:'yel',tx:START[0],ty:START[1],cap:'The Auto robot starts at its start point with the objective block on top of it: a yellow cube, 7 centimetres on each side. It delivers the block to the Parking Zone.',after:(c,ts,gap)=>{c.hide('rob',ts+gap,.4);c.hide('objCube',ts+gap,.4)}},
    {t:'Initial position marker\n(Manual) about 320 × 320 mm',x:310,y:540,tone:'dark',tx:HOME[0],ty:HOME[1],zone:{x:HOME[0],y:HOME[1],w:96,h:96},cap:'The Initial position marker is where the Manual robot starts, and where it can retract to.'},
    {t:'Cube Base platform\n10 × 10 cm top',x:430,y:660,tone:'dark',tx:PLAT[0],ty:PLAT[1]+14,zone:{x:PLATS[0][0],y:PLATS[0][1],w:46,h:46},zone2:{x:PLATS[1][0],y:PLATS[1][1],w:46,h:46},cap:'The Cube Base platform is where the Manual robot places the yellow cube to score. It is mounted beside the goalpost, 5 centimetres from the frame.',after:(c,ts,g)=>{c.to('dim5','o',ts+.6,ts+.9,1);c.to('dim5','o',ts+g-.3,ts+g,0)}},
    {t:'Goalpost (Manual)\n1000 × 400 mm',x:450,y:850,tone:'info',tx:GOAL[0]-10,ty:GOAL[1]+60,zone:{x:GOAL[0]+4,y:GOAL[1],w:100,h:345},cap:'Goalpost: to score with a ball, shoot it in here.'},
    {t:'Target pins\n250 mm tall',x:450,y:470,tone:'info',tx:PINS[0][0],ty:PINS[0][1],zone:{x:PINS[1][0],y:PINS[1][1],w:36,h:300},cap:'The red or blue target pins stand on top of the goal. Shoot them down to score. Each pin is 250 millimetres tall.'},
    {t:'Yellow ball Ø70 mm\nGreen ball Ø100 mm',x:200,y:760,tone:'yel',tx:372,ty:640,zone:{x:373,y:640,w:44,h:300},cap:'There are two kinds of ball: a small yellow one, 70 millimetres across, and a large green one, 100.'},
    {t:'Reverse Flags\n(2, central platform)',x:540,y:420,tone:'dark',tx:392,ty:639,zone:{x:F1[0],y:F1[1],w:60,h:56},zone2:{x:F2[0],y:F2[1],w:60,h:56},cap:'The two Reverse Flags sit in the upper layer of the central platform, in slots 5 and 9 of its 13 ball slots. The flags start pointing opposite ways. They are only checked when the game ends: each tip pointing at your own side scores 5 points.'},
    {t:'Central area\nballs about 170 mm apart',x:200,y:1010,tone:'dark',tx:372,ty:998,cap:'The central area is the strip down the middle. The rulebook picture puts the balls about 170 millimetres apart.'}
  ];
  addPlats(c);
  c.add('flag0','flag',{x:F1[0],y:F1[1],r:-90});c.add('flag','flag',{x:F2[0],y:F2[1],r:90});   /* both Reverse Flags are drawn on the central platform */
  c.add('rob','auto',{x:START[0],y:START[1],r:H0});c.add('objCube','cube',{x:START[0],y:START[1]});c.carry('objCube','rob',0,999,0,0,{rot:true});   /* the Auto robot waits at its start point with the objective block on top */
  callouts(c,it,.4);return c;
}

/* ---------- start entrance draw ---------- */
function mkDraw(){
  const c=new Clip({view:V_AUTO});
  const keys=['A','B','C'],F=FINAL_ENT;
  keys.forEach(k=>{const [x,y]=START_OF(k);c.add('h'+k,'shape',{x,y,w:70,h:70,shape:'rect',fill:'rgba(255,210,26,.30)',stroke:'#ffd21a',sw:6,o:0})});
  const lp={A:[110,-16],B:[338,-16],C:[110,410]};
  keys.forEach(k=>{const [x,y]=START_OF(k);lbl(c,'l'+k,`Entrance ${ENTS[k].n} (${k})`,lp[k][0],lp[k][1],{tone:'dark',tx:x,ty:y+(lp[k][1]<0?-20:22)})});
  const R={};keys.forEach(k=>R[k]=routeFor(k));
  c.add('rob','auto',{x:R.A[0][0],y:R.A[0][1],r:heading(R.A[0],R.A[1]),o:0});
  const shuffle=(t0,seq)=>{let t=t0,d=.16;seq.forEach((k,i)=>{c.jump('h'+k,'o',t,1);if(i<seq.length-1)c.jump('h'+k,'o',t+d,0);t+=d;d=Math.min(.55,d*1.18)});return t};
  const label=(k)=>`Entrance ${ENTS[k].n} (${k})`;
  const teams=['Team 1','Team 2','Team 3'];
  /* part 1: ranking matches have no draw, they always start at Entrance 1 (A) */
  let t=narr(c,0,'In the ranking round there is no draw. Every team always starts from Entrance 1 (A).');
  c.show('lA',.4);c.show('hA',.4);c.chip('draw',.2,'RANKING: ENTRANCE 1 (A)','ok');
  let tc=t+.2;
  teams.forEach((nm,i)=>{
    const rt=R.A,h=heading(rt[0],rt[1]);
    c.chip('match',tc,`${nm} · ranking match`,'blue');
    c.jump('rob','x',tc,rt[0][0]);c.jump('rob','y',tc,rt[0][1]);c.jump('rob','r',tc,h);c.setPos('rob',rt[0][0],rt[0][1],h);c.jump('rob','o',tc,1);
    const te=c.move('rob',rt.slice(1,6),tc+.5,240,{turn:0});c.hide('rob',te+.15,.3);
    tc=Math.max(te+.8,tc+2.6);
  });
  c.cap(t,tc,'Same entrance for every team, in every ranking match.');
  /* part 2: only the final match is drawn */
  const tf=tc+.3;
  c.chip('match',tf,'','blue');c.hide('hA',tf,.3);c.hide('lA',tf,.3);c.show('lA',tf+.6);c.show('lB',tf+1.2);c.show('lC',tf+1.8);
  c.chip('draw',tf,'FINAL DRAW','dark');c.ban(tf,tf+3.4,'DRAWING…','info');
  const t3=narr(c,tf,'Only the final match uses a random draw. One draw picks the start entrance for the whole final.');
  const seq=['B','C','A','C','B','A','C','B','C','A'].concat([F]);
  const tG=shuffle(tf+.6,seq);
  c.ban(tG,tG+2.4,'DRAWN: '+label(F).toUpperCase(),'ok');c.chip('draw',tG,'DRAWN: '+label(F),'ok');
  const t4=narr(c,Math.max(t3,tG),'This time the result is '+label(F)+'.',tG+2.6);
  const t5=narr(c,t4,'Every team starts all of its final matches from '+label(F)+', until the final is over.');
  let tz=t4+.2;
  teams.forEach((nm,i)=>{
    const rt=R[F],h=heading(rt[0],rt[1]);
    c.chip('match',tz,`${nm} · final match`,'red');
    c.jump('rob','x',tz,rt[0][0]);c.jump('rob','y',tz,rt[0][1]);c.jump('rob','r',tz,h);c.setPos('rob',rt[0][0],rt[0][1],h);c.jump('rob','o',tz,1);
    const te=c.move('rob',rt.slice(1,6),tz+.5,240,{turn:0});c.hide('rob',te+.15,.3);
    tz=Math.max(te+.8,tz+2.6);
  });
  if(tz>t5)c.cap(t5,tz,'Same entrance for every team, in every final match.');
  c.dur=narr(c,Math.max(t5,tz),'In short: ranking matches always use Entrance 1 (A), and only the final match is drawn. Relaunches happen at the same entrance.')+.8;
  return c;
}

/* ---------- Cube Base platform + goalpost drawing (front view, from the user's diagram) ---------- */
function mkPlatDim(){
  const c=new Clip({view:[240,130,1580,870],bg:'#eef1f6'});
  const K='#1d2228',NET='#3a4048',DIM='#111',TXT='#a33b3b';
  const raw=(id,draw,o=1)=>c.add(id,'raw',{draw,o});
  raw('goal',g=>{
    E('rect',{x:478,y:432,width:1012,height:20,fill:K},g);
    E('rect',{x:478,y:432,width:27,height:400,fill:K},g);E('rect',{x:1464,y:432,width:27,height:400,fill:K},g);
    for(let i=0;i<=17;i++){const x=508+i*(956/17);E('line',{x1:x,y1:452,x2:x,y2:776,stroke:NET,'stroke-width':3},g)}
    for(let j=0;j<=7;j++){const y=452+j*(324/7);E('line',{x1:508,y1:y,x2:1464,y2:y,stroke:NET,'stroke-width':3},g)}
    E('rect',{x:966,y:432,width:52,height:20,fill:'#0c0f12'},g)});
  [557,905,1303].forEach((x,i)=>raw('pin'+i,g=>{E('rect',{x,y:170,width:116,height:262,fill:'#4f6fff'},g);const t=E('text',{x:x+58,y:312,'text-anchor':'middle','font-size':32,fill:'#fff',style:"font-family:'IBM Plex Sans',sans-serif"},g);t.textContent='PIN'}));
  const ped=(id,mx)=>raw(id,g=>{E('rect',{x:mx-52,y:516,width:104,height:15,fill:'#2f353b'},g);E('rect',{x:mx-15,y:531,width:30,height:295,fill:'#2f353b'},g);E('rect',{x:mx-70,y:826,width:140,height:8,fill:'#2f353b'},g)});
  ped('pedL',345);ped('pedR',1595);
  const arrow=(g,x1,y1,x2,y2)=>{E('line',{x1,y1,x2,y2,stroke:DIM,'stroke-width':5},g);
    const L=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/L,uy=(y2-y1)/L,nx=-uy,ny=ux,s=16;
    [[x1,y1,1],[x2,y2,-1]].forEach(([x,y,d])=>E('path',{d:`M${x} ${y} L${x+d*ux*s+nx*s*.45} ${y+d*uy*s+ny*s*.45} L${x+d*ux*s-nx*s*.45} ${y+d*uy*s-ny*s*.45} Z`,fill:DIM},g))};
  const num=(g,x,y,s,a='middle')=>{const t=E('text',{x,y,'text-anchor':a,'font-size':50,'font-weight':600,fill:TXT,style:"font-family:'IBM Plex Sans',sans-serif"},g);t.textContent=s};
  raw('dW',g=>{arrow(g,507,848,1467,848);num(g,987,905,'1000')},0);
  raw('dH',g=>{arrow(g,470,452,470,830);num(g,455,660,'400','end')},0);
  raw('dP',g=>{arrow(g,528,170,528,432);num(g,512,320,'250','end')},0);
  raw('dG',g=>{arrow(g,1467,872,1527,872);num(g,1497,935,'50')},0);
  raw('dR',g=>{arrow(g,1695,515,1695,830);num(g,1722,660,'320','start')},0);
  raw('dT',g=>{arrow(g,1543,478,1647,478);num(g,1595,455,'106')},0);
  raw('note',g=>{const t=E('text',{x:250,y:985,'font-size':30,fill:'#55606c',style:"font-family:'IBM Plex Sans',sans-serif"},g);t.textContent='All dimensions in millimetres. Front view, redrawn from the rulebook diagram.'},1);
  c.add('hl','shape',{x:1497,y:845,w:110,h:110,shape:'rect',fill:'rgba(255,200,0,.25)',stroke:'#e6a800',sw:6,o:0,pulse:true});
  c.add('hl2','shape',{x:1595,y:520,w:150,h:70,shape:'rect',fill:'rgba(255,200,0,.25)',stroke:'#e6a800',sw:6,o:0,pulse:true});
  let t=narr(c,0,'Front view of the goalpost: three target pins on top, and a Cube Base platform at each end.');
  const t1=narr(c,t,'The goal is 1000 millimetres wide…');c.to('dW','o',t,t+.4,1);
  const t2=narr(c,t1,'…and 400 millimetres high.');c.to('dH','o',t1,t1+.4,1);
  const t3=narr(c,t2,'The target pins stand on top of the crossbar, each 250 millimetres tall.');c.to('dP','o',t2,t2+.4,1);
  const t4=narr(c,t3,'Each platform stands 50 millimetres, that is 5 centimetres, from the goal frame.');c.to('dG','o',t3,t3+.4,1);c.vis('hl',t3,t4);
  const t5=narr(c,t4,'The 320 millimetres overall is a 300 millimetre stem, a 15 millimetre tray block and a 5 millimetre base plate.');c.to('dR','o',t4,t4+.4,1);
  const t6=narr(c,t5,'The tray is 106 millimetres outside and 100 inside, with a 3 millimetre wall 10 millimetres high. The base plate is 140 by 140 by 5.');c.to('dT','o',t5,t5+.4,1);c.vis('hl2',t5,t6);
  c.dur=t6+.8;return c;
}

/* ---------- card clips for document-only rules ---------- */
function cards(rows){
  const c=new Clip({type:'cards'});let t=0;
  rows.forEach(r=>{const g=Math.max(3,r[2].length/17+.9);c.row(t,r[0],r[1],r[2]);c.cap(t,t+g,r[2]);t+=g});
  c.dur=t+.6;return c;
}
const CARDS={
 'doc-schedule':()=>cards([['19 Nov 2026','date','Competition day: ranking match, random alliance and final match.'],['21 Nov 2026','date','Deadline for the report and the SUPER COOL video.']]),
 'doc-report':()=>cards([['Code','lim','Your program with a flowchart and an explanation of how it works.'],['5 topics','lim','The program must use function, structure, loop, array and pointer.'],['Drawings','lim','All drawings and designs for every part.'],['Physics','lim','Theory and a sample engineering calculation for both robots.'],['Copying','bad','If the TAs find the same code as another team, your score and the other team’s score are divided by the number of copies.']]),
 'doc-video':()=>cards([['Format','lim','One minute, portrait, 9:16.'],['Content','ok','Shows both your Manual and your Autonomous robot.'],['AI + sound','ok','Made with the help of AI tools, and it must have sound.'],['Team','ok','Must include a picture or video of the whole team doing the project.'],['Style','lim','The rulebook says “Anything that SUPER COOL”, so be creative.']]),
 'doc-code':()=>cards([['Repository','lim','The team leader’s GitHub, public, so the TAs can open it at any time.'],['Structure','lim','competition/auto/auto.ino and competition/manual/your_manual_code.mblock.'],['Deadline','date','Before 11 November, 23:59.'],['Auto code','ok','Must use function, structure, loop, array and pointer. Hard-coding the solution is allowed.'],['Manual code','bad','Write all logic in mBlock Python only. Block code is forbidden.'],['In the report','lim','A flowchart and a detailed explanation of your code.']]),
 'robot-auto':()=>cards([['Job','ok','The Auto robot starts in the maze already holding the yellow cube. It carries the cube through the maze and parks in the Parking Zone.'],['Size','lim','At most 16 × 16 cm, any height.'],['Parts','ok','Anything from the given Autonomous Robot Set.'],['Sensors','lim','At most 5, of any kind.'],['Motors','lim','At most 2 Yellow DC motors, and only ones the TAs provide.'],['Build','ok','You may build your own mechanical parts.'],['Kits','bad','You may not buy a complete Autonomous Robot kit.']]),
 'robot-manual':()=>cards([['Job','ok','Operated by remote control. Grab a ball from the central area and launch it at the opposing goal and its pins.'],['Flag','ok','You can also launch a ball at a Reverse Flag to turn it.'],['Cube','ok','Place the cube on the Cube Base platform, with the bottom of the cube lying flat inside the platform edge.'],['Edge','bad','A cube resting on the edge, or tilted over it, scores 0 points.'],['Size','lim','At most 32 × 32 × 45 cm when fully retracted. During the Manual phase it may extend itself beyond that boundary.'],['Parts','ok','Only parts from the given Manual Robot set.'],['Electronics','bad','Any external electronics are forbidden on the Manual robot.'],['Motors','lim','At most 1 additional DC motor.'],['Kits','bad','You may not buy a complete Manual Robot kit.']]),
 'robot-damage':()=>cards([['No damage','bad','Harming any given component is forbidden: −5 points per damaged part.'],['Examples','bad','Glue, sticky tape, or cutting and drilling that damages the given parts.'],['Return','ok','All mechanical parts and everything in the Makebox kit go back in perfect condition after the competition.'],['If damaged or lost','bad','−5 points per part, and the team must buy back what it damaged or lost.']]),
 'robot-inspect':()=>cards([['Before every match','ok','Each robot must fit inside its acrylic sizing box.'],['Auto box','lim','16 × 16 × ∞ cm.'],['Manual box','lim','32 × 32 × 45 cm, with the robot fully retracted.'],['Does not fit','bad','The team must fix it and be re-checked before the match starts.']]),
 'scoring':()=>{
   const order=['parkNoCube','parkCube','cubeBase','pin','flag','greenBall','yellowBall','pickFromGoal','notReturned','earlyMove','noStop','damage'];
   const rows=order.map(k=>{const s=SCORE[k];return[(s.pts>0?'+':s.pts<0?'−':'')+Math.abs(s.pts),s.pts<0?'bad':'ok',s.label]});
   rows.splice(2,0,['MAX +10','lim','Only the higher of the two parking scores counts. Holding the cube means it must be lifted off the floor.']);
   rows.splice(4,0,['HAND-OFF','lim','The Manual robot must take the cube directly from the Auto robot, or pick it up from the Manual field floor after it drops there. From the Auto field floor or the Parking Zone does not score.']);
   rows.push(['VOID','bad','Platform points are void if a person touches the cube or a robot during the match. Carrying the robot during a relaunch, stopping the Auto robot after the time-up signal, and the referee-approved reload of a cube dropped during hand-off, do not count.']);
   rows.push(['TOTAL','date','A team’s ranking score is the sum of the points from every task it completes before the time runs out.']);
   return cards(rows)}
};

const CLIPS={
 'auto-run':mkAutoRun,'relaunch':()=>mkRelaunch(1),'relaunch2':()=>mkRelaunch(2),'continue':mkContinue,
 'handoff':mkHandoff,'floor':mkFloor,'drop-auto':mkDropAuto,'drop-manual':mkDropManual,'auto-end':()=>mkAutoEnd(false),'auto-end-late':()=>mkAutoEnd(true),'early':mkEarly,'touch':mkTouch,'balls':mkBalls,'manual-phase':mkManual,
 'arena-auto':mkArenaAuto,'arena-manual':mkArenaManual,'components':mkComponents,'draw':mkDraw,'platform':mkPlatDim,
 'full-clean':()=>mkFull(false),'full-drops':()=>mkFull(true)
};
Object.keys(CARDS).forEach(k=>CLIPS[k]=CARDS[k]);

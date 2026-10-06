/* ---------- FINAL MATCH: 8 robots ----------
   Field is symmetric: red owns the left half, blue the right half (x -> IW-x). The field has TWO Auto mazes (top and bottom, the bottom one is the top one
   flipped, y -> 1482-y) and two Manual start boxes per alliance. So each alliance has two teams: team 1 plays on the top maze and team 2 on the bottom maze. */
const FLIP=1482, V_ALL=[-437,-20,1620,1520], V_BOT=[0,800,IW,700];
const teamK=T=>({X:x=>T.s>0?x:IW-x,Y:y=>T.k?FLIP-y:y,A:r=>{if(T.k)r=180-r;return T.s>0?r:-r}});
function pinDown(c,id,t,rot,x){c.to(id,'r',t,t+.4,rot);c.to(id,'o',t,t+.6,.25);c.to(id,'x',t,t+.4,x)}

/* one Manual robot: drive to the ball, grab it with the arm, drive to a firing spot and throw it at (tx,ty). returns the time of the throw */
function fire(c,m,ball,gx,gy,gf,sx,sy,sf,t,tx,ty,d=.8){
  const m1=c.move(m,[[gx,gy]],t,220,{turn:.2,face:gf});
  c.to(m,'ext',m1,m1+.7,.45);c.to(m,'ext',m1+.8,m1+1.5,.15);
  const m2=c.move(m,[[sx,sy]],m1+1.6,200,{turn:.1,face:sf});
  const te=Math.max(m2,m1+1.7);
  c.carry(ball,m,m1+.8,te,0,0,{arm:true});
  const ts=te+.2;shoot(c,ball,ts,tx,ty,d);return ts;
}
/* a Manual robot at "stand" facing south/north places a cube it carries on a platform. returns time of placement */
function placeCube(c,m,cube,tFrom,t0,stand,face,px,py){
  const tM=c.move(m,[stand],t0,200,{turn:.2,face});
  c.to(m,'ext',tM,tM+.8,EXT_PLAT);const tP=tM+.8;
  c.carry(cube,m,tFrom,tP,0,0,{arm:true});c.jump(cube,'x',tP,px);c.jump(cube,'y',tP,py);
  return tP;
}

function mkFinal(){
  const c=new Clip({view:V_ALL,board:true,twoSide:true});
  const TS=[{id:'Rt',s:1,k:0,side:'R',n:1},{id:'Rb',s:1,k:1,side:'R',n:2},{id:'Bt',s:-1,k:0,side:'B',n:1},{id:'Bb',s:-1,k:1,side:'B',n:2}];
  TS.forEach(T=>Object.assign(T,teamK(T)));
  c.add('ref','ref',{x:373,y:-14});
  addPlats(c);
  PINS.forEach((p,i)=>c.add('pinB'+i,'pin',{x:p[0],y:p[1],c:'b'}));
  PINS.forEach((p,i)=>c.add('pinR'+i,'pin',{x:IW-p[0],y:p[1],c:'r'}));
  c.add('fTop','flag',{x:F1[0],y:F1[1],r:-90});c.add('fBot','flag',{x:F2[0],y:F2[1],r:90});   /* top tip points at RED, bottom tip at BLUE: each alliance starts with 5 */
  c.scoreRaw(.3,'Reverse Flags at rest: tips point opposite ways',5,'R');c.scoreRaw(.3,'Reverse Flags at rest: tips point opposite ways',5,'B');   /* the two Reverse Flags on the central platform */
  [['y1',533,'y'],['k1',588,'y'],['g2',995,'g'],['y2',893,'y'],['g3',487,'g'],['y3',690,'y'],['y4',945,'y']].forEach(([id,y,col])=>c.add(id,'ball',{x:372,y,c:col}));
  TS.forEach(T=>{
    T.route=ROUTE.map(([x,y])=>[T.X(x),T.Y(y)]);T.start=T.route[0];T.park=T.route[T.route.length-1];T.home=[T.X(HOME[0]),T.Y(HOME[1])];
    const tm=T.side==='R'?'r':'b';
    c.add('a'+T.id,'auto',{x:T.start[0],y:T.start[1],r:T.A(H0),team:tm});
    c.add('m'+T.id,'manual',{x:T.home[0],y:T.home[1],r:T.A(90),team:tm});
    c.add('c'+T.id,'cube',{x:T.start[0],y:T.start[1]});
    c.add('z'+T.id,'shape',{x:T.park[0],y:T.park[1],w:74,h:74,shape:'rect',fill:'rgba(255,255,255,.12)',stroke:'#fff',sw:4,dash:'9 6',o:0,pulse:true});
  });
  const [Rt,Rb,Bt,Bb]=TS;
  lbl(c,'lEnt',ELBL+' (drawn): used by all four Auto robots',373,-14,{tone:'dark',size:28,tx:Rt.start[0],ty:Rt.start[1]-18});
  lbl(c,'lBot','Second Auto maze (bottom): same drawn entrance',373,1500,{tone:'dark',size:28,tx:Rb.start[0],ty:Rb.start[1]+18});
  centerMark(c,0,0,373,330);

  c.chip('mode',0,'FINAL MATCH','dark');c.chip('clock',0,'AUTO 90 s','red');
  c.ban(.4,2.6,'INSPECTION PASSED','ok');c.vis('lEnt',.6,7);c.vis('lBot',.6,7);
  let e=narr(c,0,'The Final match. A red alliance faces a blue alliance, and each alliance has two teams. Every team has an Auto robot and a Manual robot, so eight robots are on the field. The field has two Auto mazes, one at the top and one at the bottom.',8.5);
  c.ban(e,e+1.4,'START!','ok');
  /* ---- Auto phase: all four Auto robots launch together ---- */
  const t0=e+1;
  const spd={Rt:175,Bt:168,Rb:171,Bb:165};
  TS.forEach(T=>{T.tPark=c.move('a'+T.id,T.route.slice(1),t0,spd[T.id])});
  const tAll=Math.max(...TS.map(T=>T.tPark));
  c.count('clock',t0,tAll,'AUTO',90,62,'red');
  e=narr(c,e+.6,'At the referee’s signal all four Auto robots launch at the same time. Each one carries its cube through its own maze to the Parking Zone.',tAll);
  TS.forEach(T=>{c.vis('z'+T.id,T.tPark-.2,T.tPark+4);c.score(T.tPark+.3,'parkCube',1,'Team '+T.n+' · Park holding the cube',T.side)});
  c.ban(Math.min(...TS.map(T=>T.tPark)),tAll+1.6,'ALL AUTO ROBOTS PARKED','ok');
  const tp1=narr(c,tAll,'All four Auto robots are parked holding their cubes, and the referee announces it.',tAll+3.2);
  c.ban(tp1,tp1+1.6,'MANUAL MAY MOVE','ok');c.chip('mode',tp1,'HAND-OFF','dark');
  /* ---- hand-off: each Manual takes the cube from its own Auto robot ---- */
  const hand=(T,t1)=>{
    const m='m'+T.id,a='a'+T.id,cu='c'+T.id,yS=T.Y(457);
    const tA=c.turn(m,T.A(0),c.move(m,[[T.park[0],yS]],t1,210,{turn:.2}),.35);
    c.to(m,'ext',tA,tA+.8,EXT_HAND);const tG=tA+.9;
    c.carry(cu,a,0,tG,0,-31,{rot:true});
    c.to(m,'ext',tG+.3,tG+1.1,.2);
    const tP=placeCube(c,m,cu,tG,tG+1.2,[T.X(84),T.Y(439)],T.A(180),T.X(84),T.Y(545));
    c.to(m,'ext',tP+.5,tP+1.3,.2);
    T.tG=tG;T.tP=tP;T.tA=tA;
  };
  hand(Rt,tp1+.4);hand(Rb,tp1+.4);
  hand(Bt,Rt.tG+1.3);hand(Bb,Rb.tG+1.3);
  centerMark(c,tp1+1.5,Math.max(Bt.tP,Bb.tP)+3,373,330);
  e=narr(c,tp1,'Each Manual robot takes the cube directly from the Auto robot of its own team.',Rt.tG+1.2);
  e=narr(c,e,'Then it places the cube on the Cube Base platform on its own side, next to its own goalpost. Red uses the red goalpost, blue the blue one, and nobody may cross the central platform.',Rt.tP+1.2);
  /* ---- Manual robots play on immediately, each as soon as its own cube is placed ---- */
  const tPlaced=Math.max(Bt.tP,Bb.tP)+1;c.camTo(tPlaced,tPlaced+2,V_MAN);
  c.chip('mode',Rt.tP+1.5,'MANUAL ROBOTS PLAY ON','dark');
  e=narr(c,e,'A Manual robot does not wait for the Auto phase to end. As soon as its cube is placed, it starts scoring with balls and the Reversed Flag.',tPlaced+1.5);
  c.ban(Rt.tP+1.5,Rt.tP+3.3,'NO WAITING: PLAY ON','ok');
  const goalX=GOAL[0]-30,rGoalX=IW-goalX;
  /* red 1: yellow ball + two pins */
  let tt=Rt.tP+1.6;
  const sRt=fire(c,'mRt','y1',300,533,90,300,690,90,tt,goalX,GOAL[1]-30);
  c.score(sRt+.8,'yellowBall',1,'Team 1 · Yellow ball in the goalpost','R');
  pinDown(c,'pinB1',sRt+.8,85,GOAL[0]+30);pinDown(c,'pinB0',sRt+1,-80,GOAL[0]+28);
  c.score(sRt+1.1,'pin',2,'Team 1 · Pins knocked down ×2','R');c.hide('y1',sRt+1.8,.3);
  /* red 2: green ball, then hits the BOTTOM flag (tip points at blue) and turns it toward its own side: +5 red, -5 blue */
  tt=Rb.tP+1.6;
  const sRb=fire(c,'mRb','g2',300,995,90,300,792,90,tt,goalX,GOAL[1]+30);
  c.score(sRb+.8,'greenBall',1,'Team 2 · Green ball in the goalpost','R');c.hide('g2',sRb+1.6,.3);
  const sRb2=fire(c,'mRb','y2',300,893,90,300,880,90,sRb+2,F2[0]-6,F2[1]+4,.6);
  flipFlag(c,'fBot',sRb2+.6,'R');c.scoreRaw(sRb2+.7,'Team 2 · Bottom flag turned to red',5,'R');c.scoreRaw(sRb2+.7,'Bottom flag no longer points at blue',-5,'B');
  /* blue 1: green ball, then hits the TOP flag (tip points at red) and turns it toward blue */
  tt=Bt.tP+1.6;
  const sBt=fire(c,'mBt','g3',446,487,-90,446,690,-90,tt,rGoalX,GOAL[1]-20);
  c.score(sBt+.8,'greenBall',1,'Team 1 · Green ball in the goalpost','B');c.hide('g3',sBt+1.6,.3);
  const sBt2=fire(c,'mBt','y3',446,690,-90,446,640,-90,sBt+2,F1[0]+6,F1[1]+4,.6);
  flipFlag(c,'fTop',sBt2+.6,'B');c.scoreRaw(sBt2+.7,'Team 1 · Top flag turned to blue',5,'B');c.scoreRaw(sBt2+.7,'Top flag no longer points at red',-5,'R');
  /* blue 2: yellow ball + one pin */
  tt=Bb.tP+1.6;
  const sBb=fire(c,'mBb','y4',446,945,-90,446,792,-90,tt,rGoalX,GOAL[1]+36);
  c.score(sBb+.8,'yellowBall',1,'Team 2 · Yellow ball in the goalpost','B');
  pinDown(c,'pinR2',sBb+.9,-85,IW-GOAL[0]-30);c.score(sBb+1,'pin',1,'Team 2 · Pin knocked down','B');c.hide('y4',sBb+1.8,.3);
  const tTasks=Math.max(sRt+2.2,sRb2+2,sBt2+2,sBb+2.2);
  e=narr(c,e,'Red throws balls at the blue goalpost, and blue throws balls at the red goalpost. The flags start pointing opposite ways, so each alliance already holds 5 points. Only a tip that points at your own side counts. Red turns the bottom flag toward red, and blue turns the top flag toward blue: plus 5 for the thrower, minus 5 for the other alliance.',tTasks);
  /* ---- red knocks the blue cube off its platform; blue recovers it ---- */
  const tk=tTasks+.3;
  const sK=fire(c,'mRt','k1',300,588,90,300,640,90,tk,PLATS[2][0],PLATS[2][1],.9);
  const th=sK+.9;
  c.to('cBt','x',th,th+.45,587);c.to('cBt','y',th,th+.45,560);c.to('cBt','s',th,th+.2,1.7);c.to('cBt','s',th+.2,th+.5,1);c.hide('k1',th+.2,.3);
  c.ban(th,th+2.2,'BLUE CUBE KNOCKED OFF','warn');
  e=narr(c,tk,'Now a red Manual robot throws a ball at the blue Cube Base platform and knocks the blue cube off.',th+1.6);
  const r0=c.move('mBt',[[500,560]],th+1.4,200,{turn:.2,face:90});
  c.to('mBt','ext',r0,r0+.7,EXT_FLOOR);const tg=r0+.8;
  c.to('mBt','ext',tg+.1,tg+.9,.2);
  const tPB=placeCube(c,'mBt','cBt',tg,tg+1,[PLATS[2][0],PLATS[2][1]-49-62*EXT_PLAT],180,PLATS[2][0],PLATS[2][1]);
  c.to('mBt','ext',tPB+.5,tPB+1.3,.2);
  e=narr(c,e,'The cube is on the Manual field floor, so the blue Manual robot may pick it up and place it on the platform again.',tPB);
  c.ban(tPB,tPB+1.8,'CUBE PLACED AGAIN','ok');
  /* ---- end of the match ---- */
  const tR=2*SCORE.parkCube.pts+2*SCORE.cubeBase.pts+SCORE.yellowBall.pts+2*SCORE.pin.pts+SCORE.greenBall.pts+SCORE.flag.pts;
  const tB=2*SCORE.parkCube.pts+2*SCORE.cubeBase.pts+SCORE.greenBall.pts+SCORE.flag.pts+SCORE.yellowBall.pts+SCORE.pin.pts;
  const t7=Math.max(e,tPB+1.8)+.3;
  c.chip('skip',t7,'⏩ TIME SKIPPED','yel');c.chip('clock',t7,'MANUAL 120 s','blue');c.count('clock',t7,t7+2,'MANUAL',120,0,'blue');
  TS.forEach((T,i)=>c.score(t7+2.2+i*.3,'cubeBase',1,'Team '+T.n+' · Cube on the Cube Base platform',T.side));
  const win=tR===tB?'DRAW':(tR>tB?'RED':'BLUE')+' ALLIANCE WINS';
  c.ban(t7+3.6,t7+6.4,`RED ${tR} · BLUE ${tB}`,'ok');
  c.dur=narr(c,t7,`Time is up, and the platform points are counted for all four cubes, including the one that was knocked off. Final score: red ${tR} points, blue ${tB} points. The alliance with more points wins.`,t7+7)+1;return c;
}

/* ---------- cube falls off the Cube Base platform / leaves the arena (opponent ball hits it) ---------- */
function platHit(out){
  const c=new Clip({view:V_MID,board:true});
  const S=[PLAT[0],PLAT[1]-49-62*EXT_PLAT];
  c.add('man','manual',{x:S[0],y:S[1],r:180,ext:.2,team:'r'});
  c.add('rob','auto',{x:PARK[0],y:PARK[1],r:180,team:'r'});
  c.add('opp','manual',{x:446,y:640,r:-90,team:'b'});
  c.add('ref','ref',{x:520,y:300});
  addPlats(c);parkZone(c,0,0);
  c.add('cube','cube',{x:PLAT[0],y:PLAT[1]});
  c.add('ball','ball',{x:372,y:640,c:'y'});
  lbl(c,'lPlat','Cube Base platform (red side)',250,650,{tone:'dark',tx:PLAT[0]+22,ty:PLAT[1]+14});
  lbl(c,'lFloor','cube on the Manual field floor',330,420,{tone:'warn',tx:150,ty:600});
  lbl(c,'lOut','cube left the arena',200,300,{tone:'warn',tx:16,ty:480});
  c.chip('clock',0,'MANUAL','blue');
  c.score(.5,'cubeBase',1,'Cube on the Cube Base platform (counted at the end)');
  let e=narr(c,0,'The red cube is on the red Cube Base platform. An opposing robot launches a ball at it.');
  c.to('opp','ext',.5,1.2,.45);c.to('opp','ext',1.3,2,.15);
  c.carry('ball','opp',1.3,2.2,0,0,{arm:true});
  const ts=2.4;shoot(c,'ball',ts,PLAT[0]+4,PLAT[1],.8);
  const th=ts+.8;c.hide('ball',th+.1,.2);
  c.to('cube','s',th,th+.2,1.7);c.to('cube','s',th+.2,th+.5,1);
  if(!out){
    c.to('cube','x',th,th+.45,150);c.to('cube','y',th,th+.45,600);
    c.ban(th,th+2.2,'CUBE KNOCKED OFF','warn');c.vis('lFloor',th,th+6);
    e=narr(c,e,'The ball knocks the cube off the platform, and it lands on the Manual field floor.',th+2);
    const r0=c.move('man',[[237,600]],th+1,200,{turn:.2,face:270});
    c.to('man','ext',r0,r0+.7,EXT_FLOOR);const tg=r0+.8;c.to('man','ext',tg+.1,tg+.9,.2);
    c.vis('lPlat',tg+1,tg+9);
    const tP=placeCube(c,'man','cube',tg,tg+1,S,180,PLAT[0],PLAT[1]);
    c.to('man','ext',tP+.5,tP+1.3,.2);
    c.ban(tP,tP+1.8,'CUBE PLACED AGAIN','ok');
    c.dur=narr(c,e,'If the cube falls off the Cube Base platform, the Manual robot may pick it up from the Manual field floor and place it again.',tP+3)+.6;return c;
  }
  c.to('cube','x',th,th+.5,16);c.to('cube','y',th,th+.5,480);
  c.ban(th,th+2.2,'CUBE LEFT THE ARENA','warn');c.vis('lOut',th,th+6);
  e=narr(c,e,'This time the ball knocks the cube clean out of the arena.',th+2);
  const rr=c.move('ref',[[40,480]],th+.8,200,{turn:0});c.hide('cube',rr,.2);
  c.vis('lPlat',0,0.01);
  e=narr(c,e,'The referee fetches the cube and places it back into the Auto robot, which is still parked in the Parking Zone.',rr+.8);
  const rb=c.move('ref',[[PARK[0]-44,PARK[1]]],rr+.4,220,{turn:0});
  c.jump('cube','o',rb,1);c.carry('cube','rob',rb,999,0,-31,{rot:true});
  c.move('ref',[[520,300]],rb+.8,200,{turn:0});
  c.ban(rb,rb+1.8,'CUBE BACK IN THE AUTO ROBOT','ok');
  /* the Manual robot takes it from the Auto robot again, as in a normal hand-off */
  const R=doHandoff(c,rb+1,'cube',rb,false);
  c.vis('lPlat',R.tG+1,R.tP+4);c.ban(R.tP,R.tP+1.8,'CUBE PLACED AGAIN','ok');
  const t2=narr(c,e,'Then the Manual robot takes the cube from the Auto robot as usual and places it on the platform.',R.tP+1);
  c.dur=narr(c,t2,'If the cube leaves the arena, the referee places it back into the autonomous robot parked in the Parking Zone.',R.tP+3.4)+.6;return c;
}
CLIPS['final']=mkFinal;CLIPS['plat-fall']=()=>platHit(false);CLIPS['plat-out']=()=>platHit(true);

/* ---------- the central ball platform, as in the drawing (13 slots, 170 mm apart, ends 126 mm) ---------- */
function mkCentral(){
  const c=new Clip({view:V_MAN});
  const SY=k=>436+51*k;                                   /* slot k (0..12) on the photo; 170 mm = 51 px */
  const KIND=['y','g','y','y','f','y','g','y','f','y','y','g','y'];
  c.add('strip','shape',{x:373,y:740,w:36,h:690,shape:'rect',fill:'rgba(255,255,255,.10)',stroke:'#fff',sw:3,dash:'10 6',o:0,pulse:true});
  c.add('d0','dim',{x:318,y:397,x2:318,y2:SY(0),text:'126',o:0});
  c.add('d1','dim',{x:318,y:SY(0),x2:318,y2:SY(1),text:'170',o:0});
  c.add('d2','dim',{x:318,y:SY(1),x2:318,y2:SY(2),text:'170',o:0});
  c.add('d3','dim',{x:318,y:SY(11),x2:318,y2:SY(12),text:'170',o:0});
  c.add('d4','dim',{x:318,y:SY(12),x2:318,y2:1085,text:'126',o:0});
  for(let k=0;k<13;k++)lbl(c,'s'+k,String(k+1),440,SY(k),{tone:KIND[k]==='g'?'ok':KIND[k]==='f'?'warn':'yel',tx:392,ty:SY(k)});
  lbl(c,'lCross','Robots cannot cross this platform',580,470,{tone:'warn',tx:392,ty:470});
  lbl(c,'lFl1','Reverse Flag',590,SY(4),{tone:'warn',tx:392,ty:SY(4)});
  lbl(c,'lFl2','Reverse Flag',590,SY(8),{tone:'warn',tx:392,ty:SY(8)});
  lbl(c,'lBig','Large green ball (centre)',600,SY(6),{tone:'ok',tx:392,ty:SY(6)});
  let e=narr(c,0,'The central platform holds the balls for both alliances, and robots cannot cross it.');
  c.vis('strip',.3,e+1);c.vis('lCross',.5,e);
  c.chip('mode',0,'CENTRAL PLATFORM','dark');
  const t1=e;
  e=narr(c,t1,'It has thirteen ball slots, 170 millimetres apart. The first and last slots are 126 millimetres from the ends.',t1+5);
  ['d0','d1','d2','d3','d4'].forEach((d,i)=>c.vis(d,t1+.3+i*.5,e+1));
  for(let k=0;k<13;k++)c.vis('s'+k,t1+.2+k*.12,e+4);
  const t2=e;
  e=narr(c,t2,'Three large green balls sit in slots 2, 7 and 12, and small yellow balls fill the remaining slots.',t2+3);
  const t3=e;
  c.vis('lBig',t3-2,t3+3);
  e=narr(c,t3,'Slots 5 and 9 hold the two Reverse Flags, on the upper layer. A flag only counts when a thrown ball flips it.',t3+3.4);
  c.vis('lFl1',t3,e+1);c.vis('lFl2',t3,e+1);
  c.add('flag','flag',{x:F1[0],y:F1[1],r:-90});c.add('flag2','flag',{x:F2[0],y:F2[1],r:90});
  c.add('tbR','ball',{x:300,y:F2[1]+4,c:'y',o:0});c.add('tbB','ball',{x:446,y:F1[1]+4,c:'y',o:0});
  lbl(c,'lTipB2','Tip points at BLUE',510,F2[1]+40,{tone:'dark',tx:F2[0]+14,ty:F2[1]});
  lbl(c,'lTipR2','Tip points at RED',250,F2[1]+40,{tone:'dark',tx:F2[0]-14,ty:F2[1]});
  lbl(c,'lTipR','Tip points at RED',250,F1[1]-40,{tone:'dark',tx:F1[0]-14,ty:F1[1]});
  lbl(c,'lTipB','Tip points at BLUE',510,F1[1]-40,{tone:'dark',tx:F1[0]+14,ty:F1[1]});
  const t3b=e+.3;
  e=narr(c,t3b,'Each flag is an arrow, and only a tip that points at your own side counts: 5 points. The flags start pointing opposite ways, so each alliance already holds 5 points.',t3b+5.5);
  c.vis('lTipR',t3b+.3,e);c.vis('lTipB2',t3b+.3,e);
  const t4=e+.3;
  e=narr(c,t4,'A red robot hits the bottom flag, which pointed at blue. Its tip turns toward red: plus 5 for red, minus 5 for blue.',t4+4.4);
  c.vis('tbR',t4+1,t4+2.2);
  shoot(c,'tbR',t4+1.2,F2[0]-8,F2[1]+4,.6);flipFlag(c,'flag2',t4+1.8,'R');
  c.vis('lTipR2',t4+2.4,e+.6);c.ban(t4+1.8,t4+3.4,'FLAG TURNED TO RED ✓','ok');
  const t5=e+.3;
  e=narr(c,t5,'A blue robot hits the top flag, which pointed at red. Its tip turns toward blue: plus 5 for blue, minus 5 for red.',t5+4.4);
  c.vis('tbB',t5+1,t5+2.2);
  shoot(c,'tbB',t5+1.2,F1[0]+8,F1[1]+4,.6);flipFlag(c,'flag',t5+1.8,'B');
  c.vis('lTipB',t5+2.4,e+.6);c.ban(t5+1.8,t5+3.2,'FLAG TURNED TO BLUE ✓','ok');
  c.dur=narr(c,e,'The drawing’s side view lists the heights 160, 136, 128, 130 and 80 millimetres.')+.6;return c;
}
CLIPS['central']=mkCentral;


/* ---------- hand-off clips: parked Auto robot, Manual robot at its start marker ---------- */
const EXT_HAND=.65, EXT_FLOOR=.62, EXT_PLAT=.92;
const platStand=p=>[p[0],p[1]-49-62*EXT_PLAT];   /* where the Manual robot stands (facing south) so its arm tip reaches the platform */
function addPlats(c){PLATS.forEach((p,i)=>c.add('plat'+i,'plat',{x:p[0],y:p[1]}))}
/* the central ball platform: a no-go strip for both robots */
function centerMark(c,t0,t1,lx=600,ly=300){
  if(!c.A.mid)c.add('mid','shape',{x:373,y:740,w:34,h:700,shape:'rect',fill:'rgba(255,70,70,.16)',stroke:'#ff6b60',sw:3,dash:'10 6',o:0,pulse:true});
  if(!c.A.lMid)lbl(c,'lMid','Central platform: robots cannot cross',lx,ly,{tone:'warn',tx:380,ty:ly+90});
  c.vis('mid',t0,t1);c.vis('lMid',t0+.3,t1);
}
function parkedSetup(c){
  c.add('man','manual',{x:HOME[0],y:HOME[1],r:90});
  c.add('rob','auto',{x:PARK[0],y:PARK[1],r:180});
  c.add('ref','ref',{x:520,y:332});
  addPlats(c);
  lbl(c,'lPlat','Cube Base platform (red side)',250,640,{tone:'dark',tx:PLAT[0]+22,ty:PLAT[1]+14});
  lbl(c,'lPark','Parking Zone',560,262,{tone:'info',tx:PARK[0]+20,ty:PARK[1]-6});
  c.add('cube','cube',{x:PARK[0],y:PARK[1]+31});
  parkZone(c,0,0);
}
function manApproach(c,t0){
  const tA=c.move('man',[[PARK[0],457]],t0,210,{turn:.2});
  return c.turn('man',0,tA,.35);
}
/* Manual robot with the cube on its arm drives to the Cube Base platform and places it. drop=true: the cube slips off on the way,
   lands on the Manual field floor, and the robot picks it up again before continuing. */
function toPlatform(c,tG,cube,drop){
  const S=platStand(PLAT),R={};
  c.to('man','ext',tG+.3,tG+1.1,.2);
  let tFrom=tG,tx=tG+1.2;
  if(drop){
    /* drives WEST along y=457 (its own half), the cube slips off and lands ahead of it on the Manual field floor */
    const X1=200,tD=c.move('man',[[X1,457]],tx,200,{turn:.2});
    c.carry(cube,'man',tG,tD,0,0,{arm:true});
    const fx=X1-49-62*EXT_FLOOR;
    c.to(cube,'x',tD,tD+.35,fx);
    c.to(cube,'s',tD,tD+.15,1.6);c.to(cube,'s',tD+.15,tD+.45,1);
    R.tD=tD;R.drop=[fx,457];
    c.to('man','ext',tD+1.2,tD+1.9,EXT_FLOOR);
    R.tG2=tD+2.0;
    c.to('man','ext',R.tG2+.3,R.tG2+1.1,.2);
    tFrom=R.tG2;tx=R.tG2+1.2;
  }
  const tM=c.move('man',[[S[0],S[1]]],tx,200,{turn:.2,face:180});
  c.to('man','ext',tM,tM+.8,EXT_PLAT);
  const tP=tM+.8;
  c.carry(cube,'man',tFrom,tP,0,0,{arm:true});
  c.jump(cube,'x',tP,PLAT[0]);c.jump(cube,'y',tP,PLAT[1]);
  R.tP=tP;R.tM=tM;return R;
}
/* approach + take the cube from the parked Auto robot + deliver. The cube rides on the Auto robot from cf0 until it is taken. */
function doHandoff(c,t0,cube,cf0,drop){
  const tA=manApproach(c,t0);
  c.to('man','ext',tA,tA+.8,EXT_HAND);
  const tG=tA+.9;
  c.carry(cube,'rob',cf0,tG,0,-31,{rot:true});
  const R=toPlatform(c,tG,cube,drop);
  R.tA=tA;R.tG=tG;return R;
}

function mkHandoff(){
  const c=new Clip({view:V_MID});parkedSetup(c);
  c.vis('lPark',.2,4);
  c.ban(.4,2,'AUTO PARKED','ok');
  c.score(.8,'parkCube');
  c.chip('clock',0,'MANUAL READY','blue');
  let t=narr(c,0,'The Auto robot is parked in the Parking Zone, holding the cube. The referee announces it.');
  c.ban(t,t+1.6,'MANUAL MAY MOVE','ok');
  const t1=narr(c,t,'Now the Manual robot may move. It must take the cube directly from the Auto robot’s mechanism.');
  const R=doHandoff(c,t+.4,'cube',0);
  centerMark(c,R.tG+.8,R.tP+4,600,330);
  c.cap(t1,R.tG+2.6,'Taking it straight from the Auto robot is the only way this cube scores.');
  const t2=narr(c,R.tG+2.6,'It carries the cube to the Cube Base platform on its own side, beside its own goalpost. A red robot uses the red goalpost, and it can never cross the central platform.',R.tP);
  c.vis('lPlat',R.tG+2,R.tP+5);
  c.ban(R.tP,R.tP+1.8,'CUBE ON PLATFORM','ok');
  c.to('man','ext',R.tP+.5,R.tP+1.3,0);
  const tE=narr(c,R.tP,'Placed! The platform points are counted at the end of the game.',R.tP+3.2);
  c.score(tE-.3,'cubeBase');
  c.dur=narr(c,tE,'Now the Manual robot continues with balls or the Reversed Flag.')+1;return c;
}

function mkFloor(){
  const c=new Clip({view:V_MID});parkedSetup(c);
  c.A.cube.init.y=PARK[1]+34;
  lbl(c,'lFloor','cube on the Parking Zone floor',560,300,{tone:'warn',tx:PARK[0]+8,ty:PARK[1]+34});
  lbl(c,'lNo','✗ Picked up from the floor: no points',500,720,{tone:'warn'});
  c.vis('lFloor',.3,6);
  c.chip('clock',0,'MANUAL','blue');
  let t=narr(c,0,'Suppose the cube has fallen onto the floor of the Parking Zone.');
  const tA=manApproach(c,t-1.5);
  c.to('man','ext',tA,tA+.8,EXT_FLOOR);const tG=tA+.9;
  const t1=narr(c,t,'The Manual robot scoops it from the Auto field floor.',tG+.5);
  const R=toPlatform(c,tG,'cube',false);
  c.vis('lPlat',tG+2,R.tP+3);
  c.ban(R.tP,R.tP+2.2,'NO POINTS','warn');c.vis('lNo',R.tP,R.tP+5);
  c.scoreRaw(R.tP+.3,'Cube picked up from the Auto field floor',0);
  c.dur=narr(c,t1,'Picking the cube up from the Auto field floor, Parking Zone included, does not score. It must come directly from the Auto robot.',R.tP+5)+.6;return c;
}

function mkDropAuto(){
  const c=new Clip({view:V_MID});parkedSetup(c);
  c.add('person','person',{x:20,y:340,o:0});
  lbl(c,'lMan','Manual robot must stay still',420,600,{tone:'warn',tx:PARK[0],ty:450});
  lbl(c,'lRef','Referee returns the cube',470,300,{tone:'dark'});
  lbl(c,'lMem','One teammate only',130,300,{tone:'yel'});
  c.vis('lPark',.2,2.6);
  c.chip('clock',0,'MANUAL','blue');
  let t=narr(c,0,'The Auto robot is parked with the cube, and the Manual robot comes to take it.');
  const tA=manApproach(c,1.6);
  c.to('man','ext',tA,tA+.6,.55);
  const tDrop=Math.max(tA+.7,t-.3);
  c.carry('cube','rob',0,tDrop,0,-31,{rot:true});
  c.to('cube','y',tDrop,tDrop+.35,PARK[1]+42);
  c.to('cube','s',tDrop,tDrop+.15,1.6);c.to('cube','s',tDrop+.15,tDrop+.45,1);
  c.to('man','ext',tDrop+.1,tDrop+.8,.1);
  c.chip('clock',tDrop,'PAUSE','yel');
  c.ban(tDrop,tDrop+2.2,'GAME PAUSED','yel');
  const t1=narr(c,tDrop,'If the cube drops inside the Auto field, the Parking Zone included, the referee PAUSES the game.');
  const cp=[c.pos.cube.x,PARK[1]+42];
  const rEnd=c.move('ref',[cp],t1,160,{turn:0});c.hide('cube',rEnd,.25);
  c.vis('lMan',tDrop+.8,rEnd+7);c.vis('lRef',t1,rEnd+1.2);
  const t2=narr(c,t1,'The referee picks the cube up and returns it to the team.',rEnd+.6);
  c.show('person',rEnd);
  const pEnd=c.move('person',[[PARK[0]-62,PARK[1]]],rEnd,170,{turn:0});c.vis('lMem',pEnd-1,pEnd+3);
  const t3=narr(c,t2,'One member of that team may reload the cube onto the parked Auto robot. Meanwhile the Manual robot stays still.',pEnd+.6);
  c.jump('cube','o',pEnd+.4,1);
  c.move('person',[[20,340]],pEnd+1.6,180,{turn:0});c.hide('person',pEnd+3,.4);
  c.move('ref',[[520,332]],rEnd+1.2,160,{turn:0});
  const tR=Math.max(t3,pEnd+3.2);
  c.chip('clock',tR,'MANUAL','blue');c.ban(tR,tR+1.6,'GAME RESUMES','ok');
  const t4=narr(c,tR,'The game resumes. The Manual robot takes the cube from the Auto robot again.');
  const R=doHandoff(c,tR+.3,'cube',pEnd+.4);
  c.vis('lPlat',R.tG+1.5,R.tP+4);
  const t5=narr(c,t4,'This reload is allowed by the referee, so the platform points still count.',R.tP);
  c.ban(R.tP,R.tP+1.8,'CUBE ON PLATFORM','ok');
  c.to('man','ext',R.tP+.5,R.tP+1.3,0);
  const tE=narr(c,Math.max(t5,R.tP),'Placed on the Cube Base platform: +15, counted at the end of the game.',R.tP+3);
  c.score(tE-.3,'cubeBase');
  c.dur=tE+.2;return c;
}

function mkDropManual(){
  const c=new Clip({view:V_MID});
  c.add('man','manual',{x:PARK[0],y:457,r:0,ext:.2});
  c.add('rob','auto',{x:PARK[0],y:PARK[1],r:180});
  addPlats(c);
  c.add('cube','cube',{x:PARK[0],y:457-49-12.4});
  lbl(c,'lPlat','Cube Base platform (red side)',250,640,{tone:'dark',tx:PLAT[0]+22,ty:PLAT[1]+14});
  lbl(c,'lFloor','cube on the Manual field floor',250,330,{tone:'warn'});
  lbl(c,'lAlly','Alliance partner may help pick it up',250,560,{tone:'info',tx:200,ty:457});
  c.chip('clock',0,'MANUAL','blue');
  let t=narr(c,0,'The Manual robot has the cube and is driving it to the Cube Base platform.');
  const S=platStand(PLAT),X1=200;
  const tD=c.move('man',[[X1,457]],t,200,{turn:.2});
  c.carry('cube','man',0,tD,0,0,{arm:true});
  const fx=X1-49-62*EXT_FLOOR;
  c.to('cube','x',tD,tD+.35,fx);
  c.to('cube','s',tD,tD+.15,1.6);c.to('cube','s',tD+.15,tD+.45,1);
  c.ban(tD,tD+2,'CUBE DROPPED!','warn');c.vis('lFloor',tD,tD+5);
  const t1=narr(c,tD,'If the cube drops in the Manual field, the game does not pause. The team can recover it from the floor.');
  c.to('man','ext',tD+1.2,tD+1.9,EXT_FLOOR);
  const tG=tD+2.0;
  c.vis('lAlly',t1-2,t1+3);centerMark(c,0.5,tD+6,600,330);
  const t2=narr(c,t1,'The Manual robot may pick it up itself, or an alliance partner may help pick it up.');
  c.to('man','ext',tG+.3,tG+1.1,.2);
  const tM=c.move('man',[[S[0],S[1]]],tG+1.2,200,{turn:.2,face:180});
  c.to('man','ext',tM,tM+.8,EXT_PLAT);
  const tP=tM+.8;
  c.carry('cube','man',tG,tP,0,0,{arm:true});
  c.jump('cube','x',tP,PLAT[0]);c.jump('cube','y',tP,PLAT[1]);
  c.vis('lPlat',tM-3,tP+3);
  c.ban(tP,tP+1.8,'CUBE ON PLATFORM','ok');
  const tE=narr(c,Math.max(t2,tM-1),'Then it places the cube on the Cube Base platform as normal.',tP+3);
  c.score(tE,'cubeBase');
  c.dur=narr(c,tE,'The platform points are counted at the end of the game.')+.8;return c;
}

/* ---------- Manual phase: shared by the stand-alone clip and the full match ---------- */
/* central ball platform (13 slots, 170 mm apart, y = 436 + 51k): slots 5 and 9 hold the Reverse Flags, slot 7 the large green ball */
const B1=[372,538],B2=[372,487],B3=[372,588],F1=[373,639],F2=[373,844];
/* a Reverse Flag is an arrow: at rest the tip points at the alliance that is about to throw, a hit turns it to the OPPONENT's side (r: -90 = red/west, +90 = blue/east) */
function flipFlag(c,id,t,toward){c.to(id,'r',t,t+.55,toward==='B'?90:-90);c.to(id,'s',t,t+.28,1.35);c.to(id,'s',t+.28,t+.55,1)}
function shoot(c,id,t,x,y,d=.8){c.to(id,'x',t,t+d,x);c.to(id,'y',t,t+d,y);c.to(id,'s',t,t+d/2,1.9);c.to(id,'s',t+d/2,t+d,1)}
function manualProps(c){
  c.add('ball1','ball',{x:B1[0],y:B1[1],c:'y'});c.add('ball2','ball',{x:B2[0],y:B2[1],c:'g'});c.add('ball3','ball',{x:B3[0],y:B3[1],c:'y'});
  PINS.forEach((p,i)=>c.add('pin'+i,'pin',{x:p[0],y:p[1],c:'b'}));
  c.add('flag0','flag',{x:F1[0],y:F1[1],r:-90});c.add('flag','flag',{x:F2[0],y:F2[1],r:90});   /* top flag already points at red; bottom flag points at blue and is the one to turn */
  c.add('goal','shape',{x:GOAL[0]+4,y:GOAL[1],w:100,h:345,shape:'rect',fill:'rgba(33,105,201,.25)',stroke:'#7fb2ff',sw:3,dash:'10 6',o:0,pulse:true});
  lbl(c,'lGoal','Opposing goalpost + target pins',470,460,{tone:'info',tx:GOAL[0]-10,ty:640});
  lbl(c,'lFlag','Reverse Flag (tip points at blue)',540,F2[1]+50,{tone:'dark',tx:F2[0]+18,ty:F2[1]});
  lbl(c,'lBall','Balls in the central area',200,430,{tone:'yel',tx:372,ty:520});
}
/* man must be at (300,538) facing east. Three tasks: yellow ball + pins, green ball, flag. Returns end time. */
function manualTasks(c,t0,clock=true){
  let t=t0;
  c.scoreRaw(t0+.2,'Reverse Flag at rest: one tip already points at your side',5);
  c.vis('lBall',t,t+3);centerMark(c,t+1,t+6,580,430);
  let e=narr(c,t,'Task A: grab a yellow ball from the central area and launch it into the opposing goalpost.');
  c.to('man','ext',t+.4,t+1.1,.45);
  c.to('man','ext',t+1.2,t+1.9,.15);
  const tm=c.move('man',[[300,740]],t+2,220,{turn:.2,face:90});
  c.carry('ball1','man',t+1.2,tm,0,0,{arm:true});
  c.vis('goal',tm,tm+4.6);c.vis('lGoal',tm,tm+4.4);
  const tl=tm+.2;
  shoot(c,'ball1',tl,GOAL[0]-30,GOAL[1]-12);
  c.score(tl+.8,'yellowBall');
  c.to('pin1','r',tl+.8,tl+1.2,85);c.to('pin1','o',tl+.8,tl+1.4,.25);c.to('pin1','x',tl+.8,tl+1.2,GOAL[0]+30);
  c.to('pin0','r',tl+1,tl+1.4,-80);c.to('pin0','o',tl+1,tl+1.6,.25);c.to('pin0','x',tl+1,tl+1.4,GOAL[0]+28);
  c.ban(tl+.8,tl+2.6,'PINS DOWN ✓','ok');
  c.score(tl+1.1,'pin',2);
  c.hide('ball1',tl+1.8,.3);
  e=narr(c,e,'A yellow ball in the goalpost scores 2.5 points, and each pin knocked down scores 5.',tl+2.4);
  const tB=Math.max(e,tl+2.6);
  const m1=c.move('man',[[300,B2[1]]],tB,220,{turn:.2,face:90});
  c.to('man','ext',m1,m1+.7,.45);c.to('man','ext',m1+.8,m1+1.5,.15);
  const m2=c.move('man',[[300,740]],m1+1.6,200,{turn:.1,face:90});
  c.carry('ball2','man',m1+.8,m2,0,0,{arm:true});
  const t2=m2+.2;
  e=narr(c,tB,'Task B: launch the larger green ball into the goalpost. It is worth 5 points.',t2+2);
  c.vis('goal',m2,m2+3);
  shoot(c,'ball2',t2,GOAL[0]-30,GOAL[1]+14);
  c.score(t2+.8,'greenBall');
  c.hide('ball2',t2+1.6,.3);
  const tC=Math.max(e,t2+2);
  e=narr(c,tC,'Task C: throw a ball at the Reversed Flag and turn its tip toward your own red side. Only a tip that points at your own side counts.');
  const m3=c.move('man',[[300,588]],tC,220,{turn:.2,face:90});
  c.to('man','ext',m3,m3+.7,.45);c.to('man','ext',m3+.8,m3+1.5,.15);
  const m4=c.move('man',[[300,F2[1]-12]],m3+1.6,200,{turn:.1,face:90});
  c.carry('ball3','man',m3+.8,m4,0,0,{arm:true});
  c.vis('lFlag',m4,m4+3.4);
  const t3=m4+.2;
  shoot(c,'ball3',t3,F2[0]-6,F2[1]+4,.6);
  flipFlag(c,'flag',t3+.6,'R');
  c.ban(t3+.6,t3+2.4,'FLAG TURNS TO RED ✓','ok');
  c.score(t3+.7,'flag');
  const tEnd=Math.max(e,t3+2.8);
  c.cap(Math.min(e,t3+.2),tEnd,'Every completed task adds points to the scoreboard.');
  if(clock)c.count('clock',t0,tEnd,'MANUAL',120,50,'blue');
  return tEnd;
}

function mkManual(){
  const c=new Clip({view:V_MAN});
  c.add('man','manual',{x:300,y:538,r:90});
  manualProps(c);
  c.chip('clock',0,'MANUAL 120 s','blue');
  c.ban(.3,1.9,'MANUAL PHASE','ok');
  let t=narr(c,0,'The Manual phase always starts when the Auto phase ends, and it lasts 120 seconds.',2.4);
  const tE=manualTasks(c,t);
  c.dur=narr(c,tE,'Rule 9: grab a ball from the center area and launch it at the goalpost and pins (a), or at the reverse flag (b).')+.6;return c;
}

/* ---------- full ranking match: everything in one run, camera follows the action ---------- */
function mkFull(drops){
  const c=new Clip({view:V_AUTO,board:true});intro(c);
  c.add('cube','cube',{x:START[0],y:START[1]});
  if(drops)c.add('cube2','cube',{x:START[0],y:START[1],o:0});
  c.add('person','person',{x:12,y:300,o:0});
  addPlats(c);manualProps(c);parkZone(c,0,0);
  const by=BANDY();
  lbl(c,'lEnt',ELBL+' (drawn)',170,by,{tone:'dark',tx:START[0],ty:START[1]+(by<0?-18:20)});
  lbl(c,'lPlat','Cube Base platform (red side)',250,640,{tone:'dark',tx:PLAT[0]+22,ty:PLAT[1]+14});
  lbl(c,'lMan','Manual robot stays still',200,440,{tone:'warn',tx:HOME[0]+30,ty:HOME[1]});
  let ck=90;
  const clk=(pre,t0,t1,to,tone)=>{c.count('clock',t0,t1,pre,ck,to,tone);ck=to};
  c.chip('mode',0,'RANKING MATCH','dark');
  c.chip('clock',0,'AUTO 90 s','red');
  c.ban(.4,2.4,'INSPECTION PASSED','ok');c.vis('lEnt',.6,6.5);
  let t=narr(c,0,'A full ranking match. Both robots pass inspection, and the Auto robot sits at its drawn entrance holding the cube.',6.4);
  c.ban(t,t+1.4,'START!','ok');t+=.6;
  let cubeId='cube',cf0=0,tPark;
  if(!drops){
    const t0=t+.4;tPark=c.move('rob',ROUTE.slice(1),t0,175);
    clk('AUTO',t0,tPark,62,'red');
    narr(c,t,'Auto phase: carry the cube through the maze to the Parking Zone.',tPark);
  } else {
    const t0=t+.4,tD=c.move('rob',ROUTE.slice(1,7),t0,175);
    clk('AUTO',t0,tD,76,'red');
    c.carry('cube','rob',0,tD,0,-31,{rot:true});
    c.to('cube','s',tD,tD+.15,1.6);c.to('cube','s',tD+.15,tD+.45,1);
    narr(c,t,'Auto phase: carry the cube through the maze…',tD);
    c.ban(tD,tD+1.9,'CUBE DROPPED!','warn');
    const cp=[c.pos.cube.x,c.pos.cube.y],rp=[c.pos.rob.x,c.pos.rob.y];
    const t1=narr(c,tD,'The cube drops before the Parking Zone, so the team relaunches at the same drawn entrance.');
    c.vis('lMan',tD+.5,t1+5);
    const rEnd=c.move('ref',[cp],t1,150,{turn:0});c.hide('cube',rEnd,.25);
    const t2=narr(c,t1,'The referee removes the cube, the team tells the referee, and a teammate carries the robot back.',rEnd+1);
    c.move('ref',[[34,-20]],rEnd+.6,150,{turn:0});
    c.show('person',t1+.8);
    const pEnd=c.move('person',[[rp[0],rp[1]+18]],t1+.8,140,{turn:0});
    const tBack=c.move('person',[[START[0],START[1]+18]],pEnd+.3,130,{turn:0});
    c.carry('rob','person',pEnd+.3,tBack,0,-18,{s:1.14});
    c.setPos('rob',START[0],START[1],c.pos.rob.r);
    const rt=c.turn('rob',H0,tBack,.35);
    c.move('person',[[12,300]],tBack+.3,150,{turn:0});c.hide('person',tBack+1.6,.4);
    const tR=Math.max(t2,rt)+.3;
    c.jump('cube2','o',tR,1);cubeId='cube2';cf0=tR;
    clk('AUTO',tD,tR,60,'red');
    const t3=tR+.4;
    tPark=c.move('rob',ROUTE.slice(1),t3,200);
    clk('AUTO',t3,tPark,38,'red');
    narr(c,tR,'Relaunched with a new cube, and the 90-second clock never stopped.',tPark);
  }
  c.ban(tPark,tPark+1.8,'PARKED!','ok');parkZone(c,tPark-.2,tPark+5);
  c.score(tPark+.3,'parkCube');
  const tp1=narr(c,tPark,'The Auto robot parks with the cube, and the referee announces it.',tPark+3.4);
  /* hand-off: camera glides to the middle of the field */
  c.camTo(tPark+1.5,tPark+3,V_MID);
  c.ban(tp1,tp1+1.6,'MANUAL MAY MOVE','ok');
  c.chip('mode',tp1,'HAND-OFF','dark');
  const tp2=narr(c,tp1,'The Manual robot may now move. It takes the cube directly from the Auto robot.');
  const R=doHandoff(c,tp1+.4,cubeId,cf0,drops);
  clk('AUTO',tp1,R.tG,ck-8,'red');
  let tx=tp2;
  if(drops){
    tx=narr(c,Math.max(tx,R.tG+1.5),'On the way, the cube drops on the Manual field. The game does not pause, so the robot just picks it up again.',R.tD+1.5);
    c.ban(R.tD,R.tD+2,'CUBE DROPPED!','warn');
    tx=narr(c,Math.max(tx,R.tD+1.5),'It scoops the cube from the floor and carries on to the platform.',R.tP-.3);
  } else tx=narr(c,Math.max(tx,R.tG+1.2),'It carries the cube to the Cube Base platform on its own side, beside its own goalpost.',R.tP-.3);
  c.vis('lPlat',R.tG+1,R.tP+4);
  c.ban(R.tP,R.tP+1.8,'CUBE ON PLATFORM','ok');
  clk('AUTO',R.tG,R.tP,ck-6,'red');
  c.to('man','ext',R.tP+.5,R.tP+1.3,.2);
  let t5=narr(c,R.tP,'Placed on the Cube Base platform. Those points are counted at the end of the game.',R.tP+2.4);
  /* the Manual robot does not wait: once the cube is placed it plays on while the Auto clock keeps running */
  c.camTo(t5,t5+1.6,V_MAN);c.chip('mode',t5,'MANUAL PLAYS ON','dark');
  const tw=c.move('man',[[300,450],[300,538]],R.tP+1.4,200,{turn:.2,face:90});
  const t6=narr(c,t5,'The Manual robot does not have to wait. As soon as the cube is placed, it carries on scoring with balls and the Reversed Flag, while the Auto clock keeps running.',Math.max(tw,t5+3.4));
  c.ban(t6-1.6,t6,'MANUAL ROBOT PLAYS ON','ok');
  const tE0=manualTasks(c,t6+.2,false);
  c.count('clock',R.tP+.5,tE0,'AUTO',ck-6,0,'red');
  c.ban(tE0,tE0+1.8,'90 s · AUTO PHASE ENDS','warn');c.hide('rob',tE0,.4);
  const tE=tE0+1.8;c.cap(tE0,tE+1.9,'The 90-second Auto phase ends and the Manual phase clock starts.');
  c.chip('clock',tE,'MANUAL 120 s','blue');c.chip('mode',tE,'MANUAL PHASE','dark');
  const tot=c.sc.reduce((a,e)=>a+e.pts,0)+SCORE.cubeBase.pts;
  const t7=tE+1.9;
  c.chip('skip',t7,'⏩ TIME SKIPPED','yel');
  c.count('clock',t7,t7+2,'MANUAL',120,0,'blue');
  c.ban(t7+2,t7+4.2,'MATCH OVER · '+tot+' PTS','ok');c.score(t7+2.2,'cubeBase');
  c.dur=narr(c,t7,`Time is up. The team’s ranking score for this match is ${tot} points.`,t7+4.6)+1;return c;
}
const S2=()=>platStand(PLAT)[0];

/* ---------- penalty clips ---------- */
function mkEarly(){
  const c=new Clip({view:V_AUTO,board:true});intro(c);
  c.add('cube','cube',{x:START[0],y:START[1]});parkZone(c,0,0);
  lbl(c,'lNo','Referee has not announced anything yet',420,500,{tone:'warn'});
  lbl(c,'lBack','Must return to the starting point',230,560,{tone:'dark',tx:HOME[0]+20,ty:HOME[1]+30});
  lbl(c,'lRef','Referee: “Auto robot parked”',210,By2(),{tone:'dark'});
  c.chip('clock',0,'AUTO 90 s','red');
  let t=narr(c,0,'The Manual robot must wait for the referee’s announcement before it moves.');
  const tD=c.move('rob',ROUTE.slice(1,9),t+.2,170);
  c.carry('cube','rob',0,999,0,-31,{rot:true});
  c.count('clock',t+.2,tD,'AUTO',90,60,'red');
  const tj=t+2;
  const tm=c.move('man',[[300,457]],tj,200,{turn:.2});
  c.vis('lNo',tj,tm+2.5);
  c.ban(tm,tm+2.2,'EARLY MOVE: −5','warn');
  c.score(tm+.1,'earlyMove');
  const t1=narr(c,tj,'Here the Manual robot jumps the gun and moves before the announcement.',tm+.5);
  const t2=narr(c,t1,'That costs 5 points, and the robot must return to its starting point.',tm+3);
  c.vis('lBack',tm+.8,tm+4);
  const tb=c.move('man',[[HOME[0],457]],tm+1.2,170,{turn:.2,face:90});
  const tP=Math.max(tD,tb,t2)+.4;
  const tPark=c.move('rob',ROUTE.slice(9),tP,175);
  c.cap(tP-.2,tPark,'The Auto robot carries on to the Parking Zone.');
  c.ban(tPark,tPark+1.8,'PARKED!','ok');parkZone(c,tPark,tPark+5);
  c.vis('lRef',tPark+.4,tPark+4);
  c.score(tPark+.3,'parkCube');
  c.dur=narr(c,tPark,'Only after the referee announces it may the Manual robot move.',tPark+4)+.8;return c;
}
function mkTouch(){
  const c=new Clip({view:V_MID});parkedSetup(c);
  c.add('person','person',{x:20,y:340,o:0});
  lbl(c,'lTouch','Person touches the cube',470,300,{tone:'warn',tx:PARK[0]+12,ty:PARK[1]+31});
  c.chip('clock',0,'MANUAL READY','blue');
  c.ban(.4,2,'AUTO PARKED','ok');c.score(.8,'parkCube');
  const t=narr(c,0,'The Auto robot is parked with the cube, and the match is running.');
  c.show('person',t);
  const pe=c.move('person',[[PARK[0]-40,PARK[1]+22]],t,150,{turn:0});
  c.to('cube','s',pe,pe+.2,1.5);c.to('cube','s',pe+.2,pe+.5,1);
  c.ban(pe,pe+2.4,'PERSON TOUCHED THE CUBE','warn');c.vis('lTouch',pe,pe+3);
  const t2=narr(c,t,'A teammate touches the cube during the match.',pe+2.4);
  c.move('person',[[20,340]],pe+1.2,170,{turn:0});c.hide('person',pe+3,.4);
  const R=doHandoff(c,t2+.4,'cube',0);
  c.vis('lPlat',R.tG+1,R.tP+6);
  const t3=narr(c,t2,'The Manual robot still delivers the cube to the Cube Base platform.',R.tP);
  const tE=narr(c,t3,'The platform points are counted at the end of the game…',R.tP+2.6);
  c.score(tE,'cubeBase');
  c.scoreRaw(tE+.7,'Platform points void: a person touched the cube',-SCORE.cubeBase.pts);
  c.ban(tE+.7,tE+3,'PLATFORM POINTS VOID','warn');
  c.dur=narr(c,tE,'…but they are void. This does not apply to carrying the robot during a relaunch, to stopping the Auto robot after the time-up signal, or to the referee-approved reload of a cube dropped during hand-off.',tE+7)+.8;return c;
}
function mkBalls(){
  const c=new Clip({view:V_MAN,board:true});
  const GX=120,GY=742;                                   /* a ball that is already inside the RED goalpost */
  c.add('man','manual',{x:300,y:538,r:90});
  c.add('ball1','ball',{x:GX,y:GY,c:'y'});
  c.add('ghost','shape',{x:B1[0],y:B1[1],w:30,h:30,shape:'circle',fill:'rgba(255,255,255,.12)',stroke:'#fff',sw:3,dash:'6 4',o:0,pulse:true});
  c.add('goalR','shape',{x:IW-GOAL[0]-4,y:GOAL[1],w:100,h:345,shape:'rect',fill:'rgba(217,58,48,.22)',stroke:'#ff7b72',sw:3,dash:'10 6',o:0,pulse:true});
  lbl(c,'lOrig','Original position',200,470,{tone:'dark',tx:B1[0]-8,ty:B1[1]-12});
  lbl(c,'lIn','A ball is already in the red goalpost',230,640,{tone:'warn',tx:GX,ty:GY-6});
  c.chip('clock',0,'MANUAL','blue');
  c.vis('goalR',.2,5);c.vis('lIn',.2,6);
  const e0=narr(c,0,'A ball is already inside the red goalpost. A red robot that takes it back out loses points.',5);
  /* the red Manual robot drives to its own goal, reaches in and lifts the ball out */
  const tg=c.move('man',[[300,742],[200,742]],e0,220,{turn:.2,face:-90});
  c.to('man','ext',tg,tg+.7,.5);
  c.ban(tg+.8,tg+2.6,'BALL TAKEN FROM GOAL','warn');c.score(tg+.9,'pickFromGoal');
  c.to('man','ext',tg+.8,tg+1.5,.15);
  const tb=c.move('man',[[300,640]],tg+1.6,200,{turn:.2});
  c.carry('ball1','man',tg+.8,tb,0,0,{arm:true});
  const e2=narr(c,e0,'Picking a ball back up out of the goal costs 5 points per ball.',tb);
  c.vis('ghost',tb,tb+6);c.vis('lOrig',tb,tb+6);
  c.ban(tb+.2,tb+2.4,'NOT RETURNED','warn');c.score(tb+.3,'notReturned');
  c.dur=narr(c,Math.max(e2,tb),'After the game every ball must be back at its original position, or the team loses 5 points.',tb+6)+.8;return c;
}

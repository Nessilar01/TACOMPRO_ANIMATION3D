
/* ---------- helpers shared by clip builders ---------- */
/* Narration helper: put a caption at t whose length fits the sentence (~18 chars/s), return its end time. minEnd lets a caption cover an animation that takes longer. */
function narr(c,t,text,minEnd=0){const d=Math.max(1.8,text.length/18+.35),e=Math.max(t+d,minEnd);c.cap(t,e,text);return e}
const BANDY=()=>START[1]>200?392:-16;               /* free band above (or below) the maze for explanatory labels */
function intro(c){
  c.add('man','manual',{x:HOME[0],y:HOME[1],r:90});
  c.add('rob','auto',{x:START[0],y:START[1],r:H0});
  c.add('ref','ref',{x:34,y:-20});
}
function parkZone(c,t0,t1){if(!c.A.zPark)c.add('zPark','shape',{x:PARK[0],y:PARK[1],w:74,h:74,shape:'rect',fill:'rgba(255,255,255,.12)',stroke:'#ffffff',sw:4,dash:'9 6',o:0,pulse:true});if(t1>t0)c.vis('zPark',t0,t1)}

/* ---------- Auto phase clips ---------- */
function mkAutoRun(){
  const c=new Clip({view:V_AUTO});intro(c);
  c.add('cube','cube',{x:START[0],y:START[1]});
  parkZone(c,0,0);
  const by=BANDY(),dy=by<0?-18:20;
  lbl(c,'lEnt',ELBL+' (drawn)',170,by,{tone:'dark',tx:START[0],ty:START[1]+dy});
  lbl(c,'lCube','yellow cube',400,by,{tone:'yel',tx:START[0]+12,ty:START[1]-8});
  lbl(c,'lHold','Hold the cube. Never set it on the floor',500,by<0?140:300,{tone:'warn'});
  lbl(c,'lRef','Referee: “Auto robot parked”',210,by,{tone:'dark'});
  c.chip('clock',0,'AUTO 90 s','red');
  c.vis('lEnt',.4,5.4);c.vis('lCube',2,5.4);
  narr(c,0,'In a ranking match the team plays alone. The Auto robot starts at its drawn entrance, holding the yellow cube.',7.2);
  c.ban(6.2,7.6,'START!','ok');
  const t0=7.4,tEnd=c.move('rob',ROUTE.slice(1),t0,175);
  c.carry('cube','rob',0,999,0,-31,{rot:true});
  c.count('clock',t0,tEnd,'AUTO',90,90-(tEnd-t0)*4.2,'red');
  narr(c,t0,'The first 90 seconds are the Auto phase. Carry the cube through the maze to the Parking Zone, never setting it on the floor.',tEnd);
  c.vis('lHold',t0+1,tEnd-.6);
  c.ban(tEnd,tEnd+1.8,'PARKED!','ok');
  parkZone(c,tEnd-.2,tEnd+6);
  c.score(tEnd+.3,'parkCube');
  c.vis('lRef',tEnd+.6,tEnd+4.4);
  c.move('ref',[[190,-20]],tEnd,120,{turn:0});
  const t1=narr(c,tEnd,'Parked! The referee announces it.',tEnd+4);
  c.dur=narr(c,t1,'Only then may the Manual robot move. See the hand-off clip.')+.8;return c;
}

function mkRelaunch(attempts){
  const c=new Clip({view:V_AUTO});intro(c);
  c.add('person','person',{x:12,y:300,o:0});
  parkZone(c,0,0);
  const by=BANDY();
  lbl(c,'lMan','Manual robot must stay still',200,440,{tone:'warn',tx:HOME[0]+30,ty:HOME[1]});
  lbl(c,'lNote','Team tells the referee: “Relaunch”',270,by<0?40:By2(),{tone:'dark'});
  lbl(c,'lClk','The 90-second clock keeps running',470,360,{tone:'info'});
  lbl(c,'lFix','Repairs are allowed',230,by<0?130:340,{tone:'yel'});
  lbl(c,'lNew','new cube',400,by<0?90:420,{tone:'yel',tx:START[0]+14,ty:START[1]-10});
  c.chip('clock',0,'AUTO 90 s','red');
  let t=narr(c,0,`The Auto robot leaves ${ELBL}, carrying the cube.`);
  const clockT0=t+.2;t+=.2;
  const dropIdx=[6,11],lMan=[],lNote=[],lClk=[],lFix=[],lNew=[];let tLast=0;
  for(let k=0;k<=attempts;k++){
    const cb='cube'+k,last=k===attempts;
    c.add(cb,'cube',{x:START[0],y:START[1],o:k===0?1:0});
    const tAtt=t;
    if(k>0){c.jump(cb,'o',tAtt,1);lNew.push([tAtt,tAtt+2])}
    const toIdx=last?ROUTE.length-1:dropIdx[k];
    const tEnd=c.move('rob',ROUTE.slice(1,toIdx+1),t+.4,last?200:175);
    c.cap(tAtt,Math.max(tEnd,tAtt+1.8),k===0?'It drives through the maze toward the Parking Zone.':`Attempt ${k+1}, with a fresh cube.`);
    if(!last){
      c.carry(cb,'rob',tAtt,tEnd,0,-31,{rot:true});
      c.to(cb,'s',tEnd,tEnd+.15,1.6);c.to(cb,'s',tEnd+.15,tEnd+.45,1);
      c.ban(tEnd,tEnd+1.9,'CUBE DROPPED!','warn');
      const tt=narr(c,tEnd,k===0?'Cube dropped before the Parking Zone. The team may relaunch from the drawn entrance with a new cube.':'Dropped again. The team may relaunch as many times as it likes while the 90 seconds last.');
      const cp=[c.pos[cb].x,c.pos[cb].y],rp=[c.pos.rob.x,c.pos.rob.y];
      lMan.push([tEnd+.5,0]);
      const rEnd=c.move('ref',[cp],tt,150,{turn:0});
      c.hide(cb,rEnd,.25);
      const t2=narr(c,tt,'The referee removes the dropped cube.',rEnd+.5);
      c.move('ref',[[34,-20]],t2,150,{turn:0});
      c.show('person',t2);
      const pEnd=c.move('person',[[rp[0],rp[1]+18]],t2,140,{turn:0});
      const t3=narr(c,t2,'The team must tell the referee before relaunching.',pEnd);
      lNote.push([t2,t3]);
      const tBack=c.move('person',[[START[0],START[1]+18]],t3+.4,130,{turn:0});
      c.carry('rob','person',t3+.4,tBack,0,-18,{s:1.14});
      c.setPos('rob',START[0],START[1],c.pos.rob.r);
      const t4=narr(c,t3,'One teammate carries the robot back to the entrance. That is not counted as touching it.',tBack);
      const rt=c.turn('rob',H0,tBack,.35);
      c.move('person',[[12,300]],tBack+.3,150,{turn:0});c.hide('person',tBack+1.6,.4);
      let t5=t4;
      if(k===1){t5=narr(c,t4,'The robot may be repaired before it is relaunched.');lFix.push([t4,t5])}
      const t6=narr(c,t5,'Meanwhile the Manual robot stays still and the clock does not stop.');
      lClk.push([t5,t6]);lMan[lMan.length-1][1]=t6;
      t=Math.max(t6,rt)+.4;
    } else {
      c.carry(cb,'rob',tAtt,999,0,-31,{rot:true});
      tLast=tEnd;
    }
  }
  const rate=(90-24)/(tLast-clockT0);
  c.count('clock',clockT0,tLast,'AUTO',90,90-(tLast-clockT0)*rate,'red');
  seg(c,'lMan',lMan);seg(c,'lNote',lNote);seg(c,'lClk',lClk);seg(c,'lFix',lFix);seg(c,'lNew',lNew);
  c.ban(tLast,tLast+2,'PARKED!','ok');parkZone(c,tLast,tLast+6);
  c.score(tLast+.3,'parkCube');
  const e1=narr(c,tLast,'Relaunch worked, and it all happened inside the 90 seconds.',tLast+3);
  c.dur=narr(c,e1,'There is no penalty for relaunching in this rulebook.')+.6;return c;
}
function By2(){return START[1]>200?420:40}

function mkContinue(){
  const c=new Clip({view:V_AUTO});intro(c);
  c.add('cube','cube',{x:START[0],y:START[1]});parkZone(c,0,0);
  lbl(c,'lWait','Wait until the Auto phase reaches 90 s',420,470,{tone:'warn',tx:HOME[0]+30,ty:HOME[1]});
  lbl(c,'lSkip','time skipped in this clip',560,330,{tone:'dark'});
  c.chip('clock',0,'AUTO 90 s','red');
  let t=narr(c,0,'The Auto robot sets off with the cube.');
  const tD=c.move('rob',ROUTE.slice(1,7),t+.2,175);
  c.carry('cube','rob',0,tD,0,-31,{rot:true});
  c.to('cube','s',tD,tD+.15,1.6);c.to('cube','s',tD+.15,tD+.45,1);
  c.ban(tD,tD+1.8,'CUBE DROPPED!','warn');
  c.cap(t,tD,'It drives through the maze toward the Parking Zone.');
  const t1=narr(c,tD,'Option B: do not relaunch. Keep driving and park in the Parking Zone without the cube.');
  const cp=[c.pos.cube.x,c.pos.cube.y];
  const rEnd=c.move('ref',[cp],tD+.3,150,{turn:0});c.hide('cube',rEnd,.25);c.move('ref',[[34,-20]],rEnd+.6,150,{turn:0});
  const tPark=c.move('rob',ROUTE.slice(7),tD+1.2,175);
  const rate=3.4,left=Math.max(10,90-(tPark-t)*rate);
  c.count('clock',t,tPark,'AUTO',90,left,'red');
  c.ban(tPark,tPark+1.8,'PARKED, NO CUBE','yel');parkZone(c,tPark,tPark+11);
  c.score(tPark+.3,'parkNoCube');
  if(tPark>t1+2.8)c.cap(t1,tPark,'It keeps driving to the Parking Zone, with no cube to hand over.');
  const t2=narr(c,Math.max(t1,tPark),'Parked without the cube. Now the Manual robot has to wait for the Auto phase to run its full 90 seconds.');
  c.vis('lWait',tPark+.4,t2+2);
  c.vis('lSkip',t2-1.5,t2+2);
  c.count('clock',t2-1.5,t2+1.8,'AUTO',left,0,'red');
  c.ban(t2+1.9,t2+3.9,'AUTO ENDS · MANUAL MAY MOVE','ok');
  c.move('man',[[260,457]],t2+2,170,{turn:.2});
  c.dur=narr(c,t2,'At 90 seconds the Manual robot may start working.')+1.5;return c;
}

function mkAutoEnd(late){
  const c=new Clip({view:V_AUTO});intro(c);
  c.add('cube','cube',{x:START[0],y:START[1]});
  c.add('person','person',{x:12,y:300,o:0});
  c.add('cM','cube',{x:230,y:600,o:0});
  lbl(c,'lStay','A cube in the Manual field stays in play',420,560,{tone:'ok',tx:240,ty:596});
  c.add('noZone','shape',{x:373,y:760,w:700,h:700,shape:'rect',fill:'rgba(217,58,48,.25)',stroke:'#ff5a4f',sw:5,dash:'14 8',o:0,pulse:true});
  const by=BANDY();
  lbl(c,'lNo','✗ Parking after time-up scores nothing',450,by<0?40:By2(),{tone:'warn'});
  lbl(c,'lCube','Cube still held: out of play',420,by<0?150:340,{tone:'dark'});
  lbl(c,'lField','Nobody may enter or reach into the Manual field',373,520,{tone:'warn'});
  lbl(c,'lPen',late?'−5 points: not stopped in time':'Stop within 10 s or lose 5 points',470,by<0?260:300,{tone:'warn'});
  lbl(c,'lOk','Team members may enter the Auto field only',150,300,{tone:'ok'});
  c.chip('clock',0,'AUTO 90 s','red');
  let t=narr(c,0,'Say the Auto robot is still driving as the 90 seconds run out.');
  const tA=c.move('rob',ROUTE.slice(1,13),t+.2,150);
  c.cap(t,tA,'The clock is nearly out, and the robot is still in the maze.');
  c.carry('cube','rob',0,999,0,-31,{rot:true});
  c.count('clock',t+.2,tA,'AUTO',90,0,'red');
  c.ban(tA,tA+2,'90 s: AUTO ENDS','warn');
  c.score(tA+1.2,'parkCube',0,'Parking after time-up: no points');c.sc[c.sc.length-1].pts=0;c.sc[c.sc.length-1].draft=false;
  const t1=narr(c,tA,'At 90 seconds the Auto phase ends at once. Parking points can no longer be scored, and anything the Auto robot does scores nothing.');
  const tB=c.move('rob',ROUTE.slice(13),tA+.2,late?45:120);
  c.vis('lNo',tB-1.2,tB+3);
  c.count('sub',t1,t1+10,'ORDER TO STOP:',10,0,'warn');
  c.vis('lPen',t1,t1+5);
  const t2=narr(c,t1,'If it is still moving, the referee orders the team to stop it. The team has 10 seconds.');
  if(late){
    const tp=t1+12.4;
    c.show('person',tp-1.2);const pe=c.move('person',[[c.pos.rob.x-10,c.pos.rob.y+40]],tp-1.2,150,{turn:0});
    c.ban(t1+10,t1+12.2,'TIME OVER: −5','warn');
    c.score(t1+10.1,'noStop');
    c.chip('sub',t1+10.05,'NOT STOPPED IN TIME','warn');
    if(t1+10>t2)c.cap(t2,t1+10,'The robot keeps moving, and nobody stops it.');
    const t3=narr(c,t1+10,'The 10 seconds pass and the robot is still moving. The team loses 5 points.',t1+12);
    const tS=Math.max(pe,tB)+.3;
    c.vis('lOk',tp,tS+2);
    c.hide('cube',tS+.6,.3);c.vis('lCube',tS+.6,tS+4);
    c.dur=narr(c,Math.max(t3,tS),'Only now does a teammate stop the robot. Stop it on time with the program, or lift it out.',tS+4.5)+.8;
    c.hide('rob',tS+2.4,.4);c.hide('person',tS+3.6,.4);
    return c;
  }
  c.show('person',t1+1.2);
  const pe=c.move('person',[[c.pos.rob.x-10,c.pos.rob.y+40]],t1+1.2,150,{turn:0});
  const tS=Math.max(pe,tB,t2)+.3;
  c.vis('lOk',t1+1.6,tS+2);
  c.chip('sub',tS,'STOPPED ON TIME','ok');
  c.ban(tS,tS+1.8,'ROBOT STOPPED','ok');
  const t3=narr(c,tS,'Stop it with the program, or have one team member stop or lift it out right after the time-up signal.');
  c.hide('cube',tS+.6,.3);c.vis('lCube',tS+.6,tS+5);
  c.hide('rob',tS+2.0,.4);c.move('person',[[12,300]],tS+2,160,{turn:0});c.hide('person',tS+3.6,.4);
  c.vis('noZone',t3+.2,t3+8);c.vis('lField',t3+.2,t3+8);
  const t4=narr(c,t3+.2,'Nobody may enter or reach into the Manual field at any time. When time runs out, the Auto field is reset.');
  c.vis('cM',t4,t4+7);c.vis('lStay',t4,t4+7);
  const t5=narr(c,t4,'A cube that is already in the Manual field stays in play.');
  c.dur=t5+.8;return c;
}

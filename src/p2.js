const FIELD='data:image/jpeg;base64,__B64__';
const IW=746, IH=1482, NS='http://www.w3.org/2000/svg';

/* ---------- field geometry (measured from the user's field photo) ---------- */
const P=71.9, cx=c=>50+P*c, cy=r=>47.5+P*r;
/* maze walls traced from the photo: vw[r][c] = wall between col c and c+1 in row r, hw[r][c] = wall between row r and r+1 in col c */
const MAZE={vw:[[0,0,0,0,1,0,0,0,0],[0,0,1,1,1,1,1,0,0],[1,0,1,0,1,0,1,0,1],[1,0,1,1,1,1,1,0,1],[1,0,0,1,1,1,0,0,1]],
            hw:[[1,1,0,1,0,0,1,0,1,1],[0,0,1,0,1,1,0,1,0,0],[0,1,0,0,0,0,0,0,1,0],[0,0,1,0,0,0,0,1,0,0]]};
function bfs(s,g){
  const key=(c,r)=>c+','+r,q=[s],prev={[key(...s)]:null};
  const nb=(c,r)=>{const o=[];if(c<9&&!MAZE.vw[r][c])o.push([c+1,r]);if(c>0&&!MAZE.vw[r][c-1])o.push([c-1,r]);if(r<4&&!MAZE.hw[r][c])o.push([c,r+1]);if(r>0&&!MAZE.hw[r-1][c])o.push([c,r-1]);return o};
  for(let i=0;i<q.length;i++){const u=q[i];if(u[0]===g[0]&&u[1]===g[1])break;
    for(const v of nb(...u)){const k=key(...v);if(!(k in prev)){prev[k]=u;q.push(v)}}}
  const path=[];let u=g;while(u){path.push(u);u=prev[key(...u)]}return path.reverse();
}
/* three entrances per alliance side (red side shown); the Parking Zone is the bottom-right cell of that side */
const ENTS={A:{n:1,cell:[0,0]},B:{n:2,cell:[4,0]},C:{n:3,cell:[0,4]}};
let ENT='A',ROUTE,START,PARK,H0,ELBL;
const heading=(a,b)=>Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI;
function routeFor(k){return bfs(ENTS[k].cell,[4,4]).map(([c,r])=>[cx(c),cy(r)])}
function setEnt(k){ENT=k;ROUTE=routeFor(k);START=ROUTE[0];PARK=ROUTE[ROUTE.length-1];H0=heading(ROUTE[0],ROUTE[1]);ELBL=`Entrance ${ENTS[k].n} (${k})`}
setEnt('A');

const HOME=[82,457];
/* the red alliance owns the LEFT half (goalpost x~84), the blue alliance the RIGHT half (goalpost x~662). Robots never cross the central ball platform (x~373). A robot places its cube on ITS OWN side's platform.
   goal: net frame spans y 575..912 in the photo; crossbar (pins) at x ~662. Cube Base platforms stand 5 cm (~15 px) beyond each end of the goal */
const GOAL=[666,744], PINS=[[662,613],[662,735],[662,875]], PLATS=[[84,545],[84,937],[662,545],[662,937]], PLAT=PLATS[0];
const V_AUTO=[0,-45,IW,700], V_MID=[0,215,IW,700], V_MAN=[0,380,IW,700], V_FULL=[0,-10,IW,1110];

/* ---------- scoring table (read-only on the page; change values here and rebuild). ok = value given by the rulebook/user, the rest are drafts ---------- */
const SCORE={
  parkNoCube:{label:'Park in the Parking Zone without the cube',pts:5,ok:1},
  parkCube:{label:'Park in the Parking Zone holding the cube (replaces the +5)',pts:10,ok:1},
  cubeBase:{label:'Cube on the Cube Base platform (counted at the end of the game)',pts:15,ok:1},
  pin:{label:'Pin knocked down (each)',pts:5,ok:1},
  flag:{label:'Reverse flag tip turned toward your own side by a thrown ball (each)',pts:5,ok:1},
  greenBall:{label:'Green ball in the goalpost (each)',pts:5,ok:1},
  yellowBall:{label:'Yellow ball in the goalpost (each)',pts:2.5,ok:1},
  pickFromGoal:{label:'Ball picked up from the goal (each)',pts:-5,ok:1},
  notReturned:{label:'Balls not returned to their original position after the game',pts:-5,ok:1},
  earlyMove:{label:'Manual robot moves before the referee’s announcement',pts:-5,ok:1},
  noStop:{label:'Auto robot not stopped within 10 s of the referee’s order',pts:-5,ok:1},
  damage:{label:'Damaged or lost part (each)',pts:-5,ok:1}
};

/* ---------- tiny timeline engine ---------- */
class Clip{
  constructor(o){Object.assign(this,{type:'map',view:V_AUTO,dur:10,board:false,bg:null},o);this.A={};this.order=[];this.caps=[];this.bans=[];this.chips=[];this.pos={};this.rows=[];this.sc=[];this.cam=null}
  add(id,type,init){const a={id,type,init:Object.assign({x:0,y:0,r:0,o:1,s:1,ext:0},init),kf:{},fol:[]};this.A[id]=a;this.order.push(id);this.pos[id]={x:a.init.x,y:a.init.y,r:a.init.r};return a}
  arr(id,p){const a=this.A[id];return a.kf[p]||(a.kf[p]=[[0,a.init[p]]])}
  hold(id,p,t){const k=this.arr(id,p),l=k[k.length-1];if(t>l[0]+1e-6)k.push([t,l[1]])}
  push(id,p,t,v){const k=this.arr(id,p),l=k[k.length-1];if(t<=l[0])t=l[0]+1e-3;k.push([t,v])}
  to(id,p,t0,t1,v){this.hold(id,p,t0);this.push(id,p,t1,v)}
  jump(id,p,t,v){const k=this.arr(id,p),l=k[k.length-1];if(t-0.01>l[0])k.push([t-0.01,l[1]]);this.push(id,p,t,v)}
  show(id,t,d=.3){this.to(id,'o',t,t+d,1)} hide(id,t,d=.3){this.to(id,'o',t,t+d,0)}
  vis(id,t0,t1){this.show(id,t0);this.hide(id,t1)}
  setPos(id,x,y,r){this.pos[id]={x,y,r}}
  move(id,pts,t0,spd,opt={}){
    const st=this.pos[id],turn=opt.turn??.26;let t=t0;
    this.hold(id,'x',t);this.hold(id,'y',t);this.hold(id,'r',t);
    for(const [x,y] of pts){
      const dx=x-st.x,dy=y-st.y,d=Math.hypot(dx,dy);if(d<.5)continue;
      let ang=Math.atan2(dx,-dy)*180/Math.PI,da=((ang-st.r+540)%360)-180;ang=st.r+da;
      if(Math.abs(da)>4){t+=turn*Math.min(1,Math.abs(da)/90)+.02;this.push(id,'x',t,st.x);this.push(id,'y',t,st.y);this.push(id,'r',t,ang);st.r=ang}
      t+=d/spd;this.push(id,'x',t,x);this.push(id,'y',t,y);this.push(id,'r',t,st.r);st.x=x;st.y=y;
    }
    if(opt.face!==undefined){const da=((opt.face-st.r+540)%360)-180;if(Math.abs(da)>2){t+=.3;this.push(id,'x',t,st.x);this.push(id,'y',t,st.y);this.push(id,'r',t,st.r+da);st.r+=da}}
    return t;
  }
  turn(id,face,t0,d=.35){const st=this.pos[id];const da=((face-st.r+540)%360)-180;this.hold(id,'r',t0);this.push(id,'r',t0+d,st.r+da);st.r+=da;return t0+d}
  carry(id,tgt,t0,t1,dx,dy,o={}){
    const f=Object.assign({tgt,t0,t1,dx,dy,rot:false,arm:false,s:0},o);this.A[id].fol.push(f);
    if(t1<900){const p=this.fpos(f,t1);this.jump(id,'x',t1,p.x);this.jump(id,'y',t1,p.y);if(f.rot||f.arm)this.jump(id,'r',t1,p.r);this.setPos(id,p.x,p.y,p.r)}
  }
  fpos(f,t){const T=this.val(f.tgt,t);let dx=f.dx,dy=f.dy;if(f.arm)dy=-(49+62*T.ext)+f.dy;
    if(f.rot||f.arm){const rr=T.r*Math.PI/180,c=Math.cos(rr),s=Math.sin(rr);[dx,dy]=[dx*c-dy*s,dx*s+dy*c]}
    return{x:T.x+dx,y:T.y+dy,r:T.r}}
  ev(a,p,t){const k=a.kf[p];if(!k)return a.init[p];if(t<=k[0][0])return k[0][1];
    for(let i=1;i<k.length;i++)if(t<=k[i][0]){const[t0,v0]=k[i-1],[t1,v1]=k[i];return v0+(v1-v0)*(t-t0)/(t1-t0)}
    return k[k.length-1][1]}
  val(id,t){const a=this.A[id],o={};for(const p of['x','y','r','o','s','ext'])o[p]=this.ev(a,p,t);
    for(const f of a.fol)if(t>=f.t0&&t<f.t1){const p=this.fpos(f,t);o.x=p.x;o.y=p.y;if(f.rot||f.arm)o.r=p.r;if(f.s)o.s=f.s}
    return o}
  cap(t0,t1,text){this.caps.push({t0,t1,text})}
  ban(t0,t1,text,tone='info'){this.bans.push({t0,t1,text,tone})}
  chip(key,t0,text,tone){this.chips.push({key,t0,text,tone,kind:'s'})}
  count(key,t0,t1,prefix,from,to,tone){this.chips.push({key,t0,t1,prefix,from,to,tone,kind:'c'})}
  row(t,badge,tone,text){this.rows.push({t,badge,tone,text})}
  /* scoreboard event: look the value up in SCORE (so edits in the page apply), mult = how many times */
  score(t,key,mult=1,label,side){const s=SCORE[key];this.sc.push({t,key,side,label:label||s.label+(mult>1?' ×'+mult:''),pts:s.pts*mult,draft:!s.ok});this.board=true}
  scoreRaw(t,label,pts,side){this.sc.push({t,key:'raw',side,label,pts,draft:false});this.board=true}
  /* camera: animate the SVG viewBox between same-aspect windows */
  camTo(t0,t1,v){if(!this.cam)this.cam=[[0,this.view.slice()]];const l=this.cam[this.cam.length-1];if(t0>l[0]+1e-6)this.cam.push([t0,l[1].slice()]);this.cam.push([Math.max(t1,t0+1e-3),v.slice()])}
  camAt(t){const k=this.cam;if(!k)return this.view;if(t<=k[0][0])return k[0][1];
    for(let i=1;i<k.length;i++)if(t<=k[i][0]){let f=(t-k[i-1][0])/(k[i][0]-k[i-1][0]);f=f*f*(3-2*f);return k[i-1][1].map((v,j)=>v+(k[i][1][j]-v)*f)}
    return k[k.length-1][1]}
}
function lbl(c,id,text,x,y,o={}){c.add(id,'label',Object.assign({text,x,y,o:0,tone:'info'},o))}
const seg=(c,id,a)=>a.forEach(([x,y])=>c.vis(id,x,y));

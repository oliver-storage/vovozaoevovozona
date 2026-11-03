// Vovozão e Vovozona — motor do jogo
const CONFIG = { SISTEMA:'Vovozão e Vovozona', VERSAO:'0.1.1.0', DESENVOLVEDOR:'Vettore Sistemas' };
const $=id=>document.getElementById(id);
const VW=640, VH=360, ROWS=11, G=1800, DT=1/60;
const LETRAS=['N','A','T','A','L'];
const NOMES={zao:'Vovozão',zona:'Vovozona'};
const fmtT=s=>{ s=Math.floor(s); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
const FIS={ zao:{vmax:250, jv:-520, w:36, h:84}, zona:{vmax:275, jv:-540, jv2:-480, w:28, h:80} };
const CHEFES={ cidade:{tipo:'pombao',nome:'Pombão Gigante',w:120,h:100}, escritorio:{tipo:'ranzinza',nome:'Chefe Ranzinza',w:90,h:150}, casa:{tipo:'aspirador',nome:'Aspirador Gigante',w:180,h:70} };

// ---------- save ----------
const SK='vovozao_vovozona_v1';
let S; try{ S=Object.assign({desbloq:1,melhor:{},som:true,musica:true,viuIntro:false},JSON.parse(localStorage.getItem(SK)||'{}')); }catch(e){ S={desbloq:1,melhor:{},som:true,musica:true,viuIntro:false}; }
const salvar=()=>{ try{ localStorage.setItem(SK,JSON.stringify(S)); }catch(e){} };

// ---------- som e música ----------
const Som={ ctx:null, mus:null,
  init(){ if(!this.ctx){ try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(this.ctx&&this.ctx.state==='suspended') this.ctx.resume(); if(S.musica) Musica.liga(); },
  tom(f,d=.1,tipo='square',vol=.05,q=0,f2){ if(!S.som||!this.ctx) return; const c=this.ctx,t=c.currentTime+q,o=c.createOscillator(),g=c.createGain();
    o.type=tipo; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f2||f*1.25,t+d); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+d); o.connect(g).connect(c.destination); o.start(t); o.stop(t+d+.02); },
  pulo(){ this.tom(330,.12,'square',.04,0,660); }, pulo2(){ this.tom(520,.12,'triangle',.05,0,1040); },
  presente(){ this.tom(1568,.07,'triangle',.05); this.tom(2093,.09,'triangle',.04,.05); },
  grande(){ [1047,1319,1568,2093].forEach((f,i)=>this.tom(f,.12,'triangle',.05,i*.06)); }, letra(){ [784,988,1175,1568].forEach((f,i)=>this.tom(f,.14,'square',.04,i*.08)); },
  pisa(){ this.tom(200,.12,'square',.06,0,90); }, rola(){ this.tom(140,.25,'sawtooth',.04,0,300); }, boom(){ this.tom(80,.45,'sawtooth',.09,0,30); this.tom(160,.3,'square',.05,0,60); },
  canhao(){ this.tom(110,.25,'sawtooth',.08,0,50); this.tom(600,.2,'triangle',.04,.02,1500); }, mola(){ this.tom(220,.25,'sine',.08,0,880); },
  dano(){ this.tom(400,.3,'square',.06,0,120); }, vida(){ [523,659,784,1047,1319].forEach((f,i)=>this.tom(f,.14,'square',.05,i*.09)); },
  bolsa(){ this.tom(700,.1,'triangle',.04,0,400); }, caixa(){ this.tom(160,.15,'square',.06,0,80); }, chefe(){ this.tom(90,.3,'square',.08,0,60); this.tom(300,.2,'square',.05,.05,150); },
  vitoria(){ [523,659,784,1047,784,1047,1319].forEach((f,i)=>this.tom(f,.2,'square',.05,i*.13)); }, fala(){ this.tom(380+Math.random()*240,.04,'triangle',.025); }
};
// "Jingle Bells" (melodia de 1857, domínio público) em volume baixo
const Musica={ tocando:false, prox:0, i:0, timer:null,
  notas:[[64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,.5],[64,4],[65,1],[65,1],[65,1.5],[65,.5],[65,1],[64,1],[64,1],[64,.5],[64,.5],[64,1],[62,1],[62,1],[64,1],[62,2],[67,2],
         [64,1],[64,1],[64,2],[64,1],[64,1],[64,2],[64,1],[67,1],[60,1.5],[62,.5],[64,4],[65,1],[65,1],[65,1.5],[65,.5],[65,1],[64,1],[64,1],[64,.5],[64,.5],[67,1],[67,1],[65,1],[62,1],[60,4]],
  liga(){ if(this.tocando||!Som.ctx||!S.musica) return; this.tocando=true; this.prox=Som.ctx.currentTime+.1; this.i=0; this.timer=setInterval(()=>this.agenda(),120); },
  desliga(){ this.tocando=false; clearInterval(this.timer); },
  agenda(){ const c=Som.ctx; if(!c) return; const b=.21;
    while(this.prox<c.currentTime+.5){ const [n,d]=this.notas[this.i]; const f=440*Math.pow(2,(n-69)/12), t=this.prox;
      const o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=f; g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.035,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+d*b*.95); o.connect(g).connect(c.destination); o.start(t); o.stop(t+d*b);
      if(this.i%2===0){ const o2=c.createOscillator(), g2=c.createGain(); o2.type='sine'; o2.frequency.value=f/4; g2.gain.setValueAtTime(.025,t); g2.gain.exponentialRampToValueAtTime(.0001,t+b*1.8); o2.connect(g2).connect(c.destination); o2.start(t); o2.stop(t+b*2); }
      this.prox+=d*b; this.i=(this.i+1)%this.notas.length; if(this.i===0) this.prox+=b*2; } }
};
const vibrar=p=>{ try{ navigator.vibrate&&navigator.vibrate(p); }catch(e){} };

// ---------- entrada ----------
const K={esq:0,dir:0,cima:0,baixo:0,pulo:0,puloN:0,poderN:0,poder2N:0,trocaN:0,seguirN:0};
const TEC={ArrowLeft:'esq',KeyA:'esq',ArrowRight:'dir',KeyD:'dir',ArrowUp:'cima',KeyW:'cima',ArrowDown:'baixo',KeyS:'baixo',Space:'pulo',KeyZ:'pulo',KeyK:'pulo'};
addEventListener('keydown',e=>{
  if(cena){ if(['Space','Enter'].includes(e.code)){ e.preventDefault(); avancarCena(); } return; }
  if(!J||!J.rodando){ return; }
  const k=TEC[e.code]; if(k){ if(k==='pulo'&&!K.pulo) K.puloN=1; K[k]=1; e.preventDefault(); }
  if(['KeyX','KeyJ'].includes(e.code)) K.poderN=1;
  if(['KeyC','KeyL'].includes(e.code)) K.poder2N=1;
  if(['KeyQ','Tab'].includes(e.code)){ K.trocaN=1; e.preventDefault(); }
  if(['KeyE','KeyF'].includes(e.code)) K.seguirN=1;
  if(['KeyP','Escape'].includes(e.code)) pausa();
});
addEventListener('keyup',e=>{ const k=TEC[e.code]; if(k) K[k]=0; });
function botao(id,ao,solto){ const b=$(id); if(!b) return;
  b.addEventListener('pointerdown',e=>{ e.preventDefault(); Som.init(); try{ b.setPointerCapture(e.pointerId); }catch(_){} b.classList.add('on'); ao(); });
  const f=()=>{ b.classList.remove('on'); solto&&solto(); }; b.addEventListener('pointerup',f); b.addEventListener('pointercancel',f); b.addEventListener('lostpointercapture',f); }

// ---------- fase ----------
let J=null;
const tile=(x,y)=> (y<0||y>=ROWS)?'.':(x<0||x>=J.W)?'#':J.g[y][x];
function solido(x,y){ if(y<0) return false; if(y>=ROWS) return false; if(x<0||x>=J.W) return true; if(J.sol[y][x]) return true; if(J.travada && x===J.arenaX-1 && y<9) return true; return false; }
const solidoPx=(px,py)=>solido(Math.floor(px/T),Math.floor(py/T));
function umaVia(x,y,p){ const c=tile(x,y); if(c==='=') return true; if(c==='H' && tile(x,y-1)!=='H' && !(p&&p.escada)) return true; return false; }

function carregar(n){
  const def=FASES[n-1], g=def.mapa.map(l=>l.split('')), W=g[0].length, tema=def.tema;
  const sol=g.map(r=>r.map(c=>c==='#'||c==='B'));
  const ent={pres:[], caixas:[], pontos:[], molas:[], canhoes:[], plats:[], inis:[], objs:[]};
  let ini={x:3,y:8}, arenaX=W-30, saida={x:W-5,y:8};
  const OBJ={c:[4,2],O:[6,3],S:[3,2]}; let corCarro=0;
  for(let y=0;y<ROWS;y++) for(let x=0;x<W;x++){
    const c=g[y][x], px=x*T, py=y*T; let limpa=true;
    if(c==='o') ent.pres.push({x:px+20,y:py+20,tipo:'o',v:(x*7+y)%5});
    else if(c==='G') ent.pres.push({x:px+20,y:py+20,tipo:'G'});
    else if('12345'.includes(c)) ent.pres.push({x:px+20,y:py+20,tipo:'L',i:+c-1});
    else if(c==='K') ent.caixas.push({x:px,y:py,w:40,h:40,vx:0,vy:0,re:true,x0:px,y0:py});
    else if(c==='P') ent.pontos.push({x:px,y:py,ativo:false});
    else if(c==='j') ent.molas.push({x:px,y:py,comp:0});
    else if('EeRrUu@'.includes(c)) ent.canhoes.push({x:px,y:py,tipo:c,ang:{E:Math.PI/4,e:Math.PI/4,R:.15,r:.15,U:Math.PI/2,u:Math.PI/2,'@':Math.PI/4}[c],cd:0,ocup:null,tm:0});
    else if(c==='m'||c==='M') ent.plats.push({x:px,y:py+40-14,x0:px,y0:py+40-14,w:80,h:14,tipo:c,dx:0,dy:0});
    else if('asxvtd'.includes(c)) ent.inis.push(novoInimigo(c,px,py));
    else if(OBJ[c]){ const [w,h]=OBJ[c]; for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) sol[yy][xx]=true; ent.objs.push({tipo:c,x:px,y:py,cor:corCarro++}); }
    else if(c==='J') ini={x,y};
    else if(c==='X') arenaX=x;
    else if(c==='F') saida={x,y};
    else limpa=false;
    if(limpa && !OBJ[c]) g[y][x]='.';
    if(OBJ[c]) g[y][x]='.';
  }
  const fundo=montaFundo(tema), tiles=montaTiles(tema);
  J={ n, def, tema, g, sol, W, ...ent, inimigosIni:ent.inis.map(e=>({...e})), caixasIni:ent.caixas.map(c=>({...c})),
    fundo, tiles, arenaX, saida:{x:saida.x*T,y:saida.y*T,ativo:false}, chefe:null, travada:false,
    jog:{ zao:novoJog('zao',ini.x*T+4,(ini.y+1)*T), zona:novoJog('zona',ini.x*T-40,(ini.y+1)*T) },
    ativo:'zao', seguir:true, vidas:5, presentes:0, cem:0, letras:[0,0,0,0,0], t:0, cam:{x:0,y:80}, treme:0,
    volta:{x:ini.x*T+4,y:(ini.y+1)*T}, proj:[], fx:[], rodando:false, fim:false, msg:null, arenaCaixasT:0 };
  J.cam.x=Math.max(0,J.jog.zao.x-VW/3);
}
function novoJog(id,x,yPe){ const f=FIS[id]; return {id,x,y:yPe-f.h,w:f.w,h:f.h,vx:0,vy:0,chao:false,dir:1,est:'parado',anim:0,coyote:0,jt:0,pulou2:false,rola:0,pisao:false,segura:null,cd:0,inv:0,escada:false,presente:true,sai:0,canhao:null,voo:0,plat:null,ult:{x,y:yPe-f.h},preso:0,ultDist:1e9,aiPulo:0}; }
function novoInimigo(c,px,py){ const tam={a:[36,34],s:[36,38],x:[42,40],v:[40,30],t:[40,64],d:[56,40]}[c]; return {tipo:c,x:px+(40-tam[0])/2,y:py+40-tam[1],w:tam[0],h:tam[1],x0:px,y0:py+40-tam[1],vx:0,vy:0,dir:-1,morto:false,cd:1+Math.random(),estado:'parado',t:Math.random()*6,giro:0,atira:0}; }

// ---------- colisão ----------
function moveX(e,dx){ e.x+=dx; const y1=Math.floor(e.y/T), y2=Math.floor((e.y+e.h-1)/T); let bateu=false;
  if(dx>0){ const tx=Math.floor((e.x+e.w)/T); for(let y=y1;y<=y2;y++) if(solido(tx,y)){ e.x=tx*T-e.w-.01; bateu=true; break; } }
  else if(dx<0){ const tx=Math.floor(e.x/T); for(let y=y1;y<=y2;y++) if(solido(tx,y)){ e.x=(tx+1)*T+.01; bateu=true; break; } }
  return bateu; }
function moveY(e,dy,p){ const pe0=e.y+e.h; e.y+=dy; e.chao=false; const x1=Math.floor((e.x+2)/T), x2=Math.floor((e.x+e.w-3)/T);
  if(dy>0){ const ty=Math.floor((e.y+e.h)/T);
    for(let x=x1;x<=x2;x++){ if(solido(x,ty) || (umaVia(x,ty,p) && pe0<=ty*T+2)){ e.y=ty*T-e.h; e.vy=0; e.chao=true; return; } }
    if(J.plats) for(const pl of J.plats){ if(e.x+e.w>pl.x+2 && e.x<pl.x+pl.w-2 && pe0<=pl.y+3 && e.y+e.h>=pl.y){ e.y=pl.y-e.h; e.vy=0; e.chao=true; if(p) p.plat=pl; return; } } }
  else if(dy<0){ const ty=Math.floor(e.y/T); for(let x=x1;x<=x2;x++) if(solido(x,ty)){ e.y=(ty+1)*T; e.vy=0; break; } } }
const sobre=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function naEscada(p){ const cx=Math.floor((p.x+p.w/2)/T); for(let y=Math.floor((p.y+10)/T);y<=Math.floor((p.y+p.h-4)/T);y++) if(tile(cx,y)==='H') return true; return false; }

// ---------- jogadores ----------
const ativo=()=>J.jog[J.ativo], outro=()=>J.jog[J.ativo==='zao'?'zona':'zao'];
function atualizaJog(p,c,controlado){
  if(!p.presente){ if(p.sai>0){ p.sai-=DT; p.vy+=G*DT; p.x+=p.vx*DT; p.y+=p.vy*DT; p.anim+=DT; } return; }
  if(p.canhao){ const k=p.canhao; p.x=k.x+20-p.w/2; p.y=k.y+40-p.h; p.vx=p.vy=0; k.tm-=DT;
    const auto=k.tipo===k.tipo.toUpperCase()&&k.tipo!=='@';
    if((auto&&k.tm<=0)||(!auto&&c.puloN)){ const a=k.tipo==='@'?anguloGira(k):k.ang; p.vx=Math.cos(a)*900; p.vy=-Math.sin(a)*900; p.voo=.75; p.canhao=null; k.ocup=null; k.cd=.6; p.dir=1;
      Som.canhao(); vibrar(40); J.treme=.25; for(let i=0;i<14;i++) J.fx.push(fxP(k.x+20,k.y+20,['#ff4d6a','#ffd93b','#fff'][i%3])); }
    return; }
  if(p.inv>0) p.inv-=DT; if(p.cd>0) p.cd-=DT; if(p.voo>0) p.voo-=DT;
  const F2=FIS[p.id];
  // escada
  if(!p.escada && (c.cima||c.baixo) && naEscada(p) && !p.segura){ p.escada=true; p.rola=0; }
  if(!p.escada && c.baixo && p.chao && tile(Math.floor((p.x+p.w/2)/T),Math.floor((p.y+p.h+2)/T))==='H'){ p.escada=true; p.y+=6; }
  if(p.escada){
    p.vx=((c.dir?1:0)-(c.esq?1:0))*70; p.vy=((c.baixo?1:0)-(c.cima?1:0))*160;
    if(c.puloN){ p.escada=false; p.vy=F2.jv*.75; p.jt=.12; Som.pulo(); }
    else { moveX(p,p.vx*DT); p.y+=p.vy*DT; if(!naEscada(p)) p.escada=false; if(solidoPx(p.x+p.w/2,p.y+p.h)){ p.escada=false; p.y=Math.floor((p.y+p.h)/T)*T-p.h; } }
    if(p.vx||p.vy) p.anim+=DT; p.est='escada'; if(p.escada){ coletas(p); return; } }
  // horizontal
  const m=(c.dir?1:0)-(c.esq?1:0);
  if(p.rola>0){ p.rola-=DT; p.vx=p.dir*400; if(p.rola<=0) p.vx=p.dir*220; }
  else if(p.voo>0){ if(m) p.vx+=m*300*DT; }
  else { const alvo=m*F2.vmax*(p.segura?.8:1), ac=p.chao?1500:950;
    if(m){ p.dir=m; p.vx+=Math.sign(alvo-p.vx)*Math.min(Math.abs(alvo-p.vx),ac*DT); }
    else { const fr=p.chao?1900:350; p.vx-=Math.sign(p.vx)*Math.min(Math.abs(p.vx),fr*DT); } }
  // pulo
  const estavaNoChao=p.chao;
  p.coyote = p.chao ? (p.rola>0?.28:.09) : p.coyote-DT;
  if(c.puloN){
    if(p.coyote>0){ p.vy=F2.jv; p.coyote=0; p.jt=.2; p.chao=false; p.plat=null; if(p.rola>0){ p.rola=0; p.vx=p.dir*330; } Som.pulo(); vibrar(6); }
    else if(p.id==='zona' && !p.pulou2 && !p.segura){ p.vy=F2.jv2; p.pulou2=true; p.jt=.16; Som.pulo2(); for(let i=0;i<10;i++) J.fx.push(fxP(p.x+p.w/2,p.y+p.h,'#ffe28a')); }
  }
  let fat=1;
  if(c.pulo && p.jt>0 && p.vy<0 && p.voo<=0){ fat=.35; p.jt-=DT; } else if(!c.pulo) p.jt=0;
  // poderes (só quem está sendo controlado)
  if(controlado) poderes(p,c);
  if(p.pisao){ p.vx=0; }
  p.vy+=G*fat*DT; p.vy=Math.min(p.vy,p.pisao?1100:900);
  p.planando = p.id==='zona' && !p.chao && p.vy>0 && c.pulo && p.voo<=0;
  if(p.planando) p.vy=Math.min(p.vy,75);
  // plataforma móvel
  if(p.plat){ p.x+=p.plat.dx; p.y+=p.plat.dy; }
  p.plat=null;
  const bateu=moveX(p,p.vx*DT); if(bateu&&p.rola>0) p.rola=0;
  moveY(p,p.vy*DT,p);
  if(p.chao){ p.pulou2=false; p.voo=0; if(!p.plat) p.ult={x:p.x,y:p.y};
    if(p.pisao){ p.pisao=false; onda(p); } }
  // molas
  for(const ml of J.molas){ const top=ml.y+14; if(p.vy>=0 && p.x+p.w>ml.x+6 && p.x<ml.x+34 && p.y+p.h>=top && p.y+p.h<=top+26){ p.y=top-p.h; p.vy=c.pulo?-1080:-960; p.jt=0; p.chao=false; p.pulou2=false; ml.comp=.2; Som.mola(); vibrar(15); } }
  // canhões (só controlado)
  if(controlado) for(const k of J.canhoes){ if(k.cd<=0 && !k.ocup && sobre(p,{x:k.x+4,y:k.y+4,w:32,h:36})){ p.canhao=k; k.ocup=p; k.tm=.35; p.rola=0; p.pisao=false; Som.caixa(); break; } }
  // perigos
  const x1=Math.floor((p.x+4)/T), x2=Math.floor((p.x+p.w-5)/T), yp=Math.floor((p.y+p.h-6)/T);
  for(let x=x1;x<=x2;x++) if(tile(x,yp)==='^'){ ferir(p); break; }
  if(p.y>ROWS*T+60) caiu(p);
  coletas(p);
  // estado/animação
  p.est = p.rola>0?'rola' : p.pisao?'pisao' : p.segura?'segura' : p.lanca>0?'lanca' : !p.chao ? (p.vy<0?'pula':(p.planando?'plana':'cai')) : Math.abs(p.vx)>25?'corre':'parado';
  if(p.lanca>0) p.lanca-=DT;
  p.anim+= p.est==='corre' ? DT*Math.abs(p.vx)/230 : DT;
}
function anguloGira(k){ return (Math.sin(J.t*1.7)*.5+.5)*Math.PI/2; }
function poderes(p,c){
  if(p.id==='zao'){
    if(c.poderN){
      if(p.segura){ arremessa(p); }
      else if(p.chao && p.rola<=0 && p.cd<=0){ p.rola=.45; p.cd=.55; Som.rola(); }
      else if(!p.chao && !p.pisao && p.voo<=0){ p.pisao=true; p.vy=800; p.rola=0; Som.tom(500,.2,'square',.04,0,150); }
    }
    if(c.poder2N){
      const cx=J.caixas.find(k=>!k.voando && !k.carregada && Math.abs((k.x+20)-(p.x+p.w/2))<52 && Math.abs((k.y+40)-(p.y+p.h))<36);
      const z=J.jog.zona;
      if(p.segura) arremessa(p);
      else if(cx){ cx.carregada=true; p.segura=cx; Som.caixa(); }
      else if(z.presente && !z.sai && p.chao && Math.abs((z.x+z.w/2)-(p.x+p.w/2))<90 && Math.abs((z.y+z.h)-(p.y+p.h))<30){
        z.x=p.x+p.w/2-z.w/2; z.y=p.y-z.h-2; z.vy=-860; z.vx=p.dir*140; z.dir=p.dir; z.chao=false; z.pulou2=false; z.escada=false; z.jt=0; p.lanca=.4;
        J.ativo='zona'; Som.mola(); vibrar(30); for(let i=0;i<12;i++) J.fx.push(fxP(z.x+z.w/2,z.y+z.h,'#fff6c8')); aviso('Lançamento em dupla!'); hudPers(); }
      else aviso('Chegue perto da Vovozona ou de uma caixa');
    }
  } else {
    if(c.poderN && !J.proj.some(q=>q.tipo==='bolsa')){ J.proj.push({tipo:'bolsa',x:p.x+p.w/2+p.dir*14,y:p.y+34,vx:p.dir*560,vy:0,t:0,dono:p,acertou:new Set()}); Som.bolsa(); }
  }
}
function arremessa(p){ const k=p.segura; p.segura=null; k.carregada=false; k.voando=true; k.x=p.x+p.w/2-20+p.dir*20; k.y=p.y-34; k.vx=p.dir*560; k.vy=-260; k.dir=p.dir; p.lanca=.35; Som.bolsa(); }
function onda(p){ Som.boom(); vibrar([40,20,60]); J.treme=.35; const cx=p.x+p.w/2, py=p.y+p.h;
  for(let i=0;i<24;i++){ const a=Math.PI+Math.random()*Math.PI; J.fx.push({x:cx,y:py,vx:Math.cos(a)*260,vy:Math.sin(a)*220,vida:.6,cor:'#e8eef6',r:4}); }
  J.fx.push({anel:1,x:cx,y:py,vida:.45});
  for(const e of J.inis) if(!e.morto && Math.abs(e.x+e.w/2-cx)<150 && Math.abs(e.y+e.h-py)<60) mataInimigo(e,Math.sign(e.x-cx)||1);
  for(const k of J.caixas) if(!k.carregada && Math.abs(k.x+20-cx)<110 && Math.abs(k.y+40-py)<50) quebraCaixa(k);
  const b=J.chefe; if(b && !b.morto && Math.abs(b.x+b.w/2-cx)<170 && b.y+b.h>=8.5*T) danoChefe(b,'onda'); }
function ferir(p){
  if(p.inv>0||!p.presente||p.canhao) return;
  const o=p.id==='zao'?J.jog.zona:J.jog.zao;
  Som.dano(); vibrar([60,30,60]); J.treme=.2;
  if(o.presente && !o.sai){
    if(p.segura){ const k=p.segura; p.segura=null; k.carregada=false; k.y=p.y+p.h-40; }
    p.presente=false; p.sai=1.8; p.vy=-650; p.vx=-p.dir*140; p.est='susto'; p.rola=0; p.pisao=false; p.escada=false;
    if(J.ativo===p.id){ J.ativo=o.id; } o.inv=Math.max(o.inv,1.0); aviso(`${NOMES[p.id]} levou um susto! Ache uma caixa ❤️ para trazer de volta`); hudPers();
  } else perdeVida();
}
function caiu(p){
  const o=p.id==='zao'?J.jog.zona:J.jog.zao;
  if(J.ativo!==p.id && o.presente){ teleporta(p,o); return; }
  if(o.presente && !o.sai){ p.presente=false; p.sai=0; J.ativo=o.id; o.inv=1; aviso(`${NOMES[p.id]} caiu! Ache uma caixa ❤️`); hudPers(); Som.dano(); }
  else perdeVida();
}
function perdeVida(){
  if(J.fim) return; J.vidas--; hudTopo(); J.rodando=false; Som.dano();
  if(J.vidas<=0){ J.fim=true; const jj=J; setTimeout(()=>J===jj&&modal(`<h2>Fim de jogo</h2><p>Os presentes ainda estão espalhados… tente de novo!</p><button class="btn verde" id="m-rep">Tentar de novo</button><button class="btn sec" id="m-fases">Fases</button>`,()=>{ $('m-rep').onclick=()=>jogar(J.n); $('m-fases').onclick=telaFases; }),700); return; }
  const jj=J; escurece(()=>{ if(J!==jj) return; renasce(); J.rodando=true; });
}
function renasce(){
  const v=J.volta; for(const id of ['zao','zona']){ const p=J.jog[id]; Object.assign(p,novoJog(id, id==='zao'?v.x:v.x-44, v.y)); }
  J.ativo='zao'; J.jog.zao.inv=1.2; J.jog.zona.inv=1.2;
  J.inis=J.inimigosIni.map(e=>({...e})); J.proj=[];
  J.caixas=J.caixas.filter(k=>!k.arena); J.caixasIni.forEach(ci=>{ if(!J.caixas.some(k=>k.x0===ci.x0&&k.y0===ci.y0)) J.caixas.push({...ci}); }); J.caixas.forEach(k=>{ if(!k.arena){ k.x=k.x0; k.y=k.y0; k.voando=false; k.carregada=false; } });
  if(J.chefe){ J.chefe=null; J.travada=false; J.saida.ativo=false; }
  J.cam.x=Math.max(0,v.x-VW/3); hudPers();
}
function teleporta(p,alvo){ const u=alvo.ult||{x:alvo.x,y:alvo.y};
  p.x=u.x-alvo.dir*44; p.y=u.y+alvo.h-p.h; if(solidoPx(p.x+2,p.y+p.h-4)||solidoPx(p.x+p.w-2,p.y+p.h-4)||solidoPx(p.x+p.w/2,p.y+10)) { p.x=u.x; }
  p.vx=0; p.vy=0; p.escada=false; p.preso=0; p.ultDist=1e9; p.inv=Math.max(p.inv,.6);
  for(let i=0;i<16;i++) J.fx.push(fxP(p.x+p.w/2,p.y+p.h/2,['#fff6c8','#ffd93b','#ff9ab5'][i%3])); }
// parceiro: segue sozinho (ligado) ou fica parado (desligado)
function controleIA(p){
  const c={esq:0,dir:0,cima:0,baixo:0,pulo:0,puloN:0};
  if(!J.seguir||!p.presente||p.sai) return c;
  const A=ativo(); if(!A.presente) return c;
  const alvoX=A.x+A.w/2-A.dir*58, dx=alvoX-(p.x+p.w/2), dist=Math.hypot(A.x-p.x,A.y-p.y);
  if(A.canhao||A.voo>0||dist>560||p.y>ROWS*T){ if(A.chao||dist>560) teleporta(p,A); return c; }
  if(Math.abs(dx)>26){ if(dx>0) c.dir=1; else c.esq=1; }
  if(p.chao){
    const fr=dx>0?1:-1, fx=Math.floor((p.x+p.w/2+fr*(p.w/2+14))/T), py=Math.floor((p.y+p.h-6)/T);
    const parede=solido(fx,py)||solido(fx,py-1), buraco=!solido(fx,py+1)&&!umaVia(fx,py+1)&&!solido(fx,py+2)&&!umaVia(fx,py+2);
    const acima=(A.y+A.h)<(p.y+p.h)-50 && Math.abs(dx)<170;
    if((Math.abs(dx)>26&&(parede||buraco))||acima||tile(fx,py)==='^'){ c.puloN=1; p.aiPulo=.28; }
  }
  if(p.aiPulo>0){ c.pulo=1; p.aiPulo-=DT; }
  if(dist<p.ultDist-4){ p.ultDist=dist; p.preso=0; } else if(dist>90){ p.preso+=DT; }
  if(dist<90) p.ultDist=dist;
  if(p.preso>1.6 && A.chao){ teleporta(p,A); }
  return c;
}

// ---------- coletas e caixas ----------
function coletas(p){
  const cx=p.x+p.w/2, cy=p.y+p.h/2;
  for(let i=J.pres.length-1;i>=0;i--){ const q=J.pres[i]; if(q.vx!==undefined && q.trava>0) continue;
    if(Math.abs(q.x-cx)<p.w/2+16 && Math.abs(q.y-cy)<p.h/2+14){ pega(q); J.pres.splice(i,1); } }
  for(const pt of J.pontos) if(!pt.ativo && Math.abs(pt.x+20-cx)<40 && Math.abs(pt.y+20-cy)<70 && p.id===J.ativo){ pt.ativo=true; J.volta={x:pt.x,y:pt.y+40}; Som.vida(); aviso('🎄 Ponto de volta salvo!'); for(let k=0;k<14;k++) J.fx.push(fxP(pt.x+20,pt.y,['#ffd93b','#2ecc71','#ff4d6a'][k%3])); }
  for(const k of J.caixas) if(!k.carregada && !k.voando && sobre(p,k) && p.rola>0) quebraCaixa(k);
  for(const k of J.caixas) if(!k.carregada && !k.voando && p.vy>0 && p.x+p.w>k.x+4 && p.x<k.x+36 && p.y+p.h>=k.y && p.y+p.h<=k.y+22){ quebraCaixa(k); p.vy=-460; }
  if(J.saida.ativo && p.id===J.ativo && Math.abs(J.saida.x+20-cx)<60 && Math.abs(J.saida.y+20-cy)<80) completa();
}
function pega(q){
  if(q.tipo==='o'){ J.presentes++; J.cem++; Som.presente(); }
  else if(q.tipo==='G'){ J.presentes+=10; J.cem+=10; Som.grande(); for(let k=0;k<12;k++) J.fx.push(fxP(q.x,q.y,'#ffd93b')); aviso('🎁 Presentão! +10'); }
  else if(q.tipo==='L'){ J.letras[q.i]=1; Som.letra(); for(let k=0;k<12;k++) J.fx.push(fxP(q.x,q.y,'#f2c14e')); if(J.letras.every(Boolean)){ J.vidas++; Som.vida(); aviso('✨ N-A-T-A-L completo! +1 vida'); } else aviso(`Letra ${LETRAS[q.i]}!`); }
  J.fx.push({txt:q.tipo==='G'?'+10':q.tipo==='L'?LETRAS[q.i]:'+1',x:q.x,y:q.y,vida:.7});
  while(J.cem>=100){ J.cem-=100; J.vidas++; Som.vida(); aviso('🎁 100 presentes! +1 vida'); }
  hudTopo();
}
function quebraCaixa(k){
  if(k.quebrada) return; k.quebrada=true; J.caixas=J.caixas.filter(x=>x!==k); Som.caixa(); vibrar(25);
  for(let i=0;i<14;i++) J.fx.push({x:k.x+20,y:k.y+20,vx:(Math.random()-.5)*360,vy:-Math.random()*360,vida:.8,cor:['#c98a52','#8a5a30','#e8b878'][i%3],r:4,g:1});
  const fora=['zao','zona'].map(id=>J.jog[id]).find(p=>!p.presente);
  if(k.re && fora){ Object.assign(fora,novoJog(fora.id,k.x+20-FIS[fora.id].w/2,k.y+40)); fora.vy=-500; fora.inv=1.5; aviso(`❤️ Juntos de novo! ${NOMES[fora.id]} voltou`); Som.vida(); for(let i=0;i<16;i++) J.fx.push(fxP(k.x+20,k.y+20,['#ff9ab5','#ffd93b','#fff'][i%3])); hudPers(); }
  else { const n=k.re?5:2; for(let i=0;i<n;i++) J.pres.push({x:k.x+20,y:k.y+10,tipo:'o',v:i,vx:(Math.random()-.5)*260,vy:-300-Math.random()*200,trava:.25}); }
  if(k.arena) J.arenaCaixasT=3.5;
}

// ---------- inimigos ----------
function atualizaInimigos(){
  const A=ativo();
  for(const e of J.inis){
    if(e.morto){ e.vy+=G*DT; e.y+=e.vy*DT; e.x+=e.vx*DT; e.giro+=DT*8; continue; }
    if(Math.abs(e.x-J.cam.x-VW/2)>VW*1.1) continue;
    e.t+=DT; const dxA=(A.x+A.w/2)-(e.x+e.w/2);
    switch(e.tipo){
      case 'a': case 'x': { const v=e.tipo==='x'?160:55; e.vx=e.dir*v; const fr=e.dir>0?e.x+e.w+2:e.x-2;
        if(solidoPx(fr,e.y+e.h/2) || (!solidoPx(fr,e.y+e.h+6) && !umaVia(Math.floor(fr/T),Math.floor((e.y+e.h+6)/T)))) e.dir*=-1;
        moveX(e,e.vx*DT); e.vy+=G*DT; moveY(e,e.vy*DT); break; }
      case 's': { e.vy+=G*DT; if(e.chao){ e.vx=0; e.cd-=DT; if(e.cd<=0 && Math.abs(dxA)<360){ e.dir=Math.sign(dxA)||1; e.vy=-560; e.vx=e.dir*130; e.cd=.9; } } moveX(e,e.vx*DT); moveY(e,e.vy*DT); break; }
      case 'v': { e.x=e.x0+Math.sin(e.t*1.1)*90; e.y=e.y0+Math.sin(e.t*2.2)*28; e.dir=Math.cos(e.t*1.1)>0?1:-1; break; }
      case 't': { e.dir=dxA>0?1:-1; e.cd-=DT; if(e.atira>0) e.atira-=DT;
        if(e.cd<=0 && Math.abs(dxA)<420){ e.cd=2.3; e.atira=.3; J.proj.push({tipo:'ini',x:e.x+e.w/2+e.dir*20,y:e.y+e.h*.35,vx:e.dir*230,vy:-140,g:420,vida:3}); Som.tom(300,.1,'triangle',.04,0,180); }
        e.vy+=G*DT; moveY(e,e.vy*DT); break; }
      case 'd': { e.vy+=G*DT;
        if(e.estado==='parado'){ if(Math.abs(dxA)<280 && Math.abs(A.y-e.y)<90){ e.estado='corre'; e.dir=Math.sign(dxA)||1; e.cd=1.8; Som.tom(500,.08,'square',.05,0,700); } e.vx=0; }
        else { e.vx=e.dir*250; e.cd-=DT; if(e.cd<=0||moveX(e,0)){ e.estado='parado'; } const fr=e.dir>0?e.x+e.w+2:e.x-2; if(!solidoPx(fr,e.y+e.h+6)) e.dir*=-1; }
        moveX(e,e.vx*DT); moveY(e,e.vy*DT); break; }
    }
    if(e.y>ROWS*T+100) e.morto=true;
    for(const id of ['zao','zona']){ const p=J.jog[id]; if(!p.presente||p.canhao) continue;
      if(!sobre(p,{x:e.x+4,y:e.y+4,w:e.w-8,h:e.h-6})) continue;
      if(p.rola>0||p.pisao){ mataInimigo(e,p.dir); continue; }
      if(p.vy>60 && p.y+p.h-e.y<28){ mataInimigo(e,p.dir); p.vy=(id===J.ativo&&K.pulo)?-640:-460; p.jt=0; p.pulou2=false; Som.pisa(); continue; }
      ferir(p); }
  }
  J.inis=J.inis.filter(e=>!(e.morto && e.y>ROWS*T+200));
}
function mataInimigo(e,dir){ if(e.morto) return; e.morto=true; e.vy=-480; e.vx=dir*120; Som.pisa(); vibrar(15); for(let i=0;i<8;i++) J.fx.push(fxP(e.x+e.w/2,e.y+e.h/2,'#fff')); J.fx.push({estrela:1,x:e.x+e.w/2,y:e.y,vida:.5}); }

// ---------- projéteis ----------
function atualizaProj(){
  for(const q of J.proj){
    q.t=(q.t||0)+DT;
    if(q.tipo==='bolsa'){
      const d=q.dono; if(q.t<.42){ q.vx*=.965; } else { const tx=d.x+d.w/2, ty=d.y+34, a=Math.atan2(ty-q.y,tx-q.x); q.vx=Math.cos(a)*620; q.vy=Math.sin(a)*620; if(Math.hypot(tx-q.x,ty-q.y)<24||!d.presente||q.t>2.5) q.fim=true; }
      q.x+=q.vx*DT; q.y+=q.vy*DT;
      for(const e of J.inis) if(!e.morto && Math.abs(e.x+e.w/2-q.x)<e.w/2+12 && Math.abs(e.y+e.h/2-q.y)<e.h/2+12) mataInimigo(e,Math.sign(q.vx)||1);
      for(let i=J.pres.length-1;i>=0;i--){ const p=J.pres[i]; if(Math.hypot(p.x-q.x,p.y-q.y)<26){ pega(p); J.pres.splice(i,1); } }
      for(const k of J.caixas) if(!k.carregada && sobre({x:q.x-10,y:q.y-10,w:20,h:20},k)) quebraCaixa(k);
      const b=J.chefe; if(b&&!b.morto&&!q.acertou.has(b)&&sobre({x:q.x-12,y:q.y-12,w:24,h:24},b)){ q.acertou.add(b); danoChefe(b,'bolsa'); q.t=Math.max(q.t,.42); }
      continue; }
    if(q.tipo==='ini'){ q.vy+=q.g*DT; q.x+=q.vx*DT; q.y+=q.vy*DT; q.vida-=DT; if(q.vida<=0||solidoPx(q.x,q.y)) q.fim=true;
      for(const id of ['zao','zona']){ const p=J.jog[id]; if(p.presente&&!p.canhao&&sobre(p,{x:q.x-7,y:q.y-7,w:14,h:14})){ q.fim=true; ferir(p); } } }
  }
  J.proj=J.proj.filter(q=>!q.fim);
  // caixas arremessadas e caixas soltas
  for(const k of J.caixas){
    if(k.carregada){ const p=J.jog.zao; k.x=p.x+p.w/2-20; k.y=p.y-38; continue; }
    if(k.voando){ k.vy+=1300*DT; k.x+=k.vx*DT; k.y+=k.vy*DT;
      for(const e of J.inis) if(!e.morto&&sobre(k,e)){ mataInimigo(e,k.dir); quebraCaixa(k); }
      const b=J.chefe; if(b&&!b.morto&&sobre(k,b)){ danoChefe(b,'caixa'); quebraCaixa(k); }
      if(solidoPx(k.x+20+k.dir*20,k.y+20)||solidoPx(k.x+20,k.y+40)||k.y>ROWS*T) quebraCaixa(k); }
    else { k.vy=(k.vy||0)+G*DT; moveY(k,k.vy*DT); }
  }
  // presentes que pulam de caixas e chefões
  for(const q of J.pres) if(q.vx!==undefined){ if(q.trava>0) q.trava-=DT; q.vy+=1400*DT; q.x+=q.vx*DT; q.y+=q.vy*DT; q.vx*=.99;
    if(solidoPx(q.x,q.y+14)&&q.vy>0){ q.y=Math.floor((q.y+14)/T)*T-14; q.vy*=-.35; q.vx*=.7; if(Math.abs(q.vy)<60) q.vy=0; } if(solidoPx(q.x+Math.sign(q.vx)*12,q.y)) q.vx*=-.5; if(q.y>ROWS*T) q.fim=true; }
  J.pres=J.pres.filter(q=>!q.fim);
}

// ---------- chefão ----------
function entraArena(){
  J.travada=true; const def=CHEFES[J.tema], ax=J.arenaX*T;
  J.volta={x:ax+60,y:9*T};
  const b={...def,x:ax+19*T,y:def.tipo==='pombao'?110:9*T-def.h,dir:-1,hp:6,max:6,estado:def.tipo==='pombao'?'voa':'anda',t:0,flash:0,ciclo:0,escudo:false,vx:0,vy:0};
  J.chefe=b;
  const o=outro(); if(o.presente && o.x<ax) teleporta(o,ativo());
  J.caixas.push({x:ax+3*T,y:8*T,w:40,h:40,vx:0,vy:0,re:false,arena:true}); J.caixas.push({x:ax+5*T,y:8*T,w:40,h:40,vx:0,vy:0,re:false,arena:true});
  Som.chefe(); grito(`CHEFÃO: ${def.nome.toUpperCase()}!`); hudChefe();
}
function danoChefe(b,fonte){
  if(b.morto||b.flash>0) return;
  const tonto=b.estado==='tonto';
  if(b.tipo==='aspirador' && !tonto) { Som.tom(1200,.05,'square',.04); aviso('Ele está blindado! Espere ele bater na parede'); return; }
  if(b.tipo==='ranzinza' && b.escudo && !tonto && fonte==='pisa') return;
  b.hp--; b.flash=.9; Som.chefe(); vibrar([30,30,50]); J.treme=.25; hudChefe();
  for(let i=0;i<16;i++) J.fx.push(fxP(b.x+b.w/2,b.y+b.h/2,['#fff','#ffd93b','#ff4d6a'][i%3]));
  if(b.tipo==='ranzinza' && b.hp<=3) b.escudo=true;
  if(b.hp<=0) derrotaChefe(b);
}
function derrotaChefe(b){
  b.morto=true; Som.vitoria(); vibrar([50,40,50,40,120]); J.treme=.6; grito('CHEFÃO DERROTADO!');
  for(let i=0;i<60;i++) J.fx.push({x:b.x+b.w/2,y:b.y+b.h/2,vx:(Math.random()-.5)*600,vy:-Math.random()*600,vida:1.4,cor:['#ff4d6a','#ffd93b','#46a8ff','#2ecc71','#fff'][i%5],r:4,g:1});
  for(let i=0;i<24;i++) J.pres.push({x:b.x+b.w/2,y:b.y+b.h/2,tipo:'o',v:i,vx:(Math.random()-.5)*500,vy:-300-Math.random()*400,trava:.3});
  J.saida.ativo=true; const jj=J; setTimeout(()=>{ if(J===jj&&J.chefe===b){ J.chefe=null; hudChefe(); aviso('🎁 Siga até o presente gigante para entregar!'); } },1400);
}
function atualizaChefe(){
  const b=J.chefe; if(!b) return; if(b.morto){ b.vy=(b.vy||0)+900*DT; b.y+=b.vy*DT; b.flash=.1; return; }
  b.t+=DT; if(b.flash>0) b.flash-=DT;
  const A=ativo(), ax0=J.arenaX*T+20, ax1=(J.W-1)*T-20, chao=9*T, furia=1+(b.max-b.hp)*.12;
  if(b.tipo==='pombao'){
    if(b.estado==='voa'){ const tx=A.x+A.w/2-b.w/2; b.x+=(tx-b.x)*Math.min(1,DT*1.4*furia); b.y+=(105-b.y)*DT*2; b.dir=Math.sign(A.x-b.x)||b.dir;
      b.cd=(b.cd||1)-DT; if(b.cd<=0){ b.cd=1.1/furia; J.proj.push({tipo:'ini',x:b.x+b.w/2,y:b.y+b.h,vx:0,vy:60,g:900,vida:3}); }
      if(b.t>2.6){ b.estado='mira'; b.t=0; b.alvo={x:A.x+A.w/2,y:chao}; } }
    else if(b.estado==='mira'){ b.x+=Math.sin(b.t*60)*2; if(b.t>.5){ b.estado='mergulho'; b.t=0; const dx=b.alvo.x-(b.x+b.w/2), dy=chao-(b.y+b.h), d=Math.hypot(dx,dy)||1; b.vx=dx/d*540*furia; b.vy=dy/d*540*furia; } }
    else if(b.estado==='mergulho'){ b.x+=b.vx*DT; b.y+=b.vy*DT; if(b.y+b.h>=chao){ b.y=chao-b.h; b.estado='tonto'; b.t=0; J.treme=.3; Som.boom(); } }
    else if(b.estado==='tonto'){ if(b.t>1.8){ b.estado='voa'; b.t=0; } }
  }
  if(b.tipo==='ranzinza'){
    b.vy=(b.vy||0)+G*DT; b.y+=b.vy*DT; if(b.y+b.h>=chao){ b.y=chao-b.h; b.vy=0; }
    if(b.estado==='anda'){ b.dir=Math.sign(A.x-b.x)||b.dir; b.x+=b.dir*85*furia*DT; if(b.t>2.2){ b.ciclo++; b.t=0; b.estado=b.ciclo%3===0?'investe':'joga'; } }
    else if(b.estado==='joga'){ if(b.t>.35&&!b.jogou){ b.jogou=true; for(let k=0;k<(b.hp<=3?2:1);k++){ const dx=(A.x+A.w/2)-(b.x+b.w/2); J.proj.push({tipo:'ini',x:b.x+b.w/2,y:b.y+30,vx:Math.max(-420,Math.min(420,dx*1.2))+k*90*b.dir,vy:-520,g:1200,vida:3}); } Som.tom(250,.15,'square',.05,0,500); }
      if(b.t>.8){ b.estado='anda'; b.t=0; b.jogou=false; } }
    else if(b.estado==='investe'){ b.x+=b.dir*330*furia*DT; if(b.x<ax0||b.x+b.w>ax1){ b.x=Math.max(ax0,Math.min(ax1-b.w,b.x)); b.estado='tonto'; b.t=0; J.treme=.4; Som.boom(); } }
    else if(b.estado==='tonto'){ if(b.t>1.7){ b.estado='anda'; b.t=0; } }
  }
  if(b.tipo==='aspirador'){
    b.y=chao-b.h;
    if(b.estado==='anda'){ b.dir=Math.sign(A.x-b.x)||b.dir; if(b.t>.9){ b.estado='investe'; b.t=0; } }
    else if(b.estado==='investe'){ b.x+=b.dir*330*furia*DT; if(b.x<ax0||b.x+b.w>ax1){ b.x=Math.max(ax0,Math.min(ax1-b.w,b.x)); b.estado='tonto'; b.t=0; J.treme=.4; Som.boom(); } }
    else if(b.estado==='tonto'){ if(b.t>1.9){ b.estado='suga'; b.t=0; b.dir=Math.sign(A.x-b.x)||b.dir; } }
    else if(b.estado==='suga'){ for(const id of ['zao','zona']){ const p=J.jog[id]; if(p.presente&&!p.canhao){ const d=(b.x+b.w/2)-(p.x+p.w/2); if(Math.sign(d)===-b.dir) moveX(p,Math.sign(d)*170*DT); } }
      if(b.t>2.4){ b.estado='anda'; b.t=0; } }
  }
  // contato com os vovós
  for(const id of ['zao','zona']){ const p=J.jog[id]; if(!p.presente||p.canhao) continue;
    const caixa={x:b.x+8,y:b.y+6,w:b.w-16,h:b.h-8}; if(!sobre(p,caixa)) continue;
    const vulneravel = b.estado==='tonto' || (b.tipo==='ranzinza' && !b.escudo);
    if(p.vy>60 && p.y+p.h-b.y<34){ if(vulneravel) danoChefe(b,'pisa'); p.vy=-620; p.jt=0; p.pulou2=false; Som.pisa(); continue; }
    if(p.rola>0 && b.estado==='tonto'){ danoChefe(b,'rola'); p.rola=0; p.vx=-p.dir*200; continue; }
    if(b.estado==='tonto') { p.x+= (p.x<b.x? -2 : 2); continue; }
    ferir(p); }
  // caixas da arena voltam
  if(J.arenaCaixasT>0){ J.arenaCaixasT-=DT; if(J.arenaCaixasT<=0 && J.caixas.filter(k=>k.arena).length<2) J.caixas.push({x:J.arenaX*T+(3+Math.floor(Math.random()*4))*T,y:2*T,w:40,h:40,vx:0,vy:0,re:false,arena:true}); }
}

// ---------- plataformas, molas, canhões ----------
function atualizaMundo(){
  for(const pl of J.plats){ const ox=pl.x, oy=pl.y; if(pl.tipo==='m') pl.x=pl.x0+Math.sin(J.t*.9)*120; else pl.y=pl.y0-(1-Math.cos(J.t*.8))/2*165; pl.dx=pl.x-ox; pl.dy=pl.y-oy; }
  for(const m of J.molas) if(m.comp>0) m.comp-=DT;
  for(const k of J.canhoes) if(k.cd>0) k.cd-=DT;
  for(const f of J.fx){ f.vida-=DT; if(f.vx!==undefined){ f.vy+=(f.g?900:300)*DT; f.x+=f.vx*DT; f.y+=f.vy*DT; } }
  J.fx=J.fx.filter(f=>f.vida>0);
  if(J.treme>0) J.treme-=DT;
}
const fxP=(x,y,cor)=>({x,y,vx:(Math.random()-.5)*300,vy:-Math.random()*300,vida:.6,cor,r:3});

// ---------- passo principal ----------
function passo(){
  J.t+=DT;
  if(K.trocaN){ const o=outro(); if(o.presente&&!o.sai&&!ativo().canhao){ const a=ativo(); if(a.segura){ const k=a.segura; a.segura=null; k.carregada=false; k.y=a.y+a.h-40; } J.ativo=o.id; Som.tom(660,.08,'triangle',.05,0,880); hudPers(); } else aviso('O parceiro não está aqui'); }
  if(K.seguirN){ J.seguir=!J.seguir; aviso(J.seguir?'🤝 Parceiro te seguindo':'✋ Parceiro vai esperar aqui'); hudPers(); Som.tom(J.seguir?700:400,.1,'triangle',.05); }
  const A=ativo(), O=outro();
  atualizaJog(A,{esq:K.esq,dir:K.dir,cima:K.cima,baixo:K.baixo,pulo:K.pulo,puloN:K.puloN,poderN:K.poderN,poder2N:K.poder2N},true);
  atualizaJog(O,controleIA(O),false);
  K.puloN=K.poderN=K.poder2N=K.trocaN=K.seguirN=0;
  atualizaMundo(); atualizaInimigos(); atualizaProj(); atualizaChefe();
  if(!J.travada && !J.saida.ativo && A.presente && A.x>(J.arenaX+2)*T) entraArena();
  // câmera
  const B=ativo(); if(B.presente||B.sai){
    let minX=0, maxX=J.W*T-VW; if(J.travada){ minX=J.arenaX*T-20; maxX=Math.max(minX,(J.W)*T-VW); }
    const tx=Math.max(minX,Math.min(maxX,B.x+B.w/2-VW/2+B.dir*50)), ty=Math.max(0,Math.min(ROWS*T-VH,B.y+B.h-VH*.66));
    J.cam.x+=(tx-J.cam.x)*Math.min(1,DT*6); J.cam.y+=(ty-J.cam.y)*Math.min(1,DT*5); }
}

// ---------- desenho ----------
let cv, ctx;
function desenhar(){
  const c=ctx, cam=J.cam, sx=J.treme>0?(Math.random()-.5)*10*J.treme/.3:0, sy=J.treme>0?(Math.random()-.5)*8*J.treme/.3:0;
  c.save();
  desenhaCeu(c,J.tema,cam.x,VW,VH,J.t);
  const f=J.fundo, Wf=f.longe.width;
  for(const [img,fat,dy] of [[f.longe,.2,-cam.y*.15],[f.perto,.5,-cam.y*.35+20]]){ let ox=-((cam.x*fat)%Wf); for(let x=ox;x<VW;x+=Wf) c.drawImage(img,x,dy); }
  c.translate(Math.round(-cam.x+sx),Math.round(-cam.y+sy));
  const x0=Math.max(0,Math.floor(cam.x/T)-1), x1=Math.min(J.W-1,Math.floor((cam.x+VW)/T)+1), TL=J.tiles;
  for(const o of J.objs){ if(o.x>cam.x+VW+50||o.x+260<cam.x) continue; if(o.tipo==='c') carro(c,o.x,o.y,[['#ff8a8a','#d62839','#6b1a14'],['#8fd3ff','#2e86de','#15508a'],['#ffe28a','#f2b31b','#a3740a'],['#a8e6a1','#2ecc71','#178a4a']][o.cor%4]); else if(o.tipo==='O') onibus(c,o.x,o.y); else sofa(c,o.x,o.y); }
  for(let y=0;y<ROWS;y++) for(let x=x0;x<=x1;x++){
    const ch=J.g[y][x], px=x*T, py=y*T;
    if(ch==='#'){ let img; if(y===0&&J.tema!=='cidade') img=TL.teto; else if(y>=9) img = tile(x,y-1)==='#'?TL.chao:TL.chaoTopo; else img = (J.tema==='cidade') ? (tile(x,y-1)==='#'?TL.parede:TL.chaoTopo) : (tile(x,y-1)!=='#'?TL.chaoTopo:TL.parede);
      c.drawImage(img,px,py,T,T); }
    else if(ch==='B') c.drawImage(TL.caixa,px,py,T,T);
    else if(ch==='=') c.drawImage(TL.plat,px,py,T,T);
    else if(ch==='H') c.drawImage(TL.escada,px,py,T,T);
    else if(ch==='^') c.drawImage(TL.perigo,px,py,T,T);
  }
  if(J.travada){ const px=(J.arenaX-1)*T; for(let y=0;y<9;y++){ c.fillStyle=lg(c,px,0,px+T,0,['#8a5a30','#c98a52','#8a5a30']); c.fillRect(px+6,y*T,28,T); c.fillStyle='#e63946'; c.fillRect(px+6,y*T+16,28,6); } }
  for(const pl of J.plats) plataformaMovel(c,pl.x,pl.y,pl.w,J.tema);
  for(const m of J.molas) mola(c,m.x,m.y,J.t,m.comp>0);
  for(const p of J.pontos) arvoreNatal(c,p.x,p.y,p.ativo,J.t);
  for(const k of J.canhoes) canhao(c,k.x,k.y,k.tipo==='@'?anguloGira(k):k.ang,J.t,!!k.ocup,k.tipo);
  if(J.saida.ativo) portalSaida(c,J.saida.x,J.saida.y,J.t);
  for(const q of J.pres){ if(q.x<cam.x-40||q.x>cam.x+VW+40) continue; if(q.tipo==='o') presente(c,q.x,q.y,22,q.v,J.t); else if(q.tipo==='G') presenteGrande(c,q.x,q.y,J.t); else letraOuro(c,LETRAS[q.i],q.x,q.y,J.t,false); }
  for(const k of J.caixas){ if(k.carregada) continue; if(k.voando){ c.save(); c.translate(k.x+20,k.y+20); c.rotate(J.t*12*k.dir); if(k.re) caixaReencontro(c,-20,-20,40,40,J.t); else caixaComum(c,-20,-20,40,40); c.restore(); } else if(k.re) caixaReencontro(c,k.x,k.y,40,40,J.t,!ativo().presente||!outro().presente); else caixaComum(c,k.x,k.y,40,40); }
  for(const e of J.inis){ if(e.x<cam.x-80||e.x>cam.x+VW+80) continue; inimigo(c,e,J.tema,J.t+e.t); }
  if(J.chefe) chefe(c,J.chefe,J.t);
  const ord=[outro(),ativo()];
  for(const p of ord){ if(!p.presente && !(p.sai>0)) continue; if(p.canhao) continue;
    if(p.inv>0 && p.presente && Math.floor(p.inv*16)%2) continue;
    desenhaVovo(c,p.id,p.x+p.w/2,p.y+p.h,p.dir,p.presente?p.est:'susto',p.anim);
    if(p.segura){ const k=p.segura; if(k.re) caixaReencontro(c,p.x+p.w/2-20,p.y-38,40,40,J.t); else caixaComum(c,p.x+p.w/2-20,p.y-38,40,40); }
    if(p===ativo() && p.presente){ const b=Math.sin(J.t*7)*3, tx=p.x+p.w/2, ty=p.y-(p.segura?50:18)+b; c.fillStyle=p.id==='zao'?'#46a8ff':'#ff5fa8'; c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.moveTo(tx-7,ty-9); c.lineTo(tx+7,ty-9); c.lineTo(tx,ty); c.closePath(); c.fill(); c.stroke(); }
    if(p!==ativo() && p.presente && !J.seguir){ c.fillStyle='rgba(0,0,0,.5)'; rr(c,p.x+p.w/2-14,p.y-26,28,18,9); c.fill(); c.fillStyle='#fff'; c.font='bold 12px system-ui'; c.textAlign='center'; c.fillText('✋',p.x+p.w/2,p.y-12); }
  }
  for(const q of J.proj) projetil(c,q,J.tema,J.t);
  for(const f of J.fx){
    if(f.anel){ const k=1-f.vida/.45; c.strokeStyle=`rgba(255,255,255,${f.vida/.45})`; c.lineWidth=5; c.beginPath(); c.ellipse(f.x,f.y,20+k*150,6+k*24,0,0,7); c.stroke(); continue; }
    if(f.txt){ c.globalAlpha=Math.min(1,f.vida/.3); c.fillStyle='#fff'; c.strokeStyle='#7a4a0a'; c.lineWidth=4; c.font='900 18px system-ui'; c.textAlign='center'; c.strokeText(f.txt,f.x,f.y-(.7-f.vida)*60); c.fillText(f.txt,f.x,f.y-(.7-f.vida)*60); c.globalAlpha=1; continue; }
    if(f.estrela){ for(let k=0;k<5;k++){ const a=k*1.26+J.t*6; brilhoEstrela(c,f.x+Math.cos(a)*18,f.y+Math.sin(a)*8-10,2.5); } continue; }
    c.globalAlpha=Math.max(0,Math.min(1,f.vida*2)); c.fillStyle=f.cor; c.beginPath(); c.arc(f.x,f.y,f.r||3,0,7); c.fill(); c.globalAlpha=1; }
  // neve na cidade
  if(J.tema==='cidade'){ c.fillStyle='rgba(255,255,255,.85)'; for(let k=0;k<45;k++){ const x=cam.x+((k*137+J.t*20*(1+k%3))%(VW+40))-20, y=cam.y+((k*71+J.t*(30+k%4*14))%(VH+20))-10; c.beginPath(); c.arc(x+Math.sin(J.t+k)*6,y,1.2+(k%3)*.6,0,7); c.fill(); } }
  c.restore();
  // vinheta
  c.fillStyle=rg(c,VW/2,VH/2,VH*.45,VW*.75,['rgba(0,0,0,0)','rgba(0,0,0,.35)']); c.fillRect(0,0,VW,VH);
  if(J.escuro>0){ c.fillStyle=`rgba(10,8,30,${Math.min(1,J.escuro)})`; c.fillRect(0,0,VW,VH); }
}

// ---------- HUD ----------
function hudTopo(){ $('h-pres').textContent=J.presentes; $('h-vidas').textContent=J.vidas; $('h-letras').innerHTML=LETRAS.map((l,i)=>`<i class="${J.letras[i]?'on':''}">${l}</i>`).join(''); }
function hudPers(){
  for(const id of ['zao','zona']){ const el=$('r-'+id), p=J.jog[id]; el.classList.toggle('on',J.ativo===id); el.classList.toggle('fora',!p.presente); }
  $('c-seguir').classList.toggle('desl',!J.seguir); $('c-seguir').querySelector('small').textContent=J.seguir?'Seguir':'Parado';
  const z=J.ativo==='zao'; $('c-poder').innerHTML= z?'💪<small>Rolar/Pisão</small>':'👜<small>Bolsa</small>';
  $('c-poder2').innerHTML= z?'🏋️<small>Lançar</small>':'🧣<small>Planar</small>'; $('c-poder2').classList.toggle('apagado',!z);
}
function hudChefe(){ const b=J&&J.chefe; $('h-chefe').hidden=!b||b.morto; if(b){ $('h-chefe-nome').textContent=b.nome; $('h-chefe-vida').style.width=(Math.max(0,b.hp)/b.max*100)+'%'; } }
function retratos(){ for(const id of ['zao','zona']){ const el=$('r-'+id).querySelector('canvas'), c=el.getContext('2d'); c.setTransform(2,0,0,2,0,0); c.clearRect(0,0,40,40); c.save(); c.beginPath(); c.arc(20,20,19,0,7); c.clip(); c.fillStyle=id==='zao'?'#bcd6ff':'#ffd0e0'; c.fillRect(0,0,40,40); desenhaVovo(c,id,20,id==='zao'?120:112,1,'parado',0,{esc:1.25,semSombra:1}); c.restore(); } }
let avisoT; function aviso(t){ const a=$('aviso'); a.textContent=t; a.classList.add('on'); clearTimeout(avisoT); avisoT=setTimeout(()=>a.classList.remove('on'),2300); }
function grito(t){ const g=document.createElement('div'); g.className='grito'; g.textContent=t; $('t-jogo').appendChild(g); setTimeout(()=>g.remove(),1800); }
function escurece(fim){ J.escuro=0; const ini=performance.now(); (function f(){ const k=(performance.now()-ini)/700; J.escuro=k<.5?k*2:2-k*2; if(k<.5) requestAnimationFrame(f); else { if(!f.feito){ f.feito=1; fim&&fim(); } if(k<1) requestAnimationFrame(f); else J.escuro=0; } })(); }

// ---------- laço ----------
let acc=0, ult=0, raf=0;
function quadro(t){
  if(!J){ return; }
  acc+=Math.min(.1,(t-ult)/1000); ult=t;
  if(J.rodando) while(acc>=DT){ passo(); acc-=DT; } else acc=0;
  desenhar(); raf=requestAnimationFrame(quadro);
}
function jogar(n){
  Som.init(); fecharModal(); pararCena(); paraMenu();
  carregar(n); mostrar('jogo'); ajustaCanvas(cv,ctx); retratos(); hudTopo(); hudPers(); hudChefe();
  J.rodando=true; cancelAnimationFrame(raf); ult=performance.now(); raf=requestAnimationFrame(quadro);
  setTimeout(()=>aviso(innerHeight>innerWidth?'📱 Gire o celular para ver melhor':`Fase ${n}: ${J.def.nome}`),300);
}
function completa(){
  if(J.fim) return; J.fim=true; J.rodando=false; Som.vitoria(); vibrar([40,40,40,40,120]);
  const n=J.n, m=S.melhor[n]||{}; const novo={presentes:Math.max(m.presentes||0,J.presentes), letras:Math.max(m.letras||0,J.letras.filter(Boolean).length), tempo:m.tempo?Math.min(m.tempo,Math.round(J.t)):Math.round(J.t)};
  S.melhor[n]=novo; if(n>=S.desbloq) S.desbloq=Math.min(FASES.length,n+1); if(n===FASES.length) S.zerou=true; salvar();
  const fim=()=>modal(`<h2>Presentes entregues!</h2><p class="sub">Fase ${n} · ${J.def.nome}</p>
    <div class="res"><div><b>🎁 ${J.presentes}</b><small>presentes</small></div><div><b>${J.letras.filter(Boolean).length}/5</b><small>letras</small></div><div><b>⏱ ${fmtT(J.t)}</b><small>tempo</small></div></div>
    ${n<FASES.length?'<button class="btn verde" id="m-prox">Próxima fase ›</button>':''}<button class="btn" id="m-rep">Jogar de novo</button><button class="btn sec" id="m-fases">Fases</button>`,()=>{
      if($('m-prox')) $('m-prox').onclick=()=>iniciarFase(n+1); $('m-rep').onclick=()=>jogar(n); $('m-fases').onclick=telaFases; });
  const jj=J; setTimeout(()=>{ if(J!==jj) return; if(n===FASES.length) tocarCena(CENAS.final,()=>{ mostrar('jogo'); fim(); }); else fim(); },900);
}
function pausa(){ if(!J||J.fim||!J.rodando) return; J.rodando=false;
  modal(`<h2>Pausa</h2><p class="sub">Teclado: ←→ andar · ↑↓ escada · Espaço pular (segure para ir mais alto) · X poder · C lançar · Q trocar · E seguir/parar</p>
    <button class="btn verde" id="m-cont">Continuar</button><button class="btn" id="m-rep">Reiniciar fase</button><button class="btn sec" id="m-fases">Fases</button>`,()=>{
    $('m-cont').onclick=()=>{ fecharModal(); J.rodando=true; }; $('m-rep').onclick=()=>jogar(J.n); $('m-fases').onclick=telaFases; }); }

// ---------- telas, modal ----------
function mostrar(t){ document.querySelectorAll('.tela').forEach(e=>e.classList.remove('on')); $('t-'+t).classList.add('on'); $('menu-bg').style.display=(t==='abertura'||t==='fases')?'block':'none'; }
function modal(h,liga){ $('mbox').innerHTML=h; $('modal').hidden=false; liga&&liga(); }
function fecharModal(){ $('modal').hidden=true; }
function ajustaCanvas(c,x){ const dpr=Math.min(2,devicePixelRatio||1); c.width=VW*dpr; c.height=VH*dpr; x.setTransform(dpr,0,0,dpr,0,0); x.imageSmoothingEnabled=true; }
function telaFases(){
  if(J){ J.rodando=false; } cancelAnimationFrame(raf); J=null; pararCena(); fecharModal();
  const info=[['🏙️','Centro da Cidade','Carros, toldos e o Pombão Gigante'],['🏢','O Escritório','Mesas, elevadores e o Chefe Ranzinza'],['🏠','Dentro de Casa','Sofás, brinquedos e o Aspirador Gigante']];
  $('lista-fases').innerHTML=FASES.map((f,i)=>{ const n=i+1, b=n>S.desbloq, m=S.melhor[n];
    return `<button class="fase ${b?'bloq':''}" data-n="${n}"><span class="ic">${b?'🔒':info[i][0]}</span><span class="tx"><b>Fase ${n} · ${info[i][1]}</b><small>${b?'Complete a fase anterior':info[i][2]}</small>${m?`<em>🎁 ${m.presentes} · ${'★'.repeat(m.letras)}${'☆'.repeat(5-m.letras)} · ⏱ ${fmtT(m.tempo)}</em>`:''}</span></button>`; }).join('');
  mostrar('fases'); ligaMenu();
}
$('lista-fases').addEventListener('click',e=>{ const b=e.target.closest('.fase'); if(!b) return; const n=+b.dataset.n; if(n>S.desbloq){ Som.tom(200,.1,'square',.04); return; } iniciarFase(n); });
function iniciarFase(n){ Som.init(); fecharModal(); tocarCena(CENAS['f'+n],()=>jogar(n)); }

// ---------- história em balões ----------
const CENAS={
  abertura:[
    {cen:'sala',atores:[['zona',230,1,'parado'],['zao',300,-1,'parado']],quem:'zona',txt:'O Natal está chegando!'},
    {cen:'sala',atores:[['zona',230,1,'feliz'],['zao',300,-1,'parado']],quem:'zao',txt:'Johnson Neto e Eloisa merecem os melhores presentes de Natal!'},
    {cen:'sala',atores:[['zona',230,1,'susto'],['zao',300,-1,'susto'],['duende',120,1,'parado']],quem:'duende',txt:'Hihihi! Espalhei todos os presentes pela cidade!',fx:'voam'},
    {cen:'sala',atores:[['zona',230,-1,'parado'],['zao',300,-1,'parado']],quem:'zao',txt:'Ah, é? Então vamos buscar um por um!'},
    {cen:'sala',atores:[['zona',230,1,'feliz'],['zao',300,-1,'feliz']],quem:'zona',txt:'Cidade, escritório e casa. Bora, Vovozão!'},
  ],
  f1:[{cen:'cidade',atores:[['zao',250,1,'parado'],['zona',310,-1,'parado']],quem:'zona',txt:'Olha os presentes caídos pela rua!'},{cen:'cidade',atores:[['zao',250,1,'feliz'],['zona',310,-1,'parado']],quem:'zao',txt:'Cuidado com os pombos. E com o tal Pombão!'}],
  f2:[{cen:'escritorio',atores:[['zao',250,1,'parado'],['zona',310,-1,'parado']],quem:'zao',txt:'Meu antigo escritório! O duende escondeu presentes aqui.'},{cen:'escritorio',atores:[['zao',250,1,'parado'],['zona',310,-1,'feliz']],quem:'zona',txt:'Eu cuido das alturas. Me lança, amor!'}],
  f3:[{cen:'casa',atores:[['zao',250,1,'parado'],['zona',310,-1,'parado'],['duende',420,-1,'parado']],quem:'duende',txt:'O último esconderijo é a sua casa! Hihihi!'},{cen:'casa',atores:[['zao',250,1,'parado'],['zona',310,1,'parado']],quem:'zona',txt:'Na nossa casa? Agora é pessoal!'}],
  final:[
    {cen:'festa',atores:[['zao',180,1,'feliz'],['zona',240,1,'feliz'],['johnson',360,-1,'feliz'],['eloisa',410,-1,'feliz']],quem:'johnson',txt:'Vovozão! Vovozona! Vocês chegaram!',fx:'festa'},
    {cen:'festa',atores:[['zao',180,1,'parado'],['zona',240,1,'feliz'],['johnson',360,-1,'feliz'],['eloisa',410,-1,'feliz']],quem:'eloisa',txt:'Quantos presentes!',fx:'festa'},
    {cen:'festa',atores:[['zao',180,1,'feliz'],['zona',240,1,'feliz'],['johnson',360,-1,'feliz'],['eloisa',410,-1,'feliz']],quem:'zona',txt:'Feliz Natal, meus amores!',fx:'festa'},
    {cen:'festa',atores:[['zao',180,1,'parado'],['zona',240,1,'parado'],['johnson',360,-1,'parado'],['eloisa',410,-1,'parado'],['duende',520,-1,'triste']],quem:'duende',txt:'Desculpa a bagunça… sobrou rabanada?',fx:'festa'},
    {cen:'festa',atores:[['zao',180,1,'feliz'],['zona',240,1,'feliz'],['johnson',360,-1,'feliz'],['eloisa',410,-1,'feliz'],['duende',520,-1,'parado']],quem:'zao',txt:'Sobrou! Senta aí, é Natal!',fx:'festa'},
  ],
};
const NOME_CENA={zao:'Vovozão',zona:'Vovozona',johnson:'Johnson Neto',eloisa:'Eloisa',duende:'Duende Bagunceiro'};
let cena=null, cenaRaf=0, ccv, cctx, fundosCena={};
function tocarCena(lista,depois){ fecharModal(); paraMenu(); cena={lista,i:0,t:0,depois,ult:performance.now(),letras:0}; mostrar('cena'); ajustaCanvas(ccv,cctx); cancelAnimationFrame(cenaRaf); cenaRaf=requestAnimationFrame(passoCena); }
function pararCena(){ cena=null; cancelAnimationFrame(cenaRaf); }
function durQ(q){ return Math.max(2.4,1.3+q.txt.length*.065); }
function avancarCena(){ if(!cena) return; const q=cena.lista[cena.i]; if(cena.letras<q.txt.length){ cena.letras=q.txt.length; return; } cena.i++; cena.t=0; cena.letras=0; if(cena.i>=cena.lista.length){ const d=cena.depois; pararCena(); d&&d(); } }
function pularCena(){ if(!cena) return; const d=cena.depois; pararCena(); d&&d(); }
function passoCena(t){ if(!cena) return; const dt=Math.min(.1,(t-cena.ult)/1000); cena.ult=t; cena.t+=dt; const q=cena.lista[cena.i];
  const a=Math.floor(cena.letras); cena.letras=Math.min(q.txt.length,cena.letras+dt*32); if(Math.floor(cena.letras)>a && a%3===0) Som.fala();
  desenhaCena(cctx,q,cena.t); $('cena-barra').style.width=Math.min(100,cena.t/durQ(q)*100)+'%';
  if(cena.t>=durQ(q)){ cena.letras=q.txt.length; avancarCena(); } if(cena) cenaRaf=requestAnimationFrame(passoCena); }
function desenhaCena(c,q,t){
  const tema=q.cen==='sala'||q.cen==='festa'?'casa':q.cen; if(!fundosCena[tema]) fundosCena[tema]={f:montaFundo(tema),tl:montaTiles(tema)};
  const F2=fundosCena[tema], base=300;
  desenhaCeu(c,tema,0,VW,VH,t); c.drawImage(F2.f.longe,0,-40); c.drawImage(F2.f.perto,-200,-20);
  for(let x=0;x<VW;x+=T){ c.drawImage(F2.tl.chaoTopo,x,base,T,T); c.drawImage(F2.tl.chao,x,base+T,T,T); }
  if(q.cen==='festa'){ for(let k=0;k<12;k++){ c.fillStyle=['#ff4d6a','#ffd93b','#46a8ff','#2ecc71'][k%4]; c.beginPath(); c.moveTo(k*56,20); c.lineTo(k*56+28,50); c.lineTo(k*56+56,20); c.fill(); }
    c.fillStyle=lg(c,460,base-56,580,base,['#a0522d','#7a3e1d']); rr(c,460,base-56,120,10,4); c.fill(); c.fillRect(468,base-46,8,46); c.fillRect(564,base-46,8,46);
    c.fillStyle='#fff'; c.beginPath(); c.ellipse(520,base-58,40,7,0,0,7); c.fill();
    c.fillStyle=lg(c,494,base-84,546,base-58,['#e8a868','#b8793e','#7a4a20']); c.beginPath(); c.ellipse(520,base-66,24,16,0,Math.PI,0); c.fill(); c.fillRect(496,base-66,48,6);
    c.fillStyle='#fff'; c.fillRect(516,base-88,3,10); c.fillStyle='#2e9e46'; c.beginPath(); c.ellipse(482,base-62,8,5,0,0,7); c.ellipse(558,base-62,8,5,0,0,7); c.fill();
    c.fillStyle='#d62839'; c.beginPath(); c.arc(478,base-64,2.5,0,7); c.arc(562,base-64,2.5,0,7); c.fill();
    for(let k=0;k<6;k++) presente(c,80+k*26,base-12,22,k,t); }
  if(tema==='cidade'){ c.fillStyle='rgba(255,255,255,.85)'; for(let k=0;k<50;k++){ const x=(k*137+t*25)%VW, y=(k*71+t*(40+k%4*12))%VH; c.beginPath(); c.arc(x,y,1.5,0,7); c.fill(); } }
  let fx2=VW/2, fy=100;
  for(const [id,x,dir,est] of q.atores){
    let y=base, esc=1.35;
    if(id==='duende'&&q.fx==='voam'){ y=base-40-Math.sin(t*3)*10; }
    c.save(); c.translate(x,y); c.scale(esc,esc);
    if(id==='zao'||id==='zona') desenhaVovo(c,id,0,0,dir,est,t+(id==='zona'?.5:0));
    else if(id==='duende') desenhaDuende(c,0,0,dir,t,est);
    else desenhaCrianca(c,id,0,0,dir,t,est==='feliz');
    c.restore();
    if(id===q.quem){ const alt={zao:104,zona:96,johnson:80,eloisa:80,duende:70}[id]*esc; fx2=x; fy=y-alt-8; }
  }
  if(q.fx==='voam') for(let k=0;k<10;k++){ const p=((t*.6+k*.1)%1); presente(c,120+p*600,base-60-Math.sin(p*Math.PI)*180-k*4,20,k,t); }
  if(q.fx==='festa') for(let k=0;k<40;k++){ c.fillStyle=['#ff4d6a','#ffd93b','#46a8ff','#2ecc71','#b56bff'][k%5]; const x=(k*53+Math.sin(t+k)*20)%VW, y=((k*37+t*(60+k%5*20))%(VH+20))-10; c.save(); c.translate(x,y); c.rotate(t*3+k); c.fillRect(-3,-2,6,4); c.restore(); }
  balao(c,q,fx2,fy);
}
function balao(c,q,ax,ay){
  const nome=NOME_CENA[q.quem], txt=q.txt.slice(0,Math.floor(cena.letras));
  c.font='bold 17px system-ui'; const linhas=[]; let l=''; for(const w of q.txt.split(' ')){ const tt=l?l+' '+w:w; if(c.measureText(tt).width>300){ linhas.push(l); l=w; } else l=tt; } linhas.push(l);
  const larg=Math.max(...linhas.map(s=>c.measureText(s).width))+30, alt=linhas.length*22+36;
  const bx=Math.max(8,Math.min(VW-larg-8,ax-larg/2)), by=Math.max(8,ay-alt-16);
  c.fillStyle='rgba(0,0,0,.25)'; rr(c,bx+4,by+5,larg,alt,16); c.fill();
  c.fillStyle='#fff'; c.strokeStyle='#2a1a4a'; c.lineWidth=3; rr(c,bx,by,larg,alt,16); c.fill(); c.stroke();
  const px=Math.max(bx+20,Math.min(bx+larg-20,ax)); c.beginPath(); c.moveTo(px-10,by+alt-2); c.lineTo(ax,Math.max(by+alt+6,ay-2)); c.lineTo(px+10,by+alt-2); c.fill(); c.stroke(); c.fillRect(px-9,by+alt-5,18,6);
  c.fillStyle={zao:'#1f4fd8',zona:'#d81e5b',johnson:'#2e86de',eloisa:'#c99400',duende:'#2e9e46'}[q.quem]; c.font='900 12px system-ui'; c.textAlign='left'; c.fillText(nome.toUpperCase(),bx+15,by+19);
  c.fillStyle='#2a1a4a'; c.font='bold 17px system-ui'; let resto=txt; linhas.forEach((ln,k)=>{ const parte=resto.slice(0,ln.length); resto=resto.slice(ln.length+1); c.fillText(parte,bx+15,by+42+k*22); });
}

// ---------- abertura animada (fundo dos menus) ----------
let menuRaf=0, mcv, mctx, mt0=performance.now();
const neve=Array.from({length:120},()=>({x:Math.random(),y:Math.random(),r:.6+Math.random()*2.2,v:.02+Math.random()*.05,o:Math.random()*6}));
const flutua=Array.from({length:9},(_,i)=>({x:Math.random(),y:1+Math.random(),v:.03+Math.random()*.04,s:14+Math.random()*14,var:i}));
function ligaMenu(){ cancelAnimationFrame(menuRaf); menuRaf=requestAnimationFrame(passoMenu); }
function paraMenu(){ cancelAnimationFrame(menuRaf); }
function passoMenu(now){
  const w=innerWidth, h=innerHeight, dpr=Math.min(2,devicePixelRatio||1);
  if(mcv.width!==Math.round(w*dpr)||mcv.height!==Math.round(h*dpr)){ mcv.width=Math.round(w*dpr); mcv.height=Math.round(h*dpr); }
  const c=mctx, t=(now-mt0)/1000; c.setTransform(dpr,0,0,dpr,0,0);
  c.fillStyle=lg(c,0,0,0,h,['#0b1240','#2a1f6a','#7a3f8a','#e07a7a']); c.fillRect(0,0,w,h);
  for(let k=0;k<80;k++){ const x=(k*97.3)%w, y=(k*53.7)%(h*.6), a=.3+.7*Math.abs(Math.sin(t*1.5+k)); c.fillStyle=`rgba(255,255,255,${a})`; c.fillRect(x,y,1.6,1.6); }
  c.fillStyle=rg(c,w*.82,h*.18,6,70,['#fffbe0','#ffe9a6','rgba(255,233,166,0)']); c.beginPath(); c.arc(w*.82,h*.18,70,0,7); c.fill();
  // varal de luzes
  for(let k=0;k<=Math.ceil(w/40);k++){ const x=k*40, y=18+Math.sin(k*.9)*10; c.strokeStyle='#1b1b2e'; c.lineWidth=1.5; if(k){ c.beginPath(); c.moveTo(x-40,18+Math.sin((k-1)*.9)*10); c.quadraticCurveTo(x-20,y+14,x,y); c.stroke(); }
    const on=(Math.floor(t*3)+k)%3!==0, cor=['#ff4d6a','#ffd93b','#46a8ff','#2ecc71'][k%4]; c.fillStyle=on?cor:'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(x,y+8,4,6,0,0,7); c.fill();
    if(on){ c.fillStyle=rg(c,x,y+8,1,16,[cor+'aa',cor+'00']); c.beginPath(); c.arc(x,y+8,16,0,7); c.fill(); } }
  // morros com neve
  c.fillStyle='#dfe9f7'; c.beginPath(); c.moveTo(0,h); c.lineTo(0,h*.78); c.quadraticCurveTo(w*.25,h*.66,w*.5,h*.76); c.quadraticCurveTo(w*.75,h*.86,w,h*.72); c.lineTo(w,h); c.fill();
  c.fillStyle='#f6f9ff'; c.beginPath(); c.moveTo(0,h); c.lineTo(0,h*.86); c.quadraticCurveTo(w*.3,h*.78,w*.6,h*.88); c.quadraticCurveTo(w*.85,h*.94,w,h*.86); c.lineTo(w,h); c.fill();
  // casinha iluminada
  const hx=w*.78, hy=h*.78, hs=Math.min(w,h)/420;
  c.save(); c.translate(hx,hy); c.scale(hs,hs);
  c.fillStyle=lg(c,-70,-90,70,0,['#c56a52','#8f4a3a']); c.fillRect(-70,-90,140,90); c.fillStyle=lg(c,-80,-150,80,-90,['#5a3a6a','#2a1a3a']); c.beginPath(); c.moveTo(-86,-88); c.lineTo(0,-150); c.lineTo(86,-88); c.fill();
  c.fillStyle='#fff'; c.beginPath(); c.moveTo(-86,-88); c.lineTo(0,-150); c.lineTo(86,-88); c.lineTo(78,-84); c.lineTo(0,-140); c.lineTo(-78,-84); c.fill();
  [[-48,-66],[22,-66]].forEach(([x,y])=>{ c.fillStyle=lg(c,0,y,0,y+30,['#fff3b0','#ffb84d']); c.fillRect(x,y,26,30); c.fillStyle='#8f4a3a'; c.fillRect(x+12,y,2,30); c.fillRect(x,y+14,26,2); c.fillStyle=rg(c,x+13,y+15,2,40,['rgba(255,220,120,.5)','rgba(255,220,120,0)']); c.beginPath(); c.arc(x+13,y+15,40,0,7); c.fill(); });
  c.fillStyle='#4a2a10'; c.fillRect(-12,-44,24,44); c.fillStyle='#2e9e46'; c.beginPath(); c.arc(0,-56,10,0,7); c.fill(); c.fillStyle='#d62839'; c.fillRect(-3,-50,6,5);
  for(let k=0;k<9;k++){ const on=(Math.floor(t*4)+k)%2; c.fillStyle=on?['#ff4d6a','#ffd93b','#46a8ff'][k%3]:'#444'; c.beginPath(); c.arc(-78+k*19.5,-86+Math.abs(k-4)*-7.5,3,0,7); c.fill(); }
  c.fillStyle='#7a4a4a'; c.fillRect(36,-140,16,30); c.fillStyle='rgba(220,220,230,.6)'; for(let k=0;k<4;k++){ const p=(t*.4+k*.25)%1; c.beginPath(); c.arc(44+Math.sin(p*6)*6,-146-p*60,4+p*8,0,7); c.fill(); }
  c.restore();
  // presentes subindo com brilho
  for(const p of flutua){ p.y-=p.v*.016*3; if(p.y<-.1){ p.y=1.1; p.x=Math.random(); } const x=p.x*w+Math.sin(t+p.var)*20, y=p.y*h;
    c.fillStyle=rg(c,x,y,2,p.s*1.4,['rgba(255,240,170,.35)','rgba(255,240,170,0)']); c.beginPath(); c.arc(x,y,p.s*1.4,0,7); c.fill(); presente(c,x,y,p.s,p.var,t); }
  // Vovozão e Vovozona acenando no morro
  const retrato=h>w*1.1, curto=h<560;
  const esc=retrato ? Math.max(1.2,Math.min(2.1,w/200)) : Math.max(1.05,Math.min(2.4,h/330)),
        py=retrato ? h*.66 : h*.9, px=retrato ? w*.5 : (curto ? w*.36 : w*.3);
  c.save(); c.translate(px-36*esc,py); c.scale(esc,esc); desenhaVovo(c,'zao',0,0,1,Math.sin(t*1.2)>.2?'feliz':'parado',t); c.restore();
  c.save(); c.translate(px+30*esc,py+4); c.scale(esc,esc); desenhaVovo(c,'zona',0,0,-1,Math.sin(t*1.2+1.6)>.2?'feliz':'parado',t+.5); c.restore();
  // neve
  for(const f of neve){ f.y+=f.v*.016*(1+f.r*.3); if(f.y>1.02){ f.y=-.02; f.x=Math.random(); } c.fillStyle='rgba(255,255,255,.9)'; c.beginPath(); c.arc(f.x*w+Math.sin(t+f.o)*14,f.y*h,f.r,0,7); c.fill(); }
  menuRaf=requestAnimationFrame(passoMenu);
}

// ---------- botões ----------
botao('c-esq',()=>K.esq=1,()=>K.esq=0); botao('c-dir',()=>K.dir=1,()=>K.dir=0);
botao('c-cima',()=>K.cima=1,()=>K.cima=0); botao('c-baixo',()=>K.baixo=1,()=>K.baixo=0);
botao('c-pulo',()=>{ K.puloN=1; K.pulo=1; },()=>K.pulo=0);
botao('c-poder',()=>K.poderN=1); botao('c-poder2',()=>K.poder2N=1);
botao('c-troca',()=>K.trocaN=1); botao('c-seguir',()=>K.seguirN=1);
$('r-zao').onclick=()=>{ if(J&&J.ativo!=='zao') K.trocaN=1; }; $('r-zona').onclick=()=>{ if(J&&J.ativo!=='zona') K.trocaN=1; };
$('b-pausa').onclick=pausa;
$('b-jogar').onclick=()=>{ Som.init(); if(!S.viuIntro){ S.viuIntro=true; salvar(); tocarCena(CENAS.abertura,()=>iniciarFase(Math.min(S.desbloq,1))); } else telaFases(); };
$('b-historia').onclick=()=>{ Som.init(); tocarCena(CENAS.abertura,()=>{ mostrar('abertura'); ligaMenu(); }); };
$('b-fases').onclick=()=>{ Som.init(); telaFases(); };
$('b-volta').onclick=()=>{ mostrar('abertura'); ligaMenu(); };
$('b-som').onclick=()=>{ S.som=!S.som; salvar(); $('b-som').textContent=S.som?'🔊':'🔇'; };
$('b-musica').onclick=()=>{ S.musica=!S.musica; salvar(); Som.init(); if(S.musica) Musica.liga(); else Musica.desliga(); $('b-musica').classList.toggle('desl',!S.musica); };
$('cena-pular').onclick=e=>{ e.stopPropagation(); pularCena(); };
$('t-cena').addEventListener('pointerdown',e=>{ if(e.target.id==='cena-pular') return; Som.init(); avancarCena(); });
addEventListener('resize',()=>{ if(J) ajustaCanvas(cv,ctx); });

(function(){
  cv=$('tela'); ctx=cv.getContext('2d'); ccv=$('cena'); cctx=ccv.getContext('2d'); mcv=$('menu-bg'); mctx=mcv.getContext('2d');
  document.querySelectorAll('.rodape').forEach(r=>r.textContent=`${CONFIG.SISTEMA} v${CONFIG.VERSAO}•Desenvolvido por ${CONFIG.DESENVOLVEDOR}`);
  $('b-som').textContent=S.som?'🔊':'🔇'; $('b-musica').classList.toggle('desl',!S.musica);
  mostrar('abertura'); ligaMenu();
})();

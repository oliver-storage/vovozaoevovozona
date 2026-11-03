// Vovozão e Vovozona — arte original em canvas (estilo "3D pré-renderizado": volume, brilho e sombra)
const T = 40;

// ---------- utilidades de pintura ----------
function lg(c,x0,y0,x1,y1,cores){ const g=c.createLinearGradient(x0,y0,x1,y1); cores.forEach((cor,i)=>g.addColorStop(i/(cores.length-1),cor)); return g; }
function rg(c,x,y,r0,r1,cores){ const g=c.createRadialGradient(x,y,r0,x,y,r1); cores.forEach((cor,i)=>g.addColorStop(i/(cores.length-1),cor)); return g; }
function rr(c,x,y,w,h,r){ c.beginPath(); c.roundRect(x,y,w,h,r); }
// membro com volume: contorno escuro + preenchimento em degradê perpendicular
function membro(c,x1,y1,x2,y2,r,claro,base,escuro){
  const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
  c.lineCap='round';
  c.strokeStyle='rgba(20,10,10,.55)'; c.lineWidth=r*2+2.4; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
  c.strokeStyle=lg(c,x1+nx*r,y1+ny*r,x1-nx*r,y1-ny*r,[claro,base,escuro]); c.lineWidth=r*2; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
}
function bola(c,x,y,r,claro,base,escuro){ c.fillStyle='rgba(20,10,10,.55)'; c.beginPath(); c.arc(x,y,r+1.2,0,7); c.fill(); c.fillStyle=rg(c,x-r*.35,y-r*.4,r*.1,r*1.15,[claro,base,escuro]); c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
function brilho(c,x,y,rx,ry,a=.55){ c.fillStyle=`rgba(255,255,255,${a})`; c.beginPath(); c.ellipse(x,y,rx,ry,-.5,0,7); c.fill(); }
function sombraChao(c,x,y,w){ c.fillStyle='rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x,y,w,w*.22,0,0,7); c.fill(); }

// ---------- personagens ----------
const PAL = {
  zao:{ pele:['#f6c7a2','#d9a07a','#9c6342'], cab:['#ffffff','#cfd3d8','#858b94'], camisa:['#ffffff','#eef0f4','#b9bdc9'], colete:['#4a66b0','#1f2f5c','#0d1530'], calca:['#5a6070','#2b2e38','#14161c'], sapato:['#8a5534','#5a3420','#2a170c'], laco:'#d62839', botao:'#f2c14e' },
  zona:{ pele:['#ffdcc2','#e8b48f','#b07a56'], cab:['#8a5636','#3a1f14','#150905'], vest:['#ff6b98','#d81e5b','#7d0b33'], ech:['#fff3bf','#f2c14e','#a8781a'], sapato:['#555','#1a1a1a','#000'], cinto:'#f2c14e', boca:'#c2183f' },
};
function pose(est,t,vx){
  const s=Math.sin(t*13), b=Math.sin(t*2.2);
  switch(est){
    case 'corre': return {pF:[s*.75, s*.75-(s<0?-s*1.1:.15)], pT:[-s*.75, -s*.75-(s>0?s*1.1:.15)], bF:[-s*.85, -s*.85+1.1], bT:[s*.85, s*.85+1.1], dy:-Math.abs(Math.sin(t*13))*2.5, inc:.08};
    case 'pula': return {pF:[1.0,.1], pT:[-.35,-.75], bF:[2.5,2.8], bT:[-.7,-.2], dy:0, inc:0};
    case 'cai':  return {pF:[.35,.15], pT:[-.25,-.35], bF:[1.7,2.1], bT:[1.3,1.7], dy:0, inc:0};
    case 'escada': { const e=Math.sin(t*9); return {pF:[.7+e*.35,-.3+e*.35], pT:[.7-e*.35,-.3-e*.35], bF:[2.85+e*.25,3.05], bT:[2.85-e*.25,3.05], dy:0, inc:0}; }
    case 'susto': return {pF:[.4,.1], pT:[-.4,-.1], bF:[2.9,3.1], bT:[2.6,2.9], dy:0, inc:-.1};
    case 'segura': return {pF:[.1,0], pT:[-.1,0], bF:[3.0,3.12], bT:[3.0,3.12], dy:0, inc:0};
    case 'lanca': return {pF:[.25,0], pT:[-.35,-.1], bF:[1.9,2.2], bT:[1.6,1.9], dy:0, inc:.12};
    case 'pisao': return {pF:[1.3,-.3], pT:[1.1,-.5], bF:[.5,.2], bT:[.4,.1], dy:0, inc:.05};
    case 'plana': return {pF:[.12,.05], pT:[-.08,-.05], bF:[2.75,2.95], bT:[2.55,2.8], dy:Math.sin(t*6)*1.5, inc:0};
    case 'feliz': { const p=Math.abs(Math.sin(t*6)); return {pF:[.05,0], pT:[-.05,0], bF:[2.6+p*.4,2.9], bT:[2.6+p*.4,2.9], dy:-p*6, inc:0}; }
    default: return {pF:[.05,.02], pT:[-.05,-.02], bF:[.18+b*.04,.45], bT:[-.12-b*.04,.25], dy:b*1, inc:0};
  }
}
// x = centro, y = pés, dir = 1 direita / -1 esquerda
function desenhaVovo(c,id,x,y,dir,est,t,op={}){
  if(est==='rola') return rolando(c,id,x,y,dir,t);
  const P=PAL[id], zao=id==='zao', p=pose(est,t);
  const hip=zao?42:40, L1=zao?21:20, L2=zao?21:20, sh=zao?72:66, A1=zao?17:15, A2=zao?16:15, hy=zao?-87:-79, hr=zao?12.5:11;
  if(!op.semSombra) sombraChao(c,x,y,zao?24:19);
  c.save(); c.translate(x,y+p.dy); c.scale(dir*(op.esc||1),(op.esc||1)); c.rotate(p.inc);
  const perna=(a,k,lado,frente)=>{ const hx=lado*5, kx=hx+Math.sin(a)*L1, ky=-hip+Math.cos(a)*L1, fx=kx+Math.sin(k)*L2, fy=ky+Math.cos(k)*L2;
    const tom=frente?1:.78;
    if(zao){ membro(c,hx,-hip,kx,ky,7.5,P.calca[0],P.calca[1],P.calca[2]); membro(c,kx,ky,fx,fy,6.8,P.calca[0],P.calca[1],P.calca[2]);
      c.fillStyle=lg(c,fx,fy-6,fx,fy+3,P.sapato); rr(c,fx-6,fy-6,17,8,4); c.fill(); c.strokeStyle='rgba(0,0,0,.5)'; c.lineWidth=1; c.stroke(); brilho(c,fx+4,fy-4,4,1.3,.4); }
    else { membro(c,hx,-hip,kx,ky,5.4,P.pele[0],P.pele[1],P.pele[2]); membro(c,kx,ky,fx,fy,4.6,P.pele[0],P.pele[1],P.pele[2]);
      c.fillStyle=lg(c,fx,fy-7,fx,fy+2,P.sapato); c.beginPath(); c.moveTo(fx-4,fy-6); c.lineTo(fx+10,fy-2); c.lineTo(fx+10,fy+1); c.lineTo(fx-5,fy+1); c.closePath(); c.fill(); c.fillRect(fx-5,fy-3,2.5,5); }
    if(!frente){ c.fillStyle='rgba(0,0,0,.18)'; c.beginPath(); c.arc(kx,ky,1,0,7); c.fill(); } };
  const braco=(u,f,lado,frente)=>{ const sx=lado*(zao?15:11)+2, ex=sx+Math.sin(u)*A1, ey=-sh+Math.cos(u)*A1, hx=ex+Math.sin(f)*A2, hy2=ey+Math.cos(f)*A2;
    if(zao){ membro(c,sx,-sh,ex,ey,7,P.camisa[0],P.camisa[1],P.camisa[2]); membro(c,ex,ey,hx,hy2,6,P.pele[0],P.pele[1],P.pele[2]); bola(c,hx,hy2,5.6,P.pele[0],P.pele[1],P.pele[2]);
      c.strokeStyle=P.camisa[2]; c.lineWidth=2; c.beginPath(); c.moveTo(ex-5,ey); c.lineTo(ex+5,ey); c.stroke(); }
    else { membro(c,sx,-sh,ex,ey,4.6,P.vest[0],P.vest[1],P.vest[2]); membro(c,ex,ey,hx,hy2,3.8,P.pele[0],P.pele[1],P.pele[2]); bola(c,hx,hy2,4,P.pele[0],P.pele[1],P.pele[2]);
      c.fillStyle='#f2c14e'; c.fillRect(ex+Math.sin(f)*A2*.8-3,ey+Math.cos(f)*A2*.8-1.5,6,3); }
    return [hx,hy2]; };
  // echarpe (atrás do corpo)
  if(!zao){ const onda=Math.sin(t*7)*4, long=est==='plana'?0:1;
    if(long){ c.fillStyle=lg(c,-10,-66,-40,-40,P.ech); c.beginPath(); c.moveTo(-2,-66); c.quadraticCurveTo(-26,-60+onda,-38,-46-onda); c.lineTo(-33,-41-onda); c.quadraticCurveTo(-22,-54+onda,-2,-58); c.fill(); } }
  braco(p.bT[0],p.bT[1],-1,false);
  perna(p.pT[0],p.pT[1],-1,false);
  // tronco
  if(zao){
    c.fillStyle='rgba(20,10,10,.55)'; rr(c,-19,-77,38,42,10); c.fill();
    c.fillStyle=lg(c,-18,-76,18,-36,P.camisa); rr(c,-18,-76,36,40,9); c.fill();
    c.fillStyle=lg(c,-18,-72,16,-36,P.colete); c.beginPath(); c.moveTo(-18,-70); c.lineTo(-4,-70); c.lineTo(3,-55); c.lineTo(10,-70); c.lineTo(18,-70); c.lineTo(18,-38); c.quadraticCurveTo(0,-32,-18,-38); c.closePath(); c.fill();
    c.fillStyle='rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-16,-68); c.lineTo(-7,-68); c.lineTo(-12,-44); c.lineTo(-16,-44); c.fill();
    [-50,-44,-38].forEach(by=>{ bola(c,4,by,1.8,'#fff6c8',P.botao,'#a8781a'); });
    c.fillStyle='#14161c'; rr(c,-18,-40,36,5,2); c.fill(); c.fillStyle='#f2c14e'; c.fillRect(-2,-40,6,5);
    // gravata borboleta
    c.fillStyle=P.laco; c.beginPath(); c.moveTo(2,-73); c.lineTo(-6,-77); c.lineTo(-6,-69); c.closePath(); c.moveTo(2,-73); c.lineTo(10,-77); c.lineTo(10,-69); c.closePath(); c.fill(); bola(c,2,-73,2.2,'#ff8a96',P.laco,'#7a0f18');
  } else {
    c.fillStyle='rgba(20,10,10,.5)'; c.beginPath(); c.moveTo(-12,-69); c.lineTo(12,-69); c.lineTo(9,-48); c.lineTo(22,-17); c.lineTo(-22,-17); c.lineTo(-9,-48); c.closePath(); c.fill();
    c.fillStyle=lg(c,-12,-68,14,-18,P.vest); c.beginPath(); c.moveTo(-11,-68); c.lineTo(11,-68); c.lineTo(8,-48); c.quadraticCurveTo(14,-34,21,-18); c.quadraticCurveTo(0,-13,-21,-18); c.quadraticCurveTo(-14,-34,-8,-48); c.closePath(); c.fill();
    c.strokeStyle='rgba(255,255,255,.25)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(-6,-46); c.quadraticCurveTo(-10,-32,-14,-20); c.moveTo(4,-46); c.quadraticCurveTo(8,-30,10,-19); c.stroke();
    c.fillStyle=lg(c,-9,-50,9,-46,['#fff3bf',P.cinto,'#a8781a']); rr(c,-9,-51,18,4,2); c.fill();
    c.fillStyle='rgba(255,255,255,.3)'; c.beginPath(); c.ellipse(-4,-60,3,6,-.3,0,7); c.fill();
    c.fillStyle=lg(c,-8,-70,8,-63,P.ech); c.beginPath(); c.ellipse(0,-67,9,3.4,0,0,7); c.fill(); bola(c,4,-65,2.6,P.ech[0],P.ech[1],P.ech[2]);
  }
  perna(p.pF[0],p.pF[1],1,true);
  if(!zao){ // saia sobre as coxas da frente
    c.fillStyle=lg(c,-10,-48,14,-18,P.vest); c.beginPath(); c.moveTo(-8,-48); c.lineTo(8,-48); c.quadraticCurveTo(14,-34,21,-18); c.quadraticCurveTo(0,-13,-21,-18); c.quadraticCurveTo(-14,-34,-8,-48); c.fill();
    c.strokeStyle='rgba(0,0,0,.25)'; c.lineWidth=1; c.beginPath(); c.moveTo(-21,-18); c.quadraticCurveTo(0,-13,21,-18); c.stroke(); }
  // cabeça
  const hx0=zao?2:1;
  if(zao){
    membro(c,0,-76,1,-80,6,P.pele[0],P.pele[1],P.pele[2]);
    bola(c,hx0,hy,hr,P.pele[0],P.pele[1],P.pele[2]);
    bola(c,hx0-8,hy+1,3.4,P.pele[0],P.pele[1],P.pele[2]);
    // cabelo grisalho penteado para trás
    c.fillStyle=lg(c,hx0-12,hy-14,hx0+10,hy-2,P.cab); c.beginPath(); c.moveTo(hx0-13,hy+2); c.quadraticCurveTo(hx0-15,hy-15,hx0-1,hy-15); c.quadraticCurveTo(hx0+12,hy-15,hx0+12,hy-6); c.quadraticCurveTo(hx0+2,hy-10,hx0-6,hy-5); c.quadraticCurveTo(hx0-9,hy-1,hx0-10,hy+4); c.closePath(); c.fill();
    c.strokeStyle='rgba(255,255,255,.7)'; c.lineWidth=1.2; c.beginPath(); c.moveTo(hx0-8,hy-11); c.quadraticCurveTo(hx0,hy-14,hx0+8,hy-10); c.stroke();
    // barba grisalha aparada
    c.fillStyle=lg(c,hx0-8,hy,hx0+10,hy+14,P.cab); c.beginPath(); c.moveTo(hx0-8,hy-1); c.quadraticCurveTo(hx0-9,hy+12,hx0+3,hy+14); c.quadraticCurveTo(hx0+13,hy+12,hx0+13,hy+1); c.quadraticCurveTo(hx0+9,hy+6,hx0+3,hy+6); c.quadraticCurveTo(hx0-2,hy+6,hx0-4,hy+1); c.closePath(); c.fill();
    c.fillStyle=P.cab[1]; c.beginPath(); c.ellipse(hx0+8,hy+3.5,5.5,2.3,.1,0,7); c.fill();
    c.fillStyle='#c0505a'; c.beginPath(); c.ellipse(hx0+8,hy+6.4,2.6,1.1,0,0,7); c.fill();
    // olho, sobrancelha, nariz
    const assust=est==='susto';
    c.fillStyle='#fff'; c.beginPath(); c.ellipse(hx0+6,hy-3,2.6,assust?3:2.2,0,0,7); c.fill();
    c.fillStyle='#2b1a10'; c.beginPath(); c.arc(hx0+6.8,hy-3,1.5,0,7); c.fill(); c.fillStyle='#fff'; c.fillRect(hx0+7,hy-4.5,1,1);
    c.strokeStyle=P.cab[2]; c.lineWidth=2.4; c.lineCap='round'; c.beginPath(); c.moveTo(hx0+2,hy-7); c.lineTo(hx0+10,hy-7.5); c.stroke();
    c.fillStyle=P.pele[1]; c.beginPath(); c.ellipse(hx0+12.5,hy,2.5,3,0,0,7); c.fill(); brilho(c,hx0+12.5,hy-1,1,1.2,.5);
  } else {
    // cabelo longo ondulado (atrás)
    const on=Math.sin(t*3)*1.5;
    c.fillStyle=lg(c,hx0-16,hy-14,hx0+6,hy+28,P.cab); c.beginPath(); c.moveTo(hx0+4,hy-12); c.quadraticCurveTo(hx0-20,hy-16,hx0-17,hy+8);
    c.quadraticCurveTo(hx0-21+on,hy+18,hx0-14,hy+28); c.quadraticCurveTo(hx0-10,hy+20,hx0-6,hy+26); c.quadraticCurveTo(hx0-4,hy+14,hx0-1,hy+10); c.lineTo(hx0+6,hy-4); c.closePath(); c.fill();
    membro(c,0,-68,0,-72,4,P.pele[0],P.pele[1],P.pele[2]);
    bola(c,hx0,hy,hr,P.pele[0],P.pele[1],P.pele[2]);
    // franja e topo
    c.fillStyle=lg(c,hx0-10,hy-14,hx0+12,hy-2,P.cab); c.beginPath(); c.moveTo(hx0-11,hy+3); c.quadraticCurveTo(hx0-13,hy-13,hx0,hy-13); c.quadraticCurveTo(hx0+13,hy-13,hx0+12,hy-2); c.quadraticCurveTo(hx0+6,hy-9,hx0-2,hy-7); c.quadraticCurveTo(hx0-6,hy-4,hx0-8,hy+4); c.closePath(); c.fill();
    c.strokeStyle='rgba(255,210,170,.5)'; c.lineWidth=1.3; c.beginPath(); c.moveTo(hx0-7,hy-10); c.quadraticCurveTo(hx0+2,hy-13,hx0+9,hy-8); c.stroke();
    // brinco
    bola(c,hx0-4,hy+5,2.2,'#fff6c8','#f2c14e','#a8781a');
    // olho com cílios, boca vermelha, blush
    const assust=est==='susto';
    c.fillStyle='#fff'; c.beginPath(); c.ellipse(hx0+5.5,hy-2,2.4,assust?3:2.1,0,0,7); c.fill();
    c.fillStyle='#3b2412'; c.beginPath(); c.arc(hx0+6.2,hy-2,1.4,0,7); c.fill(); c.fillStyle='#fff'; c.fillRect(hx0+6.3,hy-3.4,1,1);
    c.strokeStyle='#150905'; c.lineWidth=1.3; c.beginPath(); c.moveTo(hx0+3,hy-4.4); c.lineTo(hx0+8.6,hy-4.6); c.lineTo(hx0+10,hy-6); c.stroke();
    c.fillStyle='rgba(255,120,140,.35)'; c.beginPath(); c.ellipse(hx0+4,hy+3,2.8,1.6,0,0,7); c.fill();
    c.fillStyle=P.boca; c.beginPath(); if(assust){ c.ellipse(hx0+8,hy+5.2,1.8,2.2,0,0,7); } else { c.ellipse(hx0+8,hy+5,2.6,1.3,0,0,7); } c.fill();
    c.fillStyle=P.pele[1]; c.beginPath(); c.ellipse(hx0+11,hy+.5,1.6,2,0,0,7); c.fill();
  }
  const mao=braco(p.bF[0],p.bF[1],1,true);
  if(!zao && est==='plana'){ // echarpe aberta como asa
    const hx=mao[0], hy3=mao[1], on=Math.sin(t*9)*3;
    c.fillStyle=lg(c,-30,hy3-20,30,hy3,P.ech); c.globalAlpha=.95; c.beginPath(); c.moveTo(hx,hy3); c.quadraticCurveTo(hx-18,hy3-22+on,hx-46,hy3-8); c.quadraticCurveTo(hx-28,hy3-2-on,hx-10,hy3+6); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(hx,hy3); c.quadraticCurveTo(hx+16,hy3-20-on,hx+38,hy3-6); c.quadraticCurveTo(hx+22,hy3+on,hx+6,hy3+6); c.closePath(); c.fill(); c.globalAlpha=1;
    c.strokeStyle='rgba(255,255,255,.6)'; c.lineWidth=1; c.beginPath(); c.moveTo(hx-6,hy3-4); c.quadraticCurveTo(hx-22,hy3-16,hx-40,hy3-8); c.stroke(); }
  c.restore();
}
function rolando(c,id,x,y,dir,t){
  const P=PAL[id], r=25, cy=y-r;
  sombraChao(c,x,y,22);
  c.save(); c.translate(x,cy); c.rotate(t*16*dir);
  bola(c,0,0,r,P.colete[0],P.colete[1],P.colete[2]);
  c.fillStyle=lg(c,-r,-r,r,r,P.camisa); c.beginPath(); c.arc(0,0,r-4,-.9,.9); c.lineTo(0,0); c.fill();
  c.fillStyle=lg(c,-r,-r,0,0,P.cab); c.beginPath(); c.arc(0,0,r-2,2.2,3.6); c.lineTo(0,0); c.fill();
  c.fillStyle=P.pele[1]; c.beginPath(); c.arc(r*.45,-r*.45,6,0,7); c.fill(); c.fillStyle=P.pele[1]; c.beginPath(); c.arc(-r*.4,r*.5,6,0,7); c.fill();
  c.restore(); brilho(c,x-8,cy-12,8,4,.35);
  c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=2; for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(x-dir*(r+6+k*7),cy-10+k*10); c.lineTo(x-dir*(r+18+k*7),cy-10+k*10); c.stroke(); }
}
// netinhos e duende (cenas)
function desenhaCrianca(c,id,x,y,dir,t,feliz){
  const pula=feliz?Math.abs(Math.sin(t*6+(id==='eloisa'?1:0)))*8:0, eu=id==='eloisa';
  const pele=['#f6c7a2','#d9a07a','#9c6342'];
  sombraChao(c,x,y,13);
  c.save(); c.translate(x,y-pula); c.scale(dir,1);
  const s=Math.sin(t*10)*.3;
  membro(c,-4,-22,-5,-3,4,eu?pele[0]:'#3a5296',eu?pele[1]:'#1f2f5c',eu?pele[2]:'#0d1530'); membro(c,4,-22,5,-3,4,eu?pele[0]:'#3a5296',eu?pele[1]:'#1f2f5c',eu?pele[2]:'#0d1530');
  c.fillStyle='#e74c3c'; rr(c,-9,-5,9,5,2); c.fill(); rr(c,1,-5,9,5,2); c.fill();
  if(eu){ c.fillStyle=lg(c,-12,-40,12,-14,['#fff3a6','#ffd23f','#c99400']); c.beginPath(); c.moveTo(-8,-40); c.lineTo(8,-40); c.lineTo(14,-16); c.lineTo(-14,-16); c.closePath(); c.fill(); }
  else { c.fillStyle=lg(c,-10,-40,10,-20,['#7fc8ff','#2e86de','#15508a']); rr(c,-10,-40,20,20,6); c.fill(); c.fillStyle='#ffd93b'; c.beginPath(); for(let k=0;k<10;k++){ const r=k%2?2:5, a=k*Math.PI/5-Math.PI/2; c.lineTo(Math.cos(a)*r,-30+Math.sin(a)*r); } c.fill(); }
  membro(c,-9,-37,-14,-26+(feliz?-14:0),3.4,pele[0],pele[1],pele[2]); membro(c,9,-37,14,-26+(feliz?-14:0),3.4,pele[0],pele[1],pele[2]);
  bola(c,0,-50,12,pele[0],pele[1],pele[2]);
  if(eu){ c.fillStyle=lg(c,-12,-62,12,-48,['#8a5636','#4a2818','#1e0f09']); c.beginPath(); c.arc(0,-52,12.5,Math.PI*1.05,Math.PI*1.95); c.fill(); bola(c,-12,-56,4,'#ff9ac1','#ff5fa8','#b0306a'); bola(c,12,-56,4,'#ff9ac1','#ff5fa8','#b0306a'); }
  else { c.fillStyle=lg(c,-12,-62,12,-50,['#5a3a1e','#2b1a10','#120a05']); c.beginPath(); c.arc(0,-52,12.5,Math.PI*1.05,Math.PI*1.95); c.fill(); }
  c.fillStyle='#2b1a10'; c.beginPath(); c.arc(4,-51,1.6,0,7); c.arc(-3,-51,1.6,0,7); c.fill();
  c.strokeStyle='#8a2b2b'; c.lineWidth=1.5; c.beginPath(); c.arc(0.5,-46,4,.2,Math.PI-.2); c.stroke();
  c.fillStyle='rgba(255,120,140,.4)'; c.beginPath(); c.arc(-7,-46,2.5,0,7); c.arc(8,-46,2.5,0,7); c.fill();
  // chapéu de festa
  c.fillStyle=lg(c,-6,-80,6,-60,eu?['#d6b3ff','#9b6bff','#5a35b0']:['#9ee5de','#2ecc71','#178a4a']); c.beginPath(); c.moveTo(-7,-61); c.lineTo(0,-82); c.lineTo(7,-61); c.closePath(); c.fill();
  c.fillStyle='#fff'; for(let k=0;k<3;k++){ c.beginPath(); c.arc(-2+k*2,-66-k*5,1.3,0,7); c.fill(); } bola(c,0,-83,2.6,'#fff6c8','#f2c14e','#a8781a');
  c.restore();
}
function desenhaDuende(c,x,y,dir,t,est){
  const pula=Math.abs(Math.sin(t*7))*6; sombraChao(c,x,y,12);
  c.save(); c.translate(x,y-pula); c.scale(dir,1);
  const pele=['#ffe0c4','#f2c09a','#b8805c'];
  membro(c,-4,-18,-6,-3,3.4,'#7bd66f','#2e9e46','#176b2a'); membro(c,4,-18,6,-3,3.4,'#7bd66f','#2e9e46','#176b2a');
  c.fillStyle='#c0392b'; c.beginPath(); c.moveTo(-10,-3); c.quadraticCurveTo(-14,-6,-12,-9); c.lineTo(-3,-3); c.fill(); c.beginPath(); c.moveTo(2,-3); c.lineTo(12,-3); c.quadraticCurveTo(16,-6,14,-9); c.fill();
  c.fillStyle=lg(c,-10,-36,10,-16,['#7bd66f','#2e9e46','#176b2a']); c.beginPath(); c.moveTo(-8,-34); c.lineTo(8,-34); c.lineTo(11,-16); c.lineTo(-11,-16); c.closePath(); c.fill();
  c.fillStyle='#f2c14e'; c.fillRect(-11,-21,22,3);
  membro(c,-8,-32,-14,-22-Math.sin(t*9)*4,3,pele[0],pele[1],pele[2]); membro(c,8,-32,15,-36,3,pele[0],pele[1],pele[2]);
  bola(c,0,-44,10,pele[0],pele[1],pele[2]);
  c.fillStyle=pele[1]; c.beginPath(); c.moveTo(-9,-46); c.lineTo(-17,-52); c.lineTo(-9,-41); c.fill(); c.beginPath(); c.moveTo(9,-46); c.lineTo(17,-52); c.lineTo(9,-41); c.fill();
  c.fillStyle='#2b1a10'; c.beginPath(); c.arc(4,-45,1.5,0,7); c.arc(-2,-45,1.5,0,7); c.fill();
  c.strokeStyle='#8a2b2b'; c.lineWidth=1.4; c.beginPath(); if(est==='triste') c.arc(1,-37,3.5,Math.PI+.3,-.3); else c.arc(1,-41,4,.2,Math.PI-.2); c.stroke();
  c.fillStyle=lg(c,-10,-70,10,-50,['#ff6b6b','#d62839','#7a0f18']); c.beginPath(); c.moveTo(-11,-50); c.quadraticCurveTo(-4,-66,10,-72); c.quadraticCurveTo(14,-62,11,-50); c.closePath(); c.fill();
  c.fillStyle='#fff'; rr(c,-12,-53,24,5,2); c.fill(); bola(c,11,-73,3,'#fff','#eee','#bbb');
  c.restore();
}

// ---------- presentes, letras e objetos ----------
const COR_PRES=[['#ff8fab','#e63946','#8f1d2c'],['#9ee5de','#2a9d8f','#155e57'],['#ffe28a','#f4a261','#a35a1e'],['#c9b6ff','#7b5cff','#3d2a99'],['#a8e6a1','#2ecc71','#178a4a']];
function presente(c,x,y,tam,var_,t){
  const p=COR_PRES[var_%COR_PRES.length], b=Math.sin(t*3+x*.05)*2, s=tam;
  c.save(); c.translate(x,y+b);
  c.fillStyle='rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0,s*.62-b,s*.45,s*.1,0,0,7); c.fill();
  c.fillStyle=lg(c,-s/2,-s/2,s/2,s/2,p); rr(c,-s/2,-s*.35,s,s*.85,s*.12); c.fill(); c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=1; c.stroke();
  c.fillStyle=lg(c,-s*.55,-s*.5,s*.55,-s*.2,[p[0],p[1]]); rr(c,-s*.56,-s*.48,s*1.12,s*.22,s*.08); c.fill();
  c.fillStyle='#fff6d6'; c.fillRect(-s*.09,-s*.48,s*.18,s*.98); c.fillStyle='rgba(255,240,180,.9)';
  c.beginPath(); c.ellipse(-s*.2,-s*.56,s*.2,s*.12,-.5,0,7); c.ellipse(s*.2,-s*.56,s*.2,s*.12,.5,0,7); c.fill();
  brilho(c,-s*.25,-s*.05,s*.12,s*.22,.45);
  c.restore();
}
function presenteGrande(c,x,y,t){ const r=28+Math.sin(t*4)*3; c.fillStyle=rg(c,x,y,4,r,['rgba(255,240,150,.7)','rgba(255,220,100,0)']); c.beginPath(); c.arc(x,y,r,0,7); c.fill(); presente(c,x,y,30,3,t);
  for(let k=0;k<4;k++){ const a=t*2+k*Math.PI/2; brilhoEstrela(c,x+Math.cos(a)*22,y+Math.sin(a)*16,3+Math.sin(t*6+k)*1.5); } }
function brilhoEstrela(c,x,y,r){ c.fillStyle='#fff'; c.beginPath(); c.moveTo(x,y-r*2); c.lineTo(x+r*.4,y-r*.4); c.lineTo(x+r*2,y); c.lineTo(x+r*.4,y+r*.4); c.lineTo(x,y+r*2); c.lineTo(x-r*.4,y+r*.4); c.lineTo(x-r*2,y); c.lineTo(x-r*.4,y-r*.4); c.fill(); }
function letraOuro(c,ch,x,y,t,apagada){
  const giro=Math.cos(t*2.5); c.save(); c.translate(x,y+Math.sin(t*3)*3); c.scale(Math.max(.15,Math.abs(giro)),1);
  c.font='900 30px system-ui'; c.textAlign='center'; c.textBaseline='middle';
  c.lineWidth=6; c.strokeStyle=apagada?'rgba(0,0,0,.25)':'#7a4a0a'; c.strokeText(ch,0,0);
  c.fillStyle=apagada?'rgba(255,255,255,.25)':lg(c,0,-14,0,14,['#fff6c8','#f2c14e','#b8780a']); c.fillText(ch,0,0);
  c.restore();
}
function caixaReencontro(c,x,y,w,h,t,trem){
  const dx=trem?Math.sin(t*40)*1.5:0; c.save(); c.translate(x+dx,y);
  c.fillStyle=lg(c,0,0,w,h,['#e0a868','#b8793e','#7a4a20']); rr(c,0,0,w,h,4); c.fill(); c.strokeStyle='#4a2a10'; c.lineWidth=2; c.stroke();
  c.strokeStyle='rgba(74,42,16,.7)'; c.lineWidth=2; c.beginPath(); c.moveTo(4,4); c.lineTo(w-4,h-4); c.moveTo(w-4,4); c.lineTo(4,h-4); c.stroke();
  c.fillStyle='rgba(255,255,255,.15)'; c.fillRect(3,3,w-6,4);
  const pul=1+Math.sin(t*5)*.08; c.save(); c.translate(w/2,h/2); c.scale(pul,pul); c.fillStyle=lg(c,0,-9,0,9,['#ff9ab5','#e63946','#8f1d2c']);
  c.beginPath(); c.moveTo(0,7); c.bezierCurveTo(-13,-2,-7,-12,0,-5); c.bezierCurveTo(7,-12,13,-2,0,7); c.fill(); c.restore();
  c.restore();
}
function caixaComum(c,x,y,w,h){ c.fillStyle=lg(c,0+x,y,x+w,y+h,['#f0c48a','#c98a52','#8a5a30']); rr(c,x,y,w,h,3); c.fill(); c.strokeStyle='#5a3420'; c.lineWidth=2; c.stroke();
  c.fillStyle='#e63946'; c.fillRect(x+w/2-3,y,6,h); c.fillRect(x,y+h/2-3,w,6); }
function mola(c,x,y,t,comprimida){ const h=comprimida?10:20; c.fillStyle='#555'; rr(c,x+4,y+40-6,32,6,2); c.fill();
  c.strokeStyle=lg(c,x,y,x+40,y,['#ddd','#999','#666']); c.lineWidth=3; c.beginPath(); for(let k=0;k<=5;k++){ c.lineTo(x+8+(k%2)*24,y+34-k*h/5); } c.stroke();
  c.fillStyle=lg(c,x,y+34-h-6,x,y+34-h,['#ff8a8a','#e63946','#8f1d2c']); rr(c,x+2,y+34-h-6,36,7,3); c.fill(); }
function canhao(c,x,y,ang,t,cheio,tipo){
  const cx=x+20, cy=y+22; c.save(); c.translate(cx,cy);
  c.fillStyle='rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0,18,20,5,0,0,7); c.fill();
  c.rotate(-ang);
  c.fillStyle=lg(c,0,-16,0,16,tipo==='@'?['#c9b6ff','#7b5cff','#3d2a99']:['#ff9ab5','#e63946','#8f1d2c']); rr(c,-18,-16,40,32,6); c.fill(); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=1.5; c.stroke();
  c.fillStyle='#fff6d6'; c.fillRect(-18,-3,40,6); c.fillRect(-2,-16,6,32);
  c.fillStyle='#2b1a10'; c.beginPath(); c.ellipse(22,0,4,12,0,0,7); c.fill();
  c.fillStyle='rgba(255,255,255,.85)'; c.beginPath(); c.moveTo(30,0); c.lineTo(24,-6); c.lineTo(24,6); c.fill();
  brilho(c,-8,-10,8,3,.4);
  c.restore();
  if(!cheio && tipo!=='@' && tipo===tipo.toUpperCase()){ c.fillStyle='rgba(255,255,255,.8)'; c.font='bold 10px system-ui'; c.textAlign='center'; c.fillText('AUTO',cx,y-2); }
  if(cheio){ c.fillStyle='rgba(255,255,255,.9)'; c.font='bold 11px system-ui'; c.textAlign='center'; c.fillText(tipo===tipo.toUpperCase()&&tipo!=='@'?'…':'PULE!',cx,y-4); }
}
function arvoreNatal(c,x,y,acesa,t){ // ponto de volta
  c.fillStyle='#6b4220'; c.fillRect(x+16,y+30,8,10);
  const cores=acesa?['#7bd66f','#2e9e46','#176b2a']:['#8a9a8a','#5a6a5a','#3a4a3a'];
  for(let k=0;k<3;k++){ c.fillStyle=lg(c,x,y+k*9,x+40,y+k*9+16,cores); c.beginPath(); c.moveTo(x+20,y-6+k*9); c.lineTo(x+4+k*-2,y+16+k*8); c.lineTo(x+36+k*2,y+16+k*8); c.fill(); }
  if(acesa){ ['#ff4d6a','#ffd93b','#46a8ff','#ff9f1c'].forEach((cor,k)=>{ const on=(Math.floor(t*4)+k)%2; c.fillStyle=on?cor:'rgba(255,255,255,.4)'; c.beginPath(); c.arc(x+10+k*7,y+12+(k%2)*10,2.5,0,7); c.fill(); }); }
  c.fillStyle=acesa?'#ffd93b':'#888'; c.beginPath(); for(let k=0;k<10;k++){ const r=k%2?2.5:6, a=k*Math.PI/5-Math.PI/2; c.lineTo(x+20+Math.cos(a)*r,y-8+Math.sin(a)*r); } c.fill();
  if(acesa){ c.fillStyle=rg(c,x+20,y-8,1,16,['rgba(255,230,120,.7)','rgba(255,230,120,0)']); c.beginPath(); c.arc(x+20,y-8,16,0,7); c.fill(); }
}
function portalSaida(c,x,y,t){ // presente gigante aberto: saída da fase
  const w=90,h=110, bx=x-25, by=y-h+40;
  c.fillStyle=rg(c,bx+w/2,by+h/2,10,90,['rgba(255,240,160,.6)','rgba(255,240,160,0)']); c.beginPath(); c.arc(bx+w/2,by+h/2,90,0,7); c.fill();
  c.fillStyle=lg(c,bx,by,bx+w,by+h,['#ff9ab5','#e63946','#8f1d2c']); rr(c,bx,by+20,w,h-20,8); c.fill();
  c.fillStyle=lg(c,bx+15,by+30,bx+w-15,by+h,['#fffbe0','#ffe28a','#f2c14e']); rr(c,bx+16,by+34,w-32,h-34,6); c.fill();
  c.fillStyle='#fff6d6'; c.fillRect(bx+w/2-6,by+20,12,h-20);
  c.save(); c.translate(bx+w/2,by+20); c.rotate(-.35+Math.sin(t*3)*.05); c.fillStyle=lg(c,-50,-14,50,8,['#ff9ab5','#e63946']); rr(c,-52,-16,104,18,6); c.fill(); c.restore();
  for(let k=0;k<6;k++){ const a=t*1.5+k; brilhoEstrela(c,bx+w/2+Math.cos(a)*50,by+h/2+Math.sin(a*1.3)*45,2.5); }
  c.fillStyle='#fff'; c.font='900 14px system-ui'; c.textAlign='center'; c.fillText('ENTREGA',bx+w/2,by+h-12);
}

// ---------- inimigos ----------
function inimigo(c,e,tema,t){
  const x=e.x, y=e.y, w=e.w, h=e.h, d=e.dir, cx=x+w/2;
  c.save(); if(e.morto){ c.translate(cx,y+h/2); c.rotate(e.giro||0); c.translate(-cx,-(y+h/2)); }
  if(!e.morto) sombraChao(c,cx,y+h,w*.45);
  const k=tema+'_'+e.tipo;
  switch(k){
    case 'cidade_a': case 'cidade_v': { // pombo
      const voa=e.tipo==='v', asa=Math.sin(t*(voa?22:6))*(voa?14:2);
      c.save(); c.translate(cx,y+h*.55); c.scale(d,1);
      if(!voa){ c.strokeStyle='#d9822b'; c.lineWidth=2.5; c.beginPath(); c.moveTo(-3,10); c.lineTo(-3+Math.sin(t*12)*3,19); c.moveTo(4,10); c.lineTo(4-Math.sin(t*12)*3,19); c.stroke(); }
      bola(c,0,0,15,'#d5dbe3','#8e98a6','#4f5966');
      c.fillStyle=lg(c,-10,-20,10,0,['#bfa7ff','#6fbfa8','#3a6f8f']); c.beginPath(); c.ellipse(6,-5,7,9,.3,0,7); c.fill();
      c.fillStyle=lg(c,-14,-6,4,6,['#c0c8d2','#6f7a88']); c.beginPath(); c.ellipse(-4,-2+(voa?-asa*.3:0),13,6+(voa?Math.abs(asa)*.4:0),voa?-asa*.03:.2,0,7); c.fill();
      bola(c,11,-12,7.5,'#d5dbe3','#8e98a6','#4f5966'); c.fillStyle='#ff9f1c'; c.beginPath(); c.moveTo(17,-12); c.lineTo(24,-10); c.lineTo(17,-8); c.fill();
      c.fillStyle='#fff'; c.beginPath(); c.arc(13,-14,2.6,0,7); c.fill(); c.fillStyle='#c0392b'; c.beginPath(); c.arc(13.6,-14,1.5,0,7); c.fill();
      c.strokeStyle='#222'; c.lineWidth=2; c.beginPath(); c.moveTo(10,-18); c.lineTo(16,-16.5); c.stroke();
      c.restore(); break; }
    case 'cidade_x': { // patinete desgovernado com faísca
      c.save(); c.translate(cx,y+h); c.scale(d,1);
      c.strokeStyle='#555'; c.lineWidth=4; c.beginPath(); c.moveTo(10,-8); c.lineTo(14,-40); c.stroke(); c.strokeStyle='#222'; c.lineWidth=4; c.beginPath(); c.moveTo(8,-40); c.lineTo(20,-40); c.stroke();
      c.fillStyle=lg(c,-20,-12,20,-6,['#ff6b6b','#d62839','#7a0f18']); rr(c,-20,-13,32,7,3); c.fill();
      bola(c,-14,-5,5,'#888','#333','#111'); bola(c,12,-5,5,'#888','#333','#111');
      if(Math.floor(t*12)%2){ c.fillStyle='#ffd93b'; for(let i=0;i<3;i++){ c.beginPath(); c.arc(-24-i*4,-4-Math.random()*6,1.5,0,7); c.fill(); } }
      c.fillStyle='#fff'; c.beginPath(); c.arc(14,-42,3,0,7); c.fill(); c.fillStyle='#c0392b'; c.beginPath(); c.arc(15,-42,1.6,0,7); c.fill();
      c.restore(); break; }
    case 'cidade_t': { // boneco de neve atirador
      c.save(); c.translate(cx,y+h);
      bola(c,0,-15,16,'#ffffff','#e3ecf5','#9fb2c8'); bola(c,0,-38,12,'#ffffff','#e3ecf5','#9fb2c8'); bola(c,0,-56,9,'#ffffff','#e3ecf5','#9fb2c8');
      c.fillStyle='#ff9f1c'; c.beginPath(); c.moveTo(0,-56); c.lineTo(d*12,-54); c.lineTo(0,-52); c.fill();
      c.fillStyle='#222'; c.beginPath(); c.arc(d*3-2,-59,1.5,0,7); c.arc(d*3+3,-59,1.5,0,7); c.fill();
      c.strokeStyle='#222'; c.lineWidth=2; c.beginPath(); c.moveTo(d*-1,-63); c.lineTo(d*7,-61); c.stroke();
      c.fillStyle='#d62839'; rr(c,-12,-48,24,5,2); c.fill(); c.fillRect(d*6-3,-48,5,12);
      c.fillStyle='#222'; rr(c,-9,-74,18,10,2); c.fill(); rr(c,-12,-66,24,3,1); c.fill();
      c.strokeStyle='#6b4220'; c.lineWidth=2.5; c.beginPath(); c.moveTo(d*10,-40); c.lineTo(d*22,-48-(e.atira>0?6:0)); c.stroke();
      c.restore(); break; }
    case 'cidade_d': { // cachorro bravo
      const corre=e.estado==='corre', p=Math.sin(t*(corre?20:4))*(corre?.6:.1);
      c.save(); c.translate(cx,y+h); c.scale(d,1);
      membro(c,-12,-14,-12+Math.sin(p)*8,-2,3.5,'#e0a868','#b8793e','#7a4a20'); membro(c,12,-14,12-Math.sin(p)*8,-2,3.5,'#e0a868','#b8793e','#7a4a20');
      c.fillStyle=lg(c,-20,-30,20,-10,['#f0c48a','#c98a52','#8a5a30']); c.beginPath(); c.ellipse(0,-18,20,10,0,0,7); c.fill();
      c.strokeStyle='#8a5a30'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(-18,-22); c.lineTo(-26,-30+Math.sin(t*15)*4); c.stroke();
      bola(c,18,-28,10,'#f0c48a','#c98a52','#8a5a30'); c.fillStyle='#5a3420'; c.beginPath(); c.ellipse(13,-36,4,8,-.5,0,7); c.fill();
      c.fillStyle='#e0a868'; c.beginPath(); c.ellipse(26,-25,6,5,0,0,7); c.fill(); c.fillStyle='#222'; c.beginPath(); c.arc(31,-26,2.3,0,7); c.fill();
      c.fillStyle='#fff'; c.beginPath(); c.arc(20,-31,2.6,0,7); c.fill(); c.fillStyle='#c0392b'; c.beginPath(); c.arc(21,-31,1.5,0,7); c.fill();
      c.strokeStyle='#222'; c.lineWidth=2; c.beginPath(); c.moveTo(16,-35); c.lineTo(23,-33); c.stroke();
      if(corre){ c.fillStyle='#fff'; c.beginPath(); c.moveTo(24,-21); c.lineTo(26,-17); c.lineTo(28,-21); c.fill(); }
      else { c.fillStyle='#fff'; c.font='bold 11px system-ui'; c.fillText('z',24,-44-(t*10)%8); }
      c.fillStyle='#d62839'; c.fillRect(10,-22,6,3);
      c.restore(); break; }
    case 'escritorio_a': case 'escritorio_s': { // grampeador
      const ab=e.tipo==='s' ? (e.vy<0?.5:.15) : Math.abs(Math.sin(t*6))*.3;
      c.save(); c.translate(cx,y+h); c.scale(d,1);
      c.fillStyle=lg(c,-20,-10,20,0,['#666','#333','#111']); rr(c,-20,-10,40,10,3); c.fill();
      c.save(); c.translate(-18,-10); c.rotate(-ab); c.fillStyle=lg(c,0,-14,0,0,['#ff8a8a','#d62839','#7a0f18']); rr(c,0,-12,40,12,5); c.fill(); brilho(c,12,-9,8,2,.45);
      c.fillStyle='#fff'; c.beginPath(); c.arc(30,-7,3,0,7); c.fill(); c.fillStyle='#222'; c.beginPath(); c.arc(31,-7,1.6,0,7); c.fill(); c.restore();
      c.fillStyle='#ccc'; for(let i=0;i<4;i++) c.fillRect(6+i*3,-11+ab*6,1.5,3);
      c.restore(); break; }
    case 'escritorio_x': { // cadeira giratória
      c.save(); c.translate(cx,y+h); const g=t*8;
      for(let i=0;i<5;i++){ const a=g+i*1.25; c.fillStyle='#222'; c.beginPath(); c.arc(Math.cos(a)*16,-4,4,0,7); c.fill(); }
      c.fillStyle='#555'; c.fillRect(-2,-22,4,18); c.fillStyle=lg(c,-18,-30,18,-20,['#5a6070','#2b2e38','#14161c']); rr(c,-18,-30,36,9,4); c.fill();
      c.fillStyle=lg(c,-16,-60,16,-30,['#5a6070','#2b2e38','#14161c']); rr(c,-16*Math.cos(g*.5),-62,32*Math.cos(g*.5)||1,32,8); c.fill();
      c.restore(); break; }
    case 'escritorio_v': { // avião de papel
      c.save(); c.translate(cx,y+h/2); c.scale(d,1); c.rotate(Math.sin(t*3)*.15);
      c.fillStyle='#fff'; c.beginPath(); c.moveTo(22,0); c.lineTo(-18,-12); c.lineTo(-10,0); c.closePath(); c.fill(); c.fillStyle='#dfe6ee'; c.beginPath(); c.moveTo(22,0); c.lineTo(-18,10); c.lineTo(-10,0); c.closePath(); c.fill();
      c.strokeStyle='#9aa7b8'; c.lineWidth=1; c.beginPath(); c.moveTo(22,0); c.lineTo(-10,0); c.stroke();
      c.fillStyle='#c0392b'; c.beginPath(); c.arc(8,-3,2,0,7); c.fill();
      c.restore(); break; }
    case 'escritorio_t': { // impressora atiradora
      c.save(); c.translate(cx,y+h);
      c.fillStyle=lg(c,-24,-40,24,0,['#f4f6f8','#c9cfd6','#8a929c']); rr(c,-24,-36,48,36,6); c.fill(); c.strokeStyle='#666'; c.lineWidth=1.5; c.stroke();
      c.fillStyle='#333'; rr(c,-18,-26,36,5,2); c.fill(); c.fillStyle='#fff'; c.fillRect(-14,-46+(e.atira>0?-6:0),28,14);
      c.fillStyle=e.atira>0?'#ff4d4d':'#2ecc71'; c.beginPath(); c.arc(16,-10,3,0,7); c.fill();
      c.fillStyle='#222'; c.beginPath(); c.arc(-8,-14,2,0,7); c.arc(0,-14,2,0,7); c.fill(); c.strokeStyle='#222'; c.lineWidth=2; c.beginPath(); c.moveTo(-11,-19); c.lineTo(-5,-17); c.moveTo(3,-19); c.lineTo(-3,-17); c.stroke();
      c.restore(); break; }
    case 'casa_a': { // soldadinho de corda (original)
      const p=Math.sin(t*8)*.5;
      c.save(); c.translate(cx,y+h); c.scale(d,1);
      membro(c,-4,-20,-4+Math.sin(p)*6,-2,3.5,'#5a6070','#2b2e38','#14161c'); membro(c,4,-20,4-Math.sin(p)*6,-2,3.5,'#5a6070','#2b2e38','#14161c');
      c.fillStyle=lg(c,-10,-42,10,-18,['#ff8a8a','#d62839','#7a0f18']); rr(c,-10,-42,20,24,4); c.fill(); c.fillStyle='#f2c14e'; c.fillRect(-10,-26,20,3); c.fillRect(-1,-42,2,16);
      bola(c,0,-50,8,'#ffdcc2','#f2c09a','#b8805c'); c.fillStyle='#222'; c.beginPath(); c.arc(3,-51,1.4,0,7); c.fill();
      c.fillStyle=lg(c,-8,-72,8,-56,['#444','#111','#000']); rr(c,-8,-72,16,16,3); c.fill(); c.fillStyle='#f2c14e'; c.beginPath(); c.arc(0,-62,2,0,7); c.fill();
      c.save(); c.translate(-12,-32); c.rotate(t*6); c.fillStyle='#f2c14e'; c.fillRect(-1.5,-7,3,14); c.fillRect(-7,-1.5,14,3); c.restore();
      c.restore(); break; }
    case 'casa_s': { // bola saltitante com cara
      const est=e.vy<0?1.08:.95; c.save(); c.translate(cx,y+h/2); c.scale(1/est,est);
      bola(c,0,0,18,'#ffe28a','#f4a261','#a35a1e'); c.strokeStyle='#e63946'; c.lineWidth=4; c.beginPath(); c.arc(0,0,18,-.6,.6); c.stroke(); c.beginPath(); c.arc(0,0,18,Math.PI-.6,Math.PI+.6); c.stroke();
      c.fillStyle='#222'; c.beginPath(); c.arc(-5,-4,2,0,7); c.arc(5,-4,2,0,7); c.fill(); c.strokeStyle='#222'; c.lineWidth=2; c.beginPath(); c.moveTo(-8,-9); c.lineTo(-2,-7); c.moveTo(8,-9); c.lineTo(2,-7); c.stroke();
      brilho(c,-7,-9,5,3,.5); c.restore(); break; }
    case 'casa_x': { // robô aspirador
      c.save(); c.translate(cx,y+h);
      c.fillStyle=lg(c,-24,-18,24,0,['#6b7488','#3b4150','#1b1f28']); c.beginPath(); c.ellipse(0,-9,24,9,0,0,7); c.fill();
      c.fillStyle=lg(c,-18,-22,18,-12,['#9aa4b8','#5a6378']); c.beginPath(); c.ellipse(0,-14,18,6,0,0,7); c.fill();
      c.fillStyle=Math.floor(t*6)%2?'#ff4d4d':'#7a1010'; c.beginPath(); c.arc(d*12,-15,2.5,0,7); c.fill();
      c.save(); c.translate(d*20,-3); c.rotate(t*20); c.strokeStyle='#ccc'; c.lineWidth=1.5; for(let i=0;i<3;i++){ c.rotate(2.09); c.beginPath(); c.moveTo(0,0); c.lineTo(7,0); c.stroke(); } c.restore();
      c.restore(); break; }
    case 'casa_v': { // helicóptero de brinquedo
      c.save(); c.translate(cx,y+h/2); c.scale(d,1);
      c.fillStyle=lg(c,-16,-10,16,10,['#9ee5de','#2a9d8f','#155e57']); c.beginPath(); c.ellipse(0,0,15,10,0,0,7); c.fill();
      c.fillStyle='#aee3ff'; c.beginPath(); c.ellipse(7,-2,6,5,0,0,7); c.fill(); c.fillStyle='#2a9d8f'; c.fillRect(-28,-2,16,4); c.fillRect(-30,-7,4,10);
      c.fillStyle='#333'; c.fillRect(-1,-14,2,5); c.fillStyle='rgba(60,60,60,.6)'; c.beginPath(); c.ellipse(0,-15,24*Math.abs(Math.cos(t*30)),2.5,0,0,7); c.fill();
      c.fillStyle='#333'; c.fillRect(-10,10,20,2); c.restore(); break; }
    case 'casa_t': { // lançador de bolinhas de brinquedo
      c.save(); c.translate(cx,y+h);
      c.fillStyle=lg(c,-18,-24,18,0,['#c9b6ff','#7b5cff','#3d2a99']); rr(c,-18,-22,36,22,6); c.fill();
      c.save(); c.translate(0,-22); c.rotate(d>0?-.4:Math.PI+.4); c.fillStyle=lg(c,0,-6,0,6,['#ffe28a','#f4a261','#a35a1e']); rr(c,0,-6,26,12,5); c.fill(); c.restore();
      c.fillStyle='#fff'; c.beginPath(); c.arc(-6,-12,3,0,7); c.arc(5,-12,3,0,7); c.fill(); c.fillStyle='#222'; c.beginPath(); c.arc(-6+d,-12,1.6,0,7); c.arc(5+d,-12,1.6,0,7); c.fill();
      c.restore(); break; }
    default: { bola(c,cx,y+h/2,h/2,'#ff9ab5','#e63946','#8f1d2c'); }
  }
  c.restore();
}
function projetil(c,p,tema,t){
  if(p.tipo==='bolsa'){ c.save(); c.translate(p.x,p.y); c.rotate(t*18); c.fillStyle=lg(c,-10,-8,10,8,['#ff9ab5','#d81e5b','#7d0b33']); rr(c,-10,-6,20,14,4); c.fill(); c.strokeStyle='#f2c14e'; c.lineWidth=2.5; c.beginPath(); c.arc(0,-6,6,Math.PI,0); c.stroke(); c.fillStyle='#f2c14e'; c.fillRect(-2,-2,4,4); c.restore(); return; }
  if(p.tipo==='caixa'){ c.save(); c.translate(p.x,p.y); c.rotate(t*10*p.dir); caixaComum(c,-16,-16,32,32); c.restore(); return; }
  if(tema==='cidade'){ bola(c,p.x,p.y,7,'#ffffff','#e3ecf5','#9fb2c8'); return; }
  if(tema==='escritorio'){ c.save(); c.translate(p.x,p.y); c.rotate(t*12); c.fillStyle='#fff'; c.fillRect(-9,-6,18,12); c.strokeStyle='#9aa7b8'; c.lineWidth=1; c.strokeRect(-9,-6,18,12); c.restore(); return; }
  bola(c,p.x,p.y,7,'#ffe28a','#f4a261','#a35a1e');
}

// ---------- chefões ----------
function chefe(c,b,t){
  const flash=b.flash>0 && Math.floor(b.flash*30)%2;
  c.save(); if(flash) c.filter='brightness(2.2)';
  const cx=b.x+b.w/2, by=b.y+b.h, d=b.dir;
  if(b.tipo==='pombao'){
    const voa=b.estado!=='tonto', asa=Math.sin(t*(voa?14:3))*(voa?30:4);
    if(!voa||b.y+b.h>8*T) sombraChao(c,cx,9*T,50);
    c.save(); c.translate(cx,b.y+b.h*.55); c.scale(d,1);
    c.fillStyle=lg(c,-60,-40,20,20,['#e0e5ec','#8e98a6','#4f5966']); c.beginPath(); c.ellipse(-20,-10-asa*.6,46,16+Math.abs(asa)*.4,-asa*.012,0,7); c.fill();
    bola(c,0,0,44,'#d5dbe3','#8e98a6','#4f5966');
    c.fillStyle=lg(c,0,-40,30,0,['#cdb8ff','#6fbfa8','#3a6f8f']); c.beginPath(); c.ellipse(20,-14,20,26,.3,0,7); c.fill();
    bola(c,34,-36,22,'#d5dbe3','#8e98a6','#4f5966');
    c.fillStyle=lg(c,50,-40,70,-30,['#ffd08a','#ff9f1c','#a35a1e']); c.beginPath(); c.moveTo(52,-38); c.lineTo(74,-32); c.lineTo(52,-26); c.fill();
    const tonto=b.estado==='tonto';
    c.fillStyle='#fff'; c.beginPath(); c.arc(40,-42,7,0,7); c.fill();
    if(tonto){ c.strokeStyle='#222'; c.lineWidth=2; c.beginPath(); c.moveTo(36,-46); c.lineTo(44,-38); c.moveTo(44,-46); c.lineTo(36,-38); c.stroke(); }
    else { c.fillStyle='#c0392b'; c.beginPath(); c.arc(42,-42,4,0,7); c.fill(); c.fillStyle='#000'; c.beginPath(); c.arc(43,-42,2,0,7); c.fill(); }
    c.strokeStyle='#222'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(30,-54); c.lineTo(48,-50); c.stroke();
    c.fillStyle='#d62839'; c.beginPath(); c.moveTo(18,-56); c.lineTo(36,-76); c.lineTo(44,-56); c.closePath(); c.fill(); bola(c,36,-77,4,'#fff','#eee','#bbb');
    if(!voa){ c.strokeStyle='#ff9f1c'; c.lineWidth=5; c.beginPath(); c.moveTo(-10,40); c.lineTo(-14,52); c.moveTo(12,40); c.lineTo(14,52); c.stroke(); }
    c.restore();
    if(tonto) for(let k=0;k<3;k++){ const a=t*5+k*2.1; brilhoEstrela(c,cx+Math.cos(a)*40+d*30,b.y-10+Math.sin(a)*8,3); }
  }
  if(b.tipo==='ranzinza'){
    const anda=Math.sin(t*(b.estado==='investe'?16:7))*.5, tonto=b.estado==='tonto';
    sombraChao(c,cx,by,44);
    c.save(); c.translate(cx,by); c.scale(d,1);
    membro(c,-12,-50,-12+Math.sin(anda)*12,-6,11,'#5a6070','#2b2e38','#14161c'); membro(c,12,-50,12-Math.sin(anda)*12,-6,11,'#5a6070','#2b2e38','#14161c');
    c.fillStyle='#111'; rr(c,-26,-8,24,9,4); c.fill(); rr(c,2,-8,26,9,4); c.fill();
    c.fillStyle=lg(c,-38,-120,38,-46,['#8a96b0','#4a5470','#232a3c']); rr(c,-38,-118,76,74,16); c.fill();
    c.fillStyle='#fff'; c.beginPath(); c.moveTo(-10,-118); c.lineTo(10,-118); c.lineTo(0,-90); c.fill(); c.fillStyle='#d62839'; c.beginPath(); c.moveTo(-4,-114); c.lineTo(4,-114); c.lineTo(6,-80); c.lineTo(0,-72); c.lineTo(-6,-80); c.closePath(); c.fill();
    bola(c,0,-138,24,'#f6c7a2','#d9a07a','#9c6342');
    c.fillStyle=lg(c,-24,-164,24,-140,['#5a3a1e','#2b1a10','#120a05']); c.beginPath(); c.arc(0,-142,25,Math.PI*1.05,Math.PI*1.95); c.fill();
    c.fillStyle='#fff'; c.beginPath(); c.arc(8,-142,5,0,7); c.arc(-6,-142,5,0,7); c.fill();
    if(tonto){ c.strokeStyle='#222'; c.lineWidth=2; c.beginPath(); c.moveTo(4,-146); c.lineTo(12,-138); c.moveTo(12,-146); c.lineTo(4,-138); c.moveTo(-10,-146); c.lineTo(-2,-138); c.moveTo(-2,-146); c.lineTo(-10,-138); c.stroke(); }
    else { c.fillStyle='#222'; c.beginPath(); c.arc(10,-142,2.5,0,7); c.arc(-4,-142,2.5,0,7); c.fill(); }
    c.strokeStyle='#222'; c.lineWidth=4; c.lineCap='round'; c.beginPath(); c.moveTo(-14,-154); c.lineTo(-2,-150); c.moveTo(18,-154); c.lineTo(6,-150); c.stroke();
    c.strokeStyle='#7a3a2a'; c.lineWidth=3; c.beginPath(); c.arc(2,-124,7,Math.PI+.4,-.4); c.stroke();
    const ar=b.estado==='joga'?-2.6:b.escudo?-3.0:-.4;
    membro(c,-30,-110,-30+Math.sin(ar)*26,-110+Math.cos(ar)*26,9,'#8a96b0','#4a5470','#232a3c');
    membro(c,30,-110,30+Math.sin(ar)*26,-110+Math.cos(ar)*26,9,'#8a96b0','#4a5470','#232a3c');
    if(b.escudo){ c.fillStyle=lg(c,-34,-200,34,-170,['#c98a52','#8a5a30','#4a2a10']); rr(c,-36,-196,72,26,5); c.fill(); c.fillStyle='#f2c14e'; c.fillRect(-6,-200,12,6); }
    c.restore();
    if(tonto) for(let k=0;k<3;k++){ const a=t*5+k*2.1; brilhoEstrela(c,cx+Math.cos(a)*30,b.y-8+Math.sin(a)*8,3); }
  }
  if(b.tipo==='aspirador'){
    const tonto=b.estado==='tonto', suga=b.estado==='suga';
    sombraChao(c,cx,by,90);
    c.save(); c.translate(cx,by);
    c.fillStyle=lg(c,-90,-60,90,0,['#7d8799','#3b4150','#15181f']); c.beginPath(); c.ellipse(0,-28,90,28,0,0,7); c.fill();
    c.fillStyle=lg(c,-70,-70,70,-40,['#b9c2d3','#6b7488','#3b4150']); c.beginPath(); c.ellipse(0,-44,70,22,0,0,7); c.fill();
    if(tonto){ c.fillStyle='#2b2e38'; c.beginPath(); c.ellipse(0,-58,40,20,0,Math.PI,0); c.fill(); c.fillStyle='#ffd93b'; c.beginPath(); c.arc(0,-60,12,0,7); c.fill(); c.fillStyle='#ff4d4d'; c.beginPath(); c.arc(0,-60,6,0,7); c.fill(); }
    else { c.fillStyle=lg(c,-40,-80,40,-50,['#d6dde8','#8a94a8']); c.beginPath(); c.ellipse(0,-56,40,14,0,0,7); c.fill(); }
    c.fillStyle='#111'; rr(c,b.dir*40-26,-56,52,14,7); c.fill();
    c.fillStyle=suga||Math.floor(t*4)%2?'#ff4d4d':'#7a1010'; c.beginPath(); c.arc(b.dir*30-8,-50,5,0,7); c.arc(b.dir*30+8,-50,5,0,7); c.fill();
    for(const s of [-1,1]){ c.save(); c.translate(s*76,-8); c.rotate(t*25*s); c.strokeStyle='#ddd'; c.lineWidth=3; for(let i=0;i<3;i++){ c.rotate(2.09); c.beginPath(); c.moveTo(0,0); c.lineTo(16,0); c.stroke(); } c.restore(); }
    brilho(c,-30,-56,26,6,.35);
    c.restore();
    if(suga){ c.strokeStyle='rgba(200,230,255,.6)'; c.lineWidth=2; for(let k=0;k<5;k++){ const r=((t*160+k*40)%200); c.beginPath(); c.arc(cx+b.dir*90,by-20,200-r,b.dir>0?-0.6:Math.PI-0.6,b.dir>0?0.6:Math.PI+0.6); c.stroke(); } }
    if(tonto) for(let k=0;k<3;k++){ const a=t*5+k*2.1; brilhoEstrela(c,cx+Math.cos(a)*50,b.y-14+Math.sin(a)*8,3); }
  }
  c.restore();
}

// ---------- blocos (sprites em cache, 2x) ----------
function sprite(w,h,f){ const cv=document.createElement('canvas'); cv.width=w*2; cv.height=h*2; const c=cv.getContext('2d'); c.scale(2,2); f(c); return cv; }
function montaTiles(tema){
  const S={};
  if(tema==='cidade'){
    S.chaoTopo=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#d6d9de','#b3b8c0','#8d939c']); c.fillRect(0,0,T,T); c.fillStyle='#ececf0'; c.fillRect(0,0,T,5); c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(T-2,5,2,T); c.fillRect(0,T*.55,T,2); c.fillStyle='#fff'; c.fillRect(0,0,T,1.5); c.fillStyle='rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(12,1,10,3,0,0,7); c.ellipse(32,1.5,8,2.5,0,0,7); c.fill(); });
    S.chao=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#5b4a44','#47383a','#2e2428']); c.fillRect(0,0,T,T); c.fillStyle='rgba(0,0,0,.25)'; c.fillRect(0,19,T,2); c.fillRect(19,0,2,19); c.fillRect(5,21,2,19); c.fillRect(31,21,2,19); });
    S.parede=sprite(T,T,c=>{ c.fillStyle='#8f4a3a'; c.fillRect(0,0,T,T); for(let r=0;r<4;r++) for(let k=-1;k<3;k++){ const x=k*20+(r%2?10:0); c.fillStyle=lg(c,x,r*10,x,r*10+10,['#c56a52','#a5533f','#7a3a2a']); rr(c,x+1,r*10+1,18,8,1.5); c.fill(); } });
    S.caixa=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,T,T,['#e8b878','#c98a52','#8a5a30']); rr(c,1,1,T-2,T-2,3); c.fill(); c.strokeStyle='#5a3420'; c.lineWidth=2; c.stroke(); c.fillStyle='rgba(90,52,32,.5)'; c.fillRect(2,12,T-4,2); c.fillRect(2,26,T-4,2); c.strokeStyle='rgba(90,52,32,.6)'; c.beginPath(); c.moveTo(4,4); c.lineTo(T-4,T-4); c.stroke(); c.fillStyle='#3a2a20'; [[5,5],[T-7,5],[5,T-7],[T-7,T-7]].forEach(([a,b])=>c.fillRect(a,b,2,2)); c.fillStyle='rgba(255,255,255,.18)'; c.fillRect(3,3,T-6,3); });
    S.plat=sprite(T,T,c=>{ for(let k=0;k<4;k++){ c.fillStyle=k%2?'#ffffff':'#2e9e46'; c.fillRect(k*10,0,10,10); } c.fillStyle='rgba(0,0,0,.15)'; c.fillRect(0,8,T,2); for(let k=0;k<4;k++){ c.fillStyle=k%2?'#f0f0f0':'#258a3c'; c.beginPath(); c.arc(k*10+5,10,5,0,Math.PI); c.fill(); } c.fillStyle='rgba(255,255,255,.35)'; c.fillRect(0,0,T,2); });
    S.perigo=sprite(T,T,c=>{ for(let k=0;k<5;k++){ c.fillStyle=lg(c,k*8,20,k*8+8,40,['rgba(230,250,255,.95)','rgba(150,210,235,.9)','rgba(80,140,170,.9)']); c.beginPath(); c.moveTo(k*8,T); c.lineTo(k*8+3+(k%2)*2,T-14-(k%3)*5); c.lineTo(k*8+8,T); c.fill(); } });
  }
  if(tema==='escritorio'){
    S.chaoTopo=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#5f7aa8','#3d5480','#26365a']); c.fillRect(0,0,T,T); c.fillStyle='#8aa2cc'; c.fillRect(0,0,T,4); c.fillStyle='rgba(255,255,255,.07)'; for(let k=0;k<8;k++) c.fillRect((k*7)%T,6+k*4,3,1); });
    S.chao=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#3a3f4c','#2a2e38','#1a1d24']); c.fillRect(0,0,T,T); c.fillStyle='rgba(255,255,255,.05)'; c.fillRect(0,0,T,1); });
    S.parede=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#e8ecf2','#c9cfd8','#9aa3b0']); c.fillRect(0,0,T,T); c.fillStyle='#7a8494'; c.fillRect(0,T-4,T,4); c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(T-1,0,1,T); });
    S.teto=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#f4f6f8','#dfe4ea','#c1c8d2']); c.fillRect(0,0,T,T); c.strokeStyle='rgba(0,0,0,.12)'; c.strokeRect(.5,.5,T-1,T-1); c.fillStyle='rgba(255,255,230,.9)'; c.fillRect(6,T-6,28,4); });
    S.caixa=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,T,T,['#c9d1db','#9aa4b2','#5f6875']); rr(c,1,1,T-2,T-2,3); c.fill(); c.strokeStyle='#4a525e'; c.lineWidth=1.5; c.stroke(); for(let k=0;k<2;k++){ c.fillStyle=lg(c,0,4+k*18,0,20+k*18,['#e3e8ee','#b9c1cc']); rr(c,4,4+k*18,T-8,15,2); c.fill(); c.fillStyle='#4a525e'; rr(c,T/2-6,9+k*18,12,3,1.5); c.fill(); } brilho(c,10,6,8,1.5,.5); });
    S.plat=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,10,['#e0b98a','#b8793e','#7a4a20']); c.fillRect(0,0,T,10); c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(0,0,T,2); c.fillStyle='#555'; c.fillRect(4,10,3,26); c.fillRect(T-7,10,3,26); c.fillStyle='rgba(0,0,0,.2)'; c.fillRect(0,10,T,2); });
    S.perigo=sprite(T,T,c=>{ for(let k=0;k<3;k++){ const x=6+k*13; c.fillStyle='#999'; c.beginPath(); c.moveTo(x,T-12); c.lineTo(x+1.5,T); c.lineTo(x+3,T-12); c.fill(); bola(c,x+1.5,T-14,5,'#ff9ab5',['#e63946','#46a8ff','#f2c14e'][k],'#333'); } });
  }
  if(tema==='casa'){
    S.chaoTopo=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#d9a066','#b8793e','#7a4a20']); c.fillRect(0,0,T,T); c.fillStyle='#f0c48a'; c.fillRect(0,0,T,3); c.fillStyle='rgba(90,52,32,.4)'; c.fillRect(0,13,T,1.5); c.fillRect(0,27,T,1.5); c.fillRect(22,0,1.5,13); c.fillRect(8,13,1.5,14); c.fillRect(30,27,1.5,13); });
    S.chao=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#8a5a30','#6b4220','#4a2a10']); c.fillRect(0,0,T,T); c.fillStyle='rgba(0,0,0,.2)'; c.fillRect(0,19,T,2); });
    S.parede=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#d9a066','#b8793e','#7a4a20']); c.fillRect(0,0,T,T); c.fillStyle='#f0c48a'; c.fillRect(0,0,T,3); c.fillStyle='rgba(90,52,32,.4)'; c.fillRect(0,18,T,1.5); });
    S.teto=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,T,['#fff8ec','#f3e3cc','#d9c3a2']); c.fillRect(0,0,T,T); c.fillStyle='#c9a77a'; c.fillRect(0,T-5,T,5); c.fillStyle='rgba(255,255,255,.5)'; c.fillRect(0,T-5,T,1.5); });
    S.caixa=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,T,T,['#a8e6a1','#2ecc71','#178a4a']); rr(c,1,1,T-2,T-2,4); c.fill(); c.strokeStyle='#0f5a30'; c.lineWidth=1.5; c.stroke(); c.fillStyle='#fff'; c.font='900 18px system-ui'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('★',T/2,T/2+1); brilho(c,10,7,8,2,.5); });
    S.plat=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,0,10,['#f0c48a','#c98a52','#8a5a30']); c.fillRect(0,0,T,10); c.fillStyle='rgba(255,255,255,.3)'; c.fillRect(0,0,T,2); c.fillStyle='#6b4220'; c.beginPath(); c.moveTo(4,10); c.lineTo(14,10); c.lineTo(4,20); c.fill(); });
    S.perigo=sprite(T,T,c=>{ [['#e63946',4],['#46a8ff',16],['#f2c14e',27]].forEach(([cor,x],k)=>{ c.fillStyle=lg(c,x,T-12,x,T,[cor,'#333']); rr(c,x,T-12-(k%2)*3,10,12+(k%2)*3,2); c.fill(); c.fillStyle=cor; c.fillRect(x+1.5,T-15-(k%2)*3,3,3); c.fillRect(x+5.5,T-15-(k%2)*3,3,3); }); });
  }
  S.escada=sprite(T,T,c=>{ c.fillStyle=lg(c,0,0,10,0,['#e0b98a','#8a5a30']); c.fillRect(6,0,5,T); c.fillRect(T-11,0,5,T); for(let k=0;k<3;k++){ c.fillStyle=lg(c,0,k*13+4,0,k*13+9,['#f0c48a','#8a5a30']); c.fillRect(6,k*13+4,T-12,5); } });
  if(!S.teto) S.teto=S.parede;
  return S;
}
function carro(c,x,y,cor){ // 4x2 blocos
  const w=160,h=80; c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(w/2,h,w*.48,8,0,0,7); c.fill();
  c.fillStyle=lg(c,0,10,0,h-10,cor); c.beginPath(); c.moveTo(6,h-14); c.lineTo(4,40); c.quadraticCurveTo(8,30,30,28); c.lineTo(46,6); c.quadraticCurveTo(50,2,58,2); c.lineTo(112,2); c.quadraticCurveTo(120,2,124,8); c.lineTo(138,28); c.quadraticCurveTo(156,30,157,44); c.lineTo(156,h-14); c.closePath(); c.fill();
  c.strokeStyle='rgba(0,0,0,.45)'; c.lineWidth=1.5; c.stroke();
  c.fillStyle=lg(c,50,6,110,28,['#e8f6ff','#8fc8ec','#3f78a0']); c.beginPath(); c.moveTo(54,8); c.lineTo(80,8); c.lineTo(80,28); c.lineTo(40,28); c.closePath(); c.fill(); c.beginPath(); c.moveTo(86,8); c.lineTo(114,8); c.lineTo(128,28); c.lineTo(86,28); c.closePath(); c.fill();
  c.fillStyle='rgba(255,255,255,.45)'; c.fillRect(6,30,150,3); brilho(c,60,14,10,3,.5);
  c.fillStyle='#ffe9a6'; rr(c,148,36,8,8,2); c.fill(); c.fillStyle='#ff4d4d'; rr(c,4,36,6,8,2); c.fill();
  for(const wx of [36,124]){ bola(c,wx,h-12,14,'#666','#222','#000'); bola(c,wx,h-12,6,'#eee','#aaa','#666'); }
  c.fillStyle='#fff'; c.fillRect(0,4,w,0); c.fillStyle='rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(85,2,32,4,0,0,7); c.fill();
  c.restore();
}
function onibus(c,x,y){ const w=240,h=120; c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(w/2,h,w*.48,9,0,0,7); c.fill();
  c.fillStyle=lg(c,0,0,0,h-16,['#ffe28a','#f2b31b','#a3740a']); rr(c,2,2,w-4,h-18,12); c.fill(); c.strokeStyle='rgba(0,0,0,.4)'; c.lineWidth=1.5; c.stroke();
  for(let k=0;k<5;k++){ c.fillStyle=lg(c,0,14,0,50,['#e8f6ff','#8fc8ec','#3f78a0']); rr(c,14+k*44,14,36,34,5); c.fill(); brilho(c,22+k*44,20,6,2,.55); }
  c.fillStyle='#2b2e38'; c.fillRect(2,62,w-4,6); c.fillStyle='#d62839'; c.fillRect(2,70,w-4,4);
  c.fillStyle='#ffe9a6'; rr(c,w-12,74,8,10,2); c.fill();
  for(const wx of [48,192]){ bola(c,wx,h-16,16,'#666','#222','#000'); bola(c,wx,h-16,7,'#eee','#aaa','#666'); }
  c.fillStyle='rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(w/2,3,90,5,0,0,7); c.fill();
  // enfeite de natal
  for(let k=0;k<9;k++){ c.fillStyle=['#ff4d6a','#ffd93b','#46a8ff','#2ecc71'][k%4]; c.beginPath(); c.arc(16+k*26,58+Math.sin(k)*2,3,0,7); c.fill(); }
  c.restore(); }
function sofa(c,x,y){ const w=120,h=80; c.save(); c.translate(x,y);
  c.fillStyle='rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(w/2,h,w*.48,7,0,0,7); c.fill();
  c.fillStyle=lg(c,0,0,0,h,['#ff8a8a','#c0392b','#6b1a14']); rr(c,4,4,w-8,40,12); c.fill(); rr(c,0,30,20,h-38,8); c.fill(); rr(c,w-20,30,20,h-38,8); c.fill();
  c.fillStyle=lg(c,0,36,0,64,['#ff9a9a','#d9534f','#8f2a22']); rr(c,16,36,w/2-18,26,7); c.fill(); rr(c,w/2+2,36,w/2-18,26,7); c.fill();
  brilho(c,30,14,14,4,.35); c.fillStyle='#5a3420'; c.fillRect(10,h-10,8,10); c.fillRect(w-18,h-10,8,10);
  c.fillStyle=lg(c,20,8,44,30,['#fff3bf','#f2c14e','#a8781a']); rr(c,22,10,24,22,6); c.fill();
  c.restore(); }
function plataformaMovel(c,x,y,w,tema){ c.save(); c.translate(x,y);
  if(tema==='escritorio'){ c.fillStyle=lg(c,0,0,0,16,['#d6dde8','#8a94a8','#4a525e']); rr(c,0,0,w,16,3); c.fill(); c.fillStyle='#f2c14e'; for(let k=0;k<w;k+=12) c.fillRect(k,12,6,4); }
  else if(tema==='casa'){ c.fillStyle=lg(c,0,0,0,14,['#c9b6ff','#7b5cff','#3d2a99']); rr(c,0,0,w,12,6); c.fill(); for(const wx of [12,w-12]) bola(c,wx,16,5,'#eee','#aaa','#555'); }
  else { c.fillStyle=lg(c,0,0,0,14,['#e0b98a','#b8793e','#7a4a20']); rr(c,0,0,w,14,3); c.fill(); c.strokeStyle='#555'; c.lineWidth=2; c.beginPath(); c.moveTo(6,0); c.lineTo(6,-400); c.moveTo(w-6,0); c.lineTo(w-6,-400); c.stroke(); }
  brilho(c,w*.3,3,w*.2,1.5,.4); c.restore(); }

// ---------- cenários com 3 camadas (parallax) ----------
function montaFundo(tema,W=1280,H=360){
  const cv=n=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; return c; };
  const longe=cv(), perto=cv(); const a=longe.getContext('2d'), b=perto.getContext('2d');
  const R=(s=>()=>(s=(s*9301+49297)%233280)/233280)(tema.length*77);
  if(tema==='cidade'){
    for(let x=0;x<W;){ const w=50+R()*80, h=120+R()*140; a.fillStyle=lg(a,0,H-h,0,H,['#3a3470','#2a2558']); a.fillRect(x,H-h,w,h);
      for(let yy=H-h+12;yy<H-20;yy+=18) for(let xx=x+8;xx<x+w-8;xx+=14) if(R()<.55){ a.fillStyle=R()<.3?'rgba(255,220,120,.85)':'rgba(255,200,100,.35)'; a.fillRect(xx,yy,6,8); }
      if(R()<.4){ a.fillStyle='#2a2558'; a.fillRect(x+w/2-2,H-h-20,4,20); a.fillStyle='#ff4d4d'; a.fillRect(x+w/2-2,H-h-22,4,3); }
      x+=w+4; }
    for(let x=0;x<W;){ const w=110+R()*90, h=150+R()*90, cor=['#6b3f5e','#5a4a7a','#7a4a4a','#4a5a7a'][Math.floor(R()*4)];
      b.fillStyle=lg(b,x,0,x+w,0,[cor,'#2a2040']); b.fillRect(x,H-h,w,h);
      b.fillStyle='rgba(255,255,255,.9)'; b.fillRect(x-2,H-h-4,w+4,6);
      for(let yy=H-h+20;yy<H-60;yy+=34) for(let xx=x+12;xx<x+w-20;xx+=30){ const acesa=R()<.7; b.fillStyle=acesa?lg(b,0,yy,0,yy+20,['#fff0b0','#ffb84d']):'#2a2040'; b.fillRect(xx,yy,18,22); b.fillStyle='rgba(0,0,0,.3)'; b.fillRect(xx+8,yy,2,22); if(acesa&&R()<.3){ b.fillStyle='#2e9e46'; b.beginPath(); b.arc(xx+9,yy+11,6,0,7); b.fill(); b.fillStyle='#d62839'; b.fillRect(xx+7,yy+15,4,3); } }
      for(let k=0;k<w/10;k++){ b.fillStyle=['#ff4d6a','#ffd93b','#46a8ff','#2ecc71'][k%4]; b.beginPath(); b.arc(x+k*10+5,H-h+8+Math.sin(k)*3,2.5,0,7); b.fill(); }
      x+=w+30+R()*40; }
    for(let x=60;x<W;x+=320){ b.fillStyle='#2b2e38'; b.fillRect(x,H-150,5,150); b.fillRect(x,H-150,26,4); b.fillStyle=rg(b,x+24,H-140,2,40,['rgba(255,240,180,.8)','rgba(255,240,180,0)']); b.beginPath(); b.arc(x+24,H-140,40,0,7); b.fill(); b.fillStyle='#d62839'; b.beginPath(); b.arc(x+3,H-110,8,0,7); b.fill(); }
  }
  if(tema==='escritorio'){
    a.fillStyle=lg(a,0,0,0,H,['#c9d4e6','#aebdd6']); a.fillRect(0,0,W,H);
    for(let x=20;x<W;x+=260){ a.fillStyle='#e8eef6'; a.fillRect(x-6,30,212,230); const g=lg(a,0,40,0,250,['#1b2a55','#3a3470','#6b3f5e']); a.fillStyle=g; a.fillRect(x,40,200,210);
      for(let k=0;k<10;k++){ const bh=40+R()*120; a.fillStyle='rgba(20,20,50,.8)'; a.fillRect(x+k*20,250-bh,18,bh); for(let yy=250-bh+8;yy<246;yy+=12) if(R()<.5){ a.fillStyle='rgba(255,220,120,.8)'; a.fillRect(x+k*20+5,yy,4,5); } }
      a.fillStyle='#e8eef6'; a.fillRect(x+98,40,4,210); a.fillRect(x,140,200,4); }
    for(let x=0;x<W;x+=320){
      b.fillStyle=lg(b,0,H-130,0,H,['#8aa2cc','#5f7aa8']); b.fillRect(x+10,H-130,180,130); b.fillStyle='#4a5f86'; b.fillRect(x+10,H-130,180,6);
      b.fillStyle='#2b2e38'; b.fillRect(x+40,H-110,50,34); b.fillStyle='#46a8ff'; b.fillRect(x+44,H-106,42,26); b.fillStyle='#2b2e38'; b.fillRect(x+60,H-76,10,10);
      b.fillStyle='#2e9e46'; b.beginPath(); b.arc(x+230,H-110,26,0,7); b.arc(x+214,H-90,20,0,7); b.arc(x+246,H-90,20,0,7); b.fill(); b.fillStyle='#c98a52'; b.fillRect(x+216,H-70,28,40);
      b.fillStyle='#fff'; b.beginPath(); b.arc(x+290,60,18,0,7); b.fill(); b.strokeStyle='#333'; b.lineWidth=2; b.stroke(); b.beginPath(); b.moveTo(x+290,60); b.lineTo(x+290,48); b.moveTo(x+290,60); b.lineTo(x+299,63); b.stroke();
      for(let k=0;k<16;k++){ b.fillStyle=k%2?'#2e9e46':'#d62839'; b.beginPath(); b.arc(x+k*20+10,24+Math.sin(k*.8)*8,5,0,7); b.fill(); } }
  }
  if(tema==='casa'){
    a.fillStyle=lg(a,0,0,0,H,['#f6d6c8','#e9b8a8']); a.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=30){ a.fillStyle='rgba(255,255,255,.25)'; a.fillRect(x,0,12,H); }
    for(let x=80;x<W;x+=420){ a.fillStyle='#fff'; a.fillRect(x-8,50,156,150); a.fillStyle=lg(a,0,58,0,190,['#1b2a55','#3a5296']); a.fillRect(x,58,140,134);
      for(let k=0;k<30;k++){ a.fillStyle='#fff'; a.beginPath(); a.arc(x+R()*140,58+R()*134,1.5,0,7); a.fill(); } a.fillStyle='#fff'; a.fillRect(x+68,58,4,134); a.fillRect(x,122,140,4);
      a.fillStyle='#c0392b'; a.fillRect(x-20,44,26,170); a.fillRect(x+134,44,26,170); }
    for(let x=0;x<W;x+=640){
      b.fillStyle=lg(b,0,H-180,0,H,['#c9a27a','#8a6440']); b.fillRect(x+60,H-170,160,170); b.fillStyle='#2b1a10'; b.fillRect(x+90,H-110,100,110);
      b.fillStyle=rg(b,x+140,H-40,4,60,['rgba(255,200,80,.95)','rgba(255,120,30,.6)','rgba(255,80,20,0)']); b.beginPath(); b.arc(x+140,H-40,60,0,7); b.fill();
      b.fillStyle='#8a6440'; b.fillRect(x+50,H-176,180,12);
      ['#d62839','#2e9e46','#d62839'].forEach((cor,k)=>{ b.fillStyle=cor; rr(b,x+82+k*44,H-164,22,36,6); b.fill(); b.fillStyle='#fff'; b.fillRect(x+82+k*44,H-164,22,8); });
      const tx=x+400; b.fillStyle='#6b4220'; b.fillRect(tx-8,H-50,16,50);
      for(let k=0;k<4;k++){ b.fillStyle=lg(b,tx-70,0,tx+70,0,['#2e9e46','#176b2a']); b.beginPath(); b.moveTo(tx,H-300+k*55); b.lineTo(tx-40-k*16,H-210+k*50); b.lineTo(tx+40+k*16,H-210+k*50); b.fill(); }
      for(let k=0;k<16;k++){ b.fillStyle=['#ff4d6a','#ffd93b','#46a8ff','#ff9f1c'][k%4]; b.beginPath(); b.arc(tx-60+R()*120,H-250+R()*190,4,0,7); b.fill(); }
      b.fillStyle='#ffd93b'; b.beginPath(); for(let k=0;k<10;k++){ const r=k%2?7:16, an=k*Math.PI/5-Math.PI/2; b.lineTo(tx+Math.cos(an)*r,H-304+Math.sin(an)*r); } b.fill();
      [['#e63946',tx-50],['#2a9d8f',tx+30],['#7b5cff',tx-10]].forEach(([cor,px])=>{ b.fillStyle=cor; b.fillRect(px,H-36,30,30); b.fillStyle='#fff6d6'; b.fillRect(px+12,H-36,6,30); });
      b.fillStyle=lg(b,0,H-130,0,H,['#e9a6c0','#b8607e']); rr(b,x+500,H-110,110,70,14); b.fill(); }
  }
  return {longe,perto};
}
function desenhaCeu(c,tema,cam,VW,VH,t){
  if(tema==='cidade'){ c.fillStyle=lg(c,0,0,0,VH,['#141a4a','#4a2f7a','#c2607a','#f2a65a']); c.fillRect(0,0,VW,VH);
    c.fillStyle='rgba(255,255,255,.8)'; for(let k=0;k<40;k++){ const x=(k*97-cam*.03)%VW, y=(k*53)%(VH*.5); c.fillRect((x+VW)%VW,y,1.5,1.5); }
    c.fillStyle=rg(c,VW*.78,70,4,46,['#fffbe0','#ffe9a6','rgba(255,233,166,0)']); c.beginPath(); c.arc(VW*.78,70,46,0,7); c.fill(); }
  else if(tema==='escritorio'){ c.fillStyle=lg(c,0,0,0,VH,['#cfd8e8','#b7c4da']); c.fillRect(0,0,VW,VH); }
  else { c.fillStyle=lg(c,0,0,0,VH,['#f8dccf','#eab9a8']); c.fillRect(0,0,VW,VH); }
}

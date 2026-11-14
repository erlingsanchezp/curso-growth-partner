(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GPCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = 1;
  function number(value, label, opts = {}) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && value.trim() === '')) throw Error('Completa ' + label + '.');
    const n = Number(value);
    if (!Number.isFinite(n)) throw Error(label + ': usa un número finito.');
    if (opts.integer && !Number.isSafeInteger(n)) throw Error(label + ': usa un entero válido.');
    if (n < (opts.min ?? 0) || n > (opts.max ?? 1e12)) throw Error(label + ': valor fuera del rango permitido.');
    return n;
  }
  function economics(p, v, count, spend, clients) {
    p=number(p,'precio');v=number(v,'costo variable');count=number(count,'compras',{integer:true,min:1});spend=number(spend,'captación');clients=number(clients,'clientes nuevos',{integer:true,min:1,max:count});
    const contribution=p-v;
    return {unit:contribution,revenue:p*count,before:contribution*count,after:contribution*count-spend,cac:spend/clients,roas:spend>0?p*count/spend:null};
  }
  function funnel(n,r,a,c,cap,value) {
    n=number(n,'consultas',{integer:true,min:1});r=number(r,'reserva',{max:100})/100;a=number(a,'asistencia',{max:100})/100;c=number(c,'cierre',{max:100})/100;cap=number(cap,'capacidad',{integer:true,min:1});value=number(value,'contribución unitaria');
    const reserved=n*r,attended=reserved*a,sold=attended*c;
    return {reserved,attended,sold,contribution:sold*value,over:attended>cap,tight:attended>=cap*.9,spare:cap-attended};
  }
  function wilson(x,n) {
    n=number(n,'muestra',{integer:true,min:1});x=number(x,'éxitos',{integer:true,max:n});
    const p=x/n,z=1.96,d=1+z*z/n,center=(p+z*z/(2*n))/d,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
    return {p,low:Math.max(0,center-half),high:Math.min(1,center+half),n,x};
  }
  function ab(xa,na,xb,nb) {
    na=number(na,'muestra A',{integer:true,min:1});nb=number(nb,'muestra B',{integer:true,min:1});xa=number(xa,'éxitos A',{integer:true,max:na});xb=number(xb,'éxitos B',{integer:true,max:nb});
    if (Math.min(xa,na-xa,xb,nb-xb)<10) throw Error('La aproximación requiere al menos 10 éxitos y 10 no éxitos por grupo. Usa un método apropiado para conteos pequeños.');
    const a=xa/na,b=xb/nb,diff=b-a,se=Math.sqrt(a*(1-a)/na+b*(1-b)/nb);
    return {a,b,diff,se,low:diff-1.96*se,high:diff+1.96*se,relative:a>0?diff/a:null};
  }
  function sample(a,b,traffic) {
    a=number(a,'tasa base',{min:.1,max:99.9})/100;b=number(b,'tasa prevista',{min:.1,max:99.9})/100;traffic=number(traffic,'personas nuevas elegibles por día',{integer:true,min:1});
    if (Math.abs(b-a)<.00001) throw Error('Define una diferencia relevante distinta de cero.');
    const m=(a+b)/2,n=Math.ceil(Math.pow((1.96*Math.sqrt(2*m*(1-m))+.842*Math.sqrt(a*(1-a)+b*(1-b)))/(b-a),2));
    if (!Number.isSafeInteger(n) || n>1e9) throw Error('Ese efecto exige una muestra demasiado grande para esta práctica.');
    return {perArm:n,total:2*n,days:Math.ceil(2*n/traffic)};
  }
  function shuffle(items, seed) {
    const out=items.slice();let s=seed>>>0;
    for (let i=out.length-1;i>0;i--) {s=(Math.imul(1664525,s)+1013904223)>>>0;const j=s%(i+1);[out[i],out[j]]=[out[j],out[i]];}
    return out;
  }
  function grade(answers) {
    if (!Array.isArray(answers)||answers.length!==4||answers.some(x=>!Number.isInteger(x)||x<0||x>3)) throw Error('Responde las cuatro preguntas antes de evaluar.');
    const correct=answers.filter(x=>x===0).length;return {correct,total:4,percent:correct*25,passed:correct>=3};
  }
  function blank() {return {version:VERSION,read:{},attempts:{},notes:{},labs:{},cases:{},final:null,rubric:[0,0,0,0,0,0],projectNote:''};}
  function clean(raw) {
    if (!raw || typeof raw!=='object'||Array.isArray(raw)||raw.version!==VERSION) throw Error('Respaldo no compatible. Usa un archivo de progreso de este curso (versión 1).');
    const s=blank();
    for (let id=1;id<=24;id++) {
      for(let p=0;p<3;p++)if(raw.read?.[id+':'+p]===true)s.read[id+':'+p]=true;
      if(typeof raw.notes?.[id]==='string')s.notes[id]=raw.notes[id].slice(0,12000);
      if(Array.isArray(raw.attempts?.[id]))s.attempts[id]=raw.attempts[id].slice(0,100).flatMap(t=>{try {const g=grade(t.answers);return [{answers:t.answers.slice(),score:g.correct,at:typeof t.at==='string'?t.at.slice(0,40):''}];} catch{return [];}});
    }
    for(const key of ['economia','embudo','wilson','ab','muestra','automatizacion'])if(raw.labs?.[key]===true)s.labs[key]=true;
    for(let id=1;id<=12;id++)if(raw.cases?.[id]===true)s.cases[id]=true;
    if(Array.isArray(raw.rubric)&&raw.rubric.length===6)s.rubric=raw.rubric.map(x=>Number.isInteger(x)&&x>=0&&x<=3?x:0);
    if(typeof raw.projectNote==='string')s.projectNote=raw.projectNote.slice(0,20000);
    if(raw.final&&Array.isArray(raw.final.values)&&Array.isArray(raw.final.decisions)){
      try {const g=finalGrade(raw.final.values,raw.final.decisions);s.final={...g,values:raw.final.values.slice(),decisions:raw.final.decisions.slice(),at:typeof raw.final.at==='string'?raw.final.at.slice(0,40):''};}catch{}
    }
    return s;
  }
  function unitStatus(s,id) {
    const read=[0,1,2].filter(p=>s.read[id+':'+p]).length,a=s.attempts[id]||[],best=a.length?Math.max(...a.map(t=>grade(t.answers).correct)):0;
    return {read,best,attempts:a.length,passed:best>=3,complete:read===3&&best>=3,first:a.length?grade(a[0].answers).correct:null};
  }
  function progress(s) {
    const units=Array.from({length:24},(_,i)=>unitStatus(s,i+1));return {units,completed:units.filter(x=>x.complete).length,read:units.reduce((a,x)=>a+x.read,0),passed:units.filter(x=>x.passed).length,percent:Math.round(units.filter(x=>x.complete).length/24*100)};
  }
  const FINAL_EXPECTED=[80,1980,30,45,2460,480];
  function finalGrade(values,decisions) {
    if(!Array.isArray(values)||values.length!==6||!Array.isArray(decisions)||decisions.length!==4)throw Error('Completa los seis cálculos y cuatro decisiones.');
    const numeric=values.map((v,i)=>Math.abs(number(v,'cálculo '+(i+1),{min:-1e12})-FINAL_EXPECTED[i])<=.02);
    if(decisions.some(v=>!Number.isInteger(v)||v<0||v>3))throw Error('Responde las cuatro decisiones del proyecto.');
    const score=numeric.filter(Boolean).length+decisions.filter(v=>v===0).length;return {score,percent:score*10,passed:score>=8,numeric};
  }
  function ready(s) {return progress(s).completed===24&&s.final?.passed===true&&s.rubric.every(x=>x>=2)&&s.projectNote.trim().length>=160;}
  function initialSimulation() {return {events:[],jobs:[],effects:[],optouts:[],log:[],failed:false};}
  function simulate(old,action) {
    let s=JSON.parse(JSON.stringify(old));
    if(action==='reset')return initialSimulation();
    if(action==='ingest') {
      for(const [id,entity,type] of [['E1','L1','lead'],['E1','L1','lead'],['E2','L2','lead'],['E3','L2','out'],['E4','L3','lead']]){
        if(s.events.includes(id)){s.log.push(id+': entrega repetida, sin tarea nueva.');continue;}
        s.events.push(id);
        if(type==='out'){s.optouts.push(entity);s.jobs.filter(j=>j.entity===entity&&j.state==='pending').forEach(j=>j.state='cancelled');s.log.push(id+': baja de '+entity+', pendientes canceladas.');}
        else{s.jobs.push({entity,state:'pending',attempts:0,key:entity+':welcome:v1'});s.log.push(id+': guardado y tarea creada.');}
      }
    }
    if(action==='fail'||action==='run'){
      for(const j of s.jobs.filter(j=>j.state==='pending')){
        j.attempts++;
        if(s.optouts.includes(j.entity)){j.state='cancelled';s.log.push(j.entity+': cancelada por baja.');continue;}
        if(action==='fail'&&j.entity==='L3'&&!s.failed){s.failed=true;s.log.push('L3: destino caído, pendiente para reintento.');continue;}
        if(!s.effects.includes(j.key))s.effects.push(j.key);
        j.state='done';s.log.push(j.entity+': efecto lógico registrado una sola vez.');
      }
    }
    s.log=s.log.slice(-35);return s;
  }
  return {VERSION,number,economics,funnel,wilson,ab,sample,shuffle,grade,blank,clean,unitStatus,progress,finalGrade,ready,initialSimulation,simulate};
});

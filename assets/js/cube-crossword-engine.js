(function (root) {
  'use strict';
  const normalize = s => String(s).normalize('NFD').replace(/[\u0591-\u05c7\s'"׳״־-]/g, '').replace(/[ךםןףץ]/g, c => ({ך:'כ',ם:'מ',ן:'נ',ף:'פ',ץ:'צ'}[c]));
  const index = (x,y,z) => z*9+y*3+x;
  const lines = [];
  for (let axis=0; axis<3; axis++) for(let a=0;a<3;a++) for(let b=0;b<3;b++) {
    lines.push([0,1,2].map(t => { const p=[]; p[axis]=t; p[(axis+1)%3]=a; p[(axis+2)%3]=b; return index(...p); }));
  }
  function orientations(cube, reflections=true, preserveDirections=false) {
    const result=[];
    for(const p of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]) {
      const parity = ((p[0]>p[1])+(p[0]>p[2])+(p[1]>p[2]))%2 ? -1:1;
      for(let mask=0;mask<8;mask++) {
        if(preserveDirections && mask!==0) continue;
        const signs=[0,1,2].map(i=>mask&(1<<i)?-1:1);
        if(!reflections && parity*signs.reduce((a,b)=>a*b,1)<0) continue;
        const out=[];
        for(let z=0;z<3;z++) for(let y=0;y<3;y++) for(let x=0;x<3;x++) {
          const q=[x,y,z]; const src=p.map((v,i)=>signs[i]<0?2-q[v]:q[v]);
          out[index(x,y,z)]=cube[index(...src)];
        }
        result.push(out);
      }
    }
    return result;
  }
  function validate(data) {
    if(!data || typeof data.id!=='string' || !data.id || !Array.isArray(data.layers) || data.layers.length!==3 || data.layers.some(l=>!Array.isArray(l)||l.length!==3||l.some(r=>typeof r!=='string'|| !/^[א-ת]{3}$/.test(r)))) throw Error('יש להזין שלוש שכבות, ובכל שכבה שלוש שורות של שלוש אותיות עבריות.');
    if(!Array.isArray(data.clues)||data.clues.length!==27||data.clues.some(c=>!c||typeof c.text!=='string'||!c.text.trim()||typeof c.answer!=='string'|| !/^[א-ת]{3}$/.test(normalize(c.answer)))) throw Error('נדרשות 27 הגדרות, כל אחת עם תשובה של שלוש אותיות.');
    const cube=data.layers.flat().join('').split('');
    const words=lines.map(l=>normalize(l.map(i=>cube[i]).join(''))).sort();
    if(JSON.stringify(words)!==JSON.stringify(data.clues.map(c=>normalize(c.answer)).sort())) throw Error('התשובות אינן תואמות ל־27 המילים בקובייה.');
    return cube;
  }
  // Maximum matching preserves multiplicity when several clues share their text.
  function clueMatches(clues, values) {
    const owner=new Map();
    function assign(i,seen) {
      for(let j=0;j<clues.length;j++) if(clues[i].text===clues[j].text && normalize(values[i])===normalize(clues[j].answer) && !seen.has(j)) {
        seen.add(j);
        if(!owner.has(j)||assign(owner.get(j),seen)) { owner.set(j,i); return true; }
      }
      return false;
    }
    values.forEach((v,i)=>{if(normalize(v))assign(i,new Set());});
    return new Set(owner.values());
  }
  function cubeMatch(candidates, values, locked) {
    let best={cells:[], matched:[]};
    for(const cells of candidates) {
      if(values.some((v,i)=>locked.has(i)&&normalize(v)!==normalize(cells[i]))) continue;
      const matched=lines.map((l,i)=>l.every(j=>normalize(values[j])===normalize(cells[j]))?i:-1).filter(i=>i>=0);
      if(matched.length>best.matched.length)best={cells,matched};
    }
    return best;
  }
  const api={normalize,lines,orientations,validate,clueMatches,cubeMatch};
  if(typeof module!=='undefined')module.exports=api;
  root.CubeCrossword=api;
})(typeof window!=='undefined'?window:globalThis);

(() => {
  'use strict';
  const E=window.CubeCrossword, $=id=>document.getElementById(id);
  let data, candidates, inputs=[], cells=[], state, key;
  const target=n=>n<1?1:n<8?8:27;
  const blank=()=>({answers:Array(27).fill(''),letters:Array(27).fill(''),clues:[],locked:[],words:0});
  function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
  function update(){
    inputs.forEach((el,i)=>{el.value=state.answers[i];el.disabled=state.clues.includes(i);});
    cells.forEach((el,i)=>{el.value=state.letters[i];el.disabled=state.locked.includes(i);});
    for(const [kind,n] of [['clue',state.clues.length],['cube',state.words]]) {
      $(kind+'-progress').textContent=n===27?'הושלם · 27 מתוך 27':`${n} מתוך 27 אושרו · האישור הבא ב־${target(n)}`;
    }
  }
  function start(config){
    const cube=E.validate(config);
    data=config;candidates=E.orientations(cube,data.reflections!==false);
    key='cube-crossword:'+JSON.stringify(data);state=blank();
    try{
      const old=JSON.parse(localStorage.getItem(key));
      if(old && old.answers?.length===27 && old.letters?.length===27 && old.answers.every(v=>typeof v==='string') && old.letters.every(v=>typeof v==='string') && Array.isArray(old.clues) && Array.isArray(old.locked) && [0,1,8,27].includes(old.words) && [0,1,8,27].includes(old.clues.length) && [...old.clues,...old.locked].every(i=>Number.isInteger(i)&&i>=0&&i<27))state=old;
    }catch{}
    inputs=[];cells=[];$('clues').replaceChildren();$('layers').replaceChildren();
    data.clues.forEach((clue,i)=>{
      const row=document.createElement('label');row.className='clue';
      const number=document.createElement('span');number.className='number';number.textContent=i+1;
      const text=document.createElement('span');text.textContent=clue.text;
      const input=document.createElement('input');input.autocomplete='off';input.spellcheck=false;input.setAttribute('aria-label',`תשובה להגדרה ${i+1}: ${clue.text}`);
      const answerChanged=event=>{state.answers[i]=input.value;save();if(!event.isComposing)checkClues();};
      input.addEventListener('input',answerChanged);
      input.addEventListener('compositionend',answerChanged);
      row.append(number,text,input);$('clues').append(row);inputs.push(input);
    });
    for(let z=0;z<3;z++){
      const layer=document.createElement('div');layer.className='layer';
      const title=document.createElement('h3');title.textContent=`שכבה ${z+1}`;
      const grid=document.createElement('div');grid.className='grid';
      for(let y=0;y<3;y++)for(let x=0;x<3;x++){
        const i=z*9+y*3+x,input=document.createElement('input');input.className='cell';input.autocomplete='off';input.spellcheck=false;
        input.setAttribute('aria-label',`שכבה ${z+1}, שורה ${y+1}, עמודה ${x+1} מימין`);
        const letterChanged=event=>{
          if(event.isComposing)return;
          input.value=input.value.normalize('NFC').replace(/[^א-ת]/g,'').slice(-1);state.letters[i]=input.value;save();checkCube();
        };
        input.addEventListener('input',letterChanged);
        input.addEventListener('compositionend',letterChanged);
        grid.append(input);cells.push(input);
      }
      layer.append(title,grid);$('layers').append(layer);
    }
    $('setup').classList.add('hidden');$('game').classList.remove('hidden');update();
  }
  function checkClues(){
    const n=state.clues.length;if(n===27)return;
    const matched=E.clueMatches(data.clues,state.answers),next=target(n);
    if(matched.size>=next && state.clues.every(i=>matched.has(i))){
      const fresh=[...matched].filter(i=>!state.clues.includes(i)).slice(0,next-n);
      state.clues.push(...fresh);$('clue-status').textContent=next===27?'כל ההגדרות נכונות!':`נכון! ${next-n} תשובות נוספות אושרו וננעלו.`;save();update();
    }
    if(state.clues.length>n && state.clues.length<27)checkClues();
  }
  function checkCube(){
    const n=state.words;if(n===27)return;
    const match=E.cubeMatch(candidates,state.letters,new Set(state.locked)),next=target(n);
    if(match.matched.length>=next){
      // Lock the entire batch actually confirmed, retaining one common orientation.
      const already=E.lines.map((line,i)=>line.every(j=>state.locked.includes(j))?i:-1).filter(i=>i>=0);
      const chosen=[...already,...match.matched.filter(i=>!already.includes(i))].slice(0,next);
      state.locked=[...new Set([...state.locked,...chosen.flatMap(i=>E.lines[i])])];state.words=next;
      $('cube-status').textContent=next===27?'הקובייה הושלמה! כל 27 המילים במקום.':`נכון! ${next-n} מילים נוספות אושרו. האותיות שלהן ננעלו.`;save();update();
    }
    if(state.words>n && state.words<27)checkCube();
  }
  $('reset').addEventListener('click',()=>{if(!state)return;state=blank();save();update();$('clue-status').textContent='';$('cube-status').textContent='';inputs[0]?.focus();});
  $('load').addEventListener('change',async event=>{try{const file=event.target.files[0];if(file)start(JSON.parse(await file.text()));}catch(error){$('error').textContent=error.message;}});
  if(window.CUBE_CROSSWORD_DATA){try{start(window.CUBE_CROSSWORD_DATA);}catch(error){$('error').textContent=error.message;}}
})();

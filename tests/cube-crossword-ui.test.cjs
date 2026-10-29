const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
class Element {
  constructor(){this.value='';this.children=[];this.handlers={};this.classList={add(){},remove(){}};}
  addEventListener(name,fn){this.handlers[name]=fn;}
  append(...items){this.children.push(...items);}
  replaceChildren(){this.children=[];}
  setAttribute(){}
  focus(){}
  showModal(){this.open=true;this.openCount=(this.openCount||0)+1;}
  close(){this.open=false;}
}
const nodes=new Map();
const storage=new Map();
const context={window:{CubeCrossword:require('../assets/js/cube-crossword-engine.js')},document:{getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},createElement(){return new Element();}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}};
vm.createContext(context);
for(const file of ['cube-crossword-data.js','cube-crossword.js'])vm.runInContext(fs.readFileSync('assets/js/'+file,'utf8'),context);
const clues=nodes.get('clues').children.map(row=>row.children[2]);
const config=context.window.CUBE_CROSSWORD_DATA;
for(let i=0;i<8;i++){
  clues[i].value=config.clues[i].answer;
  clues[i].handlers.input({isComposing:false});
  assert.equal(clues.filter(el=>el.disabled).length,i===0?1:i<7?1:8);
}
const cells=nodes.get('layers').children.flatMap(layer=>layer.children[1].children);
const cube=config.layers.flat().join('');
const finalForms={'מ':'ם','נ':'ן','כ':'ך','פ':'ף','צ':'ץ'};
for(let i=0;i<3;i++){cells[i].value=finalForms[cube[i]]||cube[i];cells[i].handlers.input({isComposing:false});}
assert.equal(cells.filter(el=>el.disabled).length,3);
assert.equal(cells[0].value,'מ','Confirmed final mem becomes ordinary mem');
assert.match(nodes.get('cube-progress').textContent,/1 מתוך 27/);
assert.ok(!fs.readFileSync('cube-crossword.html','utf8').includes('id="reset"'));
assert.ok(!nodes.get('completion').open);
for(let i=8;i<27;i++){
  clues[i].value=config.clues[i].answer;
  clues[i].handlers.input({isComposing:false});
  assert.equal(clues.filter(el=>el.disabled).length,i<13?8:i<19?14:i<26?20:27);
}
assert.ok(!nodes.get('completion').open,'Clues alone must not trigger completion');
for(let i=0;i<27;i++){
  if(cells[i].disabled)continue;
  cells[i].value=finalForms[cube[i]]||cube[i];cells[i].handlers.input({isComposing:false});
}
assert.equal(nodes.get('completion').open,true);
assert.ok(cells.every(cell=>!/[םןךףץ]/.test(cell.value)),'All confirmed cells use ordinary letter forms');
assert.equal(nodes.get('completion').openCount,1);
assert.match(nodes.get('completion-picture').src,/1e4kVPqLeYMOOTSGkUWdgOjnarJPg1rAf\/preview$/);
console.log('Automatic clue/cube confirmation checks passed; restart button removed.');
console.log('Completion picture popup appears once after both panels are finished.');

// A clue wording update must retain progress from the old content-based key.
const legacyConfig=JSON.parse(JSON.stringify(config));
legacyConfig.clues[3].text='רואים אותו כדי לצאת';
legacyConfig.clues[24].text='עצם';
const legacyKey='cube-crossword:'+JSON.stringify(legacyConfig);
const legacyProgress=JSON.stringify({answers:config.clues.map((c,i)=>i<8?c.answer:''),letters:Array(27).fill(''),clues:[0,1,2,3,4,5,6,7],locked:[],words:0});
storage.clear();storage.set(legacyKey,legacyProgress);
vm.runInContext(fs.readFileSync('assets/js/cube-crossword.js','utf8'),context);
let restored=nodes.get('clues').children.map(row=>row.children[2]);
assert.equal(restored.filter(el=>el.disabled).length,8);
assert.equal(restored[3].value,config.clues[3].answer);
assert.equal(storage.get(legacyKey),legacyProgress);
for(let i=8;i<14;i++){restored[i].value=config.clues[i].answer;restored[i].handlers.input({isComposing:false});}
assert.equal(restored.filter(el=>el.disabled).length,14);
assert.equal(storage.get(legacyKey),legacyProgress,'Existing save remains untouched');
vm.runInContext(fs.readFileSync('assets/js/cube-crossword.js','utf8'),context);
restored=nodes.get('clues').children.map(row=>row.children[2]);
assert.equal(restored.filter(el=>el.disabled).length,14,'New checkpoint survives reload');
assert.equal(config.clues[3].text,'רואים אותו כדי לצאת (ר"ת)');
assert.equal(config.clues[24].text,'עצם ה-');
console.log('New checkpoints and legacy saved progress preservation checks passed.');

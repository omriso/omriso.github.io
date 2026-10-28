const assert=require('node:assert/strict');
const E=require('../assets/js/cube-crossword-engine.js');
const cube=Array.from('אבגדהוזחטיכלמנסעפצקרשתאבגדה');
assert.equal(cube.length,27);
assert.equal(E.lines.length,27);
assert.equal(E.orientations(cube).length,48);
assert.equal(E.orientations(cube,false).length,24);
const data={id:'test',layers:[0,1,2].map(z=>[0,1,2].map(y=>cube.slice(z*9+y*3,z*9+y*3+3).join(''))),clues:E.lines.map(l=>({text:'זהה',answer:l.map(i=>cube[i]).join('')}))};
assert.deepEqual(E.validate(data),cube);
assert.throws(()=>E.validate({...data,clues:[]}));
assert.equal(E.normalize('מֶלֶךְ'),E.normalize('מלכ'));
const clues=[{text:'זהה',answer:'אבג'},{text:'זהה',answer:'דהו'},{text:'אחר',answer:'זחט'}];
assert.equal(E.clueMatches(clues,['דהו','אבג','זחט']).size,3);
assert.equal(E.clueMatches(clues,['אבג','אבג','זחט']).size,2);
assert.equal(E.clueMatches(clues,['זחט','דהו','אבג']).size,1);
for(const variant of E.orientations(cube))assert.equal(E.cubeMatch(E.orientations(cube),variant,new Set()).matched.length,27);
const partial=Array(27).fill('');E.lines[0].forEach(i=>partial[i]=cube[i]);
assert.equal(E.cubeMatch([cube],partial,new Set()).matched.length,1);
const wrong=[...cube];wrong[0]='ת';
assert.equal(E.cubeMatch([cube],wrong,new Set([0])).matched.length,0);
console.log('Cube crossword logic checks passed.');

// Direction-preserving symmetry never reverses a word or moves הבט to the origin row.
const vm=require('node:vm');
const fs=require('node:fs');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('assets/js/cube-crossword-data.js','utf8'),context);
const puzzle=context.window.CUBE_CROSSWORD_DATA;
const realCube=E.validate(puzzle);
assert.equal(puzzle.preserveDirections,true);
const directed=E.orientations(realCube,true,true);
assert.equal(directed.length,6);
const expectedWords=E.lines.map(l=>E.normalize(l.map(i=>realCube[i]).join(''))).sort();
for(const variant of directed){
  assert.deepEqual(E.lines.map(l=>E.normalize(l.map(i=>variant[i]).join(''))).sort(),expectedWords);
  assert.equal(E.cubeMatch(directed,variant,new Set()).matched.length,27);
  assert.notEqual(variant.slice(0,3).join(''),'הבט');
}
const rejected=Array(27).fill('');
Array.from('הבט').forEach((letter,i)=>rejected[i]=letter);
assert.equal(E.cubeMatch(directed,rejected,new Set()).matched.length,0);
const reversed=realCube.map((_,i)=>realCube[Math.floor(i/9)*9+Math.floor(i%9/3)*3+2-i%3]);
assert.ok(E.cubeMatch(directed,reversed,new Set()).matched.length<27);
console.log('Direction-preserving symmetries and rejected top-row הבט checks passed.');

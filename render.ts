import * as jscad from '@jscad/core';
import * as fs from 'fs';
console.log(jscad);

const file = process.argv[2];
import(file).then(({default:shape}) => {
  //console.log(JSON.stringify(shape));
  var outputData = jscad.generateOutput('stlb', shape);
  fs.writeFileSync('target/torus.stl', outputData.asBuffer())
})

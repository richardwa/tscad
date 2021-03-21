#!/usr/bin/env ts-node
/// <reference path="../../types.d.ts" />

import { processPolygons, writeOBJ } from "../util/process-mesh";
import { dualMarch } from "../dual3/dual-march";
import * as path from 'path'

const file = path.join(process.cwd(), process.argv.slice(2)[0]);
console.log(file);
const name = path.basename(file, '.ts');
import(file).then(({ main }) => {
  console.time('render');
  const faces = dualMarch({
    size: 2,
    minSize: 1,
    shape: main,
  });
  console.timeEnd('render');
  const mesh = processPolygons(faces);
  writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name });
});

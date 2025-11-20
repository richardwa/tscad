import { processPolygons } from "../src/util/process-mesh";
import { dualMarch } from "../src/dual3/dual-march";
import { writeOBJ, createFileStream } from "./file-helper";
import * as path from "path";

const file = path.join(process.cwd(), process.argv.slice(2)[0]);
console.log(file);
const name = path.basename(file, ".ts");
import(file).then(({ main }) => {
  console.time("render");
  const faces = dualMarch({
    size: 2,
    minSize: 1,
    shape: main,
  });
  console.timeEnd("render");
  const mesh = processPolygons(faces);
  const os = createFileStream(`${name}.obj`);
  writeOBJ({ faces: mesh.faces, vertices: mesh.vertices }, os);
});

import { processPolygons } from '../src/util/process-mesh'
import { dualMarch } from '../src/dual3/dual-march'
import * as path from 'path'
import * as fs from 'fs'

type WriteObjProps = {
  faces: number[][]
  vertices: number[][]
  name: string
  outDir?: string
}

export function writeOBJ(p: WriteObjProps) {
  const os = fs.createWriteStream(`${p.outDir || './target'}/${p.name}.obj`)
  //write obj file
  for (const pos of p.vertices) {
    os.write('v ' + pos.join(' ') + '\n')
  }
  for (const face of p.faces) {
    os.write('f ' + face.map((i) => i + 1).join(' ') + '\n')
  }
}

const file = path.join(process.cwd(), process.argv.slice(2)[0])
console.log(file)
const name = path.basename(file, '.ts')
import(file).then(({ main }) => {
  console.time('render')
  const faces = dualMarch({
    size: 2,
    minSize: 1,
    shape: main
  })
  console.timeEnd('render')
  const mesh = processPolygons(faces)
  writeOBJ({ faces: mesh.faces, vertices: mesh.vertices, name })
})

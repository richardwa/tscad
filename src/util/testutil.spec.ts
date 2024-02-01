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

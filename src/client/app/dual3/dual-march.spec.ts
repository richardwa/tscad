import { union } from '../csg/boolean'
import { rotate, translate } from '../csg/manipulate'
import { box, sphere } from '../csg/primitives'
import { dualMarch } from './dual-march'
import { processPolygons } from '../util/process-mesh'
import { writeOBJ, createFileStream } from '../../server/file-helper'
import { test } from 'vitest'

test('render using dual march', () => {
  const shape = rotate(
    'y',
    0,
    rotate('z', 0, union({ radius: 3 }, box(20.2), translate([10, 10, 10], sphere(10))))
  )

  console.time('render')
  const faces = dualMarch({
    size: 4,
    shape
  })
  console.timeEnd('render')

  const mesh = processPolygons(faces)
  const os = createFileStream('dual-march.obj')
  writeOBJ({ faces: mesh.faces, vertices: mesh.vertices }, os)
})

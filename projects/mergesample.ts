import { diff, union } from '../src/csg/boolean'
import { extrude, mirror, revolve, tile, tileCircular } from '../src/csg/extrude'
import { rotate, translate } from '../src/csg/manipulate'
import { box, circle, cylinder, poly, rect, sphere } from '../src/csg/primitives'

// all primitives
const sph = sphere(5)
const cube = box(10)

export const main = union({ radius: 1 }, cube, translate([5, 5, 5], sph))
 
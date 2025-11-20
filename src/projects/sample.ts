/* eslint-disable @typescript-eslint/no-unused-vars */
import { diff, union } from '../common/csg/boolean'
import { extrude, mirror, revolve, tile, tileCircular } from '../common/csg/extrude'
import { rotate, translate } from '../common/csg/manipulate'
import { box, circle, cylinder, poly, rect, sphere } from '../common/csg/primitives'

const hex = poly(6, 10)
const hexPlate = extrude(2, hex)
const cyl = cylinder(10, 20)

export const main = hexPlate

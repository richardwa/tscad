/* eslint-disable @typescript-eslint/no-unused-vars */
import { diff, union } from '../src/csg/boolean'
import { extrude, mirror, revolve, tile, tileCircular } from '../src/csg/extrude'
import { rotate, translate } from '../src/csg/manipulate'
import { box, circle, cylinder, poly, rect, sphere } from '../src/csg/primitives'
import { ring } from './utils'

const options = {
  rimDiameter: 68,
  drainDiameter: 37,
  meshSize: 8,
  thickness: 1.2
}
type Option = typeof options
const showerDrain = ({ rimDiameter, drainDiameter, meshSize, thickness: t }: Option) => {
  const ringOuter = ring({
    od: rimDiameter,
    id: rimDiameter - t * 2,
    h: t * 2
  })
  return ringOuter
}

export const main = showerDrain(options)

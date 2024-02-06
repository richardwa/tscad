/* eslint-disable @typescript-eslint/no-unused-vars */
import { diff, union } from '../src/csg/boolean'
import { extrude, mirror, revolve, tile, tileCircular } from '../src/csg/extrude'
import { rotate, translate } from '../src/csg/manipulate'
import { box, circle, cylinder, poly, rect, sphere } from '../src/csg/primitives'

const inf = 1000
type HexTileOptions = {
  hexSize: number
  spacing: number
  thickness: number
  size: Vec2
}
export const hexTile = (p: HexTileOptions) => {
  const { hexSize, spacing, thickness, size } = p
  const hexPlate = extrude(thickness, poly(6, hexSize / Math.sqrt(3) - spacing / 2))
  const height = hexSize * Math.sqrt(3)
  const rows = Math.ceil(size[0] / height / 2) * 2 // want even number
  const cols = Math.ceil(size[1] / hexSize / 2) * 2
  const tileHex = tile({ y: [cols, hexSize], x: [rows, hexSize] }, hexPlate)

  const panel = union(tileHex, translate([height / 2, hexSize / 2, 0], tileHex))

  const result = translate([-(rows / 2) * height, -(cols / 2) * hexSize, 0], panel)

  Object.assign(result, p)
  return result as Shape3 & Vec3 & HexTileOptions
}
type RingOptions = {
  id: number
  od: number
  h: number
}
export const ring = ({ id, od, h }: RingOptions) => {
  const r1 = od / 2
  const r2 = id / 2
  const ret = diff(cylinder(r1, h), cylinder(r2, h + 1))
  return ret
}
 
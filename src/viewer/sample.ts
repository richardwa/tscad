
import { diff, union } from '../csg/boolean';
import { extrude, tile } from '../csg/extrude';
import { rotate, translate } from '../csg/manipulate';
import { box, poly, sphere } from '../csg/primitives';

type HexTileOptions = {
  hexSize: number,
  spacing: number,
  thickness: number
  minWidth: number,
  minHeight: number
}
export const hexTile = ({ hexSize, spacing, thickness, minWidth, minHeight }: HexTileOptions) => {
  const r = hexSize;
  const wireThickness = spacing / 2;
  const radiusOuter = r / Math.cos(30 / 360 * 2 * Math.PI);
  const hexPlate = extrude(thickness, poly(6, radiusOuter - wireThickness));
  const rows = minHeight / (2 * r * Math.sqrt(3));
  const cols = minWidth / (2 * r);
  const tileHex = tile({
    x: [Math.ceil(cols / 2), 2 * r],
    y: [Math.ceil(rows / 2), 2 * r * Math.sqrt(3)]
  }, hexPlate);
  return union(tileHex,
    translate([r, r * Math.sqrt(3), 0], tileHex));
}

export const main = diff(box(100, 100, 2), hexTile({
  hexSize: 8,
  spacing: 3,
  minHeight: 100,
  minWidth: 200,
  thickness: 3
}));
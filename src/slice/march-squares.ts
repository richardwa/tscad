import { boundsToCorners2, getCenter, positiveNumReducer, interpolate, splitSquare, findZeroRecursive } from '../util/math';
import { edgeTable } from './marching-squares-tables';

const marchSquare = (s: Square, fn: Shape2): Line => {
  const results = s.map(fn) as QuadArray<number>;
  const cube_index = results.reduce(positiveNumReducer, 0);
  const edges = edgeTable[cube_index];
  if (edges === undefined || edges.length === 0) {
    return;
  }
  const [[a, b], [c, d]] = edges;
  return [
    findZeroRecursive(s[a], s[b], results[a], results[b], 0.001, fn),
    findZeroRecursive(s[c], s[d], results[c], results[d], 0.001, fn),
  ];
}


const getSquares = (bounds: Bounds2, size: number, minSize: number, fn: Shape2): Square[] => {
  const _process = (square: Square): Square[] => {
    const results = square.map(fn) as OctArray<number>;
    const [p0, p1, p2, p3] = square;
    const maxLen = Math.max(
      p1[0] - p0[0],
      p2[1] - p0[1],
    );

    // Optimization check, if we are far away (wrt cube size) from the surface, no need to divide further
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return [square];
    }

    // split until we are small enough
    if (maxLen > size) {
      return splitSquare(square).flatMap(_process);
    }

    // adaptive cubes - continue split if too much error
    if (maxLen > minSize) {
      const edge_mask = results.reduce(positiveNumReducer, 0);
      const edges = edgeTable[edge_mask];
      if (edges === undefined) {
        // ambiguous case
        return splitSquare(square).flatMap(_process);
      }
      if (edges.length !== 0) {
        const line = marchSquare(square, fn);
        const center = getCenter(...line);
        const error = Math.abs(fn(center));
        if (error > minSize) {
          return splitSquare(square).flatMap(_process);
        }
      }
    }

    return [square];
  }
  return _process(boundsToCorners2(bounds));
}

type Props = {
  layerHeight: number;
  height: number | Pair<number>;
  xybounds?: Bounds2;
  size: number;
  minSize?: number;
  shape: Shape3;
}

export function slice(p: Props): Square3[] {
  const size = p.size;
  const minSize = p.minSize || (p.size / 200);
  console.log('cube size', size);
  const s = 44;
  const bounds = p.xybounds || [[-s, -s], [s, s]];
  const layerHeight = p.layerHeight;
  const halfHeight = (layerHeight / 2) + (layerHeight / 100);
  const bottom = p.height instanceof Array ? p.height[0] : -p.height;
  const top = p.height instanceof Array ? p.height[1] : p.height;

  console.log('layer height', layerHeight);

  const quads: Square3[] = [];
  for (let h = bottom + halfHeight; h < top; h += layerHeight) {
    const shape2 = (v: Vec2) => p.shape([...v, h]);
    const squares = getSquares(bounds, size, minSize, shape2);
    const lines = squares.map(s => marchSquare(s, shape2)).filter(i => i);
    lines.forEach(line => {
      const [p1, p2] = line;
      quads.push([
        [p1[0], p1[1], h - halfHeight],
        [p2[0], p2[1], h - halfHeight],
        [p2[0], p2[1], h + halfHeight],
        [p1[0], p1[1], h + halfHeight]
      ]);
    });
  }
  return quads;
}

import {
  boundsToCorners2,
  getCenter,
  positiveNumReducer,
  interpolate,
  splitSquare,
  findZeroRecursive,
  interpolate2,
  getCenter2
} from '../util/math'
import { SpatialIndex } from '../util/spatial-index'
import { edgeTable } from './marching-squares-tables'

const marchSquare = (s: Square, fn: Shape2): Line[] => {
  const results = s.map(fn) as QuadArray<number>
  const cube_index = results.reduce(positiveNumReducer, 0)
  const edges = edgeTable[cube_index]
  if (edges.length === 0) {
    return []
  }
  const lines: Line[] = []
  const zeros = edges.map(([a, b]) => interpolate2(s[a], s[b], results[a], results[b])) // 0.1, fn));

  if (zeros.length > 2) {
    // saddle case
    const [a, b, c, d] = zeros
    return [
      [a, b],
      [c, d]
    ]
  } else {
    return [[zeros[0], zeros[1]]]
  }
}

const resFn = (n: number) => Math.floor(n / 0.001)
const keyFn = (n: Vec2) => n.map(resFn).join()
const match = (v1: Vec2, v2: Vec2) => Number(v1[0] === v2[0]) + Number(v1[1] === v2[1])

export const getDualSquares = (squares: Square[]): Square[] => {
  const dualMap: Map<string, Square> = new Map()
  const setDual = (corner: Vec2, i: number, center: Vec2) => {
    const key = keyFn(corner)
    let dual = dualMap.get(key)
    if (dual === undefined) {
      dual = [undefined, undefined, undefined, undefined] as unknown as Square
      dualMap.set(key, dual)
    }
    dual[3 - i] = center
  }

  const points = squares
    .flatMap((c) => c)
    .reduce((a, v, i) => {
      a.set(keyFn(v), v)
      return a
    }, new Map<String, Vec2>())

  const spatialIndex = new SpatialIndex(Array.from(points.values()))

  squares.forEach((square) => {
    const center = getCenter2(square[0], square[3])
    const size = Math.abs(square[0][0] - square[1][0])
    spatialIndex.queryCube(center, size).forEach((p) => {
      const matches = square.map((c) => match(c, p))
      const groupMatches = matches.reduce((a, v, i) => {
        if (!a.get(v)) {
          a.set(v, [i])
        } else {
          a.get(v)?.push(i)
        }
        return a
      }, new Map<number, number[]>())
      const pType = Math.max(...Array.from(groupMatches.keys()))
      groupMatches.get(pType)?.forEach((i) => {
        setDual(p, i, center)
      })
    })
  })

  // filter incomplete cubes
  return Array.from(dualMap.values()).filter((dual) =>
    dual.reduce((a, v) => v !== undefined && a, true)
  )
}

const getSquares = (bounds: Bounds2, size: number, minSize: number, fn: Shape2): Square[] => {
  const _process = (square: Square): Square[] => {
    const results = square.map(fn) as OctArray<number>
    const [p0, p1, p2, p3] = square
    const maxLen = Math.max(Math.abs(p1[0] - p0[0]), Math.abs(p2[1] - p0[1]))

    // Optimization check, if we are far away (wrt cube size) from the surface, no need to divide further
    if (Math.min(...results.map(Math.abs)) > maxLen) {
      return [square]
    }

    // split until we are small enough
    if (maxLen > size) {
      return splitSquare(square).flatMap(_process)
    }

    //adaptive cubes - continue split if too much error
    if (maxLen > minSize) {
      const edge_mask = results.reduce(positiveNumReducer, 0)
      const edges = edgeTable[edge_mask]
      if (edges.length > 2) {
        // saddle case
        return splitSquare(square).flatMap(_process)
      }
      if (edges.length !== 0) {
        const lines: Line[] = marchSquare(square, fn)
        const error = Math.max(...lines.map((l) => getCenter2(...l)).map(fn))
        if (error > minSize) {
          return splitSquare(square).flatMap(_process)
        }
      }
    }

    return [square]
  }
  return _process(boundsToCorners2(bounds))
}

type Props = {
  layerHeight: number
  height: number | Pair<number>
  xybounds?: Bounds2
  size: number
  minSize?: number
  shape: Shape3
}

export function slice(p: Props): Square3[] {
  const size = p.size
  const minSize = p.minSize || p.size / 200
  console.log('cube size', size)
  const s = 500
  const bounds = p.xybounds || [
    [-s, -s],
    [s, s]
  ]
  const layerHeight = p.layerHeight
  const halfHeight = layerHeight / 2 + layerHeight / 100
  const bottom = p.height instanceof Array ? p.height[0] : -p.height
  const top = p.height instanceof Array ? p.height[1] : p.height

  console.log('layer height', layerHeight)

  const quads: Square3[] = []
  const count = [0, 0]
  for (let h = bottom + halfHeight; h < top; h += layerHeight) {
    const shape2 = (v: Vec2) => p.shape([...v, h])
    shape2.gl = p.shape.gl
    const squares = getSquares(bounds, size, minSize, shape2)
    count[0] += squares.length
    const duals = getDualSquares(squares)
    count[1] += duals.length
    const lines = duals.flatMap((s) => marchSquare(s, shape2))
    lines.forEach((line) => {
      const [p1, p2] = line
      quads.push([
        [p1[0], p1[1], h - halfHeight],
        [p2[0], p2[1], h - halfHeight],
        [p2[0], p2[1], h + halfHeight],
        [p1[0], p1[1], h + halfHeight]
      ])
    })
  }
  console.log('squares', count[0])
  console.log('duals', count[1])

  return quads
}

import { Triangle } from "./marchingcubes";
import { Vector } from "./math";

function getFaceNormal(t: Triangle) {
  const v1 = new Vector(t[0]).minus(t[1]);
  const v2 = new Vector(t[0]).minus(t[2]);
  return v1.cross(v2.result);
}
const toFixed = (n: number) => n.toFixed(5);
const keyFn = (v: Vec3) => v.map(toFixed).join();

function getEdges(t: Triangle): string[] {
  const [a, b, c] = t.map(keyFn);
  return [[a, b], [b, c], [a, c]].map(k => k.sort().join(' '));
}

type Props = {
  f: Triangle;
  normal: Vec3;
}

function refineMesh(mesh: Triangle[], fn: Shape3, tolerance: number) {
  // build graph
  const vertexCache = new Map<string, Vec3>();
  const triangleMap = new Map<Vec3, Props[]>();
  const edgeNeighbors = new Map<string, Props[]>();

  // unique and copy all vertices
  mesh.forEach(t => {
    const tri = t.map(v => {
      const key = keyFn(v);
      if (!vertexCache.has(key)) {
        vertexCache.set(key, [...v]);
      }
      return vertexCache.get(key);
    }) as Triangle;

    // check triangle validity
    if (tri[0] !== tri[1] && tri[0] != tri[2] && tri[1] !== tri[2]) {
      // get some additional properties we can use later
      const props: Props = {
        f: tri,
        normal: getFaceNormal(tri).toUnitVector().result,
      }

      getEdges(tri).forEach(v => {
        if (edgeNeighbors.has(v)) {
          edgeNeighbors.get(v).push(props);
        } else {
          edgeNeighbors.set(v, [props]);
        }
      });
    }
  });

  const visited = new Set<Props>();
  const queue: Props[] = [];
  const iter = triangleMap[Symbol.iterator]();
  const collapsable: Array<{ normal: Vec3, members: Triangle[] }> = [];
  do {
    const val: Props = queue.length > 0 ? queue.shift() : iter.next().value;
    if (visited.has(val)) {
      continue;
    } else {
      visited.add(val);
    }

    const currentComparing = collapsable[]

    // enque others with similar normals
    val.f.forEach(v => {
      triangleMap.get(v).forEach(p => {
        if (p !== val && new Vector(p.normal).minus(val.normal).magnitude() < 0.01) {
          queue.push(p);
        }
      })
    });






  } while (queue.length > 0 || !iter.next().done);








};


import { cubeVerts, edgeIndex, faceToCorners, faceToEdges } from "./marchingcubes-tables";
import { Vector } from "./math";


class Corner<T, E, V> {
  pos: Vec3;
  data?: V;
  constructor(v: Vec3) {
    this.pos = v;
  }
}

type EdgeSplit = (a: Vec3, b: Vec3) => Vec3;
class Edge<T, E, V> {
  corners: Pair<Corner<T, E, V>>; // always the more negative corner
  cubes: QuadArray<Cube<T, E, V>>; // any edge can have a max of 4 neigboring cubes
  data?: E;
  constructor(corners: Pair<Corner<T, E, V>>) {
    this.corners = corners;
    this.cubes = new Array(4) as QuadArray<Cube<T, E, V>>;
  }

  // child edges are made by cutting parent in half
  children: Pair<Edge<T, E, V>>;

  split(f: EdgeSplit): Pair<Edge<T, E, V>> {
    if (this.children) {
      return this.children;
    } else {
      const middle = f(this.corners[0].pos, this.corners[1].pos);
      const corner = new Corner<T, E, V>(middle);
      this.children = [
        new Edge([this.corners[0], corner]),
        new Edge([corner, this.corners[1]])
      ];
      return this.children;
    }
  }

  getLeafs(): Edge<T, E, V>[] {
    if (this.children) {
      return this.children.flatMap(this.getLeafs);
    } else {
      return [this];
    }
  }
}

export const createCube = <T, E, V>(bounds: [Vec3, Vec3]): Cube<T, E, V> => {
  const [lower, upper] = bounds;
  const vertexPositions = cubeVerts.map(v =>
    v.map((o: number, i: number) =>
      o ? upper[i] : lower[i]) as Vec3);
  const corners = vertexPositions.map(p => new Corner(p)) as OctArray<Corner<T, E, V>>;
  const edges = edgeIndex.map(n =>
    new Edge<T, E, V>([corners[n[0]], corners[n[1]]])) as Array12<Edge<T, E, V>>;
  return new Cube("", edges);
}


export class Cube<T, E, V> {
  edges: Array12<Edge<T, E, V>>;
  name: string;
  data?: T;
  private children?: OctArray<Cube<T, E, V>>;
  constructor(name: string, edges: Array12<Edge<T, E, V>>) {
    this.name = name;
    this.edges = edges;
  }

  /**
   * using corner,edge indexing scheme as done in marching cubes by paul bourke.
   */
  getCorners() {
    const arr: Corner<T, E, V>[] = [];
    for (let i = 0; i < 8; i++) {
      const vedge = 8 + (i % 4);
      arr[i] = this.edges[vedge].corners[Math.floor(i / 4)];
    }
    return arr;
  }
  getCorner(i: number) {
    if (i < 8) {
      const vedge = 8 + (i % 4);
      return this.edges[vedge].corners[Math.floor(i / 4)];
    }
  }

  /**
   * returns the 4 edges of a face 
   */
  getFaceEdges(faceNumber: number): QuadArray<Edge<T, E, V> {
    return faceToEdges[faceNumber].map(n => this.edges[n]) as QuadArray<Edge<T, E, V>>;
  }
  getFaceCorners(faceNumber: number): QuadArray<Corner<T, E, V>> {
    return faceToCorners[faceNumber].map(n => this.getCorner[n]) as QuadArray<Corner<T, E, V>>;
  }


  findCenter(a: Vec3, b: Vec3): Vec3 {
    return new Vector(a).add(b).scale(1 / 2).result;
  }

  split(): OctArray<Cube<T, E, V>> {
    if (this.children) {
      return this.children;
    }
    // setup octant graph

    // split all edges of parent box - this gives us 24 edges (12 x 2). 
    // and 6 new corners (1 at the center of every cut edge)
    //
    // child edges - organized by parent edges
    const ce = this.edges.map(e => e.split(this.findCenter));
    // need 7 more corners (1 at center of each face and 1 for the origin)
    // and 6 more interior edges
    const center = new Corner<T, E, V>(this.findCenter(this.getCorner(0).pos, this.getCorner(6).pos));

    // face edges
    const fe = [[], [], [], [], [], []];

    for (let i = 0; i < 6; i++) {
      const fcorners = this.getFaceCorners(i)
      const faceCenter = new Corner<T, E, V>(this.findCenter(fcorners[0].pos, fcorners[2].pos));
      //connect edge center to face center
      faceToEdges[i].forEach((eindex, j) => {
        const edgeCenter = ce[eindex][0][1];
        if (j <= 1) {
          fe[i].push(new Edge<T, E, V>([edgeCenter, faceCenter]));
        } else {
          fe[i].push(new Edge<T, E, V>([faceCenter, edgeCenter]));
        }
      });

      //conect face center to volume center
      if (i % 2 === 0) {
        fe[i].push(new Edge<T, E, V>([faceCenter, center]))
      } else {
        fe[i].push(new Edge<T, E, V>([center, faceCenter]))
      }
    }
    // all edges are instantiated, now its a matter of tediously 
    // going through the naming scheme to list all edges for all octants
    const children: OctArray<Cube<T, E, V>> = [
      new Cube(`${this.name}0`, [
        ce[0][0], fe[4][0], fe[0][3], ce[3][0],
        fe[2][3], fe[2][4], fe[0][4], fe[0][0],
        ce[8][0], fe[2][0], fe[4][4], fe[0][1]
      ]),
      new Cube(`${this.name}1`, [
        ce[0][1], ce[1][0], fe[4][1], fe[4][0],
        fe[2][1], fe[1][0], fe[1][4], fe[2][4],
        fe[2][0], ce[9][0], fe[1][2], fe[4][4]
      ]),
      new Cube(`${this.name}2`, [
        fe[4][1], ce[1][1], ce[2][1], fe[4][2],
        fe[1][4], fe[1][2], fe[3][1], fe[3][4],
        fe[4][4], fe[1][1], ce[10][0], fe[3][0]
      ]),
      new Cube(`${this.name}3`, [
        fe[4][3], fe[4][2], ce[2][0], ce[3][1],
        fe[0][4], fe[3][0], fe[3][3], fe[0][2],
        fe[0][1], fe[4][4], fe[3][0], ce[11][0]
      ]),
      new Cube(`${this.name}4`, [
        fe[2][3], fe[2][4], fe[0][4], fe[0][0],
        ce[4][0], fe[5][0], fe[5][3], ce[7][0],
        ce[8][1], fe[2][2], fe[5][4], fe[0][3]
      ]),
      new Cube(`${this.name}5`, [
        fe[2][1], fe[1][0], fe[1][4], fe[2][4],
        ce[4][1], ce[5][0], fe[5][1], fe[5][0],
        fe[2][2], ce[9][1], fe[1][3], fe[5][4]
      ]),
      new Cube(`${this.name}6`, [
        fe[1][4], fe[1][2], fe[3][1], fe[3][4],
        fe[5][1], ce[5][1], ce[6][1], fe[5][2],
        fe[5][4], fe[1][3], ce[10][1], fe[3][2]
      ]),
      new Cube(`${this.name}7`, [
        fe[0][4], fe[3][0], fe[3][3], fe[0][2],
        fe[5][3], fe[5][2], ce[6][0], ce[7][1],
        fe[0][3], fe[5][4], fe[3][2], ce[11][1]
      ]),
    ];
    this.children = children;
    return children;
  }

  forEachLeafEdge(f: (e: Edge<T, E, V>) => void) {
    const unvisited: Cube<T, E, V>[] = [this];
    const visited = new Set<Cube<T, E, V>>();
    const visitedEdges = new Set<Edge<T, E, V>>();
    const visitEdge = (e: Edge<T, E, V>) => {
      if (!visitedEdges.has(e)) {
        e.getLeafs().forEach(f);
        visitedEdges.add(e);
      }
    };

    while (unvisited.length > 0) {
      const cube = unvisited.pop();
      if (visited.has(cube)) {
        continue;
      } else {
        visited.add(cube);
      }
      cube.edges.forEach(visitEdge);
      if (cube.children) {
        unvisited.push(...cube.children);
      }
    }
  }
}

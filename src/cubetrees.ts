/// <reference path="../types.d.ts" />

import { cubeVerts, edgeIndex, faceToCorners, faceToEdges } from "./marchingcubes-tables";
import { Vector } from "./math";

export class Corner {
  pos: Vec3
  data?: number;
  // no spatial data is required, but object reference is important
  constructor(a: Vec3) {
    this.pos = a;
  }
}

export class Edge {
  corners: Pair<Corner>; // always the more negative corner
  cubes: Cube[] = []; // any edge can have a max of 4 neigboring cubes
  data?: Vec3;
  constructor(corners: Pair<Corner>) {
    if (!corners[0] || !corners[1]) {
      throw `corners cannot be undefined ${corners}`
    }
    this.corners = corners;
  }
  // child edges are made by cutting parent in half
  children?: Pair<Edge>;
  split(): Pair<Edge> {
    if (this.children) {
      return this.children;
    } else {
      const middle = findCenter(this.corners[0], this.corners[1]);
      this.children = [
        new Edge([this.corners[0], middle]),
        new Edge([middle, this.corners[1]])
      ];
      return this.children;
    }
  }
  getLeafs(): Edge[] {
    if (this.children) {
      return this.children.flatMap(c => c.getLeafs());
    } else {
      return [this];
    }
  }
}

export const createCube = (bounds: [Vec3, Vec3]): Cube => {
  const [lower, upper] = bounds;
  const vertexPositions = cubeVerts.map(v =>
    v.map((o: number, i: number) =>
      o ? upper[i] : lower[i]) as Vec3);
  const corners = vertexPositions.map(p => new Corner(p)) as OctArray<Corner>;
  const edges = edgeIndex.map(n =>
    new Edge([corners[n[0]], corners[n[1]]])) as Array12<Edge>;
  return new Cube("", edges);
}

const findCenter = (a: Corner, b: Corner): Corner => {
  const middle = new Vector(a.pos).add(b.pos).scale(1 / 2).result;
  return new Corner(middle);
}

export class Cube {
  edges: Array12<Edge>;
  name: string;
  data?: Vec3;
  children?: OctArray<Cube>;
  constructor(name: string, edges: Array12<Edge>) {
    this.name = name;
    this.edges = edges;
    for (let e of edges) {
      e.cubes.push(this);
    }
  }

  /**
   * using corner,edge indexing scheme as done in marching cubes by paul bourke.
   */
  getCorners() {
    const arr: Corner[] = [];
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
    } else {
      console.warn(i, 'index out of range');
    }
  }

  /**
   * returns the 4 edges of a face 
   */
  getFaceEdges(faceNumber: number): QuadArray<Edge> {
    return faceToEdges[faceNumber].map(n => this.edges[n]) as QuadArray<Edge>;
  }
  getFaceCorners(faceNumber: number): QuadArray<Corner> {
    return faceToCorners[faceNumber].map(n => this.getCorner(n)) as QuadArray<Corner>;
  }

  split(): OctArray<Cube> {
    if (this.children) {
      return this.children;
    }
    // setup octant graph

    // split all edges of parent box - this gives us 24 edges (12 x 2). 
    // and 6 new corners (1 at the center of every cut edge)
    //
    // child edges - organized by parent edges
    const ce = this.edges.map(e => e.split());
    // need 7 more corners (1 at center of each face and 1 for the origin)
    // and 6 more interior edges
    const center = findCenter(this.getCorner(0), this.getCorner(6));

    // face edges
    const fe: Edge[][] = [[], [], [], [], [], []];

    for (let i = 0; i < 6; i++) {
      const fcorners = this.getFaceCorners(i);
      const faceCenter = findCenter(fcorners[0], fcorners[3]);
      //connect edge center to face center
      faceToEdges[i].forEach((eindex, j) => {
        const edgeCenter: Corner = ce[eindex][0].corners[1];
        if (j <= 1) {
          fe[i].push(new Edge([edgeCenter, faceCenter]));
        } else {
          fe[i].push(new Edge([faceCenter, edgeCenter]));
        }
      });

      //conect face center to volume center
      if (i % 2 === 0) {
        fe[i].push(new Edge([faceCenter, center]))
      } else {
        fe[i].push(new Edge([center, faceCenter]))
      }
    }

    // all edges are instantiated, now its a matter of tediously 
    // going through the naming scheme to list all edges for all octants
    const children: OctArray<Cube> = [
      new Cube(`${this.name}0`, [
        ce[0][0], fe[4][0], fe[0][3], ce[3][0],
        fe[2][3], fe[2][4], fe[0][4], fe[0][0],
        ce[8][0], fe[2][0], fe[4][4], fe[0][1]
      ]),
      new Cube(`${this.name}1`, [
        ce[0][1], ce[1][0], fe[4][1], fe[4][0],
        fe[2][1], fe[1][0], fe[1][4], fe[2][4],
        fe[2][0], ce[9][0], fe[1][1], fe[4][4]
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

  getLeafs(): Cube[] {
    const nextCubes: Cube[] = [this];
    const leafs: Cube[] = [];

    while (nextCubes.length > 0) {
      const cube = nextCubes.pop();
      if (cube.children) {
        nextCubes.push(...cube.children);
      } else {
        leafs.push(cube);
      }
    }

    return leafs;
  }

  getLeafEdges(): Set<Edge> {
    const edges = new Set<Edge>();
    this.getLeafs().forEach(cube => {
      for (let i = 0; i < cube.edges.length; i++) {
        edges.add(cube.edges[i]);
      }
    });
    return edges;
  }
}

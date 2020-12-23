import { epsilon } from "./constants";
import { HashSet } from "./hastset";

export type Vertex = {
  id: Vec3;
  // graph info
  edges?: Set<Edge>;
};

export type Edge = {
  id: [Vertex, Vertex];
  //graph info
  faces?: Set<Face>;
}

export type Face = {
  id: Vertex[];
  edges?: Set<Edge>;
}


const keyFn = (n: number[]) => n.map(n => Math.floor(n / epsilon)).join(' ');

export class MeshBuilder {
  private verts: HashSet<Vertex> = new HashSet(
    v => keyFn(v.id),
    v => {
      v.edges = new Set();
      return v;
    });

  private edges: HashSet<Edge> = new HashSet(
    e => e.id.map(v => v.id)
      .sort().map(keyFn).join(' '),
    e => {
      e.faces = new Set();
      return e;
    });

  private faces: HashSet<Face> = new HashSet(
    f => f.id.map(v => v.id)
      .sort().map(keyFn).join(' '),
    f => {
      f.edges = new Set();
      return f;
    });


  private _removeFace(f: Face) {
    const removed = this.faces.remove(f);
    if (removed) {
      removed.edges.forEach(e => {
        const deleted = e.faces.delete(f);
        if (deleted && e.faces.size === 0) {
          this._removeEdge(e);
        }
      });
    }
  }
  private _removeEdge(e: Edge) {
    const removed = this.edges.remove(e);
    if (removed) {
      removed.faces.forEach(f => {
        this._removeFace(f);
      });
    }
  }
  private _removeVertex(v: Vertex) {
    const removed = this.verts.remove(v);
    if (removed) {
      removed.edges.forEach(e => {
        this._removeEdge(e);
      });
    }
  }

  addTriangle(p: [Vec3, Vec3, Vec3]) {
    // Get and/or initialize
    const verts = p.map(v => this.verts.add({ id: v }));
    const edges = verts.map((v, i) =>
      this.edges.add({ id: [v, verts[(i + 1) % 3]] }));
    const face: Face = this.faces.add({ id: verts });

    // set graph info
    edges.forEach(e => {
      e.faces.add(face);
      face.edges.add(e);
    });
    verts.forEach((v, i) => {
      v.edges.add(edges[i]);
    });
    this.faces.add(face);
  }

  // public methods
  removeTriangle(p: [Vec3, Vec3, Vec3]) {
    // Get referenced objects 
    const f: Face = this.faces.get({ id: [{ id: p[0] }, { id: p[1] }, { id: p[2] }] });
    this._removeFace(f);
  }

  removeEdge(p: [Vec3, Vec3]) {
    const verts = this.edges.get({ id: [{ id: p[0] }, { id: p[1] }] });
    this._removeEdge(verts);
  }

  removeVertex(p: Vec3) {
    const vert = this.verts.get({ id: p });
    this._removeVertex(vert);
  }

  // reference attached getters
  getFaces() {
    return Array.from(this.faces.map.values());
  }
  getEdges() {
    return Array.from(this.edges.map.values());
  }
  getVertices() {
    return Array.from(this.verts.map.values());
  }


  // methods for printing internal data
  viewVertices(): Vec3[] {
    return Array.from(this.verts.map, ([k, v]) => v.id);
  }

  viewEdges(): [Vec3, Vec3][] {
    return Array.from(this.edges.map, ([k, e]) => [e.id[0].id, e.id[1].id]);
  }

  viewFaces(): Vec3[][] {
    return Array.from(this.faces.map, ([k, f]) => f.id.map(v => v.id));
  }
}
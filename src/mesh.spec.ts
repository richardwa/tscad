/// <reference path="./types.d.ts" />

import { epsilon } from "./constants";
import { MeshBuilder } from "./mesh";

const mesh = new MeshBuilder();
const p1 = () => [0, 0, 0] as Vec3;
const p2 = () => [0, 0, 1] as Vec3;
const p2_1 = () => [0, 0, 1 + (epsilon / 10)] as Vec3;
const p3 = () => [0, 1, 0] as Vec3;
const p4 = () => [1, 1, 1] as Vec3;

mesh.addTriangle([p4(), p2_1(), p1()]);
mesh.addTriangle([p1(), p2(), p3()]);
mesh.addTriangle([p1(), p4(), p3()]);
mesh.addTriangle([p2(), p4(), p3()]);

console.log("verts", mesh.viewVertices());
console.log("edges", mesh.viewEdges());
console.log("faces", mesh.viewFaces());

mesh.removeTriangle([p1(), p2(), p3()]);
console.log("verts", mesh.viewVertices());
console.log("edges", mesh.viewEdges());
console.log("faces", mesh.viewFaces());

mesh.removeTriangle([p4(), p2(), p3()]);
console.log("verts", mesh.viewVertices());
console.log("edges", mesh.viewEdges());
console.log("faces", mesh.viewFaces());

mesh.removeTriangle([p1(), p4(), p3()]);
console.log("verts", mesh.viewVertices());
console.log("edges", mesh.viewEdges());
console.log("faces", mesh.viewFaces());
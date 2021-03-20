export declare class Vector<T extends number[]> {
    result: T;
    constructor(v: T);
    minus(v: T): this;
    dot(v: T): number;
    add(v: T): this;
    scale(s: number): this;
    cross2d(v: Vec2): number;
    cross(v: Vec3): this;
    toUnitVector(): this;
    magnitude(): number;
}
export declare function getSurfaceNormal(p: Vec3, fn: Shape3): Vector<Vec3>;
export declare function clamp(x: number, a: number, b: number): number;
export declare function mix(a: number, b: number, s: number): number;
export declare const getHex: (n: number) => string;
export declare const positiveNumReducer: (a: number, v: number, i: number) => number;
export declare const boundsToCorners: ([[a, b, c], [x, y, z]]: Bounds) => [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3];
export declare const boundsToCorners2: ([[a, b], [x, y]]: Bounds2) => QuadArray<Vec2>;
export declare const getCentroid: (t: Vec3[]) => Vec3;
export declare const getCenter: <T extends Vec2 | Vec3>(p1: T, p2: T) => T;
export declare const splitCube: (cube: [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3]) => Cube[];
export declare const splitSquare: (square: QuadArray<Vec2>) => Square[];
export declare const interpolate: <T extends Vec2 | Vec3>(p1: T, p2: T, e1: number, e2: number) => T;
export declare const findZeroRecursive: <T extends Vec2 | Vec3>(p1: T, p2: T, e1: number, e2: number, threshold: number, fn: (t: T) => number) => T;

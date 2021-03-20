import * as ubilabs from 'kd-tree-javascript';
export declare class SpatialIndex<T extends Vec2 | Vec3> {
    kdtree: ubilabs.kdTree<T>;
    constructor(points: T[]);
    queryCube(center: T, size: number): T[];
}

declare type WriteObjProps = {
    faces: number[][];
    vertices: number[][];
    name: string;
    outDir?: string;
};
export declare function writeOBJ(p: WriteObjProps): void;
export declare function processPolygons(polygons: Vec3[][]): {
    vertices: Vec3[];
    faces: number[][];
};
export {};

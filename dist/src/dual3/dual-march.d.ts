export declare const getDualCubes: (cubes: Cube[]) => Cube[];
declare type Props = {
    size: number;
    minSize?: number;
    shape: Shape3;
    bounds?: Bounds;
};
export declare function dualMarch(p: Props): Triangle[];
export {};

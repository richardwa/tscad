export declare function extrude(height: number, s: Shape2): Shape3;
export declare function revolve(axis: Axis, offset: number, s: Shape2): Shape3;
export declare function mirror(plane: Plane, s: Shape3): Shape3;
declare type TileParams = {
    [a in Axis]?: [times: number, width: number];
};
export declare function tile(o: TileParams, s: Shape3): Shape3;
export {};

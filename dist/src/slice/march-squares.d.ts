export declare const getDualSquares: (squares: Square[]) => Square[];
declare type Props = {
    layerHeight: number;
    height: number | Pair<number>;
    xybounds?: Bounds2;
    size: number;
    minSize?: number;
    shape: Shape3;
};
export declare function slice(p: Props): Square3[];
export {};

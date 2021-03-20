declare type OpParams = {
    radius: number;
};
export declare const union: (a: OpParams | Shape3, ...s: Shape3[]) => GLShape<(p: Vec3) => number>;
export declare const diff: (a: OpParams | Shape3, ...s: Shape3[]) => GLShape<(p: Vec3) => number>;
export declare const intersect: (a: OpParams | Shape3, ...s: Shape3[]) => GLShape<(p: Vec3) => number>;
export {};

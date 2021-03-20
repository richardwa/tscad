import { ShaderSrc } from "../viewer/gl-util";
export declare const f: (n: number) => string;
export declare const v3: (p: Vec3) => string;
export declare const addFunc: (type: string, args: string, def: string, deps: GLNode[]) => GLNode;
export declare const wrap: (fn: (p: Vec3) => number, type: string, args: string, def: string, deps: GLNode[]) => Shape3;
export declare const getShaderSrc: (n: GLNode) => ShaderSrc;

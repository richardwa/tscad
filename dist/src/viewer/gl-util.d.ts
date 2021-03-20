export declare const initialState: {
    iResolution: Vec3;
    cameraPos: Vec3;
    cameraDir: Vec3;
    cameraTop: Vec3;
    zoom: number;
};
export declare type State = typeof initialState;
export declare type ShaderSrc = {
    entry: string;
    funcs: string[];
};
export declare const fragmentShaderSrc: ({ entry, funcs }: ShaderSrc) => string;
export declare const vertexShaderSrc = "\n\t// vertex shader's code goes here\n  attribute vec2 position;\n  void main() {\n    gl_Position = vec4(position, 0.0, 1.0);  \n  } \n";
export declare const setupWebGL: (canvas: HTMLCanvasElement, src: ShaderSrc) => (state: State) => void;

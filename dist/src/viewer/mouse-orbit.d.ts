export declare type ClickAndDragCB = {
    current: Vec2;
    startPos: Vec2;
    end: boolean;
    leftClick: boolean;
};
export declare const registerClickAndDrag: (el: HTMLElement, cb: (p: ClickAndDragCB) => void) => void;
export declare const registerScrollWheel: (el: HTMLElement, cb: (zoom: number) => void) => void;
export declare type SphericalSystem = {
    pos: Vec3;
    origin: Vec3;
};
export declare type CartesianSystem = {
    cameraPos: Vec3;
    cameraDir?: Vec3;
    cameraTop?: Vec3;
};
export declare const sphericalToCartesion: ({ pos: [radius, theta, _phi], origin }: SphericalSystem) => CartesianSystem;

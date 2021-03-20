export declare function circle(r?: number): Shape2;
export declare function sphere(r?: number): Shape3;
export declare function cylinder(radius?: number, height?: number): Shape3;
export declare function rect(x?: number, y?: number): Shape2;
/**
 * @param points specify number of corners for a regular polygon.  Can also use an abitrary array of points
 * @param radius not required when using list of points
 */
export declare function poly(points: number | Vec2[], radius?: number): Shape2;
export declare function box(x?: number, y?: number, z?: number): Shape3;

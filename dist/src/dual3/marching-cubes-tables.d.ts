/**
 * Marching Cubes lookup data from http://paulbourke.net/geometry/polygonise/
 *
 * paul has a different corner indexing convention, his original data needs to be transformed to my c
 */
export declare const edges: Array12<Vec2>;
/**
 * for convertion flip position 3 and 2,  flip 6 and 7
 */
export declare const edgeTable: Uint32Array;
/**
* index = 8 bits which indicate positive or negative implicit function value at each corner
* return triplet[] which indicates sides of the cube involved in triangle
*/
export declare const bourkeTriTable: number[][];
/**
 * for convertion flip position 3 and 2,  flip 6 and 7
 */
export declare const triTable: number[][];

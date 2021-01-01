type Pair<T> = [T, T];
type TriArray<T> = [T, T, T];
type QuadArray<T> = [T, T, T, T];
type HexArray<T> = [T, T, ...QuadArray<T>];
type OctArray<T> = [...QuadArray<T>, ...QuadArray<T>];
type Array12<T> = [...HexArray<T>, ...HexArray<T>];

type Vec2 = [number, number];
type Vec3 = [number, number, number];

type Shape2 = (p: Vec2) => number;
type Shape3 = (p: Vec3) => number;

type Axis = 'x' | 'y' | 'z';
type Plane = 'xy' | 'xz' | 'yz';

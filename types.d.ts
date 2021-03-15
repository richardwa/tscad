type Pair<T> = [T, T];
type TriArray<T> = [T, T, T];
type QuadArray<T> = [T, T, T, T];
type HexArray<T> = [T, T, ...QuadArray<T>];
type OctArray<T> = [...QuadArray<T>, ...QuadArray<T>];
type Array12<T> = [...HexArray<T>, ...HexArray<T>];

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Bounds = [Vec3, Vec3];
type Bounds2 = [Vec2, Vec2];
type Cube = OctArray<Vec3>;
type Square = QuadArray<Vec2>;
type Square3 = QuadArray<Vec3>;
type Triangle = TriArray<Vec3>;
type Line = Pair<Vec2>;

type Shape2 = (p: Vec2) => number;
type Shape3 = (p: Vec3) => number;

type Axis = 'x' | 'y' | 'z';
type Plane = 'xy' | 'xz' | 'yz';


type Vec2 = [number, number];
type Vec3 = [number, number, number];

type Shape2 = (p: Vec2) => number;
type Shape3 = (p: Vec3) => number;

type Axis = 'x' | 'y' | 'z';
type Plane = 'xy' | 'xz' | 'yz';
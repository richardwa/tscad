
// used for format floats suchs that 1 will show as 1.0
export const f = (n: number) => n.toLocaleString(null, {
  minimumFractionDigits: 1,
  useGrouping: false
});

export const glFunctions = new Map<string, string>();
export const addFunc = (type: string, args: string, def: string) => {
  const name = `fn${glFunctions.size}`;
  glFunctions.set(`${type} ${name}`, def);
  return name;
}

export const wrap = (f: (p: Vec3) => number, gl: string): Shape3 => {
  (f as any).gl = gl;
  return f as Shape3;
}
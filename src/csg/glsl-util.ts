
// used for format floats suchs that 1 will show as 1.0
export const f = (n: number) => n.toLocaleString(null, {
  minimumFractionDigits: 1,
  useGrouping: false
});

export const glFunctions = new Map<string, { name: string, src: string }>();
export const addFunc = (type: string, args: string, def: string) => {
  const key = `${type} ${args} ${def}`;
  if (!glFunctions.has(key)) {
    const name = `fn${glFunctions.size}`;
    const src = `${type} ${name}(${args}){\n${def}\n}`;
    glFunctions.set(key, { name, src });
    return name;
  }
  return glFunctions.get(key).name;
}

export const v = (p: Vec3) => `vec3(${f(p[0])},${f(p[1])},${f(p[2])})`;

export const wrap = (fn: (p: Vec3) => number, gl: string): Shape3 => {
  (fn as any).gl = gl;
  return fn as Shape3;
}
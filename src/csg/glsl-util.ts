import { type ShaderSrc } from '@/util/gl-util'

// used for format floats suchs that 1 will show as 1.0
export const f = (n: number) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    useGrouping: false
  })
export const v3 = (p: Vec3) => `vec3(${f(p[0])},${f(p[1])},${f(p[2])})`

let count = 0
export const addFunc = (type: string, args: string, def: string, deps: GLNode[]): GLNode => {
  const name = `fn${count++}`
  const body = deps.reduce((a, v, i) => a.replace(new RegExp('\\$' + (i + 1), 'g'), v.name), def)
  const formated = body
    .split('\n')
    .map((s) => '  ' + s)
    .join('\n')
  const src = `${type} ${name}(${args}){\n${formated}\n}`
  return { name, src, deps }
}

export const wrap = (
  fn: (p: Vec3) => number,
  type: string,
  args: string,
  def: string,
  deps: GLNode[]
): Shape3 => {
  const fns = fn as Shape3
  fns.gl = addFunc(type, args, def, deps)
  return fns
}

const walkSrc = (n: GLNode): string[] => [...n.deps.flatMap(walkSrc), n.src]

export const getShaderSrc = (n: GLNode): ShaderSrc => {
  const funcs = Array.from(new Set(walkSrc(n)))
  return {
    entry: n.name,
    funcs
  }
}

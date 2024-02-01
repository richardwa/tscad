export class HashMap<K, V> {
  keyfn: (k: K) => string
  map: Map<string, [K, V]>

  constructor(keyfn: (k: K) => string) {
    this.keyfn = keyfn
    this.map = new Map()
  }
  clear(): void {
    this.map.clear()
  }
  delete(key: K): boolean {
    const res = this.map.delete(this.keyfn(key))
    return res
  }
  get(key: K): V {
    const val = this.map.get(this.keyfn(key))
    if (val) {
      return val[1]
    }
    return undefined
  }
  has(key: K): boolean {
    return this.map.has(this.keyfn(key))
  }
  set(key: K, value: V): this {
    this.map.set(this.keyfn(key), [key, value])
    return this
  }
}

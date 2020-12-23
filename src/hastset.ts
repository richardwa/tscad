

export class HashSet<T> {
  map: Map<string, T> = new Map();
  keyFn: (t: T) => string;
  initFn: (t: T) => T;
  constructor(keyFn: (t: T) => string, initFunc: (t: T) => T) {
    this.keyFn = keyFn;
    this.initFn = initFunc;
  }
  // sets the object if it doesn't exits
  add = (t: T, key?: string): T => {
    if (!key){
      key = this.keyFn(t);
    }
    if (this.map.has(key)) {
      return this.map.get(key);
    } else {
      this.map.set(key, this.initFn(t));
      return t;
    }
  }
  remove = (t: T): T => {
    const key = this.keyFn(t);
    const o = this.map.get(key);
    this.map.delete(key);
    return o;
  }
  has = (t: T): boolean => {
    return this.map.has(this.keyFn(t));
  }
  get = (t: T): T => {
    return this.map.get(this.keyFn(t));
  }

}
export class Signal<T> {
  val: T;
  old?: T;
  subscribers: Set<() => void>;
  constructor(initial: T) {
    this.val = initial;
    this.subscribers = new Set();
  }
  set(newVal: T) {
    if (newVal === this.val) return;
    this.old = this.val;
    this.val = newVal;
    this.subscribers.forEach((fn) => fn());
  }

  get() {
    return this.val;
  }

  prev() {
    return this.old;
  }

  on(fn: () => void, now = false) {
    this.subscribers.add(fn);
    if (now) fn();
    // allow caller a handle on unregister
    return () => this.subscribers.delete(fn);
  }
}

export function signal<T>(): Signal<T | undefined>;
export function signal<T>(v: T): Signal<T>;
export function signal<T>(v?: T) {
  return new Signal(v);
}

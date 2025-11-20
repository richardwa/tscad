import { Signal } from "./signal";
const debug = (...msg: any[]) => {
  // @ts-ignore
  if (import.meta.env.DEV) {
    console.debug(RNode.name, ...msg);
  }
};
export class RNode {
  el: HTMLElement;
  childrenSet: Set<RNode | string>;
  unmountListeners: Array<() => void>;
  memoMap?: Map<string | number, RNode | string>;

  constructor(tag: string) {
    this.el = document.createElement(tag);
    this.childrenSet = new Set();
    this.unmountListeners = [];
  }

  unmount() {
    this.el.remove();
    debug("unmounted");
    this.childrenSet.forEach((r) => {
      if (typeof r !== "string") r.unmount();
    });
    this.unmountListeners.forEach((fn) => fn());
  }

  onUnmount(fn: () => void) {
    this.unmountListeners.push(fn);
    return this;
  }

  attr(key: string, val?: string | null) {
    const element = this.el;
    if (key == null) {
      while (element.attributes.length > 0) {
        element.removeAttribute(element.attributes[0].name);
      }
    } else if (val === null) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, val ?? "");
    }
    return this;
  }

  cn(name: string, add = true) {
    if (add) {
      this.el.classList.add(name);
    } else {
      this.el.classList.remove(name);
    }
    return this;
  }

  css(name: string, ...values: any) {
    // @ts-ignore
    this.el.style[name] = values ? values.join(" ") : "";
    return this;
  }

  on(event: string, fn: (event: any) => void) {
    const element = this.el;
    if (event == null) {
      // true keeps children, false removes them
      const cleanElement = element.cloneNode(true);
      element.replaceWith(cleanElement);
    } else {
      this.el.addEventListener(event, fn);
    }
    return this;
  }

  watch(
    signals: Signal<unknown> | Signal<unknown>[],
    fn: (n: RNode) => void,
    now = true,
  ) {
    const register = (signal: Signal<unknown>) => {
      const clear = signal.on(() => fn(this), now);
      this.unmountListeners.push(clear);
    };
    if (Array.isArray(signals)) {
      signals.forEach(register);
    } else {
      register(signals);
    }
    return this;
  }

  do(fn: (node: RNode) => void) {
    fn(this);
    return this;
  }

  memo(key: string | number, fn: () => RNode | string) {
    const localMemoMap = this.memoMap ?? new Map();
    if (this.memoMap === undefined) {
      this.memoMap = localMemoMap;
    }
    const val = localMemoMap.get(key);
    if (val) {
      debug("cache hit", key);
      return val;
    }
    debug("cache miss", key);
    const newVal = fn();
    if (newVal instanceof RNode) {
      newVal.onUnmount(() => {
        localMemoMap.delete(key);
      });
    }
    localMemoMap.set(key, newVal);
    return newVal;
  }

  inner(...newChildren: Array<RNode | string>) {
    const newChildElements = newChildren.map((r) =>
      typeof r === "string" ? r : r.el,
    );
    this.el.replaceChildren(...newChildElements);
    const newChildrenSet = new Set(newChildren);
    this.childrenSet.forEach((child) => {
      if (!newChildrenSet.has(child) && typeof child !== "string") {
        child.unmount();
      }
    });
    this.childrenSet = newChildrenSet;
    return this;
  }
}

export const h = (tag: string) => new RNode(tag);

export const render = (
  element: HTMLElement | null,
  ...nodes: Array<RNode | string>
) => {
  if (!element) throw "missing root element";

  const elements = nodes.map((r) => (typeof r === "string" ? r : r.el));
  element.replaceChildren(...elements);
};

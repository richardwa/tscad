import { Vector } from "../util/math";

export type ClickAndDragCB = {
  current: Vec2;
  startPos: Vec2;
  end: boolean;
}
export const registerClickAndDrag = (el: HTMLElement, cb: (p: ClickAndDragCB) => void) => {
  let mouseListen = false;
  let startPos: Vec2 = [null, null];

  const start = (e: MouseEvent) => {
    mouseListen = true;
    startPos = [e.clientX, e.clientY];
  }
  const stop = (e: MouseEvent) => {
    mouseListen = false
    const current: Vec2 = [e.clientX, e.clientY];
    cb({ current, startPos, end: true });
  }
  const moving = (e: MouseEvent) => {
    if (mouseListen) {
      const current: Vec2 = [e.clientX, e.clientY];
      cb({ current, startPos, end: false });
    }
  }

  el.addEventListener('mousedown', start);
  el.addEventListener('mouseup', stop);
  el.addEventListener('mouseout', stop);
  el.addEventListener('mousemove', moving);
}

export const registerScrollWheel = (el: HTMLElement, cb: (zoom: number) => void) => {
  el.addEventListener('wheel', (e => {
    cb(e.deltaY);
  }));
}

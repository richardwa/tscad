import { clamp, Vector } from "../util/math";
import * as _ from 'lodash';

export type ClickAndDragCB = {
  current: Vec2;
  startPos: Vec2;
  end: boolean;
  leftClick: boolean;
}
export const registerClickAndDrag = (el: HTMLElement, cb: (p: ClickAndDragCB) => void) => {
  let mouseListen = false;
  let startPos: Vec2 = [null, null];
  let leftClick: boolean = null;

  const start = (e: MouseEvent) => {
    mouseListen = true;
    startPos = [e.clientX, e.clientY];
    leftClick = e.button === 0;
  }
  const stop = (e: MouseEvent) => {
    if (mouseListen) {
      mouseListen = false
      const current: Vec2 = [e.clientX, e.clientY];
      cb({ current, startPos, end: true, leftClick });
      leftClick = null
    }
  }
  const moving = (e: MouseEvent) => {
    if (mouseListen) {
      const current: Vec2 = [e.clientX, e.clientY];
      cb({ current, startPos, end: false, leftClick });
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

export type SphericalSystem = {
  pos: Vec3, //[r,theta,phi]
  origin: Vec3,  //
}
export type CartesianSystem = {
  cameraPos: Vec3,
  cameraDir?: Vec3, // undefined when camera is at origin
  cameraTop?: Vec3 // undefined when camera is facing up/down exacltly
}
export const sphericalToCartesion = ({ pos: [radius, theta, _phi], origin }: SphericalSystem): CartesianSystem => {
  if (Math.abs(radius) < 0.01) {
    return {
      cameraPos: origin
    }
  }
  const phi = clamp(_phi, -Math.PI + .01, Math.PI - .01);

  const xzRadius = radius * Math.cos(phi);

  const cameraPos: Vec3 = [
    xzRadius * Math.sin(theta) + origin[0],
    radius * Math.sin(phi) + origin[2],
    xzRadius * Math.cos(theta) + origin[1],
  ];
  const cameraDir = new Vector(origin).minus(cameraPos).toUnitVector().result as Vec3;

  const up: Vec3 = [0, 0, 1];

  const cameraTop = new Vector(cameraDir).cross(up).cross(cameraDir).toUnitVector().result;

  return {
    cameraPos,
    cameraDir,
    cameraTop
  };
};

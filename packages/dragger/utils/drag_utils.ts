import { IPoint, DragEventData } from "../models";

export function getCurrentTouches(
  originalEvent: TouchEvent | MouseEvent,
  touches: TouchList | Array<MouseEvent>,
  prevTouch: DragEventData | null,
  initialTouch: DragEventData | null
): DragEventData {
  const firstTouch = initialTouch;

  const pointer = new Pointer(touches[0]);

  let deltaX = 0;
  let deltaY = 0;
  let delta = 0;
  let distance = 0;
  let angleDeg = 0;
  if (prevTouch) {
    delta = getDistance(pointer, prevTouch);
    deltaX = pointer.x - prevTouch.x;
    deltaY = pointer.y - prevTouch.y;
  }
  if (firstTouch && prevTouch) {
    distance = getDistance(pointer, firstTouch);
    angleDeg = getAngleDeg(pointer, prevTouch);
  }

  return {
    preventDefault: originalEvent.preventDefault,
    stopPropagation: originalEvent.stopPropagation,
    pointers: [pointer],
    ...pointer,
    deltaX,
    deltaY,
    delta,
    distance,
    angleDeg,
  };
}

export function getPinchDistance(pointA: Pointer, pointB: Pointer) {
  // Return the distance between the two points
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export function calcMidPoint(pointA: Pointer, pointB: Pointer) {
  return {
    x: (pointB.x - pointA.x) * 0.5,
    y: (pointB.y - pointA.y) * 0.5,
  };
}

export const getDistance = (p1: Pointer, p2: Pointer) => {
  const powX = (p1.x - p2.x) ** 2;
  const powY = (p1.y - p2.y) ** 2;

  return Math.sqrt(powX + powY);
};

export const getAngleDeg = (p1: Pointer, p2: Pointer) => {
  return (Math.atan2(p1.y - p2.y, p1.x - p2.x) * 180) / Math.PI;
};

export class Pointer implements IPoint {
  x: number;
  y: number;

  constructor(touch: Touch | MouseEvent) {
    this.x = touch.clientX;
    this.y = touch.clientY;
  }
}

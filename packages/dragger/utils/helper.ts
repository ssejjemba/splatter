import React, { ReactElement } from "react";
import { Dimension } from "../models";

// React.addons.cloneWithProps look-alike that merges style & className.
export function cloneElement(
  element: ReactElement<any, string>,
  props: any
): React.ReactElement<any, any> {
  if (props.style && element.props.style) {
    props.style = { ...element.props.style, ...props.style };
  }
  if (props.className && element.props.className) {
    props.className = `${element.props.className} ${props.className}`;
  }
  return React.cloneElement(element, props);
}

export const clamp = (n: number, min: number, max: number) =>
  Math.max(Math.min(n, max), min);

export const snap = (n: number, size: number) => Math.round(n / size) * size;

export const hasDirection = (dir: string, target: string) =>
  new RegExp(dir, "i").test(target);

export const findClosestSnap = (
  n: number,
  snapArray: number[],
  snapGap: number = 0
): number => {
  const closestGapIndex = snapArray.reduce(
    (prev, curr, index) =>
      Math.abs(curr - n) < Math.abs(snapArray[prev] - n) ? index : prev,
    0
  );
  const gap = Math.abs(snapArray[closestGapIndex] - n);

  return snapGap === 0 || gap < snapGap ? snapArray[closestGapIndex] : n;
};

export const endsWith = (str: string, searchStr: string) =>
  str.substring(str.length - searchStr.length) === searchStr;

export const getStringSize = (n: string | number | null | undefined) => {
  if (n === null || n === undefined) {
    return 0;
  }

  n = n.toString();
  if (n === "auto") {
    return n;
  }
  if (endsWith(n, "px")) {
    return n;
  }
  if (endsWith(n, "%")) {
    return n;
  }
  if (endsWith(n, "vh")) {
    return n;
  }
  if (endsWith(n, "vw")) {
    return n;
  }
  if (endsWith(n, "vmax")) {
    return n;
  }
  if (endsWith(n, "vmin")) {
    return n;
  }
  return `${n}px`;
};

export const getPixelSize = (
  size: undefined | string | number,
  parentSize: number,
  innerWidth: number,
  innerHeight: number
) => {
  if (size && typeof size === "string") {
    if (size.endsWith("px")) {
      return Number(size.replace("px", ""));
    }
    if (size.endsWith("%")) {
      const ratio = Number(size.replace("%", "")) / 100;
      return parentSize * ratio;
    }
    if (size.endsWith("vw")) {
      const ratio = Number(size.replace("vw", "")) / 100;
      return innerWidth * ratio;
    }
    if (size.endsWith("vh")) {
      const ratio = Number(size.replace("vh", "")) / 100;
      return innerHeight * ratio;
    }
  }
  return size;
};

export const calculateNewMax = (
  parentSize: { width: number; height: number },
  innerWidth: number,
  innerHeight: number,
  maxWidth?: string | number,
  maxHeight?: string | number,
  minWidth?: string | number,
  minHeight?: string | number
) => {
  const _maxWidth = getPixelSize(
    maxWidth,
    parentSize.width,
    innerWidth,
    innerHeight
  );
  const _maxHeight = getPixelSize(
    maxHeight,
    parentSize.height,
    innerWidth,
    innerHeight
  );
  const _minWidth = getPixelSize(
    minWidth,
    parentSize.width,
    innerWidth,
    innerHeight
  );
  const _minHeight = getPixelSize(
    minHeight,
    parentSize.height,
    innerWidth,
    innerHeight
  );
  return {
    maxWidth: typeof _maxWidth === "undefined" ? undefined : Number(_maxWidth),
    maxHeight:
      typeof _maxHeight === "undefined" ? undefined : Number(_maxHeight),
    minWidth: typeof _minWidth === "undefined" ? undefined : Number(_minWidth),
    minHeight:
      typeof _minHeight === "undefined" ? undefined : Number(_minHeight),
  };
};

export const isTouchEvent = (
  event: MouseEvent | TouchEvent
): event is TouchEvent => {
  return Boolean(
    (event as TouchEvent).touches && (event as TouchEvent).touches.length
  );
};

export const isMouseEvent = (
  event: MouseEvent | TouchEvent
): event is MouseEvent => {
  return Boolean(
    ((event as MouseEvent).clientX || (event as MouseEvent).clientX === 0) &&
      ((event as MouseEvent).clientY || (event as MouseEvent).clientY === 0)
  );
};

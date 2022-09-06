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
  snapArray: Array<number>,
  snapGap: number
) => {
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

export const getStringSize = (n: string | null | undefined) => {
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

const getPixelSize = (size: string | null | undefined, parentSize: number) => {
  if (size && typeof size === "string") {
    if (endsWith(size, "%")) {
      const ratio = Number(size.replace("%", "")) / 100;
      return parentSize * ratio;
    } else if (endsWith(size, "vw")) {
      const ratio = Number(size.replace("vw", "")) / 100;
      return window.innerWidth * ratio;
    } else if (endsWith(size, "vh")) {
      const ratio = Number(size.replace("vh", "")) / 100;
      return window.innerHeight * ratio;
    }
  }
  return size;
};

export const calculateNewMax = (
  parentSize: Dimension,
  maxWidth: string,
  maxHeight: string,
  minWidth: string,
  minHeight: string
) => {
  const _maxWidth = getPixelSize(maxWidth, parentSize.width);
  const _maxHeight = getPixelSize(maxHeight, parentSize.height);
  const _minWidth = getPixelSize(minWidth, parentSize.width);
  const _minHeight = getPixelSize(minHeight, parentSize.height);
  return {
    maxWidth: typeof _maxWidth === "undefined" ? undefined : Number(_maxWidth),
    maxHeight:
      typeof _maxHeight === "undefined" ? undefined : Number(_maxHeight),
    minWidth: typeof _minWidth === "undefined" ? undefined : Number(_minWidth),
    minHeight:
      typeof _minHeight === "undefined" ? undefined : Number(_minHeight),
  };
};

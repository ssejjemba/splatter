import { Dimension, Direction } from ".";

export interface IResizableProps {
  as?: string | React.ComponentType<any>;
  style?: React.CSSProperties;
  className?: string;
  grid?: [number, number];
  snap?: {
    x?: number[];
    y?: number[];
  };
  snapGap?: number;
  bounds?: "parent" | "window" | HTMLElement;
  boundsByDirection?: boolean;
  size?: Dimension;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  lockAspectRatio?: boolean | number;
  lockAspectRatioExtraWidth?: number;
  lockAspectRatioExtraHeight?: number;
  enable?: Enable;
  handleStyles?: HandleStyles;
  handleClasses?: HandleClassName;
  handleWrapperStyle?: React.CSSProperties;
  handleWrapperClass?: string;
  handleComponent?: HandleComponent;
  children?: React.ReactNode;
  onResizeStart?: ResizeStartCallback;
  onResize?: ResizeCallback;
  onResizeStop?: ResizeCallback;
  defaultSize?: Dimension;
  scale?: number;
  resizeRatio?: number;
}

export type ResizeCallback = (
  event: MouseEvent | TouchEvent,
  direction: Direction,
  elementRef: HTMLElement,
  delta: Dimension
) => void;

export type ResizeStartCallback = (
  e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
  dir: Direction,
  elementRef: HTMLElement
) => void | boolean;

export interface Enable {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
}

export interface HandleStyles {
  top?: React.CSSProperties;
  right?: React.CSSProperties;
  bottom?: React.CSSProperties;
  left?: React.CSSProperties;
  topRight?: React.CSSProperties;
  bottomRight?: React.CSSProperties;
  bottomLeft?: React.CSSProperties;
  topLeft?: React.CSSProperties;
}

export interface HandleComponent {
  top?: React.ReactElement<any>;
  right?: React.ReactElement<any>;
  bottom?: React.ReactElement<any>;
  left?: React.ReactElement<any>;
  topRight?: React.ReactElement<any>;
  bottomRight?: React.ReactElement<any>;
  bottomLeft?: React.ReactElement<any>;
  topLeft?: React.ReactElement<any>;
}

export interface HandleClassName {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  topRight?: string;
  bottomRight?: string;
  bottomLeft?: string;
  topLeft?: string;
}

export interface IState {
  isResizing: boolean;
  direction: Direction;
  original: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  width: number | string;
  height: number | string;

  backgroundStyle: React.CSSProperties;
  flexBasis?: string | number;
}

export const definedProps = [
  "as",
  "style",
  "className",
  "grid",
  "snap",
  "bounds",
  "boundsByDirection",
  "size",
  "defaultSize",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "lockAspectRatio",
  "lockAspectRatioExtraWidth",
  "lockAspectRatioExtraHeight",
  "enable",
  "handleStyles",
  "handleClasses",
  "handleWrapperStyle",
  "handleWrapperClass",
  "children",
  "onResizeStart",
  "onResize",
  "onResizeStop",
  "handleComponent",
  "scale",
  "resizeRatio",
  "snapGap",
];

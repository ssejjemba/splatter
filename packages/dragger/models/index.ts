import React from "react";

export type Dimension = {
  width: number;
  height: number;
};

export type Size = {
  width: number | string;
  height: number | string;
};

export type StringDimensions = {
  width: string;
  height: string;
};

export interface IPoint {
  x: number;
  y: number;
}

export type DragEventData = {
  preventDefault(): void;
  stopPropagation(): void;
  pointers: Array<IPoint>;
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly delta: number;
  readonly distance: number;
  readonly angleDeg: number;
  readonly scale?: number;
};

export type DragHandlers = {
  onDragStart(event: DragEventData): void;
  onDragMove(event: DragEventData): void;
  onDragEnd(event: DragEventData): void;
};

export type DragEvents = "onDragStart" | "onDragMove" | "onDragEnd";

export type Direction =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "topRight"
  | "bottomRight"
  | "bottomLeft"
  | "topLeft";

/**
 * Typed generic callback function, used mostly internally
 * to defined callback setters
 */
export interface SomeCallback<TArgs, TResult = void> {
  (...args: TArgs[]): TResult;
}

/**
 * A callback setter is generally used to set the value of
 * a callback that will be used to perform updates
 */
export interface CallbackSetter<TArgs> {
  (nextCallback: SomeCallback<TArgs>): void;
}

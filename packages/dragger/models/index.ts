export type Dimension = {
  width: number;
  height: number;
};

export interface IPoint {
  x: number;
  y: number;
}

export type TouchEventData = {
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
  onDragStart(event: TouchEventData): void;
  onDragMove(event: TouchEventData): void;
  onDragEnd(event: TouchEventData): void;
};

export type DragEvents = "onDragStart" | "onDragMove" | "onDragEnd";

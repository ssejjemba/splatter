// This will use the drag deltas to return a new position (x, y) for an element

import { useState } from "react";

import { DragEventData } from "../models";
import { useDrag } from "./useDrag";

export function useReposition(
  elementRef: React.RefObject<HTMLElement>,
  defaults: { left: number; top: number }
): { left: number; top: number; isRepositioning: boolean } {
  const [left, setLeft] = useState(defaults.left);
  const [top, setTop] = useState(defaults.top);

  const onDragStart = (event: DragEventData) => {
    console.log("starting to reposition the block");
  };

  const onDragMove = (event: DragEventData) => {
    setLeft(left + event.deltaX);
    setTop(top + event.deltaY);
  };

  const onDragEnd = (event: DragEventData) => {
    console.log("stopped repositioning the block");
  };

  const { isDragging } = useDrag(elementRef, {
    onDragStart,
    onDragMove,
    onDragEnd,
  });

  return {
    left,
    top,
    isRepositioning: isDragging,
  };
}

// This will use the drag deltas to return a new position (x, y) for an element

import { useEffect, useRef, useState } from "react";

import { DragEventData } from "../models";
import { useDrag } from "./useDrag";

export function useReposition(
  elementRef: React.RefObject<HTMLElement>,
  defaults: { left: number; top: number },
  canDrag: boolean
): {
  left: number;
  top: number;
  isRepositioning: boolean;
  setDimensions: (newDimens: { left: number; top: number }) => void;
} {
  const [left, setLeft] = useState(defaults.left);
  const [top, setTop] = useState(defaults.top);

  const originalStackIndex = useRef<string>("auto");

  const setDimensions = (newDimens: { left: number; top: number }) => {
    setLeft(newDimens.left);
    setTop(newDimens.top);
  };

  const onDragStart = (event: DragEventData) => {
    console.log("starting to reposition the block");
    if (elementRef && elementRef.current) {
      elementRef.current.style.zIndex = "9999";
    }
  };

  const onDragMove = (event: DragEventData) => {
    console.log("is repositioning the block");
    setLeft(left + event.deltaX);
    setTop(top + event.deltaY);
  };

  const onDragEnd = (event: DragEventData) => {
    console.log("stopped repositioning the block");
    if (elementRef && elementRef.current) {
      elementRef.current.style.zIndex = originalStackIndex.current;
    }
  };

  useEffect(() => {
    if (elementRef && elementRef.current) {
      originalStackIndex.current = elementRef.current.style.zIndex;
    }
  }, [elementRef]);

  const { isDragging } = useDrag(
    elementRef,
    {
      onDragStart,
      onDragMove,
      onDragEnd,
    },
    canDrag
  );

  return {
    left,
    top,
    isRepositioning: isDragging,
    setDimensions,
  };
}

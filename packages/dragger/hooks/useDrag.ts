// This hook acts as an interface for both touch and mouse pointer events to drag interface

import { DragHandlers } from "../models";
import { useMouseDrag } from "./useMouseDrag";
import { useTouchDrag } from "./useTouchDrag";

export function useDrag(
  elementRef: React.RefObject<HTMLElement>,
  handlers: DragHandlers,
  canDrag: boolean
): { isDragging: boolean } {
  const mouseDrag = useMouseDrag(elementRef, handlers, canDrag);
  const touchDrag = useTouchDrag(elementRef, handlers, canDrag);

  return {
    isDragging: mouseDrag.isDragging || touchDrag.isDragging,
  };
}

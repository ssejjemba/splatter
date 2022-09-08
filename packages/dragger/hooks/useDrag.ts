// This hook acts as an interface for both touch and mouse pointer events to drag interface

import { DragHandlers } from "../models";
import { useMouseDrag } from "./useMouseDrag";
import { useTouchDrag } from "./useTouchDrag";

export function useDrag(
  elementRef: React.RefObject<HTMLElement>,
  handlers: DragHandlers
): { isDragging: boolean } {
  const mouseDrag = useMouseDrag(elementRef, handlers);
  const touchDrag = useTouchDrag(elementRef, handlers);

  return {
    isDragging: mouseDrag.isDragging || touchDrag.isDragging,
  };
}

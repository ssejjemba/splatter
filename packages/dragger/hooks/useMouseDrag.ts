import React, { useEffect, useRef, useState } from "react";
import { DragEventData, DragEvents, DragHandlers } from "../models";
import { getCurrentTouches } from "../utils/drag_utils";

let pointer: DragEventData | null = null;

export function useMouseDrag(
  elementRef: React.RefObject<HTMLElement>,
  handlers: DragHandlers,
  canDrag: boolean
): { isDragging: boolean } {
  const [isDragging, setIsDragging] = useState(false);
  const initialTouches = useRef<DragEventData | null>(null);

  useEffect(() => {
    const callHandler = (eventName: DragEvents, event: DragEventData) => {
      const _handlers: DragHandlers = {
        onDragStart: handlers.onDragStart,
        onDragMove: handlers.onDragMove,
        onDragEnd: handlers.onDragEnd,
      };
      if (eventName && _handlers[eventName]) {
        _handlers[eventName](event);
      }
    };
    const handleMouseDown = (event: MouseEvent) => {
      if (isDragging || !canDrag) {
        return;
      }
      const touch = [event];
      const currentTouches = getCurrentTouches(event, touch, null, null);
      pointer = currentTouches;
      initialTouches.current = currentTouches;
      callHandler("onDragStart", currentTouches);

      setIsDragging(true);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canDrag) {
        cancelTheDrag();
      }
      if (!isDragging) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const touch = [event];
      const currentTouches = getCurrentTouches(
        event,
        touch,
        pointer,
        initialTouches.current
      );
      pointer = currentTouches;

      callHandler("onDragMove", currentTouches);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!isDragging) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const touch = [event];
      const currentTouches = getCurrentTouches(
        event,
        touch,
        pointer,
        initialTouches.current
      );
      pointer = currentTouches;
      initialTouches.current = currentTouches;
      callHandler("onDragEnd", currentTouches);
      pointer = null;
      initialTouches.current = null;
      setIsDragging(false);
    };

    const cancelTheDrag = () => {
      // cance the drag
      pointer = null;
      initialTouches.current = null;
      setIsDragging(false);
    };
    const element = elementRef.current;

    element?.addEventListener("mousedown", handleMouseDown);
    element?.addEventListener("mousemove", handleMouseMove);
    element?.addEventListener("mouseup", handleMouseUp);

    return () => {
      element?.removeEventListener("mousedown", handleMouseDown);
      element?.removeEventListener("mouseup", handleMouseUp);
      element?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    canDrag,
    elementRef,
    handlers.onDragEnd,
    handlers.onDragMove,
    handlers.onDragStart,
    isDragging,
  ]);

  return {
    isDragging,
  };
}

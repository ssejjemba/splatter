import React, { useEffect, useRef, useState } from "react";
import { DragEvents, DragHandlers, DragEventData } from "../models";
import { getCurrentTouches } from "../utils/drag_utils";

let touches: DragEventData | null = null;

export function useTouchDrag(
  elementRef: React.RefObject<HTMLElement>,
  handlers: DragHandlers
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

    const touchStart = (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const currentTouches = getCurrentTouches(
        event,
        event.touches,
        null,
        null
      );
      touches = currentTouches;
      initialTouches.current = currentTouches;

      if (event.touches.length === 2) {
        return;
      } else {
        callHandler("onDragStart", currentTouches);
        const element = elementRef.current;
        element?.addEventListener("touchmove", touchMove);
        setIsDragging(true);
      }
    };

    const touchMove = (event: TouchEvent) => {
      if (!isDragging) {
        return;
      }
      const currentTouches = getCurrentTouches(
        event,
        event.touches,
        touches,
        initialTouches.current
      );
      touches = currentTouches;

      if (event.touches.length === 2) {
        return;
      } else {
        callHandler("onDragMove", currentTouches);
      }
    };
    const touchEnd = (event: TouchEvent) => {
      const currentTouches = getCurrentTouches(
        event,
        event.changedTouches,
        touches,
        initialTouches.current
      );
      if (touches && touches.pointers) {
        if (touches.pointers.length === 2) {
          return;
        } else {
          callHandler("onDragEnd", currentTouches);
        }
      }
      const element = elementRef.current;
      element?.removeEventListener("touchmove", touchMove);
      touches = null;
      initialTouches.current = null;
      setIsDragging(false);
    };
    const element = elementRef.current;

    element?.addEventListener("touchstart", touchStart);
    element?.addEventListener("touchend", touchEnd);

    return () => {
      element?.removeEventListener("touchstart", touchStart);
      element?.removeEventListener("touchend", touchEnd);
      element?.removeEventListener("touchmove", touchMove);
    };
  }, [
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

import React, { useEffect, useRef, useState } from "react";
import { DragEvents, DragHandlers, DragEventData } from "../models";
import { getCurrentTouches } from "../utils/drag_utils";
import useTouchEvents from "./useTouchEvents";

let touches: DragEventData | null = null;

export function useTouchDrag(
  elementRef: React.RefObject<HTMLElement>,
  handlers: DragHandlers,
  canDrag: boolean
): { isDragging: boolean } {
  const [isDragging, setIsDragging] = useState(false);
  const initialTouches = useRef<DragEventData | null>(null);

  const { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel } =
    useTouchEvents(elementRef);

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
    if (isDragging || !canDrag) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const currentTouches = getCurrentTouches(event, event.touches, null, null);
    touches = currentTouches;
    initialTouches.current = currentTouches;

    if (event.touches.length === 2) {
      return;
    } else {
      callHandler("onDragStart", currentTouches);
      setIsDragging(true);
    }
  };

  const touchMove = (event: TouchEvent) => {
    if (!isDragging || !canDrag) {
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
    if (!isDragging || !canDrag) {
      return;
    }
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
    touches = null;
    initialTouches.current = null;
    setIsDragging(false);
  };

  onTouchStart(touchStart);
  onTouchMove(touchMove);
  onTouchCancel(touchEnd);
  onTouchEnd(touchEnd);

  return {
    isDragging,
  };
}

import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { DragEventData, DragEvents, DragHandlers } from "../models";
import { getCurrentTouches } from "../utils/drag_utils";
import useMouseEvents from "./useMouseEvents";

let pointer: DragEventData | null = null;

export function useMouseDrag(
  elementRef: React.RefObject<HTMLElement>,
  handlers: DragHandlers,
  canDrag: boolean
): { isDragging: boolean } {
  const [isDragging, setIsDragging] = useState(false);
  const initialTouches = useRef<DragEventData | null>(null);

  const { onMouseDown, onMouseLeave, onMouseMove, onMouseUp } =
    useMouseEvents(elementRef);

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
      cancelDrag();
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

  const cancelDrag = () => {
    pointer = null;
    initialTouches.current = null;
    setIsDragging(false);
  };

  onMouseDown(handleMouseDown);
  onMouseMove(handleMouseMove);
  onMouseLeave(handleMouseUp);
  onMouseUp(handleMouseUp);

  return {
    isDragging,
  };
}

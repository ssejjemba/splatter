import React, { useCallback, useRef, useState } from "react";
import { useReposition } from "../hooks/useReposition";
import { Direction } from "../models";
import { IResizableProps } from "../models/props";
import { hasDirection } from "../utils/helper";
import { Resizer } from "./Resizer";

interface IDraggableElementProps {
  defaultPosition: { top: number; left: number };
  className?: string;
  withResizing?: boolean;
  as?: "div" | "svg" | "span" | "p" | React.ComponentType<any>;
  resizeProps?: IResizableProps;
  children?: React.ReactNode;
  shouldDrag?: boolean;
}

export function DraggableElement({
  defaultPosition,
  className,
  withResizing = true,
  as,
  resizeProps,
  children,
  shouldDrag = true,
}: IDraggableElementProps) {
  const Wrapper = as || "div";
  const ref = useRef<HTMLElement | null>(null);
  const sizeRef = useRef<{ width: number; height: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const canDrag = shouldDrag && !isResizing;
  const { top, left, setDimensions } = useReposition(
    ref,
    defaultPosition,
    canDrag
  );

  const handleResizeStart = useCallback(
    (
      ev: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
      dir: Direction,
      elRef: HTMLElement
    ) => {
      setIsResizing(true);
      if (resizeProps && resizeProps.onResizeStart) {
        resizeProps.onResizeStart(ev, dir, elRef);
      }
    },
    [resizeProps]
  );

  const handleResize = useCallback(
    (
      ev: MouseEvent | TouchEvent,
      dir: Direction,
      elRef: HTMLElement,
      delta: { width: number; height: number }
    ) => {
      const positionDelta = {
        top: 0,
        left: 0,
      };
      if (hasDirection("top", dir)) {
        // change the position of the top by this change
        if (sizeRef.current) {
          positionDelta.top = delta.height - sizeRef.current.height;
        } else {
          positionDelta.top = delta.height;
        }
      }
      if (hasDirection("left", dir)) {
        // change the position of the left by this change
        if (sizeRef.current) {
          positionDelta.left = delta.width - sizeRef.current.width;
        } else {
          positionDelta.left = delta.width;
        }
      }

      sizeRef.current = delta;

      setDimensions({
        left: left - positionDelta.left,
        top: top - positionDelta.top,
      });
      if (resizeProps && resizeProps.onResize) {
        resizeProps.onResize(ev, dir, elRef, delta);
      }
    },
    [left, resizeProps, setDimensions, top]
  );

  const handleResizeStop = useCallback(
    (
      ev: MouseEvent | TouchEvent,
      dir: Direction,
      elRef: HTMLElement,
      delta: { width: number; height: number }
    ) => {
      sizeRef.current = null;
      setIsResizing(false);
      if (resizeProps && resizeProps.onResizeStop) {
        resizeProps.onResizeStop(ev, dir, elRef, delta);
      }
    },
    [resizeProps]
  );

  if (withResizing && resizeProps) {
    return (
      <Wrapper
        ref={ref}
        style={{
          position: "relative",
          top: `${top}px`,
          left: `${left}px`,
          display: "inline-block",
        }}
        className={className}
      >
        <Resizer
          {...resizeProps}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
        >
          {children}
        </Resizer>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      ref={ref}
      style={{
        position: "relative",
        top: `${top}px`,
        left: `${left}px`,
        display: "inline-block",
      }}
      className={className}
    >
      {children}
    </Wrapper>
  );
}

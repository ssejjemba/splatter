import React, { useRef, useState } from "react";
import { useReposition } from "../hooks/useReposition";
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

  if (withResizing && resizeProps) {
    return (
      <Wrapper
        ref={ref}
        style={{ position: "relative", top: `${top}px`, left: `${left}px` }}
        className={className}
      >
        <Resizer
          {...resizeProps}
          onResizeStart={(ev, dir, elRef) => {
            setIsResizing(true);
            if (resizeProps.onResizeStart) {
              resizeProps.onResizeStart(ev, dir, elRef);
            }
          }}
          onResize={(ev, dir, elRef, delta) => {
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
            if (resizeProps.onResize) {
              resizeProps.onResize(ev, dir, elRef, delta);
            }
          }}
          onResizeStop={(ev, dir, elRef, delta) => {
            sizeRef.current = null;
            setIsResizing(false);
            if (resizeProps.onResizeStop) {
              resizeProps.onResizeStop(ev, dir, elRef, delta);
            }
          }}
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

import React, { useRef } from "react";
import { useReposition } from "../hooks/useReposition";
import { IResizableProps } from "../models/props";
import { Resizer } from "./Resizer";

interface IDraggableElementProps {
  defaultPosition: { top: number; left: number };
  className?: string;
  withResizing?: boolean;
  as?: "div" | "svg" | "span" | "p" | React.ComponentType<any>;
  resizeProps?: IResizableProps;
  children?: React.ReactNode;
}

export function DraggableElement({
  defaultPosition,
  className,
  withResizing = true,
  as,
  resizeProps,
  children,
}: IDraggableElementProps) {
  const Wrapper = as || "div";
  const ref = useRef<HTMLElement | null>(null);
  const { top, left } = useReposition(ref, defaultPosition);

  if (withResizing && resizeProps) {
    return (
      <Wrapper
        ref={ref}
        style={{ position: "relative", top: `${top}px`, left: `${left}px` }}
        className={className}
      >
        <Resizer {...resizeProps}>{children}</Resizer>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      ref={ref}
      style={{ position: "relative", top: `${top}px`, left: `${left}px` }}
      className={className}
    >
      {children}
    </Wrapper>
  );
}

import React, { CSSProperties } from "react";
import { Direction } from "../models";
import { handleStyles } from "../utils/resize_utils";

export type OnStartCallback = (
  e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  dir: Direction
) => void;

export function ResizerHandle(props: {
  direction: Direction;
  className?: string;
  replaceStyles?: React.CSSProperties;
  children: React.ReactNode;
  onResizeStart: OnStartCallback;
}) {
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.nativeEvent.stopPropagation();
    e.nativeEvent.preventDefault();
    props.onResizeStart(e, props.direction);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.nativeEvent.stopPropagation();
    e.nativeEvent.preventDefault();
    props.onResizeStart(e, props.direction);
  };

  const styles: CSSProperties = {
    position: "absolute",
    userSelect: "none",
  };
  return (
    <div
      role="button"
      tabIndex={0}
      className={props.className || ""}
      style={{
        ...styles,
        ...handleStyles[props.direction],
        ...(props.replaceStyles || {}),
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.nativeEvent.stopPropagation();
        onMouseDown(e);
      }}
      onTouchStart={onTouchStart}
    >
      {props.children}
    </div>
  );
}

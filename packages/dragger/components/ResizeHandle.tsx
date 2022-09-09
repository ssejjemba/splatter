import React, { CSSProperties } from "react";
import { Direction } from "../models";
import { handleStyles } from "../utils/resize_utils";

export function Resizer(props: {
  direction: Direction;
  className?: string;
  replaceStyles?: React.CSSProperties;
  children: React.ReactNode;
}) {
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
    >
      {props.children}
    </div>
  );
}

import React from "react";
import { DraggableElement } from "dragger";

import classes from "./Sample.module.css";

export function Sample() {
  return (
    <div className={classes["container"]}>
      <DraggableElement
        className={classes["block"]}
        defaultPosition={{ top: 10, left: 10 }}
      >
        <p>This block is moveable</p>
      </DraggableElement>
    </div>
  );
}

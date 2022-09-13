import React from "react";
import { DraggableElement } from "dragger";

import classes from "./Sample.module.css";

export function Sample() {
  return (
    <div className={classes["container"]}>
      <DraggableElement
        className={classes["block"]}
        defaultPosition={{ top: 100, left: 100 }}
        withResizing
        resizeProps={{
          onResize: () => {
            // console.log("resizing");
          },
          className: classes["block--container"],
          defaultSize: {
            width: 300,
            height: 200,
          },
        }}
      >
        <p>This block is moveable</p>
      </DraggableElement>
    </div>
  );
}

import React, { RefObject, useContext, useEffect, useRef } from "react";
import { SelectorProviderStore } from "../models";
import { SelectionContext } from "../providers/SelectorProvider";
import {
  checkBoundaryForIntersection,
  checkBoundaryForOverlap,
} from "../utils/helper";

export function SelectableElement({
  children,
  selectionStyles = {},
  blockId,
  selectionClassName = "",
}: {
  children: React.ReactNode;
  blockId: string;
  selectionStyles?: React.CSSProperties;
  selectionClassName?: string;
}) {
  const selectionStore = useContext(SelectionContext);
  const selectElementRef = useRef<HTMLElement | null>(null);
  if (!selectionStore) {
    throw new Error(
      "This component can not be used outside a selector provider"
    );
  }
  const {
    isSelecting,
    activateBlock,
    deactivateBlock,
    activeBlocks,
    selectionClientRect,
    selectionSettings: { isActiveOn },
  } = selectionStore;

  useEffect(() => {
    if (isSelecting) {
      // check if the boundary of this element intercepts with
      const element = selectElementRef.current;
      if (element && selectionClientRect) {
        const bounds = element.getBoundingClientRect();
        const isPartOfSelection =
          isActiveOn === "intersection"
            ? checkBoundaryForIntersection(bounds, selectionClientRect)
            : checkBoundaryForOverlap(bounds, selectionClientRect);
        if (isPartOfSelection) {
          activateBlock(blockId);
        } else {
          deactivateBlock(blockId);
        }
      }
    }
  }, [
    activateBlock,
    blockId,
    deactivateBlock,
    isActiveOn,
    isSelecting,
    selectionClientRect,
  ]);

  const isActiveBlock = activeBlocks.findIndex((id) => id === blockId) !== -1;
  return (
    <div
      className={isActiveBlock ? selectionClassName : ""}
      ref={selectElementRef as RefObject<HTMLDivElement>}
      style={
        isActiveBlock
          ? {
              border: "1px solid blue",
              ...selectionStyles,
              width: "auto",
              height: "auto",
            }
          : {}
      }
    >
      {children}
    </div>
  );
}

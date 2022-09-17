import { CursorPosition, SelectorPosition } from "../models";

export function calculateNewBoudingRect(
  initialData: SelectorPosition,
  currentCursorPosition: CursorPosition
): SelectorPosition {
  // calculate the new bounding client rect
  // if the width is 0 then
  const deltaX = currentCursorPosition.x - initialData.left;
  const deltaY = currentCursorPosition.y - initialData.top;

  const newWidth = Math.abs(deltaX);
  const newHeight = Math.abs(deltaY);

  let newTop = initialData.top;
  let newLeft = initialData.left;

  if (!isPositive(deltaX)) {
    // is moving in the negative x axis
    newLeft = newLeft + deltaX;
  }

  if (!isPositive(deltaY)) {
    // is moving in the negative y axis
    newTop = newTop + deltaY;
  }

  return {
    top: newTop,
    left: newLeft,
    width: newWidth,
    height: newHeight,
  };
}

function isPositive(x: number): boolean {
  return x > 0;
}

type BoxBoundary = {
  maxX: number;
  minX: number;
  maxY: number;
  minY: number;
};

function getBoxBoundary(boxBoundingRect: SelectorPosition): BoxBoundary {
  return {
    minX: boxBoundingRect.left,
    maxX: boxBoundingRect.left + boxBoundingRect.width,
    minY: boxBoundingRect.top,
    maxY: boxBoundingRect.top + boxBoundingRect.height,
  };
}

export function checkBoundaryForIntersection(
  blockBoundary: SelectorPosition,
  selectionBoundary: SelectorPosition
): boolean {
  // Call them box a (selection box) and box b (target box)
  const boxABoundary = getBoxBoundary(selectionBoundary);

  const boxBBoundary = getBoxBoundary(blockBoundary);

  return (
    boxBBoundary.minX >= boxABoundary.minX &&
    boxBBoundary.maxX <= boxABoundary.maxX &&
    boxBBoundary.minY >= boxABoundary.minY &&
    boxBBoundary.maxY <= boxABoundary.maxY
  );
}

export function checkBoundaryForOverlap(
  blockBoundary: SelectorPosition,
  selectionBoundary: SelectorPosition
): boolean {
  // Call them box a (selection box) and box b (target box)
  const boxABoundary = getBoxBoundary(selectionBoundary);

  const boxBBoundary = getBoxBoundary(blockBoundary);

  return (
    boxBBoundary.minX >= boxABoundary.minX ||
    boxBBoundary.maxX <= boxABoundary.maxX ||
    boxBBoundary.minY >= boxABoundary.minY ||
    boxBBoundary.maxY <= boxABoundary.maxY
  );
}

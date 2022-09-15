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

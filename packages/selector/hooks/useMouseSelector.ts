import { useState, RefObject, useRef } from "react";
import { useMouseEvents } from "dragger";
import { SelectorHandlers, SelectorPosition } from "../models";
import { calculateNewBoudingRect } from "../utils/helper";

export const useMouseSelector = (
  ref: RefObject<HTMLElement>,
  handlers: SelectorHandlers
): { isSelecting: boolean; selectorData: SelectorPosition | null } => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectorData, setSelectorData] = useState<SelectorPosition | null>(
    null
  );

  const initialData = useRef<SelectorPosition | null>(null);
  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } =
    useMouseEvents(ref);

  const handleMouseDown = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const newBoundRect = {
      left: clientX,
      top: clientY,
      width: 0,
      height: 0,
    };
    initialData.current = newBoundRect;
    setSelectorData(newBoundRect);
    setIsSelecting(true);
    handlers.createSelection &&
      handlers.createSelection({
        ...selectorData,
      } as SelectorPosition);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isSelecting || !selectorData || !initialData.current) {
      return;
    }

    const { clientX, clientY } = event;

    const newSelectorData = calculateNewBoudingRect(initialData.current, {
      x: clientX,
      y: clientY,
    });

    setSelectorData(newSelectorData);
    handlers.expandSelection &&
      handlers.expandSelection({
        ...selectorData,
      } as SelectorPosition);
  };

  const handleMouseUp = (event: MouseEvent) => {
    handlers.commitSelection &&
      handlers.commitSelection({
        ...selectorData,
      } as SelectorPosition);
    initialData.current = null;
    setSelectorData(null);
    setIsSelecting(false);
  };

  const handleMouseLeave = (event: MouseEvent) => {
    handlers.cancelSelection && handlers.cancelSelection();
    initialData.current = null;
    setSelectorData(null);
    setIsSelecting(false);
  };

  onMouseDown(handleMouseDown);
  onMouseMove(handleMouseMove);
  onMouseUp(handleMouseUp);
  onMouseLeave(handleMouseLeave);

  return {
    isSelecting,
    selectorData,
  };
};

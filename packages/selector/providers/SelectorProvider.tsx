import React, {
  createContext,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMouseSelector } from "../hooks/useMouseSelector";
import "intersection-observer";
import { SelectorPosition } from "../models";

type SelectorProviderStore = {
  isSelecting: boolean;
  selectionClientRect: SelectorPosition | null;
  activeBlocks: Array<string>;
  activateBlock: (id: string) => void;
  deactivateBlock: (id: string) => void;
  clearActiveBlocks: () => void;
};

export const SelectionContext = createContext<SelectorProviderStore | null>(
  null
);

export const SELECTOR_ID = "__selection_container__";

export const SelectorProvider = ({
  children,
  selectorClassName,
  selectorStyles = {},
  containerClassName,
  containerStyles = {},
  onCreateSelection = () => {},
  onExpandSelection = () => {},
  onCancelSelection = () => {},
  onConfirmSelection = () => {},
}: {
  children: React.ReactNode;
  selectorStyles?: React.CSSProperties;
  selectorClassName?: string;
  containerStyles?: React.CSSProperties;
  containerClassName?: string;
  onCreateSelection?: () => void;
  onExpandSelection?: () => void;
  onConfirmSelection?: () => void;
  onCancelSelection?: () => void;
}) => {
  const [selectionClientRect, setSelectionClientRect] =
    useState<SelectorPosition | null>(null);

  const elementRef = useRef<HTMLElement | null>(null);

  const [activeBlocks, setActiveBlocks] = useState<Array<string>>([]);

  const createSelection = (selectionRect: SelectorPosition) => {
    setSelectionClientRect(selectionRect);
    onCreateSelection();
  };

  const expandSelection = (selectionRect: SelectorPosition) => {
    setSelectionClientRect(selectionRect);
    onExpandSelection();
  };

  const cancelSelection = () => {
    console.log("canceled selection");
    setSelectionClientRect(null);
    onCancelSelection();
  };

  const commitSelection = () => {
    console.log("confirmed selection");
    onConfirmSelection();
  };

  const { isSelecting } = useMouseSelector(elementRef, {
    createSelection,
    expandSelection,
    cancelSelection,
    commitSelection,
  });

  const activateBlock = (id: string) => {
    setActiveBlocks([...activeBlocks, id]);
  };

  const deactivateBlock = (id: string) => {
    const newActiveBlocks = activeBlocks.filter((blockId) => blockId !== id);
    setActiveBlocks(newActiveBlocks);
  };

  const clearActiveBlocks = () => {
    setActiveBlocks([]);
  };

  const store: SelectorProviderStore = {
    isSelecting,
    selectionClientRect,
    activeBlocks,
    activateBlock,
    deactivateBlock,
    clearActiveBlocks,
  };
  return (
    <SelectionContext.Provider value={store}>
      <div
        className={containerClassName}
        ref={elementRef as RefObject<HTMLDivElement>}
        style={{ ...containerStyles, position: "relative" }}
      >
        {selectionClientRect && (
          <div
            id={SELECTOR_ID}
            className={selectorClassName}
            style={{
              border: "1px dashed blue",
              ...selectorStyles,
              position: "absolute",
              top: `${selectionClientRect.top}px`,
              left: `${selectionClientRect.left}px`,
              right: "unset",
              bottom: "unset",
              width: `${selectionClientRect.width}px`,
              height: `${selectionClientRect.height}px`,
              zIndex: "999999",
            }}
          />
        )}
        {children}
      </div>
    </SelectionContext.Provider>
  );
};

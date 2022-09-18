export type MouseDragDirection =
  | "LeftUp" // Drag from left top corner
  | "LeftDown" // Drag from left bottom corner
  | "RightUp" // Drag from right top corner
  | "RightDown"; // Drag from right bottom corner

export type SelectorPosition = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type CursorPosition = {
  x: number;
  y: number;
};

export type SelectorHandlers = {
  createSelection?: (selection: SelectorPosition) => void;
  expandSelection?: (selection: SelectorPosition) => void;
  commitSelection?: (selection: SelectorPosition) => void;
  cancelSelection?: () => void;
};

export type SelectorProviderStore = {
  isSelecting: boolean;
  selectionClientRect: SelectorPosition | null;
  activeBlocks: Array<string>;
  activateBlock: (id: string) => void;
  deactivateBlock: (id: string) => void;
  clearActiveBlocks: () => void;
  selectionSettings: SelectionSettings;
};

export type SelectionSettings = { isActiveOn: "overlap" | "intersection" };

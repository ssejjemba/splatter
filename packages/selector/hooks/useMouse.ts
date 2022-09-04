import {useState, useEffect} from "react"

type MouseDragDirection =
  | "LeftUp" // Drag from left bottom corner to right and up
  | "LeftDown" // Drag from left top corner to right and down
  | "RightUp" // Drag from right bottom corner to left and up
  | "RightDown"; // Drag from right top corner to left and down

type SelectorPosition = {
    x: number;
    y: number;
    w: number;
    h: number;
    direction: MouseDragDirection;
  };

export const useMouse = () => {

}
import { RefObject } from "react";
import useEvent from "./useEvent";

const useMouseEvents = <TElement extends HTMLElement>(
  targetRef?: RefObject<TElement>,
  passive?: boolean
) => {
  const target =
    targetRef ||
    ({ current: window.document } as unknown as RefObject<TElement>);
  const onMouseDown = useEvent<MouseEvent, TElement>(target, "mousedown", {
    passive,
  });
  const onMouseEnter = useEvent<MouseEvent, TElement>(target, "mouseenter", {
    passive,
  });
  const onMouseLeave = useEvent<MouseEvent, TElement>(target, "mouseleave", {
    passive,
  });
  const onMouseMove = useEvent<MouseEvent, TElement>(target, "mousemove", {
    passive,
  });
  const onMouseOut = useEvent<MouseEvent, TElement>(target, "mouseout", {
    passive,
  });
  const onMouseOver = useEvent<MouseEvent, TElement>(target, "mouseover", {
    passive,
  });
  const onMouseUp = useEvent<MouseEvent, TElement>(target, "mouseup", {
    passive,
  });

  return Object.freeze({
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseOut,
    onMouseOver,
    onMouseUp,
  });
};

export default useMouseEvents;

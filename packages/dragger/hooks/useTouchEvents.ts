import { RefObject } from "react";
import useEvent from "./useEvent";

const useTouchEvents = <TElement extends HTMLElement>(
  targetRef?: RefObject<TElement>,
  passive?: boolean
) => {
  const target =
    targetRef ||
    ({ current: window.document } as unknown as RefObject<TElement>); // hackish but works
  const onTouchStart = useEvent<TouchEvent, TElement>(target, "touchstart", {
    passive,
  });
  const onTouchEnd = useEvent<TouchEvent, TElement>(target, "touchend", {
    passive,
  });
  const onTouchCancel = useEvent<TouchEvent, TElement>(target, "touchcancel", {
    passive,
  });
  const onTouchMove = useEvent<TouchEvent, TElement>(target, "touchmove", {
    passive,
  });

  return Object.freeze({
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    onTouchMove,
  });
};

export default useTouchEvents;

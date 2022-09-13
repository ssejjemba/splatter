/**
 * @vitest-environment jsdom
 */

import React, { useRef } from "react";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { DragEventData } from "../../models";
import { useMouseDrag } from "../useMouseDrag";

const preventDefault = vi.fn();

const stopPropagation = vi.fn();

let dragStat: DragEventData | null = null;

const onDragStart = vi.fn().mockImplementation((event: DragEventData) => {
  dragStat = event;
});

const onDragMove = vi.fn().mockImplementation((event: DragEventData) => {
  dragStat = event;
});

const onDragEnd = vi.fn().mockImplementation((event: DragEventData) => {
  dragStat = event;
});

const SampleComponent = () => {
  const ref = useRef<HTMLElement | null>(null);
  const { isDragging } = useMouseDrag(
    ref,
    {
      onDragEnd,
      onDragStart,
      onDragMove,
    },
    true
  );

  return (
    <div data-testid="container" ref={ref as React.RefObject<HTMLDivElement>}>
      {isDragging && <p data-testid="dragging">Is Dragging</p>}
      {!isDragging && <p data-testid="not-dragging">Is not Dragging</p>}
    </div>
  );
};

afterEach(() => {
  preventDefault.mockClear();
  stopPropagation.mockClear();
  onDragStart.mockClear();
  onDragMove.mockClear();
  onDragEnd.mockClear();
});

describe("This tests that the mouse drag hook functions correctly", () => {
  it("It will correctly report mouse drag events fired on a component", async () => {
    render(<SampleComponent />);

    const containerElement = screen.getByTestId("container");

    // starts off in the not dragging mode
    expect(screen.queryByTestId("dragging")).toBeFalsy();
    expect(screen.getByTestId("not-dragging")).toBeDefined();

    //  let's assume these coordinates coincide with the draggable container
    const mouse = [
      { clientX: 10, clientY: 20 }, // initial
      { clientX: 15, clientY: 30 }, // final
    ];

    // when drag is made it swiches to dragging mode
    // hold the mouse
    fireEvent.mouseDown(containerElement, {
      ...mouse[0],
      preventDefault,
      stopPropagation,
    });
    // at this point the dragging mode should be set by the hook and the drag start called
    expect(screen.queryByTestId("not-dragging")).toBeFalsy();
    expect(screen.getByTestId("dragging")).toBeDefined();

    expect(onDragStart).toBeCalledTimes(1);
    expect(dragStat?.distance).toBe(0);
    // drag the mouse to final point
    fireEvent.mouseMove(containerElement, {
      ...mouse[1],
      preventDefault,
      stopPropagation,
    });
    expect(onDragMove).toBeCalledTimes(1);
    if (dragStat?.distance !== undefined) {
      expect(
        Math.round((dragStat?.distance + Number.EPSILON) * 100) / 100
      ).toBe(11.18);
    }
    // release the mouse at this point
    fireEvent.mouseUp(containerElement, {
      ...mouse[1],
      preventDefault,
      stopPropagation,
    });
    // ends off in the not dragging mode
    expect(screen.queryByTestId("dragging")).toBeFalsy();
    expect(screen.getByTestId("not-dragging")).toBeDefined();

    // moving the mouse without holding it down on the element shouldn't call the move handler
    //  attempt to move back the block without holding the mouse
    fireEvent.mouseMove(containerElement, {
      ...mouse[0],
      preventDefault,
      stopPropagation,
    });
    // handler calls should still be 1
    expect(onDragMove).toBeCalledTimes(1);

    // should still be in not dragging mode
    expect(screen.queryByTestId("dragging")).toBeFalsy();
    expect(screen.getByTestId("not-dragging")).toBeDefined();
  });
});

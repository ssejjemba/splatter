/**
 * @vitest-environment jsdom
 */

import React, { useRef } from "react";
import { describe, it, vi, expect, afterEach } from "vitest";
import { render, fireEvent, screen, cleanup } from "@testing-library/react";
import { useReposition } from "../useReposition";

const DEFAULT_POSITION = {
  top: 10,
  left: 8,
};
const SampleComponent = () => {
  const ref = useRef<HTMLElement | null>(null);

  const { top, left } = useReposition(ref, DEFAULT_POSITION, true);

  return (
    <div
      style={{ position: "relative", top: `${top}px`, left: `${left}px` }}
      data-testid="container"
      ref={ref as React.RefObject<HTMLDivElement>}
    ></div>
  );
};

afterEach(cleanup);

describe("Tests for the reposition hook", () => {
  it("Can correctly reposition the element with mouse drag", () => {
    render(<SampleComponent />);

    const containerElement = screen.getByTestId("container");

    expect(window.getComputedStyle(containerElement).top).toBe(
      `${DEFAULT_POSITION.top}px`
    );
    expect(window.getComputedStyle(containerElement).left).toBe(
      `${DEFAULT_POSITION.left}px`
    );

    const mouse = [
      { clientX: 10, clientY: 20 }, // initial
      { clientX: 15, clientY: 30 }, // intermediate
      { clientX: 20, clientY: 40 }, // final
    ];

    fireEvent.mouseDown(containerElement, {
      ...mouse[0],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    fireEvent.mouseMove(containerElement, {
      ...mouse[1],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(window.getComputedStyle(containerElement).top).toBe(`${20}px`);
    expect(window.getComputedStyle(containerElement).left).toBe(`${13}px`);

    // continue moving mouse
    fireEvent.mouseMove(containerElement, {
      ...mouse[2],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(window.getComputedStyle(containerElement).top).toBe(`${30}px`);
    expect(window.getComputedStyle(containerElement).left).toBe(`${18}px`);
  });

  it("Can correctly reposition the element with touch drag", () => {
    render(<SampleComponent />);

    const containerElement = screen.getByTestId("container");

    expect(window.getComputedStyle(containerElement).top).toBe(
      `${DEFAULT_POSITION.top}px`
    );
    expect(window.getComputedStyle(containerElement).left).toBe(
      `${DEFAULT_POSITION.left}px`
    );

    const touches = [
      { clientX: 10, clientY: 20 }, // initial
      { clientX: 15, clientY: 30 }, // intermediate
      { clientX: 20, clientY: 40 }, // final
    ];

    fireEvent.touchStart(containerElement, {
      touches: [touches[0]],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    fireEvent.touchMove(containerElement, {
      touches: [touches[1]],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(window.getComputedStyle(containerElement).top).toBe(`${20}px`);
    expect(window.getComputedStyle(containerElement).left).toBe(`${13}px`);

    // continue moving touch device
    fireEvent.touchMove(containerElement, {
      touches: [touches[2]],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    expect(window.getComputedStyle(containerElement).top).toBe(`${30}px`);
    expect(window.getComputedStyle(containerElement).left).toBe(`${18}px`);
  });
});

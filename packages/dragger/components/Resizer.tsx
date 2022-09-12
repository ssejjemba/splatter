/* eslint-disable react/display-name */
import { createRef, PureComponent } from "react";
import { flushSync } from "react-dom";
import { Dimension, Direction, Size } from "../models";
import { definedProps, IResizableProps, IState } from "../models/props";
import {
  calculateNewMax,
  clamp,
  findClosestSnap,
  getStringSize,
  hasDirection,
  isMouseEvent,
  isTouchEvent,
  snap,
} from "../utils/helper";
import { ResizerHandle } from "./ResizeHandle";

const baseClassName = "__resizable_base_element__";

const DEFAULT_SIZE = {
  width: "auto",
  height: "auto",
};

declare global {
  interface Window {
    MouseEvent: typeof MouseEvent;
    TouchEvent: typeof TouchEvent;
  }
}

interface NewSize {
  newHeight: number | string;
  newWidth: number | string;
}

export class Resizer extends PureComponent<IResizableProps, IState> {
  flexDir?: "row" | "column";
  resizableElement: HTMLElement | null = null;
  ref: React.RefObject<HTMLElement | null>;

  ratio = 1;

  // For parent boundary
  parentLeft = 0;
  parentTop = 0;

  // For boundary
  resizableLeft = 0;
  resizableRight = 0;
  resizableTop = 0;
  resizableBottom = 0;

  // For target boundary
  targetLeft = 0;
  targetTop = 0;

  public static defaultProps = {
    as: "div",
    onResizeStart: () => {},
    onResize: () => {},
    onResizeStop: () => {},
    enable: {
      top: true,
      right: true,
      bottom: true,
      left: true,
      topRight: true,
      bottomRight: true,
      bottomLeft: true,
      topLeft: true,
    },
    style: {},
    grid: [1, 1],
    lockAspectRatio: false,
    lockAspectRatioExtraWidth: 0,
    lockAspectRatioExtraHeight: 0,
    scale: 1,
    resizeRatio: 1,
    snapGap: 0,
  };

  get parentNode(): HTMLElement | null {
    if (!this.resizableElement) {
      return null;
    }
    return this.resizableElement.parentNode as HTMLElement;
  }

  get window(): Window | null {
    if (!this.resizableElement) {
      return null;
    }
    if (!this.resizableElement.ownerDocument) {
      return null;
    }
    return this.resizableElement.ownerDocument.defaultView as Window;
  }

  get propsSize(): Size {
    return this.props.size || this.props.defaultSize || DEFAULT_SIZE;
  }

  get size(): Dimension {
    let width = 0;
    let height = 0;
    if (this.resizableElement && this.window) {
      const orgWidth = this.resizableElement.offsetWidth;
      const orgHeight = this.resizableElement.offsetHeight;
      // Set position `relative` to get parent size as absolute takes resizable element outside document flow.
      const orgPosition = this.resizableElement.style.position;
      if (orgPosition !== "relative") {
        this.resizableElement.style.position = "relative";
      }
      // INFO: Use original width or height if set auto.
      width =
        this.resizableElement.style.width !== "auto"
          ? this.resizableElement.offsetWidth
          : orgWidth;
      height =
        this.resizableElement.style.height !== "auto"
          ? this.resizableElement.offsetHeight
          : orgHeight;
      // Restore original position
      this.resizableElement.style.position = orgPosition;
    }
    return { width, height };
  }

  get sizeStyle(): Size {
    const { size } = this.props;
    const getSize = (key: "width" | "height"): string | number => {
      if (
        typeof this.state[key] === "undefined" ||
        this.state[key] === "auto"
      ) {
        return "auto";
      }
      if (
        this.propsSize &&
        this.propsSize[key] &&
        this.propsSize[key].toString().endsWith("%")
      ) {
        if (this.state[key].toString().endsWith("%")) {
          return this.state[key].toString();
        }
        const parentSize = this.getParentSize();
        const value = Number(this.state[key].toString().replace("px", ""));
        const percent = (value / parentSize[key]) * 100;
        return `${percent}%`;
      }
      return getStringSize(this.state[key]);
    };
    const width =
      size && typeof size.width !== "undefined" && !this.state.isResizing
        ? getStringSize(size.width)
        : getSize("width");
    const height =
      size && typeof size.height !== "undefined" && !this.state.isResizing
        ? getStringSize(size.height)
        : getSize("height");
    return { width, height };
  }

  constructor(props: IResizableProps) {
    super(props);

    this.state = {
      isResizing: false,
      width:
        typeof (this.propsSize && this.propsSize.width) === "undefined"
          ? "auto"
          : this.propsSize && this.propsSize.width,
      height:
        typeof (this.propsSize && this.propsSize.height) === "undefined"
          ? "auto"
          : this.propsSize && this.propsSize.height,
      direction: "right",
      original: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      backgroundStyle: {
        height: "100%",
        width: "100%",
        backgroundColor: "rgba(0,0,0,0)",
        cursor: "auto",
        opacity: 0,
        position: "fixed",
        zIndex: 9999,
        top: "0",
        left: "0",
        bottom: "0",
        right: "0",
      },
      flexBasis: undefined,
    };

    this.ref = createRef<HTMLElement | null>();
  }

  componentDidMount() {
    this.resizableElement = this.ref.current;
    if (!this.resizableElement || !this.window) {
      return;
    }
    const computedStyle = this.window.getComputedStyle(this.resizableElement);
    this.setState({
      width: this.state.width || this.size.width,
      height: this.state.height || this.size.height,
      flexBasis:
        computedStyle.flexBasis !== "auto"
          ? computedStyle.flexBasis
          : undefined,
    });
  }

  componentWillUnmount() {
    if (this.window) {
      this.unbindEvents();
    }
  }

  getParentSize = (): { width: number; height: number } => {
    if (!this.parentNode) {
      if (!this.window) {
        return { width: 0, height: 0 };
      }
      return { width: this.window.innerWidth, height: this.window.innerHeight };
    }
    // add a base that's used to comprehend dimensions of it's container
    const base = this.appendBase();
    if (!base) {
      return { width: 0, height: 0 };
    }
    // INFO: To calculate parent width with flex layout
    let wrapChanged = false;
    const wrap = this.parentNode.style.flexWrap;
    if (wrap !== "wrap") {
      wrapChanged = true;
      this.parentNode.style.flexWrap = "wrap";
    }
    // Use relative to get parent padding size
    base.style.position = "relative";
    base.style.minWidth = "100%";
    base.style.minHeight = "100%";
    const size = {
      width: base.offsetWidth,
      height: base.offsetHeight,
    };
    if (wrapChanged) {
      this.parentNode.style.flexWrap = wrap;
    }
    // remove the base
    this.removeBase(base);
    return size;
  };

  appendBase = () => {
    if (!this.resizableElement || !this.window) {
      return null;
    }
    const parent = this.parentNode;
    if (!parent) {
      return null;
    }
    const element = this.window.document.createElement("div");
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.position = "absolute";
    element.style.transform = "scale(0, 0)";
    element.style.left = "0";
    element.style.flex = "0 0 100%";
    if (element.classList) {
      element.classList.add(baseClassName);
    } else {
      element.className += baseClassName;
    }
    parent.appendChild(element);
    return element;
  };

  removeBase = (base: HTMLElement) => {
    const parent = this.parentNode;
    if (!parent) {
      return;
    }
    parent.removeChild(base);
  };

  createSizeForCssProperty = (
    newSize: number | string,
    kind: "width" | "height"
  ): number | string => {
    const propsSize = this.propsSize && this.propsSize[kind];
    return this.state[kind] === "auto" &&
      this.state.original[kind] === newSize &&
      (typeof propsSize === "undefined" || propsSize === "auto")
      ? "auto"
      : newSize;
  };

  calculateNewMaxFromBoundary = (maxWidth?: number, maxHeight?: number) => {
    const { boundsByDirection } = this.props;
    const { direction } = this.state;
    const widthByDirection =
      boundsByDirection && hasDirection("left", direction);
    const heightByDirection =
      boundsByDirection && hasDirection("top", direction);
    let boundWidth;
    let boundHeight;
    if (this.props.bounds === "parent") {
      const parent = this.parentNode;
      if (parent) {
        boundWidth = widthByDirection
          ? this.resizableRight - this.parentLeft
          : parent.offsetWidth + (this.parentLeft - this.resizableLeft);
        boundHeight = heightByDirection
          ? this.resizableBottom - this.parentTop
          : parent.offsetHeight + (this.parentTop - this.resizableTop);
      }
    } else if (this.props.bounds === "window") {
      if (this.window) {
        boundWidth = widthByDirection
          ? this.resizableRight
          : this.window.innerWidth - this.resizableLeft;
        boundHeight = heightByDirection
          ? this.resizableBottom
          : this.window.innerHeight - this.resizableTop;
      }
    } else if (this.props.bounds) {
      boundWidth = widthByDirection
        ? this.resizableRight - this.targetLeft
        : this.props.bounds.offsetWidth +
          (this.targetLeft - this.resizableLeft);
      boundHeight = heightByDirection
        ? this.resizableBottom - this.targetTop
        : this.props.bounds.offsetHeight + (this.targetTop - this.resizableTop);
    }
    if (boundWidth && Number.isFinite(boundWidth)) {
      maxWidth = maxWidth && maxWidth < boundWidth ? maxWidth : boundWidth;
    }
    if (boundHeight && Number.isFinite(boundHeight)) {
      maxHeight =
        maxHeight && maxHeight < boundHeight ? maxHeight : boundHeight;
    }
    return { maxWidth, maxHeight };
  };

  calculateNewSizeFromDirection = (clientX: number, clientY: number) => {
    const scale = this.props.scale || 1;
    const resizeRatio = this.props.resizeRatio || 1;
    const { direction, original } = this.state;
    const {
      lockAspectRatio,
      lockAspectRatioExtraHeight,
      lockAspectRatioExtraWidth,
    } = this.props;
    let newWidth = original.width;
    let newHeight = original.height;
    const extraHeight = lockAspectRatioExtraHeight || 0;
    const extraWidth = lockAspectRatioExtraWidth || 0;
    if (hasDirection("right", direction)) {
      newWidth =
        original.width + ((clientX - original.x) * resizeRatio) / scale;
      if (lockAspectRatio) {
        newHeight = (newWidth - extraWidth) / this.ratio + extraHeight;
      }
    }
    if (hasDirection("left", direction)) {
      newWidth =
        original.width - ((clientX - original.x) * resizeRatio) / scale;
      if (lockAspectRatio) {
        newHeight = (newWidth - extraWidth) / this.ratio + extraHeight;
      }
    }
    if (hasDirection("bottom", direction)) {
      newHeight =
        original.height + ((clientY - original.y) * resizeRatio) / scale;
      if (lockAspectRatio) {
        newWidth = (newHeight - extraHeight) * this.ratio + extraWidth;
      }
    }
    if (hasDirection("top", direction)) {
      newHeight =
        original.height - ((clientY - original.y) * resizeRatio) / scale;
      if (lockAspectRatio) {
        newWidth = (newHeight - extraHeight) * this.ratio + extraWidth;
      }
    }
    return { newWidth, newHeight };
  };

  calculateNewSizeFromAspectRatio(
    newWidth: number,
    newHeight: number,
    max: { width?: number; height?: number },
    min: { width?: number; height?: number }
  ) {
    const {
      lockAspectRatio,
      lockAspectRatioExtraHeight,
      lockAspectRatioExtraWidth,
    } = this.props;
    const computedMinWidth = typeof min.width === "undefined" ? 10 : min.width;
    const computedMaxWidth =
      typeof max.width === "undefined" || max.width < 0 ? newWidth : max.width;
    const computedMinHeight =
      typeof min.height === "undefined" ? 10 : min.height;
    const computedMaxHeight =
      typeof max.height === "undefined" || max.height < 0
        ? newHeight
        : max.height;
    const extraHeight = lockAspectRatioExtraHeight || 0;
    const extraWidth = lockAspectRatioExtraWidth || 0;
    if (lockAspectRatio) {
      const extraMinWidth =
        (computedMinHeight - extraHeight) * this.ratio + extraWidth;
      const extraMaxWidth =
        (computedMaxHeight - extraHeight) * this.ratio + extraWidth;
      const extraMinHeight =
        (computedMinWidth - extraWidth) / this.ratio + extraHeight;
      const extraMaxHeight =
        (computedMaxWidth - extraWidth) / this.ratio + extraHeight;
      const lockedMinWidth = Math.max(computedMinWidth, extraMinWidth);
      const lockedMaxWidth = Math.min(computedMaxWidth, extraMaxWidth);
      const lockedMinHeight = Math.max(computedMinHeight, extraMinHeight);
      const lockedMaxHeight = Math.min(computedMaxHeight, extraMaxHeight);
      newWidth = clamp(newWidth, lockedMinWidth, lockedMaxWidth);
      newHeight = clamp(newHeight, lockedMinHeight, lockedMaxHeight);
    } else {
      newWidth = clamp(newWidth, computedMinWidth, computedMaxWidth);
      newHeight = clamp(newHeight, computedMinHeight, computedMaxHeight);
    }
    return { newWidth, newHeight };
  }

  setBoundingClientRect = () => {
    // For parent boundary
    if (this.props.bounds === "parent") {
      const parent = this.parentNode;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        this.parentLeft = parentRect.left;
        this.parentTop = parentRect.top;
      }
    }

    // For target(html element) boundary
    if (this.props.bounds && typeof this.props.bounds !== "string") {
      const targetRect = this.props.bounds.getBoundingClientRect();
      this.targetLeft = targetRect.left;
      this.targetTop = targetRect.top;
    }

    // For boundary
    if (this.resizableElement) {
      const { left, top, right, bottom } =
        this.resizableElement.getBoundingClientRect();
      this.resizableLeft = left;
      this.resizableRight = right;
      this.resizableTop = top;
      this.resizableBottom = bottom;
    }
  };

  bindEvents = () => {
    if (this.window) {
      this.window.addEventListener("mouseup", this.onResizeStop);
      this.window.addEventListener("mousemove", this.onResize);
      this.window.addEventListener("mouseleave", this.onResizeStop);
      this.window.addEventListener("touchmove", this.onResize, {
        capture: true,
        passive: false,
      });
      this.window.addEventListener("touchend", this.onResizeStop);
    }
  };

  unbindEvents = () => {
    if (this.window) {
      this.window.removeEventListener("mouseup", this.onResizeStop);
      this.window.removeEventListener("mousemove", this.onResize);
      this.window.removeEventListener("mouseleave", this.onResizeStop);
      this.window.removeEventListener("touchmove", this.onResize, true);
      this.window.removeEventListener("touchend", this.onResizeStop);
    }
  };

  onResizeStart = (
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    direction: Direction
  ) => {
    if (!this.resizableElement || !this.window) {
      return;
    }
    let clientX = 0;
    let clientY = 0;
    if (event.nativeEvent && isMouseEvent(event.nativeEvent)) {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    } else if (event.nativeEvent && isTouchEvent(event.nativeEvent)) {
      clientX = (event.nativeEvent as TouchEvent).touches[0].clientX;
      clientY = (event.nativeEvent as TouchEvent).touches[0].clientY;
    }
    if (this.props.onResizeStart) {
      if (this.resizableElement) {
        const startResize = this.props.onResizeStart(
          event,
          direction,
          this.resizableElement
        );
        if (startResize === false) {
          return;
        }
      }
    }

    if (this.props.size) {
      if (
        typeof this.props.size.height !== "undefined" &&
        this.props.size.height !== this.state.height
      ) {
        this.setState({ height: this.props.size.height });
      }
      if (
        typeof this.props.size.width !== "undefined" &&
        this.props.size.width !== this.state.width
      ) {
        this.setState({ width: this.props.size.width });
      }
    }

    // For lockAspectRatio case
    this.ratio =
      typeof this.props.lockAspectRatio === "number"
        ? this.props.lockAspectRatio
        : this.size.width / this.size.height;

    let flexBasis;
    const computedStyle = this.window.getComputedStyle(this.resizableElement);
    if (computedStyle.flexBasis !== "auto") {
      const parent = this.parentNode;
      if (parent) {
        const dir = this.window.getComputedStyle(parent).flexDirection;
        this.flexDir = dir.startsWith("row") ? "row" : "column";
        flexBasis = computedStyle.flexBasis;
      }
    }
    // For boundary
    this.setBoundingClientRect();
    this.bindEvents();
    const state = {
      original: {
        x: clientX,
        y: clientY,
        width: this.size.width,
        height: this.size.height,
      },
      isResizing: true,
      backgroundStyle: {
        ...this.state.backgroundStyle,
        cursor:
          this.window.getComputedStyle(event.target as HTMLElement).cursor ||
          "auto",
      },
      direction,
      flexBasis,
    };

    this.setState(state);
  };

  onResize = (event: MouseEvent | TouchEvent) => {
    if (!this.state.isResizing || !this.resizableElement || !this.window) {
      return;
    }
    if (this.window.TouchEvent && isTouchEvent(event)) {
      try {
        event.preventDefault();
        event.stopPropagation();
      } catch (e) {
        // Ignore on fail
      }
    }
    let { maxWidth, maxHeight, minWidth, minHeight } = this.props;
    const clientX = isTouchEvent(event)
      ? event.touches[0].clientX
      : event.clientX;
    const clientY = isTouchEvent(event)
      ? event.touches[0].clientY
      : event.clientY;
    const { direction, original, width, height } = this.state;
    const parentSize = this.getParentSize();
    const max = calculateNewMax(
      parentSize,
      this.window.innerWidth,
      this.window.innerHeight,
      maxWidth,
      maxHeight,
      minWidth,
      minHeight
    );

    maxWidth = max.maxWidth;
    maxHeight = max.maxHeight;
    minWidth = max.minWidth;
    minHeight = max.minHeight;

    // Calculate new size
    let { newHeight, newWidth }: NewSize = this.calculateNewSizeFromDirection(
      clientX,
      clientY
    );

    // Calculate max size from boundary settings
    const boundaryMax = this.calculateNewMaxFromBoundary(maxWidth, maxHeight);

    if (this.props.snap && this.props.snap.x) {
      newWidth = findClosestSnap(
        newWidth,
        this.props.snap.x,
        this.props.snapGap
      );
    }
    if (this.props.snap && this.props.snap.y) {
      newHeight = findClosestSnap(
        newHeight,
        this.props.snap.y,
        this.props.snapGap
      );
    }

    // Calculate new size from aspect ratio
    const newSize = this.calculateNewSizeFromAspectRatio(
      newWidth,
      newHeight,
      { width: boundaryMax.maxWidth, height: boundaryMax.maxHeight },
      { width: minWidth, height: minHeight }
    );
    newWidth = newSize.newWidth;
    newHeight = newSize.newHeight;

    if (this.props.grid) {
      const newGridWidth = snap(newWidth, this.props.grid[0]);
      const newGridHeight = snap(newHeight, this.props.grid[1]);
      const gap = this.props.snapGap || 0;
      newWidth =
        gap === 0 || Math.abs(newGridWidth - newWidth) <= gap
          ? newGridWidth
          : newWidth;
      newHeight =
        gap === 0 || Math.abs(newGridHeight - newHeight) <= gap
          ? newGridHeight
          : newHeight;
    }

    const delta = {
      width: newWidth - original.width,
      height: newHeight - original.height,
    };

    if (width && typeof width === "string") {
      if (width.endsWith("%")) {
        const percent = (newWidth / parentSize.width) * 100;
        newWidth = `${percent}%`;
      } else if (width.endsWith("vw")) {
        const vw = (newWidth / this.window.innerWidth) * 100;
        newWidth = `${vw}vw`;
      } else if (width.endsWith("vh")) {
        const vh = (newWidth / this.window.innerHeight) * 100;
        newWidth = `${vh}vh`;
      }
    }

    if (height && typeof height === "string") {
      if (height.endsWith("%")) {
        const percent = (newHeight / parentSize.height) * 100;
        newHeight = `${percent}%`;
      } else if (height.endsWith("vw")) {
        const vw = (newHeight / this.window.innerWidth) * 100;
        newHeight = `${vw}vw`;
      } else if (height.endsWith("vh")) {
        const vh = (newHeight / this.window.innerHeight) * 100;
        newHeight = `${vh}vh`;
      }
    }

    const newState: {
      width: string | number;
      height: string | number;
      flexBasis?: string | number;
    } = {
      width: this.createSizeForCssProperty(newWidth, "width"),
      height: this.createSizeForCssProperty(newHeight, "height"),
    };

    if (this.flexDir === "row") {
      newState.flexBasis = newState.width;
    } else if (this.flexDir === "column") {
      newState.flexBasis = newState.height;
    }

    // For v18, update state sync
    flushSync(() => {
      this.setState(newState);
    });

    if (this.props.onResize) {
      this.props.onResize(event, direction, this.resizableElement, delta);
    }
  };

  onResizeStop = (event: MouseEvent | TouchEvent) => {
    const { isResizing, direction, original } = this.state;
    if (!isResizing || !this.resizableElement) {
      return;
    }
    const delta = {
      width: this.size.width - original.width,
      height: this.size.height - original.height,
    };
    if (this.props.onResizeStop) {
      this.props.onResizeStop(event, direction, this.resizableElement, delta);
    }
    if (this.props.size) {
      this.setState(this.props.size);
    }
    this.unbindEvents();
    this.setState({
      isResizing: false,
      backgroundStyle: { ...this.state.backgroundStyle, cursor: "auto" },
    });
  };

  renderResizer() {
    const {
      enable,
      handleStyles,
      handleClasses,
      handleWrapperStyle,
      handleWrapperClass,
      handleComponent,
    } = this.props;
    if (!enable) {
      return null;
    }
    const resizers = Object.keys(enable).map((dir) => {
      if (enable[dir as Direction] !== false) {
        return (
          <ResizerHandle
            key={dir}
            direction={dir as Direction}
            onResizeStart={this.onResizeStart}
            replaceStyles={handleStyles && handleStyles[dir as Direction]}
            className={handleClasses && handleClasses[dir as Direction]}
          >
            {handleComponent && handleComponent[dir as Direction]
              ? handleComponent[dir as Direction]
              : null}
          </ResizerHandle>
        );
      }
      return null;
    });

    return (
      <div className={handleWrapperClass} style={handleWrapperStyle}>
        {resizers}
      </div>
    );
  }

  render() {
    const extendsProps = Object.keys(this.props).reduce((acc, key) => {
      if (definedProps.indexOf(key) !== -1) {
        return acc;
      }
      acc[key] = this.props[key as keyof IResizableProps];
      return acc;
    }, {} as { [key: string]: any });

    const style: React.CSSProperties = {
      position: "relative",
      userSelect: this.state.isResizing ? "none" : "auto",
      ...this.props.style,
      ...this.sizeStyle,
      maxWidth: this.props.maxWidth,
      maxHeight: this.props.maxHeight,
      minWidth: this.props.minWidth,
      minHeight: this.props.minHeight,
      boxSizing: "border-box",
      flexShrink: 0,
    };

    if (this.state.flexBasis) {
      style.flexBasis = this.state.flexBasis;
    }

    const Wrapper = this.props.as || "div";

    return (
      <Wrapper
        ref={this.ref}
        style={style}
        className={this.props.className}
        {...extendsProps}
      >
        {this.state.isResizing && <div style={this.state.backgroundStyle} />}
        {this.props.children}
        {this.renderResizer()}
      </Wrapper>
    );
  }
}

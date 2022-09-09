/* eslint-disable react/display-name */
import { Component, createRef, PureComponent, useRef } from "react";
import { IResizableProps } from "../models/props";

const baseClassName = "__resizable_base_element__";

const DEFAULT_SIZE = {
  width: "auto",
  height: "auto",
};

export class Resizer extends PureComponent {
  resizableElement: HTMLElement | null = null;
  ref: React.RefObject<HTMLElement | null>;

  constructor(props: IResizableProps) {
    super(props);

    this.ref = createRef<HTMLElement | null>();
  }
}

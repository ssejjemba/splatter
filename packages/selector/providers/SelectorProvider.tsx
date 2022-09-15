import React, { useState } from "react";
import { useMouseSelector } from "../hooks/useMouseSelector";
import "intersection-observer";

export const SelectorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div>{children}</div>;
};

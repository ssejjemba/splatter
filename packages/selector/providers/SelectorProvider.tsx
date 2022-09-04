import React, {useState} from "react"
import { useMouse } from "../hooks/useMouse"
import "intersection-observer"


export const SelectorProvider = ({children}: {children: React.ReactNode}) => {
  return (
    <div>
      {children}
    </div>
  )
}


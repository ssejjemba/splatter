import { SelectorProvider } from "selector";
import { Sample } from "../components/sample/Sample";

import classes from "../styles/Home.module.css";

export default function Web() {
  return (
    <div>
      <SelectorProvider containerClassName={classes["selector_container"]}>
        <Sample />
      </SelectorProvider>
    </div>
  );
}

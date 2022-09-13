import { SelectorProvider } from "selector";
import { Sample } from "../components/sample/Sample";

export default function Web() {
  return (
    <div>
      <SelectorProvider>
        <Sample />
      </SelectorProvider>
    </div>
  );
}

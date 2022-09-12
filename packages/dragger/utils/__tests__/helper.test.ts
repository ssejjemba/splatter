import { describe, expect, it } from "vitest";
import { clamp, getPixelSize, snap } from "../helper";

describe("These are tests for the resize helper suite", () => {
  it("Will clamp a value in the given boundaries", () => {
    const tests = [
      {
        inputs: [2, 1, 4],
        output: 2,
      },
      {
        inputs: [1, 4, 6],
        output: 4,
      },
      {
        inputs: [8, 4, 6],
        output: 6,
      },
    ];

    for (let test of tests) {
      expect(clamp(test.inputs[0], test.inputs[1], test.inputs[2])).toBe(
        test.output
      );
    }
  });

  it("Will snap a value in the given size", () => {
    const tests = [
      {
        inputs: [1, 2],
        output: 2,
      },
      {
        inputs: [14, 5],
        output: 15,
      },
      {
        inputs: [16, 5],
        output: 15,
      },
    ];

    for (let test of tests) {
      expect(snap(test.inputs[0], test.inputs[1])).toBe(test.output);
    }
  });

  it("Will get the number size from a css size", () => {
    // let's assume the window is 800 x 800
    const tests = [
      {
        inputs: ["50px", 100, 800, 800],
        output: 50,
      },
      {
        inputs: ["30%", 100, 800, 800],
        output: 30,
      },
      {
        inputs: ["20vh", 100, 800, 800],
        output: 160,
      },
      {
        inputs: ["40vw", 100, 800, 800],
        output: 320,
      },
    ];

    for (let test of tests) {
      expect(
        getPixelSize(
          test.inputs[0],
          test.inputs[1] as number,
          test.inputs[2] as number,
          test.inputs[3] as number
        )
      ).toBe(test.output);
    }
  });
});

import { current, produce } from "immer";
import { newId } from "../util";
import { pushHistory } from "./historySlice";

export const eraserSize = 20;

export const freeDrawingSlice = (set) => ({
  fdMode: null,
  fdLines: {},
  fdBrushSize: 2,
  fdBrushColor: "#000000",
  fdAddLine: (points) =>
    set(
      produce((state) => {
        const id = newId();
        const { fdLines, fdMode, fdBrushSize } = state;
        fdLines[id] = {
          id,
          points,
          color: state.fdBrushColor,
          strokeWidth: fdMode == "brush" ? fdBrushSize : eraserSize,
          globalCompositeOperation: fdMode == "brush" ? "source-over" : "destination-out",
        };
        pushHistory(state);
      })
    ),
  fdRemoveAll: () => {
    set(
      produce((state) => {
        const lines = current(state).fdLines;
        Object.keys(lines).forEach((key) => {
          delete state.fdLines[key];
        });
        pushHistory(state);
      })
    );
  },
  toggleBrush: () =>
    set(
      produce((state) => {
        state.fdMode = state.fdMode == "brush" ? null : "brush";
        while (state.selected.pop()) {}
      })
    ),
  toggleEraser: () =>
    set(
      produce((state) => {
        state.fdMode = state.fdMode == "eraser" ? null : "eraser";
        while (state.selected.pop()) {}
      })
    ),
});

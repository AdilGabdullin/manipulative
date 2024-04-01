import { current, original, produce } from "immer";
import { clearSelected } from "../util";

export const historySlice = (set) => ({
  history: [
    {
      elements: {},
      fdLines: {},
      minValue: 1,
      maxValue: 1_000_000,
      subtractorCounts: {
        1_000_000: 0,
        100_000: 0,
        10_000: 0,
        1000: 0,
        100: 0,
        10: 0,
        1: 0,
        0.1: 0,
        0.01: 0,
        0.001: 0,
      },
    },
  ],
  historyIndex: 0,

  undo: () =>
    set(
      produce((state) => {
        const curr = current(state);
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          const history = curr.history;
          const historyState = history[state.historyIndex];
          state.elements = historyState.elements;
          state.fdLines = historyState.fdLines;
          state.lastActiveElement = historyState.lastActiveElement;
          state.minValue = historyState.minValue;
          state.maxValue = historyState.maxValue;
          state.subtractorCounts = historyState.subtractorCounts;
          clearSelected(state);
        }
      })
    ),
  redo: () =>
    set(
      produce((state) => {
        const curr = current(state);
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          const history = curr.history;
          const historyState = history[state.historyIndex];
          state.elements = historyState.elements;
          state.fdLines = historyState.fdLines;
          state.lastActiveElement = historyState.lastActiveElement;
          state.minValue = historyState.minValue;
          state.maxValue = historyState.maxValue;
          state.subtractorCounts = historyState.subtractorCounts;
          clearSelected(state);
        }
      })
    ),
});

export function pushHistory(state) {
  const { historyIndex, history } = original(state);
  if (historyIndex < history.length - 1) {
    for (let i = 0; i < history.length - 1 - historyIndex; i += 1) {
      state.history.pop();
    }
  }
  const currentState = current(state);
  state.history.push({
    elements: currentState.elements,
    fdLines: currentState.fdLines,
    lastActiveElement: currentState.lastActiveElement,
    minValue: currentState.minValue,
    maxValue: currentState.maxValue,
    subtractorCounts: currentState.subtractorCounts,
  });
  state.historyIndex += 1;
}

import { current, original, produce } from "immer";
import { clearSelected } from "../util";

export const historySlice = (set) => ({
  history: [{ geoboardBands: [], elements: {}, fdLines: {} }],
  historyIndex: 0,

  undo: () =>
    set(
      produce((state) => {
        const curr = current(state);
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          const history = curr.history;
          const historyState = history[state.historyIndex];
          state.geoboardBands = historyState.geoboardBands;
          state.elements = historyState.elements;
          state.fdLines = historyState.fdLines;
          state.lastActiveElement = historyState.lastActiveElement;
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
          state.geoboardBands = historyState.geoboardBands;
          state.elements = historyState.elements;
          state.fdLines = historyState.fdLines;
          state.lastActiveElement = historyState.lastActiveElement;
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
    geoboardBands: currentState.geoboardBands,
    elements: currentState.elements,
    fdLines: currentState.fdLines,
    lastActiveElement: currentState.lastActiveElement,
  });
  state.historyIndex += 1;
}

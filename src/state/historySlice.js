import { current, original, produce } from "immer";

export const historySlice = (set) => ({
  history: [{ geoboardBands: [], elements: {}, fdLines: {} }],
  historyIndex: 0,

  undo: () =>
    set(
      produce((state) => {
        if (state.historyIndex > 0) {
          state.historyIndex -= 1;
          const history = current(state).history;
          const historyState = history[state.historyIndex];
          state.geoboardBands = historyState.geoboardBands;
          state.elements = historyState.elements;
          state.fdLines = historyState.fdLines;
        }
      })
    ),
  redo: () =>
    set(
      produce((state) => {
        if (state.historyIndex < state.history.length - 1) {
          state.historyIndex += 1;
          const history = current(state).history;
          const historyState = history[state.historyIndex];
          state.geoboardBands = historyState.geoboardBands;
          state.elements = historyState.elements;
          state.fdLines = historyState.fdLines;
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
  });
  state.historyIndex += 1;
}

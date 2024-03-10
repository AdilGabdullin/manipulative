import { useAppStore } from "../state/store";

export const bottomToolbarHeight = 60;

const bgColor = "#072846";
const buttonColor = "#20496d";

const BottomToolbar = () => {
  const state = useAppStore();
  const style = { height: bottomToolbarHeight - 10, backgroundColor: bgColor, padding: 5 };
  return (
    <div style={style}>
      <Button text="undo" onClick={state.undo} />
      <Button text="redo" onClick={state.redo} />
      <Button text="clear" onClick={state.clear} />
      <Button text="zoom in" onClick={() => state.setScale(state.scale - 0.1)} />
      <Button text="zoom out" onClick={() => state.setScale(state.scale + 0.1)} />
      <Button text="fullscreen" onClick={state.toggleFullscreen} />

      <Button text="brush" onClick={state.toggleBrush} />
      <Button text="eraser" onClick={state.toggleEraser} />

      {state.mode == "geoboard" && (
        <select onChange={(e) => state.setWorkspace(e.target.value)} value={state.workspace} style={{ fontSize: 20 }}>
          <option value="square">Square</option>
          <option value="isometric">Isometric</option>
          <option value="circular">Circular</option>
        </select>
      )}
    </div>
  );
};

const Button = (props) => {
  const style = {
    fontSize: "16px",
    backgroundColor: buttonColor,
    color: "#FFFFFF",
    height: bottomToolbarHeight - 2 * (5 + 8),
    padding: 8,
    margin: 8,
  };
  return (
    <button style={style} onClick={props.onClick}>
      {props.text}
    </button>
  );
};

export default BottomToolbar;

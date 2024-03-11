import { useAppStore } from "../state/store";

export const bottomToolbarHeight = 60;

const bgColor = "#c1cedb";

const BottomToolbar = () => {
  const state = useAppStore();
  return (
    <div className="bottom-toolbar" style={{ height: bottomToolbarHeight }}>
      <div className="bottom-toolbar-buttons">
        <Button text="undo" imageSrc="buttons/undo-min.png" onClick={state.undo} />
        <Button text="redo" imageSrc="buttons/redo-min.png" onClick={state.redo} />
        <Button text="clear" imageSrc="buttons/clear-canvas-min.png" onClick={state.clear} />
        <Button text="zoom in" imageSrc="buttons/zoom-in-min.png" onClick={() => state.setScale(state.scale - 0.1)} />
        <Button text="zoom out" imageSrc="buttons/zoom-out-min.png" onClick={() => state.setScale(state.scale + 0.1)} />
        <Button text="fullscreen" imageSrc="buttons/full-screen-min.png" onClick={state.toggleFullscreen} />

        <Button text="brush" imageSrc="buttons/pencil-min.png" onClick={state.toggleBrush} />
        <Button text="eraser" imageSrc="buttons/eraser-min.png" onClick={state.toggleEraser} />
      </div>
      {state.mode == "geoboard" && (
        <div className="workspace-selector">
          <label className="workspace-selector-label">Workspace</label>
          <select onChange={(e) => state.setWorkspace(e.target.value)} value={state.workspace}>
            <option value="square">Square</option>
            <option value="isometric">Isometric</option>
            <option value="circular">Circular</option>
          </select>
        </div>
      )}
    </div>
  );
};

const Button = ({ onClick, imageSrc, text }) => {
  return <img src={"./img/" + imageSrc} height={32} onClick={onClick} />;
};

export default BottomToolbar;

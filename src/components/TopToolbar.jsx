import { workspace } from "../config";
import { useAppStore } from "../state/store";
import ShapesMenu from "./ShapesMenu";

export const topToolbarHeight = 42;

const TopToolbar = ({ onSave }) => {
  return (
    <div className="bottom-toolbar" style={{ height: topToolbarHeight }}>
      <Buttons onSave={onSave} />
      <div style={{ display: "flex", gap: 16 }}>
        <ShapesMenu />
        <WorkspaceSelector />
      </div>
    </div>
  );
};

const Buttons = ({ onSave }) => {
  const state = useAppStore();
  return (
    <div className="bottom-toolbar-buttons">
      <Button text="undo" imageSrc="buttons/undo-min.png" onClick={state.undo} />
      <Button text="redo" imageSrc="buttons/redo-min.png" onClick={state.redo} />
      <Button text="clear" imageSrc="buttons/clear-canvas-min.png" onClick={state.clear} />
      <Button text="zoom in" imageSrc="buttons/zoom-in-min.png" onClick={() => state.setScale(state.scale + 0.1)} />
      <Button text="zoom out" imageSrc="buttons/zoom-out-min.png" onClick={() => state.setScale(state.scale - 0.1)} />
      <Button text="fullscreen" imageSrc="buttons/full-screen-min.png" onClick={state.toggleFullscreen} />
      <Button
        text="brush"
        imageSrc="buttons/pencil-min.png"
        onClick={state.toggleBrush}
        active={state.fdMode == "brush"}
      />
      <Button
        text="eraser"
        imageSrc="buttons/eraser-min.png"
        onClick={state.toggleEraser}
        active={state.fdMode == "eraser"}
      />
      <Button text="save" imageSrc="buttons/save.png" onClick={() => state.saveState(onSave)} />
    </div>
  );
};

const Button = ({ onClick, imageSrc, text, active }) => {
  return (
    <div className={"toolbar-button-wrap" + (active ? " active" : "")}>
      <img src={"./img/" + imageSrc} height={32} onClick={onClick} title={text} />
    </div>
  );
};

const WorkspaceSelector = () => {
  const state = useAppStore();
  return (
    <div className="workspace-selector">
      <label className="workspace-selector-label">Workspace</label>
      <select onChange={(e) => state.setWorkspace(e.target.value)} value={state.workspace}>
        {Object.entries(workspace).map(([key, option]) => (
          <option key={key} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TopToolbar;

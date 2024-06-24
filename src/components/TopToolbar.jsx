import { useAppStore } from "../state/store";
import { capitalizeFirstLetter } from "../util";
import ShapesMenu from "./ShapesMenu";

export const topToolbarHeight = 42;

const TopToolbar = ({ onSave }) => {
  return (
    <div className="bottom-toolbar" style={{ height: topToolbarHeight }}>
      <Buttons onSave={onSave} />
      <div style={{ display: "flex", gap: 16 }}>
        <ShapesMenu />
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

export default TopToolbar;

import { Rect } from "react-konva";
import { useAppStore } from "../state/store";

const RectElement = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, x, y, width, height, fill, locked } = props;

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], locked);
  };

  const onDragStart = (e) => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
  };

  const onDragEnd = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };

  return (
    <Rect
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      width={width}
      height={height}
      stroke={"black"}
      fill={fill ? "#56d2f5" : null}
      onPointerClick={onPointerClick}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

export default RectElement;

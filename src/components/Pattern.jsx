import { Line } from "react-konva";
import { useAppStore } from "../state/store";

const Pattern = ({ id, x, y, points, fill, fillColor, stroke, locked }) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;

  const onDragStart = (e) => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    e.target.setAttrs({ x: origin.x + x + dx, y: origin.y + y + dy });
  };

  const onDragEnd = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
  };

  return (
    <Line
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      points={points}
      fill={fill ? fillColor : null}
      stroke={stroke}
      closed
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
    />
  );
};

export default Pattern;

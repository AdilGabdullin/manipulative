import { Ellipse } from "react-konva";
import { useAppStore } from "../state/store";

const EllipseElement = (props) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const { id, x, y, radiusX, radiusY, fill, locked } = props;

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
    <Ellipse
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      radiusX={radiusX}
      radiusY={radiusY}
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

export default EllipseElement;

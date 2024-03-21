import { Line } from "react-konva";
import { useAppStore } from "../state/store";
import { distance2 } from "../util";

const Pattern = (props) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;
  const { id, x, y, points, fill, fillColor, stroke, locked } = props;

  const onDragStart = (e) => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    let dx = e.target.x() - props.x - origin.x;
    let dy = e.target.y() - props.y - origin.y;
    const { x, y } = patternMagnet(id, props.x + dx, props.y + dy, points, elements);
    e.target.setAttrs({ x: x + origin.x, y: y + origin.y });
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
      lineCap={"round"}
      lineJoin={"round"}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
    />
  );
};

export function patternMagnet(id, x, y, points, elements) {
  for (const element of Object.values(elements)) {
    if (element.id == id || element.type != "pattern") continue;
    for (const point1 of unflattenPoints(points, x, y)) {
      for (const point2 of unflattenPoints(element.points, element.x, element.y)) {
        if (distance2(point1, point2) < 20 ** 2) {
          return { x: x + point2.x - point1.x, y: y + point2.y - point1.y };
        }
      }
    }
  }
  return { x, y };
}

function unflattenPoints(points, x, y) {
  const result = [];
  for (let i = 0; i < points.length; i += 2) {
    result.push({ x: points[i] + x, y: points[i + 1] + y });
  }
  return result;
}

export default Pattern;

import { Line } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { distance2, sin } from "../util";

const Pattern = (props) => {
  const state = useAppStore();
  const { origin, elements, fdMode, showGrid } = state;
  const { id, x, y, points, fill, fillColor, stroke, locked, template } = props;

  let dragTargets = null;
  const getDragTargets = (e) => {
    if (dragTargets) return dragTargets;
    const stage = e.target.getStage();
    dragTargets = [];
    for (const pattern of template.patterns) {
      const node = stage.findOne("#" + template.id + pattern.id);
      dragTargets.push({
        node: node,
        x: pattern.x + origin.x,
        y: pattern.y + origin.y,
      });
    }
    return dragTargets;
  };

  const onDragStart = (e) => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    const dx = e.target.x() - props.x - origin.x;
    const dy = e.target.y() - props.y - origin.y;
    if (template) {
      for (const { node, x, y } of getDragTargets(e)) {
        node.setAttrs({ x: x + dx, y: y + dy });
      }
    } else {
      const { x, y } = patternMagnet(id, props.x + dx, props.y + dy, points, elements, showGrid);
      e.target.setAttrs({ x: x + origin.x, y: y + origin.y });
    }
  };

  const onDragEnd = (e) => {
    dragTargets = null;
    const dx = e.target.x() - x - origin.x;
    const dy = e.target.y() - y - origin.y;
    state.relocateElement(template ? template.id : id, dx, dy);
  };

  const onPointerClick = (e) => {
    if (fdMode) return;
    if (template) {
      state.selectIds([template.id], template.locked);
    } else {
      state.selectIds([id], elements[id].locked);
    }
  };

  return (
    <Line
      id={template ? template.id + id : id}
      x={origin.x + x}
      y={origin.y + y}
      points={points}
      fill={template ? "#dddddb" : fill ? fillColor : null}
      stroke={fill || template ? "#dddddb" : stroke}
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

export function patternMagnet(id, x, y, points, elements, isGridOn) {
  for (const point1 of unflattenPoints(points, x, y)) {
    for (const element of Object.values(elements)) {
      if (element.id == id) continue;
      if (element.type == "pattern") {
        for (const point2 of unflattenPoints(element.points, element.x, element.y)) {
          if (distance2(point1, point2) < 15 ** 2) {
            return { x: x + point2.x - point1.x, y: y + point2.y - point1.y };
          }
        }
      }
      if (element.type == "template") {
        for (const tElement of element.patterns) {
          for (const point2 of unflattenPoints(tElement.points, tElement.x, tElement.y)) {
            if (distance2(point1, point2) < 15 ** 2) {
              return { x: x + point2.x - point1.x, y: y + point2.y - point1.y };
            }
          }
        }
      }
    }
    if (isGridOn) {
      for (const point2 of gridPointsGenerator()) {
        if (distance2(point1, point2) < 15 ** 2) {
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

function* gridPointsGenerator() {
  const xStep = gridStep;
  const yStep = gridStep * sin(60);
  let shift = false;
  for (let y = -50 * yStep; y < 50 * yStep; y += yStep) {
    for (let x = -50 * gridStep; x < 50 * gridStep; x += xStep) {
      yield { x: x + (shift ? xStep / 2 : 0), y };
    }
    shift = !shift;
  }
}

export default Pattern;

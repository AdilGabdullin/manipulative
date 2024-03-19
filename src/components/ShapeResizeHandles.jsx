import { Circle } from "react-konva";
import { useAppStore } from "../state/store";

const handleRadius = 6;
const minEllipseRadius = 10;

const ShapeResizeHandles = (props) => {
  const state = useAppStore();
  const { selected, elements, origin, scale, offset } = state;
  const { x, y, width, height, findOne } = props;

  if (selected.length != 1 || !["text", "rect", "ellipse", "line"].includes(elements[selected[0]].type)) {
    return null;
  }

  const element = elements[selected[0]];
  if (!element || !["rect", "ellipse", "line"].includes(element.type)) {
    return null;
  }
  let elementNode = null;

  const onDragStart = (e) => {
    e.target
      .getStage()
      .find(".popup-menu")
      .forEach((node) => node.visible(false));
  };

  const onDragMove = (e) => {
    if (!elementNode) {
      elementNode = findOne(element.id);
    }

    const { x1, x2, y1, y2 } = getPositions(e, findOne);
    const x = Math.min(x1, x2) / scale + offset.x + 9;
    const y = Math.min(y1, y2) / scale + offset.y + 9;
    const width = Math.abs(x1 - x2) / scale - 18;
    const height = Math.abs(y1 - y2) / scale - 18;
    switch (element.type) {
      case "rect":
        elementNode.setAttrs({ x, y, width, height });
        break;
      case "ellipse":
        elementNode.setAttrs({
          x: x + width / 2,
          y: y + height / 2,
          radiusX: Math.max(width / 2, minEllipseRadius),
          radiusY: Math.max(height / 2, minEllipseRadius),
        });
        break;
      case "line":
        elementNode.setAttrs({
          x: (x1 + 8 * Math.sign(x2 - x1)) / scale + offset.x,
          y: (y1 + 8 * Math.sign(y2 - y1)) / scale + offset.y,
          points: [0, 0, (x2 - x1 - 16 * Math.sign(x2 - x1)) / scale, (y2 - y1 - 16 * Math.sign(y2 - y1)) / scale],
        });
        break;
    }
    findOne("selected-frame").setAttrs({
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x1 - x2),
      height: Math.abs(y1 - y2),
    });
  };

  const onDragEnd = (e) => {
    e.target
      .getStage()
      .find(".popup-menu")
      .forEach((node) => node.visible(false));
    const { x1, x2, y1, y2 } = getPositions(e, findOne);
    const x = Math.min(x1, x2) / scale + offset.x + 9;
    const y = Math.min(y1, y2) / scale + offset.y + 9;
    const width = Math.abs(x1 - x2) / scale - 18;
    const height = Math.abs(y1 - y2) / scale - 18;
    switch (element.type) {
      case "rect":
        state.updateElement(element.id, { x: x - origin.x, y: y - origin.y, width, height });
        break;
      case "ellipse":
        state.updateElement(element.id, {
          x: x + width / 2 - origin.x,
          y: y + height / 2 - origin.y,
          radiusX: Math.max(width / 2, minEllipseRadius),
          radiusY: Math.max(height / 2, minEllipseRadius),
        });
        break;
      case "line":
        state.updateElement(element.id, {
          x: (x1 + 8 * Math.sign(x2 - x1)) / scale + offset.x - origin.x,
          y: (y1 + 8 * Math.sign(y2 - y1)) / scale + offset.y - origin.y,
          x2: (x2 - x1 - 16 * Math.sign(x2 - x1)) / scale,
          y2: (y2 - y1 - 16 * Math.sign(y2 - y1)) / scale,
        });
        break;
    }
  };

  return (
    <>
      <Circle
        id="resize-handle-0"
        name="drag-hidden"
        x={x}
        y={y}
        radius={handleRadius}
        stroke={"#2196f3"}
        fill="#ffffff"
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
      <Circle
        id="resize-handle-1"
        name="drag-hidden"
        x={x + width}
        y={y}
        radius={handleRadius}
        stroke={"#2196f3"}
        fill="#ffffff"
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
      <Circle
        id="resize-handle-2"
        name="drag-hidden"
        x={x}
        y={y + height}
        radius={handleRadius}
        stroke={"#2196f3"}
        fill="#ffffff"
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
      <Circle
        id="resize-handle-3"
        name="drag-hidden"
        x={x + width}
        y={y + height}
        radius={handleRadius}
        stroke={"#2196f3"}
        fill="#ffffff"
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
    </>
  );
};

function getPositions(e, findOne) {
  const circles = ["resize-handle-0", "resize-handle-1", "resize-handle-2", "resize-handle-3"].map(findOne);
  const target = e.target;

  let x1, x2, y1, y2;
  switch (target.id()) {
    case "resize-handle-0":
    case "resize-handle-3":
      x1 = circles[0].x();
      y1 = circles[0].y();
      x2 = circles[3].x();
      y2 = circles[3].y();
      break;
    case "resize-handle-1":
    case "resize-handle-2":
      x2 = circles[1].x();
      y1 = circles[1].y();
      x1 = circles[2].x();
      y2 = circles[2].y();
      break;
  }

  circles[0].x(x1);
  circles[0].y(y1);
  circles[1].x(x2);
  circles[1].y(y1);
  circles[2].x(x1);
  circles[2].y(y2);
  circles[3].x(x2);
  circles[3].y(y2);
  return { x1, x2, y1, y2 };
}

export default ShapeResizeHandles;

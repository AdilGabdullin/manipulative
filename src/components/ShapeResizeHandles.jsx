import { Circle } from "react-konva";
import { useAppStore } from "../state/store";

const handleRadius = 6;
const minEllipseRadius = 10;

const ShapeResizeHandles = (props) => {
  const state = useAppStore();
  const { selected, elements, origin, scale, offset } = state;
  const { x, y, width, height, findOne } = props;

  const element = elements[selected[0]];
  if (!element || !["text", "rect", "ellipse", "line"].includes(element.type)) {
    return null;
  }

  const onDragStart = (e) => {
    e.target
      .getStage()
      .find(".popup-menu")
      .forEach((node) => node.visible(false));
  };

  let elementNode = null;
  let frameNode = null;
  let circles = null;

  const ratio = element.type == "text" ? width / height : null;

  const onDragMove = (e) => {
    if (!elementNode) {
      elementNode = findOne(element.id);
    }
    if (!frameNode) {
      frameNode = findOne("selected-frame");
    }
    if (!circles) {
      circles = ["resize-handle-0", "resize-handle-1", "resize-handle-2", "resize-handle-3"].map(findOne);
    }

    const { x1, x2, y1, y2 } = getPositions(e, circles, ratio);
    const x = Math.min(x1, x2) / scale + offset.x + 8;
    const y = Math.min(y1, y2) / scale + offset.y + 8;
    const width = Math.abs(x1 - x2) / scale - 16;
    const height = Math.abs(y1 - y2) / scale - 16;
    switch (element.type) {
      case "text":
        const s = Math.abs(x1 - x2) / props.width;
        elementNode.setAttrs({ scaleX: element.scale * s, scaleY: element.scale * s });
        break;
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
          x: x1 / scale + offset.x + 8 * Math.sign(x2 - x1),
          y: y1 / scale + offset.y + 8 * Math.sign(y2 - y1),
          points: [0, 0, (x2 - x1) / scale - 16 * Math.sign(x2 - x1), (y2 - y1) / scale - 18 * Math.sign(y2 - y1)],
        });
        break;
    }
    frameNode.setAttrs({
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
      .forEach((node) => node.visible(true));
    const { x1, x2, y1, y2 } = getPositions(e, circles, ratio);
    const x = Math.min(x1, x2) / scale + offset.x + 8;
    const y = Math.min(y1, y2) / scale + offset.y + 8;
    const width = Math.abs(x1 - x2) / scale - 16;
    const height = Math.abs(y1 - y2) / scale - 16;
    switch (element.type) {
      case "text":
        const s = Math.abs(x1 - x2) / props.width;
        const clientRect = elementNode.getClientRect();
        state.updateElement(element.id, {
          scale: element.scale * s,
          width: clientRect.width,
          height: clientRect.height,
        });
        break;
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
          x: x1 / scale + offset.x + 8 * Math.sign(x2 - x1) - origin.x,
          y: y1 / scale + offset.y + 8 * Math.sign(y2 - y1) - origin.y,
          x2: (x2 - x1) / scale - 16 * Math.sign(x2 - x1),
          y2: (y2 - y1) / scale - 16 * Math.sign(y2 - y1),
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

function getPositions(e, circles, ratio) {
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

  if (ratio) {
    switch (target.id()) {
      case "resize-handle-0":
      case "resize-handle-1":
        y1 = y2 - (x2 - x1) / ratio;
        break;
      case "resize-handle-2":
      case "resize-handle-3":
        y2 = y1 + (x2 - x1) / ratio;
        break;
    }
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

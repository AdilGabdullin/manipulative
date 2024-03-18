import { Circle } from "react-konva";
import { useAppStore } from "../state/store";

const radius = 6;

const ShapeResizeHandles = (props) => {
  const state = useAppStore();
  const { selected, elements, origin, scale } = state;
  const { x, y, width, height, findOne } = props;

  if (selected.length != 1 || !["text", "rect", "ellipse", "line"].includes(elements[selected[0]].type)) {
    return null;
  }

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

  const onDragMove = (e) => {
    const { x1, x2, y1, y2 } = getPositions(e, findOne);
    switch (element.type) {
      case "rect":
        findOne(element.id).setAttrs({
          x: Math.min(x1, x2) + 8,
          y: Math.min(y1, y2) + 8,
          width: Math.abs(x1 - x2) - 16,
          height: Math.abs(y1 - y2) - 16,
        });
        break;
      case "ellipse":
        findOne(element.id).setAttrs({
          x: (x1 + x2) / 2,
          y: (y1 + y2) / 2,
          radiusX: Math.max(Math.abs(x1 - x2) / 2 - 8, 10),
          radiusY: Math.max(Math.abs(y1 - y2) / 2 - 8, 10),
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
    switch (element.type) {
      case "rect":
        state.updateElement(element.id, {
          x: Math.min(x1, x2) + 8 - origin.x,
          y: Math.min(y1, y2) + 8 - origin.y,
          width: Math.abs(x1 - x2) - 16,
          height: Math.abs(y1 - y2) - 16,
        });
        break;
      case "ellipse":
        state.updateElement(element.id, {
          x: (x1 + x2) / 2 - origin.x,
          y: (y1 + y2) / 2 - origin.y,
          radiusX: Math.max(Math.abs(x1 - x2) / 2 - 8, 10),
          radiusY: Math.max(Math.abs(y1 - y2) / 2 - 8, 10),
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
        radius={radius}
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
        radius={radius}
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
        radius={radius}
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
        radius={radius}
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

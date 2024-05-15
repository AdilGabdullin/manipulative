import { Circle } from "react-konva";
import { useAppStore } from "../state/store";
import { config } from "../config";

const handleRadius = 6;
const minEllipseRadius = 10;

const FrameResizeHandle = (props) => {
  const state = useAppStore();
  const { selected, elements, origin, scale, offset } = state;
  const { x, y, width, height, findOne } = props;

  const id = selected.find((id) => elements[id].type == "frame");
  const element = elements[id];
  if (element?.type != "frame" || !element?.resizable) {
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

  const frameSize = config.frame.size;
  const minX = x + (16 + frameSize) * scale;
  const minY = y + (16 + frameSize) * scale;
  const onDragMove = (e) => {
    if (!elementNode) {
      elementNode = findOne(element.id);
    }
    if (!frameNode) {
      frameNode = findOne("selected-frame");
    }
    if (!circles) {
      circles = ["frame-resize-handle"].map(findOne);
    }

    const target = e.target;
    if (target.x() < minX) {
      target.x(minX);
    }
    if (target.y() < minY) {
      target.y(minY);
    }
    const x = props.x / scale + offset.x + 8;
    const y = props.y / scale + offset.y + 8;
    const width = Math.abs(target.x() - props.x) / scale - 16;
    const height = Math.abs(target.y() - props.y) / scale - 16;
    frameNode.setAttrs({
      width: Math.abs(props.x - target.x()),
      height: Math.abs(props.y - target.y()),
    });
    switch (element.type) {
      case "text":
        const scaleX = (element.scale * (Math.abs(x1 - x2) / scale - 16)) / (props.width / scale - 16);
        elementNode.setAttrs({ x, y, scaleX: scaleX, scaleY: scaleX });
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
  };

  const onDragEnd = (e) => {
    const target = e.target;
    target
      .getStage()
      .find(".popup-menu")
      .forEach((node) => node.visible(true));
    const round = (x) => Math.round(x / frameSize) * frameSize;
    const width = round(Math.abs(target.x() - props.x) / scale - 16);
    const height = round(Math.abs(target.y() - props.y) / scale - 16);
    frameNode.setAttrs({
      width: (width + 16) * scale,
      height: (height + 16) * scale,
    });
    circles[0].setAttrs({ x: props.x + (width + 16) * scale, y: props.y + (height + 16) * scale });
    state.updateElement(element.id, { width, height });
  };
  return (
    <>
      <Circle
        id="frame-resize-handle"
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

export default FrameResizeHandle;

import { Circle } from "react-konva";
import { useAppStore } from "../state/store";
import { config } from "../config";

const handleRadius = 6;
const minEllipseRadius = 10;

const FrameResizeHandle = (props) => {
  const state = useAppStore();
  const { selected, elements, origin, scale, offset } = state;
  const { x, y, width, height, findOne } = props;

  const element = selected.length == 1 && elements[selected[0]];
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

  const ratio = element.type == "text" ? width / height : null;

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
    const x = props.x / scale + offset.x + 8;
    const y = props.y / scale + offset.y + 8;
    const width = Math.abs(target.x() - props.x) / scale - 16;
    const height = Math.abs(target.y() - props.y) / scale - 16;
    const size = config.frame.size;
    const round = (x) => Math.round(x / size) * size;
    state.updateElement(element.id, { x: x - origin.x, y: y - origin.y, width: round(width), height: round(height) });
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

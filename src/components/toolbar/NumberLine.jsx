import { Group, Line, Rect } from "react-konva";
import { leftToolbarWidth } from "../LeftToolbar";
import { useRef } from "react";

const lineWidth = 10;
const headSize = 15;

export const defaultWidth = 900;

const NumberLine = ({ x, y, width, height, draggable }) => {
  const onDragMove = (e) => {
    const target = e.target;
    const stage = target.getStage();
    const pos = stage.getPointerPosition();
    target.setAttrs({ x, y });
    if (pos.x > leftToolbarWidth) {
      stage.findOne("#shadow-number-line").setAttrs({
        visible: true,
        x: pos.x,
        y: pos.y,
      });
    } else {
      stage.findOne("#shadow-number-line").setAttrs({
        visible: false,
      });
    }
  };

  const onDragEnd = (e) => {};

  return (
    <Group x={x} y={y} draggable onDragMove={onDragMove} onDragEnd={onDragEnd}>
      {draggable && <Rect width={width} height={height} />}
      <Line
        x={headSize / 2}
        y={height / 2}
        points={[0, 0, width - headSize, 0]}
        strokeWidth={lineWidth}
        stroke={"black"}
      />
      <Line
        x={0}
        y={height / 2}
        points={[0, 0, headSize, headSize, headSize, -headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
      />
      <Line
        x={width}
        y={height / 2}
        points={[0, 0, -headSize, -headSize, -headSize, headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
      />
    </Group>
  );
};

export default NumberLine;

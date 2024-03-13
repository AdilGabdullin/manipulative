import { Line, Rect } from "react-konva";

const ResizableIcon = ({ x, y, width, height }) => {
  const color = "#2b2e31";
  const arrowWidth = width * 0.35;
  const rectWidth = width - 2 * arrowWidth;
  const rectHeight = height * 0.2;
  return (
    <>
      <Rect
        stroke={color}
        fill={color}
        x={x - rectWidth / 2}
        y={y - rectHeight / 2}
        width={rectWidth}
        height={rectHeight}
      />
      <Line
        stroke={color}
        fill={color}
        points={[
          x - width / 2,
          y,
          x - width / 2 + arrowWidth,
          y - height / 2,
          x - width / 2 + arrowWidth,
          y + height / 2,
        ]}
        closed
      />
      <Line
        stroke={color}
        fill={color}
        points={[
          x + width / 2,
          y,
          x + width / 2 - arrowWidth,
          y - height / 2,
          x + width / 2 - arrowWidth,
          y + height / 2,
        ]}
        closed
      />
    </>
  );
};

export default ResizableIcon;

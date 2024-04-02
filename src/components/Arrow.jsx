import { Group, Path, Rect } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";

const strokeWidth = 10;
const headSize = 25;
export const arWidth = 200;
export const arHeight = 100;

const Arrow = ({ id, x, y, width, height, isBlue, visible }) => {
  const state = useAppStore();
  const { origin } = state;

  const color = isBlue ? colors.blue : colors.red;
  const headX = isBlue ? width : 0;
  const headY = height;

  const onDragStart = (e) => {};

  const onDragMove = (e) => {};

  const onDragEnd = (e) => {};

  return (
    <Group
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      <Rect width={width} height={height} stroke={"black"} />
      <Path
        x={isBlue ? -strokeWidth / 2 : width + strokeWidth / 2}
        y={height}
        fill={color}
        data={`
          m 0 0 
          a ${width / 2} ${height} 0 0 1
            ${width - headSize / 4.5}
            ${-headSize}
          h ${-strokeWidth}
          a ${width / 2 - strokeWidth} ${height - strokeWidth} 0 0 0
            ${2 * strokeWidth - width + headSize / 4.5}
            ${headSize}
          h ${-strokeWidth}
        `}
        scaleX={isBlue ? 1.13 : -1.13}
      />
      <Path
        x={headX}
        y={headY}
        fill={color}
        stroke={color}
        data={`
          m 0 0
          l ${-headSize / 2} ${-headSize}
          l ${headSize} ${0}
          l ${-headSize / 2} ${headSize}
        `}
      />
      <Rect width={width} height={height} stroke={"black"} />
    </Group>
  );
};

export default Arrow;

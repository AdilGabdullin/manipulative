import { Arc, Group, Line, Path, Rect } from "react-konva";
import { colors } from "../state/colors";
import { cos, sin } from "../util";

const strokeWidth = 10;
const headSize = 25;

const ToolbarArrow = ({ x, y, width, height, isBlue }) => {
  const color = isBlue ? colors.blue : colors.red;
  const headX = isBlue ? width : 0;
  const headY = height;

  return (
    <Group x={x} y={y}>
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
        // stroke={"black"}
        data={`
          m 0 0
          l ${-headSize / 2} ${-headSize}
          l ${headSize} ${0}
          l ${-headSize / 2} ${headSize}
        `}
      />
      {/* <Rect width={width} height={height} stroke={"black"} /> */}
    </Group>
  );
};

export default ToolbarArrow;

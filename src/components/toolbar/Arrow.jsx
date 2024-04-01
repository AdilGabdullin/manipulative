import { Group, Path, Rect } from "react-konva";
import { colors } from "../../state/colors";
import { leftToolbarWidth } from "../LeftToolbar";

const strokeWidth = 10;
const headSize = 25;

const Arrow = ({ x, y, width, height, isBlue, draggable }) => {
  const color = isBlue ? colors.blue : colors.red;
  const headX = isBlue ? width : 0;
  const headY = height;

  const onDragMove = (e) => {
    const target = e.target;
    const stage = target.getStage();
    const {x,y} = stage.getPointerPosition();
  };

  const onDragEnd = (e) => {

  };

  return (
    <Group x={x} y={y} draggable={draggable} onDragMove={onDragMove} onDragEnd={onDragEnd}>
      {draggable && <Rect width={width} height={height} />}
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

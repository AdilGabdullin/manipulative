import { Group, Path, Rect } from "react-konva";
import { colors } from "../../state/colors";
import { leftToolbarWidth } from "../LeftToolbar";
import { useAppStore } from "../../state/store";
import { arHeight, arWidth } from "../Arrow";
import { getStageXY } from "../../util";

const strokeWidth = 10;
const headSize = 25;

const Arrow = ({ x, y, width, height, isBlue, draggable }) => {
  const state = useAppStore();
  const { addElement, origin } = state;

  const color = isBlue ? colors.blue : colors.red;
  const headX = isBlue ? width : 0;
  const headY = height;

  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-arrow-" + (isBlue ? "blue" : "red")));
  };

  const onDragStart = (e) => {
    getShadow(e).setAttrs({ visible: true });
  };

  const onDragMove = (e) => {
    const target = e.target;
    const pos = target.getStage().getPointerPosition();
    target.setAttrs({ x, y });
    if (pos.x > leftToolbarWidth) {
      const stagePos = getStageXY(e.target.getStage(), state);
      getShadow(e).setAttrs({
        x: origin.x + stagePos.x,
        y: origin.y + stagePos.y,
        visible: true,
      });
    } else {
      getShadow(e).setAttrs({
        visible: false,
      });
    }
  };

  const onDragEnd = (e) => {
    getShadow(e).setAttrs({
      visible: false,
    });
    addElement({
      type: "arrow",
      width: arWidth,
      height: arHeight,
      isBlue: isBlue,
      ...getStageXY(e.target.getStage(), state),
    });
  };

  return (
    <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
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

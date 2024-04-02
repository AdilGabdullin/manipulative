import { Group, Line, Rect } from "react-konva";
import { leftToolbarWidth } from "../LeftToolbar";
import { defaultHeight, defaultWidth, lineWidth } from "../NumberLine";
import { useAppStore } from "../../state/store";
import { getStageXY } from "../../util";

const NumberLine = ({ x, y, width, height }) => {
  const state = useAppStore();
  const { addElement, origin } = state;

  const headSize = height / 2;

  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-number-line"));
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
      type: "number-line",
      width: defaultWidth,
      height: defaultHeight,
      ...getStageXY(e.target.getStage(), state),
    });
  };

  return (
    <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
      <Rect width={width} height={height} stroke={"black"} />
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

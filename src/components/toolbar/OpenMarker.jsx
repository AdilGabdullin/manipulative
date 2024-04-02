import { Group, Rect } from "react-konva";
import { colors } from "../../state/colors";
import { useAppStore } from "../../state/store";
import { leftToolbarWidth } from "../LeftToolbar";
import { getStageXY } from "../../util";

export const omWidth = 60;
export const omHeight = 100;

const OpenMarker = ({ x, y, width, height }) => {
  const state = useAppStore();
  const { addElement, origin } = state;

  const top = {
    width: width / 20,
    height: width * 0.4,
  };
  const window = {
    width: width * 0.8,
    height: width * 0.8,
    margin: width * 0.1,
  };
  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-open-marker"));
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
      type: "open-marker",
      width: omWidth,
      height: omHeight,
      ...getStageXY(e.target.getStage(), state),
    });
  };

  return (
    <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
      <Rect width={width} height={height} stroke={"black"} />
      <Rect
        x={width / 2 - top.width / 2}
        y={0}
        width={top.width}
        height={top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
      />
      <Rect
        x={0}
        y={top.height}
        width={width}
        height={height - top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
        cornerRadius={8}
      />
      <Rect
        x={window.margin}
        y={top.height + window.margin}
        width={window.width}
        height={window.height}
        fill={"white"}
      />
    </Group>
  );
};

export default OpenMarker;

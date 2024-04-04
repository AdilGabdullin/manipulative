import { Group, Rect } from "react-konva";
import { colors } from "../../state/colors";
import { useAppStore } from "../../state/store";
import { leftToolbarWidth } from "../LeftToolbar";
import { getStageXY } from "../../util";
import { omHeight, omWidth, openMarkerMagnet } from "../OpenMarker";
import { useRef } from "react";

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

  const toolbarShadow = useRef();

  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-open-marker"));
  };

  const onDragStart = (e) => {
    getShadow(e).setAttrs({ visible: true });
    toolbarShadow.current.visible(true);
  };

  const onDragMove = (e) => {
    const target = e.target;
    const pos = target.getStage().getPointerPosition();
    if (pos.x > leftToolbarWidth) {
      let stagePos = getStageXY(e.target.getStage(), state);
      stagePos = openMarkerMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2 }, state);
      target.visible(false);
      getShadow(e).setAttrs({
        x: origin.x + stagePos.x,
        y: origin.y + stagePos.y,
        visible: true,
      });
    } else {
      target.visible(true);
      getShadow(e).setAttrs({
        visible: false,
      });
    }
  };

  const onDragEnd = (e) => {
    let stagePos = getStageXY(e.target.getStage(), state);
    stagePos = openMarkerMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2 }, state);
    e.target.setAttrs({ x, y, visible: true });
    toolbarShadow.current.visible(false);
    getShadow(e).setAttrs({
      visible: false,
    });
    if (e.target.getStage().getPointerPosition().x > leftToolbarWidth) {
      addElement({
        type: "open-marker",
        width: omWidth,
        height: omHeight,
        x: stagePos.x,
        y: stagePos.y,
        text: "",
      });
    }
  };

  return (
    <>
      <Group ref={toolbarShadow} x={x} y={y} visible={false}>
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
      <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
        <Rect width={width} height={height} />
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
    </>
  );
};

export default OpenMarker;

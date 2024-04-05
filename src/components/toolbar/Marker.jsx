import { Circle, Group, Path, Rect } from "react-konva";
import { colors } from "../../state/colors";
import { useAppStore } from "../../state/store";
import { leftToolbarWidth } from "../LeftToolbar";
import { cos, getStageXY, sin } from "../../util";
import { useRef } from "react";
import { mHeight, mWidth, markerMagnet } from "../Marker";

const Marker = ({ x, y, width, height }) => {
  const state = useAppStore();
  const { addElement, origin } = state;
  const toolbarShadow = useRef();
  const angle = 60;
  const r1 = width / 2 - 5;
  const r2 = width / 2;
  const cx = width / 2;
  const cy = r2;
  const dx = r2 * cos(angle);
  const dy = r2 * sin(angle);

  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-marker"));
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
      stagePos = markerMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2, width, height }, state);
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
    stagePos = markerMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2, width, height }, state);
    e.target.setAttrs({ x, y, visible: true });
    toolbarShadow.current.visible(false);
    getShadow(e).setAttrs({
      visible: false,
    });
    if (e.target.getStage().getPointerPosition().x > leftToolbarWidth) {
      addElement({
        type: "marker",
        width: mWidth,
        height: mHeight,
        x: stagePos.x,
        y: stagePos.y,
        text: "",
      });
    }
  };

  return (
    <>
      <Group ref={toolbarShadow} x={x} y={y} visible={false}>
        <Circle x={cx} y={cy} radius={r2} fill={colors.purple} />
        <Circle x={cx} y={cy} radius={r1} fill={colors.white} />
        <Path
          stroke={colors.purple}
          fill={colors.purple}
          data={`
            M ${cx - dx} ${cy + dy}
            A ${r2} ${r2} 0 0 0 ${cx + dx} ${cy + dy}
            L ${cx} ${height}
            L ${cx - dx} ${cy + dy}
          `}
        />
      </Group>
      <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
        <Circle x={cx} y={cy} radius={r2} fill={colors.purple} />
        <Circle x={cx} y={cy} radius={r1} fill={colors.white} />
        <Path
          stroke={colors.purple}
          fill={colors.purple}
          data={`
            M ${cx - dx} ${cy + dy}
            A ${r2} ${r2} 0 0 0 ${cx + dx} ${cy + dy}
            L ${cx} ${height}
            L ${cx - dx} ${cy + dy}
          `}
        />
        <Rect width={width} height={height} />
      </Group>
    </>
  );
};

export default Marker;

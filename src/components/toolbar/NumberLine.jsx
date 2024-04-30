import { Group, Line, Rect } from "react-konva";
import { leftToolbarWidth } from "../LeftToolbar";
import { nlHeight, nlWidth, nlLineWidth, defaultMinMax } from "../NumberLine";
import { useAppStore } from "../../state/store";
import { getStageXY } from "../../util";
import { useRef } from "react";
import { colors } from "../../state/colors";

const NumberLine = ({ x, y, width, height }) => {
  const state = useAppStore();
  const { addElement, origin, workspace } = state;

  const headSize = height / 2;
  const toolbarShadow = useRef();
  const haveNotches = workspace != "Open";

  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-number-line"));
  };

  const onDragStart = (e) => {
    getShadow(e).setAttrs({ visible: true });
    toolbarShadow.current.visible(true);
  };

  const onDragMove = (e) => {
    const target = e.target;
    const pos = target.getStage().getPointerPosition();
    if (pos.x > leftToolbarWidth) {
      const stagePos = getStageXY(e.target.getStage(), state);
      target.visible(false);
      getShadow(e).setAttrs({
        x: origin.x + stagePos.x - width / 2,
        y: origin.y + stagePos.y - height / 2,
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
    const stagePos = getStageXY(e.target.getStage(), state);
    e.target.setAttrs({ x, y, visible: true });
    toolbarShadow.current.visible(false);
    getShadow(e).setAttrs({
      visible: false,
    });
    if (e.target.getStage().getPointerPosition().x > leftToolbarWidth) {
      addElement({
        type: "number-line",
        width: nlWidth,
        height: nlHeight,
        x: stagePos.x - width / 2,
        y: stagePos.y - height / 2,
        ...defaultMinMax(state.workspace),
      });
    }
  };

  const props = { width, height, headSize };

  return (
    <>
      <Group ref={toolbarShadow} x={x} y={y} visible={false}>
        <MainLine {...props} />
        <LeftHead {...props} />
        <RightHead {...props} />
        {workspace != "Open" && <Notches {...props} />}
      </Group>
      <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
        <Rect width={width} height={height} />
        <MainLine {...props} />
        <LeftHead {...props} />
        <RightHead {...props} />
        {workspace != "Open" && <Notches {...props} />}
      </Group>
    </>
  );
};

const MainLine = ({ width, height, headSize }) => {
  return (
    <Line
      x={headSize / 2}
      y={height / 2}
      points={[0, 0, width - headSize, 0]}
      strokeWidth={nlLineWidth}
      stroke={colors.woodBrown}
    />
  );
};

const LeftHead = ({ width, height, headSize }) => {
  return (
    <Line
      x={0}
      y={height / 2}
      points={[0, 0, headSize, headSize, headSize, -headSize, 0, 0]}
      stroke={colors.woodBrown}
      fill={colors.woodBrown}
      closed
    />
  );
};

const RightHead = ({ width, height, headSize }) => {
  return (
    <Line
      x={width}
      y={height / 2}
      points={[0, 0, -headSize, -headSize, -headSize, headSize, 0, 0]}
      stroke={colors.woodBrown}
      fill={colors.woodBrown}
      closed
    />
  );
};

const Notches = ({ width, height, headSize }) => {
  const step = (width - 2 * headSize) / 4;
  const xs = [step, step * 2, step * 3];
  return xs.map((x) => (
    <Line
      key={x}
      x={headSize + x}
      y={height / 4}
      points={[0, 0, 0, height / 2]}
      strokeWidth={nlLineWidth / 2}
      stroke={colors.woodBrown}
      fill={colors.woodBrown}
      lineCap="round"
    />
  ));
};

export default NumberLine;

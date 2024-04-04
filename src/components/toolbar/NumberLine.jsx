import { Group, Line, Rect } from "react-konva";
import { leftToolbarWidth } from "../LeftToolbar";
import { nlHeight, nlWidth, nlLineWidth } from "../NumberLine";
import { useAppStore } from "../../state/store";
import { getStageXY } from "../../util";
import { useRef } from "react";

const NumberLine = ({ x, y, width, height }) => {
  const state = useAppStore();
  const { addElement, origin } = state;

  const headSize = height / 2;
  const toolbarShadow = useRef();

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
      });
    }
  };

  return (
    <>
      <Group ref={toolbarShadow} x={x} y={y} visible={false}>
        <Rect width={width} height={height} />
        <Line
          x={headSize / 2}
          y={height / 2}
          points={[0, 0, width - headSize, 0]}
          strokeWidth={nlLineWidth}
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
      <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
        <Rect width={width} height={height} />
        <Line
          x={headSize / 2}
          y={height / 2}
          points={[0, 0, width - headSize, 0]}
          strokeWidth={nlLineWidth}
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
    </>
  );
};

export default NumberLine;

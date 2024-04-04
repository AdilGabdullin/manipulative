import { Group, Path, Rect } from "react-konva";
import { colors } from "../../state/colors";
import { leftToolbarWidth } from "../LeftToolbar";
import { useAppStore } from "../../state/store";
import { arHeight, arWidth, arrowMagnet } from "../Arrow";
import { getStageXY, asin, cos, sin } from "../../util";
import { useRef } from "react";

const strokeWidth = 10;
const headSize = 25;

const Arrow = (props) => {
  const state = useAppStore();
  const { addElement, origin } = state;
  const { x, y, width, height, isBlue } = props;

  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-arrow-" + (isBlue ? "blue" : "red")));
  };

  const group = useRef();
  const toolbarShadow = useRef();
  const arc = useRef();
  const rect = useRef();
  const head = useRef();

  const arcProps = ({ width, height, isBlue, shiftX, shiftY }) => {
    shiftX = shiftX || 0;
    shiftY = shiftY || 0;
    width = Math.abs(width);
    const rx1 = width / 2 - strokeWidth / 2;
    const rx2 = width / 2 + strokeWidth / 2;
    const ry1 = height - strokeWidth / 2;
    const ry2 = height + strokeWidth / 2;
    const theta = asin(headSize / ry2) - width / height;
    return {
      x: width / 2 + shiftX,
      y: height + shiftY,
      fill: isBlue ? colors.blue : colors.red,
      scaleX: isBlue ? 1 : -1,
      data: `
      M ${-rx2} 0 
      A ${rx2} ${ry2} 0 0 1 ${rx2 * cos(theta)} ${-ry2 * sin(theta)}
      L ${rx1 * cos(theta)} ${-ry1 * sin(theta)}
      A ${rx1} ${ry1} 0 0 0 ${-rx1} ${0}
      L ${-rx2} 0 
    `,
    };
  };

  const headProps = ({ width, height, isBlue, shiftX, shiftY }) => {
    shiftX = shiftX || 0;
    shiftY = shiftY || 0;
    const ry2 = height + strokeWidth / 2;
    const theta = asin(headSize / ry2) * (isBlue ? 1 : -1);
    const color = isBlue ? colors.blue : colors.red;
    return {
      x: isBlue ? Math.abs(width) + shiftX : 0 + shiftX,
      y: height + shiftY,
      fill: color,
      stroke: color,
      data: `
      M ${headSize * cos(-120 - theta)} ${headSize * sin(-120 - theta)}
      L ${headSize * cos(-60 - theta)} ${headSize * sin(-60 - theta)}
      L 0 0
    `,
    };
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
      stagePos = arrowMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2, height }, state);
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
    stagePos = arrowMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2, height }, state);
    e.target.setAttrs({ x, y, visible: true });
    toolbarShadow.current.visible(false);
    getShadow(e).setAttrs({
      visible: false,
    });
    if (e.target.getStage().getPointerPosition().x > leftToolbarWidth) {
      addElement({
        type: "arrow",
        width: arWidth,
        height: arHeight,
        isBlue: isBlue,
        x: stagePos.x,
        y: stagePos.y,
        text: "",
      });
    }
  };

  return (
    <>
      <Group ref={toolbarShadow} x={x} y={y} visible={false}>
        <Path ref={arc} {...arcProps(props)} />
        <Path ref={head} {...headProps(props)} />
      </Group>
      <Group ref={group} x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
        <Path ref={arc} {...arcProps(props)} />
        <Path ref={head} {...headProps(props)} />
        <Rect ref={rect} x={0} y={0} width={width} height={height} />
      </Group>
    </>
  );
};

export default Arrow;

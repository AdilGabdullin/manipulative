import { Group, Path, Rect, Text } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { useRef } from "react";
import { numberBetween } from "../util";
import { mk, notchStep } from "./NumberLine";

const strokeWidth = 10;
const headSize = 25;
export const sarWidth = 130;
export const sarHeight = 50;

const StraightArrow = (props) => {
  const state = useAppStore();
  const { origin, selectIds, relocateElement, updateElement } = state;
  const { id, x, y, width, height, isBlue, visible, locked, text } = props;

  const headX = isBlue ? width : 0;

  const pos = {
    x: origin.x + x,
    y: origin.y + y,
  };

  const textProps = ({ width, height, isBlue, shiftX, shiftY, text }) => {
    shiftX = shiftX || 0;
    shiftY = shiftY || 0;
    const color = isBlue ? colors.blue : colors.red;
    const prefix = width == 0 ? "" : isBlue ? "+" : "-";
    return {
      x: shiftX - 100,
      y: shiftY - 30,
      width: Math.abs(width) + 200,
      text: text !== undefined ? prefix + text : "",
      fill: color,
    };
  };

  const updateNodes = (newProps) => {
    head.current.setAttrs(headProps(newProps));
    arc.current.setAttrs(arcProps(newProps));
    textRef.current.setAttrs(textProps(newProps));
  };

  const group = useRef();
  const arc = useRef();
  const head = useRef();
  const textRef = useRef();

  const groupDragMove = (e) => {
    if (e.target === group.current) {
      const dx = e.target.x() - pos.x;
      const dy = e.target.y() - pos.y;
      const newPos = arrowMagnet({ x: x + dx, y: y + dy, height }, state);
      e.target.setAttrs({ x: origin.x + newPos.x, y: origin.y + newPos.y });
    }
  };

  const groupDragEnd = (e) => {
    if (e.target === group.current) {
      relocateElement(id, e.target.x() - pos.x, e.target.y() - pos.y);
    }
  };

  const groupClick = () => selectIds([id], locked);

  const headDragMove = (e) => {
    const dx = e.target.x() - headX;
    e.target.setAttrs({ y: 0 });
    if (isBlue) {
      const isBlue = width + dx > 0;
      const shiftX = isBlue ? 0 : width + dx;
      updateNodes(headMagnet({ ...props, width: width + dx, height, isBlue, shiftX }, state));
    } else {
      const isBlue = width - dx < 0;
      const shiftX = isBlue ? width : dx;
      const newProps = headMagnet({ ...props, width: width - dx, x: dx, height, isBlue, shiftX }, state);
      updateNodes(newProps);
    }
  };

  const headDragEnd = (e) => {
    const dx = e.target.x() - headX;
    e.target.setAttrs({ y: 0 });
    if (isBlue) {
      const isBlue = width + dx >= 0;
      const shiftX = isBlue ? 0 : width + dx;
      const newWidth = Math.abs(width + dx);
      const newProps = headMagnet({ ...props, x: props.x + shiftX, width: newWidth, height, isBlue }, state);
      head.current.setAttrs(headProps(newProps));
      textRef.current.setAttrs(textProps(newProps));
      arc.current.setAttrs(arcProps(newProps));
      updateElement(id, newProps);
    } else {
      const isBlue = width - dx <= 0;
      const shiftX = isBlue ? width : dx;
      const newWidth = Math.abs(width - dx);
      const newProps = headMagnet({ ...props, x: props.x + shiftX, width: newWidth, height, isBlue }, state);
      head.current.setAttrs(headProps(newProps));
      textRef.current.setAttrs(textProps(newProps));
      arc.current.setAttrs(arcProps(newProps));
      updateElement(id, newProps);
    }
  };

  return (
    <Group
      ref={group}
      id={id}
      x={pos.x}
      y={pos.y}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragMove={groupDragMove}
      onDragEnd={groupDragEnd}
      onPointerClick={groupClick}
    >
      {/* <Rect x={0} y={0} width={width} height={height} stroke={"black"}/> */}
      <Rect ref={arc} {...arcProps(props)} />
      <Path ref={head} {...headProps(props)} draggable onDragMove={headDragMove} onDragEnd={headDragEnd} />
      <Text ref={textRef} fontFamily="Calibri" fontSize={24} align="center" {...textProps(props)} />
    </Group>
  );
};

export function arcProps({ width, height, isBlue, shiftX, shiftY }) {
  shiftX = shiftX || 0;
  shiftY = shiftY || 0;
  width = Math.abs(width);
  return {
    x: shiftX + (isBlue ? 0 : headSize),
    y: shiftY + height / 2 - strokeWidth / 2,
    fill: isBlue ? colors.blue : colors.red,
    width: width - headSize,
    height: strokeWidth,
  };
}

export function headProps({ width, height, isBlue, shiftX, shiftY }) {
  shiftX = shiftX || 0;
  shiftY = shiftY || 0;
  width = Math.abs(width);

  const color = isBlue ? colors.blue : colors.red;
  return {
    x: isBlue ? Math.abs(width) + shiftX : 0 + shiftX,
    y: shiftY,
    fill: color,
    stroke: color,
    data: `
    M ${isBlue ? -headSize : headSize} ${0}
    l ${isBlue ? headSize : -headSize} ${headSize}
    l ${isBlue ? -headSize : headSize} ${headSize}
    v ${-2 * headSize}
  `,
  };
}

export function arrowMagnet(props, state) {
  let { x, y, width, height, text } = props;
  const sens = 250;
  const lines = Object.values(state.elements).filter((e) => e.type == "number-line");
  for (const line of lines) {
    const { m, k } = mk(state, line.denominator || 1);
    if (numberBetween(y + height, line.y + line.height / 2 - sens, line.y + line.height / 2 + sens)) {
      if (state.workspace != "Open") {
        const firstNotch = line.x + line.height * 2;
        const range = line.max - line.min;
        const step = ((line.width - line.height * 4) / range) * notchStep(range);
        x = x - ((x - firstNotch) % (step / k));
        width = m * step;
        text = m * notchStep(range);
      }
      return { x, y, width, text };
    }
  }
  return props;
}

function headMagnet(props, state) {
  if (state.workspace == "Open") {
    return props;
  }
  const { x, y, width, height, shiftX } = props;
  const sens = 250;
  const lines = Object.values(state.elements).filter((e) => e.type == "number-line");
  for (const line of lines) {
    const { k } = mk(state, line.denominator || 1);
    if (numberBetween(y + height, line.y + line.height / 2 - sens, line.y + line.height / 2 + sens)) {
      const range = line.max - line.min;
      const step = (((line.width - line.height * 4) / range) * notchStep(range)) / k;
      const newText = Math.abs(Math.round(width / step) / k) * notchStep(range);
      const newWidth = Math.round(width / step) * step;
      const newShiftX = Math.round(shiftX / step) * step;
      return { ...props, width: newWidth, shiftX: newShiftX, text: newText };
    }
  }
  return props;
}

export default StraightArrow;

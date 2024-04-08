import { Group, Path, Rect, Text } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { useRef } from "react";
import { asin, atan2, cos, numberBetween, sin } from "../util";
import { mk, nlLineWidth, notchStep } from "./NumberLine";

const strokeWidth = 10;
const headSize = 25;
export const arWidth = 260;
export const arHeight = 130;
const minHeight = 100;
const rhWidth = 50;
const rhHeight = strokeWidth;

const Arrow = (props) => {
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
      const newProps = arrowMagnet({ ...props, x: x + dx, y: y + dy }, state);
      e.target.setAttrs({ ...newProps, x: origin.x + newProps.x, y: origin.y + newProps.y });
    }
  };

  const groupDragEnd = (e) => {
    if (e.target === group.current) {
      const dx = e.target.x() - pos.x;
      const dy = e.target.y() - pos.y;
      const newProps = arrowMagnet({ ...props, x: x + dx, y: y + dy }, state);
      updateElement(id, { ...props, x: newProps.x, y: newProps.y });
    }
  };

  const groupClick = () => selectIds([id], locked);

  const headDragMove = (e) => {
    const dx = e.target.x() - headX;
    e.target.setAttrs({ y: height });
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
    e.target.setAttrs({ y: height });
    if (isBlue) {
      const isBlue = width + dx >= 0;
      const shiftX = isBlue ? 0 : width + dx;
      const newWidth = Math.abs(width + dx);
      head.current.setAttrs({ x: 0 });
      textRef.current.setAttrs({ x: -100, y: -30 });
      updateElement(id, headMagnet({ ...props, x: props.x + shiftX, width: newWidth, height, isBlue }, state));
    } else {
      const isBlue = width - dx <= 0;
      const shiftX = isBlue ? width : dx;
      const newWidth = Math.abs(width - dx);
      const newProps = { ...props, x: props.x + shiftX, width: newWidth, height, isBlue };
      head.current.setAttrs({ x: 0 });
      textRef.current.setAttrs({ x: -100, y: -30 });
      updateElement(id, headMagnet(newProps, state));
    }
  };

  const resizeHandleDragMove = (e) => {
    const dy = Math.min(e.target.y() + rhHeight / 2, height - minHeight);
    e.target.setAttrs({ x: width / 2 - rhWidth / 2, y: -rhHeight / 2 + dy });
    const newHeight = height - dy;
    const shiftY = dy;
    updateNodes({ ...props, height: newHeight, shiftY });
  };
  const resizeHandleDragEnd = (e) => {
    const dy = Math.min(e.target.y() + rhHeight / 2, height - minHeight);
    e.target.setAttrs({ x: width / 2 - rhWidth / 2, y: -rhHeight / 2 });
    const newHeight = height - dy;
    textRef.current.setAttrs({ x: -100, y: -30 });
    updateElement(id, { ...props, height: newHeight, y: y + dy });
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
      <Path ref={arc} {...arcProps(props)} />
      <Path ref={head} {...headProps(props)} draggable onDragMove={headDragMove} onDragEnd={headDragEnd} />
      <Rect
        x={width / 2 - rhWidth / 2}
        y={-rhHeight / 2}
        width={rhWidth}
        height={rhHeight}
        draggable
        onDragMove={resizeHandleDragMove}
        onDragEnd={resizeHandleDragEnd}
      />
      <Text ref={textRef} fontFamily="Calibri" fontSize={24} align="center" {...textProps(props)} />
    </Group>
  );
};

export function arcProps({ width, height, isBlue, shiftX, shiftY }) {
  shiftX = shiftX || 0;
  shiftY = shiftY || 0;
  width = Math.abs(width);
  const rx1 = width / 2 - strokeWidth / 2;
  const rx2 = width / 2 + strokeWidth / 2;
  const ry1 = height - strokeWidth / 2;
  const ry2 = height + strokeWidth / 2;
  let theta = asin(headSize / ry2);

  if (height / width > 3) {
    theta -= 4;
  } else {
    theta -= 2;
  }
  return {
    x: width / 2 + shiftX,
    y: height + shiftY,
    fill: isBlue ? colors.blue : colors.red,
    scaleX: isBlue ? 1 : -1,
    data:
      width < 5
        ? `M ${-strokeWidth / 2 + width / 2} ${-height} h ${strokeWidth}
           v ${height - headSize * sin(60)} h ${-strokeWidth}
           v ${-height + headSize * sin(60)}
          `
        : `
          M ${-rx2} 0 
          A ${rx2} ${ry2} 0 0 1 ${rx2 * cos(theta)} ${-ry2 * sin(theta)}
          L ${rx1 * cos(theta)} ${-ry1 * sin(theta)}
          A ${rx1} ${ry1} 0 0 0 ${-rx1} ${0}
          L ${-rx2} 0 
        `,
  };
}

export function headProps({ width, height, isBlue, shiftX, shiftY }) {
  shiftX = shiftX || 0;
  shiftY = shiftY || 0;
  const ry2 = height + strokeWidth / 2;

  width = Math.abs(width);
  const theta = asin(headSize / ry2);
  let alpha = (90 - atan2((height / 2) * sin(theta), width / 2 - (width / 2) * cos(theta))) * (isBlue ? 1 : -1);
  if (width / height > 3) {
    alpha *= 0.5;
  } else if (width / height > 1) {
    alpha *= 0.7;
  }
  const color = isBlue ? colors.blue : colors.red;
  return {
    x: isBlue ? Math.abs(width) + shiftX : 0 + shiftX,
    y: height + shiftY,
    fill: color,
    stroke: color,
    data: `
    M ${headSize * cos(-120 - alpha)} ${headSize * sin(-120 - alpha)}
    L ${headSize * cos(-60 - alpha)} ${headSize * sin(-60 - alpha)}
    L 0 0
  `,
  };
}

export function arrowMagnet(props, state) {
  let { x, y, width, height, text } = props;
  const sens = 50;
  const lines = Object.values(state.elements).filter((e) => e.type == "number-line");
  const { m, k } = mk(state);
  for (const line of lines) {
    if (
      numberBetween(x, line.x, line.x + line.width) &&
      numberBetween(y + height, line.y + line.height / 2 - sens, line.y + line.height / 2 + sens)
    ) {
      if (state.workspace != "Open") {
        const firstNotch = line.x + line.height * 2;
        const range = line.max - line.min;
        const step = ((line.width - line.height * 4) / range) * notchStep(range);
        x = x - ((x - firstNotch) % (step / k));
        width = m * step;
        text = m * notchStep(range);
      }
      return { x: x, y: line.y + (line.height - nlLineWidth) / 2 - height, width, text };
    }
  }
  return { ...props };
}

function headMagnet(props, state) {
  if (state.workspace == "Open") {
    return props;
  }
  const { x, y, width, height, shiftX } = props;
  const sens = 50;
  const { k } = mk(state);
  const lines = Object.values(state.elements).filter((e) => e.type == "number-line");
  for (const line of lines) {
    if (
      numberBetween(x, line.x, line.x + line.width) &&
      numberBetween(y + height, line.y + line.height / 2 - sens, line.y + line.height / 2 + sens)
    ) {
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

export default Arrow;

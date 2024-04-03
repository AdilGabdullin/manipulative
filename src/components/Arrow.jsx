import { Group, Path, Rect, Text } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { useRef } from "react";
import { asin, cos, numberBetween, sin } from "../util";
import { nlLineWidth } from "./NumberLine";

const strokeWidth = 10;
const headSize = 25;
export const arWidth = 130;
export const arHeight = 65;
const minHeight = 50;
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

  const textProps = ({ width, height, isBlue, shiftX, shiftY }) => {
    shiftX = shiftX || 0;
    shiftY = shiftY || 0;
    const color = isBlue ? colors.blue : colors.red;
    return {
      x: shiftX - 100,
      y: shiftY - 50,
      width: Math.abs(width) + 200,
      text: text ? (isBlue ? "+" : "-") + text : "",
      fill: color,
      stroke: color,
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
    e.target.setAttrs({ y: height });
    if (isBlue) {
      const isBlue = width + dx > 0;
      const shiftX = isBlue ? 0 : width + dx;
      updateNodes({ ...props, width: width + dx, height, isBlue, shiftX });
    } else {
      const isBlue = width - dx < 0;
      const shiftX = isBlue ? width : dx;
      const newProps = { ...props, width: width - dx, x: dx, height, isBlue, shiftX };
      updateNodes(newProps);
    }
  };

  const headDragEnd = (e) => {
    const dx = e.target.x() - headX;
    e.target.setAttrs({ y: height });
    if (isBlue) {
      const isBlue = width + dx > 0;
      const shiftX = isBlue ? 0 : width + dx;
      const newWidth = Math.abs(width + dx);
      head.current.setAttrs({ x: 0 });
      textRef.current.setAttrs({ x: -100, y: -50 });
      updateElement(id, { ...props, x: props.x + shiftX, width: newWidth, height, isBlue });
    } else {
      const isBlue = width - dx < 0;
      const shiftX = isBlue ? width : dx;
      const newWidth = Math.abs(width - dx);
      const newProps = { ...props, x: props.x + shiftX, width: newWidth, height, isBlue };
      head.current.setAttrs({ x: 0 });
      textRef.current.setAttrs({ x: -100, y: -50 });
      updateElement(id, newProps);
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
    textRef.current.setAttrs({ x: -100, y: -50 });
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

export function arrowMagnet({ x, y, height }, state) {
  const sens = 50;
  const lines = Object.values(state.elements).filter((e) => e.type == "number-line");
  for (const line of lines) {
    if (
      numberBetween(x, line.x, line.x + line.width) &&
      numberBetween(y + height, line.y + line.height / 2 - sens, line.y + line.height / 2 + sens)
    ) {
      return { x, y: line.y + (line.height - nlLineWidth) / 2 - height };
    }
  }
  return { x, y };
}

export default Arrow;

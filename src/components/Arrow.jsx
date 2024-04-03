import { Arc, Circle, Group, Path, Rect } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { useRef } from "react";
import { asin, atan2, cos, sin } from "../util";

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
  const { id, x, y, width, height, isBlue, visible, locked } = props;

  x && console.log({ x, width });

  const headX = isBlue ? width : 0;

  const pos = {
    x: origin.x + x,
    y: origin.y + y,
  };

  const arcProps = ({ width, height, isBlue, shift }) => {
    shift = shift || 0;
    width = Math.abs(width);
    const rx1 = width / 2 - strokeWidth / 2;
    const rx2 = width / 2 + strokeWidth / 2;
    const ry1 = height - strokeWidth / 2;
    const ry2 = height + strokeWidth / 2;
    const theta = asin(headSize / ry2);
    return {
      x: width / 2 + shift,
      y: height,
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

  const headProps = ({ width, height, isBlue, shift }) => {
    shift = shift || 0;
    const ry2 = height + strokeWidth / 2;
    const theta = asin(headSize / ry2) * (isBlue ? 1 : -1);
    const color = isBlue ? colors.blue : colors.red;
    return {
      x: isBlue ? Math.abs(width) + shift : 0 + shift,
      y: height,
      fill: color,
      stroke: color,
      data: `
      M ${headSize * cos(-120 - theta)} ${headSize * sin(-120 - theta)}
      L ${headSize * cos(-60 - theta)} ${headSize * sin(-60 - theta)}
      L 0 0
    `,
    };
  };

  const updateNodes = (newProps) => {
    let { shift, width, height } = newProps;
    shift = shift || 0;
    head.current.setAttrs(headProps(newProps));
    arc.current.setAttrs(arcProps(newProps));
    rect.current.setAttrs({ x: shift, y: 0, width: Math.abs(width), height });
  };

  const group = useRef();
  const arc = useRef();
  const rect = useRef();
  const head = useRef();

  const groupDragMove = (e) => {
    if (e.target === group.current) {
      // TODO magnet
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
      const shift = isBlue ? 0 : width + dx;
      updateNodes({ ...props, width: width + dx, height, isBlue, shift });
    } else {
      const isBlue = width - dx < 0;
      const shift = isBlue ? width : dx;
      const newProps = { ...props, width: width - dx, x: dx, height, isBlue, shift };
      updateNodes(newProps);
    }
  };

  const headDragEnd = (e) => {
    const dx = e.target.x() - headX;
    e.target.setAttrs({ y: height });
    if (isBlue) {
      const isBlue = width + dx > 0;
      const shift = isBlue ? 0 : width + dx;
      const newWidth = Math.abs(width + dx);
      rect.current.setAttrs({ x: 0, y: 0 });
      updateElement(id, { ...props, x: props.x + shift, width: newWidth, height, isBlue });
    } else {
      const isBlue = width - dx < 0;
      const shift = isBlue ? width : dx;
      const newWidth = Math.abs(width - dx);
      const newProps = { ...props, x: props.x + shift, width: newWidth, height, isBlue };
      rect.current.setAttrs({ x: 0, y: 0 });
      head.current.setAttrs({x: 0});
      updateElement(id, newProps);
    }
  };

  const resizeHandleDragMove = (e) => {
    const dy = Math.min(e.target.y() + rhHeight / 2, height - minHeight);
    e.target.setAttrs({ x: width / 2 - rhWidth / 2, y: -rhHeight / 2 + dy });
    const newHeight = height - dy;
    arc.current.setAttrs({ data: arcData(width, newHeight) });
    head.current.setAttrs({ data: headData(width, newHeight, isBlue) });
  };
  const resizeHandleDragEnd = (e) => {
    const dy = Math.min(e.target.y() + rhHeight / 2, height - minHeight);
    e.target.setAttrs({ x: width / 2 - rhWidth / 2, y: -rhHeight / 2 });
    const newHeight = height - dy;
    updateElement(id, { y: pos.y - origin.y + dy, height: newHeight });
    arc.current.setAttrs({ data: arcData(width, newHeight) });
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
      <Rect ref={rect} x={0} y={0} width={width} height={height} stroke={"black"} />
      <Path ref={arc} {...arcProps(props)} />
      <Path ref={head} {...headProps(props)} draggable onDragMove={headDragMove} onDragEnd={headDragEnd} />
      <Rect
        x={width / 2 - rhWidth / 2}
        y={-rhHeight / 2}
        width={rhWidth}
        height={rhHeight}
        stroke={"black"}
        draggable
        onDragMove={resizeHandleDragMove}
        onDragEnd={resizeHandleDragEnd}
      />
    </Group>
  );
};

export default Arrow;

import { Arc, Circle, Group, Path, Rect } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";
import { useRef } from "react";

const strokeWidth = 10;
const headSize = 25;
export const arWidth = 130;
export const arHeight = 65;
const minHeight = 50;

const Arrow = ({ id, x, y, width, height, isBlue, visible, locked }) => {
  const state = useAppStore();
  const { origin, selectIds, relocateElement, updateElement } = state;

  const color = isBlue ? colors.blue : colors.red;
  const headX = isBlue ? width : 0;
  const headY = height + headSize / 4;

  const pos = {
    x: origin.x + x,
    y: origin.y + y,
  };

  const arcData = (width, height) => {
    const shift = width < 0 ? width : 0;
    width = Math.abs(width);
    return `
      m ${shift} 0 
      a ${width / 2} ${height} 0 0 1
        ${width + strokeWidth * Math.sign(width)}
        ${0}
      h ${-strokeWidth}
      a ${width / 2 - strokeWidth} ${height - strokeWidth} 0 0 0
        ${strokeWidth * Math.sign(width) - width}
        ${0}
      h ${-strokeWidth}
    `;
  };

  const group = useRef();
  const arc = useRef();
  const rect = useRef();
  const head = useRef();
  return (
    <Group
      ref={group}
      id={id}
      x={pos.x}
      y={pos.y}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragMove={(e) => {
        if (e.target === group.current) {
        }
      }}
      onDragEnd={(e) => {
        if (e.target === group.current) {
          relocateElement(id, e.target.x() - pos.x, e.target.y() - pos.y);
        }
      }}
      onPointerClick={() => selectIds([id], locked)}
    >
      <Rect ref={rect} width={width} height={height} stroke={"black"} />
      <Path ref={arc} x={-strokeWidth / 2} y={height} fill={color} data={arcData(width, height)} />
      <Path
        ref={head}
        x={headX}
        y={headY}
        fill={color}
        stroke={color}
        data={`
          m 0 0
          l ${-headSize / 2} ${-headSize}
          l ${headSize} ${0}
          l ${-headSize / 2} ${headSize}
        `}
        draggable
        onDragMove={(e) => {
          const x = e.target.x();
          const dx = x - headX;
          e.target.setAttrs({ y: headY });
          const newWidth = isBlue ? headX + dx : width - x;
          const newX = isBlue ? -strokeWidth / 2 : -strokeWidth / 2 + dx;
          const newIsBlue = isBlue ? dx > -width : dx > width;
          const newColor = newIsBlue ? colors.blue : colors.red;
          arc.current.setAttrs({
            x: newX,
            data: arcData(newWidth, height),
            fill: newColor,
          });
          head.current.setAttrs({ fill: newColor, stroke: newColor });
          rect.current.setAttrs({ width: newWidth, x: newX + strokeWidth / 2 });
        }}
        onDragEnd={(e) => {
          const x = e.target.x();
          const dx = x - headX;
          e.target.setAttrs({ x: 0, y: headY });
          const newWidth = isBlue ? headX + dx : width - x;
          const newX = isBlue ? pos.x - origin.x : pos.x + dx - origin.x;
          arc.current.setAttrs({
            x: -strokeWidth / 2,
          });
          rect.current.setAttrs({ x: 0, y: 0 });
          updateElement(id, { x: newX, width: newWidth });
        }}
      />
      <Circle
        x={width / 2}
        y={0}
        radius={6}
        draggable
        onPointerEnter={(e) => e.target.setAttrs({ stroke: colors.blue, fill: colors.white })}
        onPointerLeave={(e) => e.target.setAttrs({ stroke: null, fill: null })}
        onDragMove={(e) => {
          const dy = Math.min(e.target.y(), height - minHeight);
          e.target.setAttrs({ x: width / 2, y: dy });
          const newHeight = height - dy;
          arc.current.setAttrs({
            data: arcData(width, newHeight),
          });
        }}
        onDragEnd={(e) => {
          const dy = Math.min(e.target.y(), height - minHeight);
          e.target.setAttrs({ x: width / 2, y: 0 });
          const newHeight = height - dy;
          updateElement(id, { y: pos.y - origin.y + dy, height: newHeight });
          arc.current.setAttrs({
            data: arcData(width, newHeight),
          });
        }}
      />
    </Group>
  );
};

export default Arrow;

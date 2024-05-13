import { Group, Line, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, config, workspace } from "../config";
import { useRef } from "react";
import Notches from "./Notches";
import { pointsIsClose } from "../util";

export const nlWidth = config.tile.size * 22;
export const nlHeight = 26;
export const nlLineWidth = 4;
const nlMinWidth = config.tile.size * 3;

const NumberLine = (props) => {
  const state = useAppStore();
  const { origin, relocateElement, fdMode, selectIds } = state;
  let { id, x, y, width, height, visible, locked, min, max, denominator } = props;
  x = Math.round(x);
  y = Math.round(y);
  const headSize = height / 2;
  const groupPos = { x: origin.x + x, y: origin.y + y };
  const rectPos = { x: headSize, y: 0 };
  const linePos = { x: headSize, y: height / 2 };

  const group = useRef();
  const line = useRef();
  const leftHead = useRef();
  const rightHead = useRef();

  const setColor = (targets, color) => {
    if (fdMode) return;
    for (const target of targets) {
      target.setAttrs({
        stroke: color,
        fill: color,
      });
    }
  };

  const size = config.tile.size;

  return (
    <Group
      ref={group}
      id={id}
      {...groupPos}
      visible={visible !== undefined ? visible : true}
      draggable={!locked && !fdMode}
      onDragMove={(e) => {
        if (e.target === group.current) {
          const pos = lineMagnet(e.target.x() - origin.x, e.target.y() - origin.y, state);
          if (pos) {
            e.target.setAttrs({ x: origin.x + pos.x, y: origin.y + pos.y });
          }
        }
      }}
      onDragEnd={(e) => {
        if (e.target === group.current) {
          relocateElement(id, e.target.x() - groupPos.x, e.target.y() - groupPos.y);
        }
      }}
      onPointerClick={() => selectIds([id], locked)}
    >
      <Line
        ref={line}
        {...linePos}
        points={[0, 0, width - headSize * 2, 0]}
        strokeWidth={nlLineWidth}
        stroke={"black"}
      />
      <Rect
        {...rectPos}
        width={width - 2 * headSize}
        height={height}
        onPointerEnter={(e) => {
          const notches = e.target.getStage().find(`.${id}-notch`);
          setColor([...notches, line.current, leftHead.current, rightHead.current], colors.blue);
        }}
        onPointerLeave={(e) => {
          const notches = e.target.getStage().find(`.${id}-notch`);
          setColor([...notches, line.current, leftHead.current, rightHead.current], colors.black);
        }}
      />
      <Line
        ref={leftHead}
        x={0}
        y={height / 2}
        points={[0, 0, headSize, headSize, headSize, -headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
        draggable={!locked && !fdMode}
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          let dx = Math.min(e.target.x() - 0, width - nlMinWidth);
          dx = Math.round(dx / size) * size;
          e.target.setAttrs({ x: dx, y: height / 2 });
          const numberLine = state.elements.numberLine;
          const { x, y, width: nWidth, min, max } = numberLine;
          state.updateElement("numberLine", { x: x + dx, width: nWidth - dx, min: min + dx / size });
        }}
      />
      <Line
        ref={rightHead}
        x={width}
        y={height / 2}
        points={[0, 0, -headSize, -headSize, -headSize, headSize, 0, 0]}
        stroke={"black"}
        fill="black"
        closed
        draggable={!locked && !fdMode}
        onPointerEnter={(e) => setColor([e.target], colors.blue)}
        onPointerLeave={(e) => setColor([e.target], colors.black)}
        onDragMove={(e) => {
          let dx = Math.max(e.target.x() - width, nlMinWidth - width);
          dx = Math.round(dx / size) * size;
          e.target.setAttrs({ x: width + dx, y: height / 2 });
          const numberLine = state.elements.numberLine;
          state.updateElement("numberLine", { width: numberLine.width + dx, max: numberLine.max + dx / size });
        }}
      />
      <Notches {...props} />
    </Group>
  );
};

export function notchStep() {
  return 1;
}

export function notchX(i) {
  return (1 + i) * config.tile.size;
}

export function mk() {
  return { m: 10, k: 1 };
}

export function lineZeroPos(state) {
  const size = config.tile.size;
  const { x, y, height } = state.elements.numberLine;
  return { x: Math.round(x + size), y: Math.round(y + height / 2 - size) };
}

export function magnetToLine(tile, state) {
  if (state.workspace != workspace.numberLine) return null;
  const size = config.tile.size;
  const { x, y } = lineZeroPos(state);
  const { min, max } = state.elements.numberLine;
  for (let i = -1; i < max - min + 1; i++) {
    const topPoint = { x: x + i * size, y };
    const bottomPoint = { x: x + i * size, y: y + size };
    if (pointsIsClose(tile, topPoint, 20)) return topPoint;
    if (pointsIsClose(tile, bottomPoint, 20)) return bottomPoint;
  }
  return null;
}

export function lineMagnet(x, y, state) {
  const size = config.tile.size;
  const elements = state.elements;
  const { min, max, height } = elements.numberLine;
  if (state.showGrid) {
    return { x: Math.round(x / size) * size, y: Math.round(y / size) * size - height / 2 };
  }
  const dxStop = (max - min + 2) * size;
  for (const tile of Object.values(elements)) {
    if (tile.type != "tile") continue;
    for (const dy of [height / 2 - size, height / 2]) {
      for (let dx = 0; dx < dxStop; dx += size) {
        if (pointsIsClose(tile, { x: x + dx, y: y + dy }, 20)) return { x: tile.x - dx, y: tile.y - dy };
      }
    }
  }
  return null;
}

export default NumberLine;

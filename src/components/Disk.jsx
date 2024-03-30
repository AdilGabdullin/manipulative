import { Circle, Group, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { fromStageXY, pointsIsClose, toStageXY } from "../util";
import { useEffect, useRef } from "react";
import { Animation } from "konva/lib/Animation";

export const radius = 32;
export const duration = 400;

const Disk = (props) => {
  const state = useAppStore();
  const { origin, selectIds, elements, relocateElement } = state;
  const { id, value, color, locked, moveFrom, visible } = props;
  const x = origin.x + props.x;
  const y = origin.y + props.y;
  const diskRef = useRef(null);

  useEffect(() => {
    animateMove(diskRef.current, moveFrom, state);
  }, [moveFrom]);

  const onPointerClick = (e) => {
    selectIds([id], locked);
  };

  const onDragMove = (e) => {
    const targetPos = { x: e.target.x() - origin.x, y: e.target.y() - origin.y };
    const pos = magnet(id, targetPos, elements);
    if (pos) {
      e.target.setAttrs({ x: origin.x + pos.x, y: origin.y + pos.y });
    }
  };
  const onDragEnd = (e) => {
    const group = e.target;
    relocateElement(id, group.x() - x, group.y() - y);
  };

  return (
    <Group
      id={id}
      ref={diskRef}
      x={x}
      y={y}
      visible={visible}
      onPointerClick={onPointerClick}
      draggable
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      <Circle x={0} y={0} fill={color} radius={radius} />
      <Text
        x={-radius}
        y={-fontSize(value) / 2}
        width={radius * 2}
        text={format(value)}
        fontFamily={"Calibri"}
        fontSize={fontSize(value)}
        wrap="char"
        align="center"
        verticalAlign="center"
        fill={"white"}
        color={"white"}
      />
    </Group>
  );
};

const intl = new Intl.NumberFormat("en-US");

export function format(value) {
  return intl.format(value);
}

export function magnet(id, pos, elements) {
  for (const [elementId, element] of Object.entries(elements)) {
    if (elementId == id || element.type != "disk") continue;
    for (const [dx, dy] of [
      [-radius, -radius],
      [-radius, 0],
      [-radius, radius],
      [0, -radius],
      [0, radius],
      [radius, -radius],
      [radius, 0],
      [radius, radius],
      [0, -radius * 2],
      [0, radius * 2],
      [-radius * 2, 0],
      [radius * 2, 0],
    ]) {
      const point = { x: element.x + dx, y: element.y + dy };
      if (pointsIsClose(pos, point, 16)) {
        return point;
      }
    }
  }
  return null;
}

export function fontSize(value) {
  if (value == 1_000_000) return 15;
  if (value == 100_000) return 18;
  return 22;
}

function animateMove(node, moveFrom, state) {
  if (!moveFrom) return;
  const { origin } = state;
  const xFrom = moveFrom.x + origin.x;
  const yFrom = moveFrom.y + origin.y;
  const xTo = node.x();
  const yTo = node.y();
  node.setAttrs({ x: xFrom, y: yFrom, visible: true });
  const animation = new Animation(({ time }) => {
    if (time > duration) {
      animation.stop();
      node.setAttrs({ x: xTo, y: yTo });
      return;
    }
    const t = time / duration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    node.setAttrs({
      x: xFrom * (1 - k) + xTo * k,
      y: yFrom * (1 - k) + yTo * k,
    });
  }, node.getLayer());
  animation.start();
}

export default Disk;

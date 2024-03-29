import { Circle, Group, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { fromStageXY, pointsIsClose, toStageXY } from "../util";
import { useEffect, useRef } from "react";
import { Animation } from "konva/lib/Animation";

export const radius = 32;

const Disk = (props) => {
  const state = useAppStore();
  const { origin, selectIds, elements, relocateElement, scale, offset } = state;
  const { id, value, color, locked, moveTo } = props;
  const x = origin.x + props.x;
  const y = origin.y + props.y;
  const diskRef = useRef(null);

  useEffect(() => {
    if (moveTo) {
      animateMove(diskRef.current, moveTo, state);
    }
  }, []);

  const onPointerClick = (e) => {
    selectIds([id], locked);
  };

  const onDragMove = (e) => {
    const targetPos = { x: e.target.x(), y: e.target.y() };
    const pos = magnet(id, toStageXY(targetPos, state), elements);
    if (pos) {
      e.target.setAttrs(fromStageXY(pos, state));
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

function animateMove(node, moveTo, state) {
  const duration = 400;
  const x0 = node.x();
  const y0 = node.y();
  const { x, y } = fromStageXY(moveTo, state);
  const animation = new Animation(({ time }) => {
    if (time > duration) {
      animation.stop();
      node.setAttrs({ x, y });
    } else {
    //   const n = InOutQuadBlend(time / duration);
    //   const n = BezierBlend(time / duration);
      const n = ParametricBlend(time / duration);
      node.setAttrs({
        x: x0 * (1 - n) + x * n,
        y: y0 * (1 - n) + y * n,
      });
    }
  }, node.getLayer());
  animation.start();
}

function InOutQuadBlend(t) {
  if (t <= 0.5) return 2.0 * t * t;
  t -= 0.5;
  return 2.0 * t * (1.0 - t) + 0.5;
}

function BezierBlend(t) {
  return t * t * (3.0 - 2.0 * t);
}

function ParametricBlend(t) {
  const sqr = t * t;
  return sqr / (2.0 * (sqr - t) + 1.0);
}

export default Disk;

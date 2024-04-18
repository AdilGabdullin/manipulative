import { Line } from "react-konva";
import { useAppStore } from "../state/store";
import { menuHeight } from "./Menu";
import config from "../config";

export const maxOffset = 500;

const Scrolls = () => {
  const state = useAppStore();
  const { width, height, offset } = state;
  const scrollWidth = (300 * window.innerWidth) / 2000;
  const scrollHeight = 220;
  const xMin = config.leftToolbar.width + 12;
  const xMax = width - scrollWidth - 18;
  const xProgress = (offset.x + maxOffset) / 2 / maxOffset;
  const hx = xMin * (1 - xProgress) + xMax * xProgress;
  const hy = height - 12;
  const yMin = menuHeight + 12;
  const yMax = height - scrollHeight - 18;
  const yProgress = (offset.y + maxOffset) / 2 / maxOffset;
  const vx = width - 12;
  const vy = yMin * (1 - yProgress) + yMax * yProgress;

  const xProgressNext = (node) => {
    const range = xMax - xMin;
    const x = Math.max(Math.min(node.x(), range * (1 - xProgress)), range * (0 - xProgress));
    const nextProgress = xProgress + x / range;
    const offset = nextProgress * 2 * maxOffset - maxOffset;
    return { x, offset };
  };

  const yProgressNext = (node) => {
    const range = yMax - yMin;
    const y = Math.max(Math.min(node.y(), range * (1 - yProgress)), range * (0 - yProgress));
    const nextProgress = yProgress + y / range;
    const offset = nextProgress * 2 * maxOffset - maxOffset;
    return { y, offset };
  };

  const onHorizontalDrag = (e) => {
    const node = e.target;
    const { x, offset } = xProgressNext(node);
    node.getStage().findOne("#board-layer").offsetX(offset);
    node.getStage().findOne("#free-drawing-layer").offsetX(offset);
    node.setAttrs({
      x: x,
      y: 0,
    });
  };

  const onVerticalDrag = (e) => {
    const node = e.target;
    const { y, offset } = yProgressNext(node);
    node.getStage().findOne("#board-layer").offsetY(offset);
    node.getStage().findOne("#free-drawing-layer").offsetY(offset);
    node.setAttrs({
      x: 0,
      y: y,
    });
  };

  const onHorizontalDragEnd = (e) => {
    const node = e.target;
    state.setOffsetX(xProgressNext(node).offset);
    node.setAttrs({
      x: 0,
      y: 0,
    });
  };

  const onVerticalDragEnd = (e) => {
    const node = e.target;
    state.setOffsetY(yProgressNext(node).offset);
    node.setAttrs({
      x: 0,
      y: 0,
    });
  };

  return (
    <>
      <Line
        id="vertical-scroll"
        points={[vx, vy, vx, vy + scrollHeight]}
        stroke="#e0e0e0"
        strokeWidth={8}
        lineCap="round"
        draggable
        onDragStart={() => state.clearSelect()}
        onDragMove={onVerticalDrag}
        onDragEnd={onVerticalDragEnd}
      />
      <Line
        id="horizontal-scroll"
        points={[hx, hy, hx + scrollWidth, hy]}
        stroke="#e0e0e0"
        strokeWidth={8}
        lineCap="round"
        draggable
        onDragStart={() => state.clearSelect()}
        onDragMove={onHorizontalDrag}
        onDragEnd={onHorizontalDragEnd}
      />
    </>
  );
};

export default Scrolls;

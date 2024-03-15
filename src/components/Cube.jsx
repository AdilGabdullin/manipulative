import { Image } from "react-konva";
import { cubeShift, cubeSize, useAppStore } from "../state/store";
import { numberBetween } from "../util";

const Cube = ({ id, x, y, image, onPointerClick, rotation, locked }) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const d = 47;
  const sens = 12;

  const onDragStart = () => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    const node = e.target;
    const x = node.x() - origin.x;
    const y = node.y() - origin.y;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id() || el.rotation != rotation) continue;
      if (rotation == 1) {
        if (numberBetween(x - d, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x - cubeShift + d);
          e.target.y(el.y + origin.y - cubeShift);
        }
        if (numberBetween(x + d, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x - cubeShift - d);
          e.target.y(el.y + origin.y - cubeShift);
        }
      } else {
        if (numberBetween(y - d, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y - cubeShift + d);
          e.target.x(el.x + origin.x - cubeShift);
        }
        if (numberBetween(y + d, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y - cubeShift - d);
          e.target.x(el.x + origin.x - cubeShift);
        }
      }
    }
  };
  const onDragEnd = (e) => {
    const dx = e.target.x() - x - origin.x + cubeShift;
    const dy = e.target.y() - y - origin.y + cubeShift;
    state.relocateElement(id, dx, dy);
  };
  return (
    <Image
      id={id}
      x={origin.x + x - cubeShift}
      y={origin.y + y - cubeShift}
      width={cubeSize}
      height={cubeSize}
      image={image}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
    />
  );
};

export default Cube;

import { Image, Rect } from "react-konva";
import { cubeShift, cubeSize, gridStep, useAppStore } from "../state/store";
import { distance2, getStageXY, numberBetween } from "../util";

export const leftToolbarWidth = 180;
const ids = {
  "linking-cubes": [
    "cube-0-up",
    "cube-0-right",
    "cube-1-up",
    "cube-1-right",
    "cube-2-up",
    "cube-2-right",
    "cube-3-up",
    "cube-3-right",
    "cube-4-up",
    "cube-4-right",
    "cube-5-up",
    "cube-5-right",
    "cube-6-up",
    "cube-6-right",
    "cube-7-up",
    "cube-7-right",
    "cube-8-up",
    "cube-8-right",
    "cube-9-up",
    "cube-9-right",
  ],
};

const colors = {
  "linking-cubes": [
    "#ffc000",
    "#e22da1",
    "#1b57c1",
    "#009bdd",
    "#20a19a",
    "#008f30",
    "#4ba82c",
    "#fdd700",
    "#df040b",
    "#8e8e8e",
  ],
};

const LeftToolbar = ({ findOne }) => {
  const state = useAppStore();
  const { origin, fullscreen, addElement } = state;
  const margin = fullscreen ? 20 : 10;
  const images = ids["linking-cubes"].map((id) => document.getElementById(id));
  const baseHeight = ((state.height - margin * 12) / images.length) * 2;
  const baseWidth = (baseHeight / images[0].height) * images[0].width;
  const height = baseWidth;
  const width = baseWidth;
  const left = (leftToolbarWidth - width * 2) / 3;

  const imageX = (i) => left + (left + width) * (i % 2);
  const imageY = (i) => margin * (Math.floor(i / 2) + 1) + height * Math.floor(i / 2);

  const onDragStart = (e, i) => {
    state.clearSelect();
    e.target.visible(false);
    findOne("shadow-image").setAttrs({
      visible: true,
      image: images[i],
    });
  };

  const d = 49;
  const sens = 12;
  const magnet = (i, { x, y }) => {
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.rotation != i % 2) continue;
      if (i % 2 == 0) {
        if (numberBetween(x - d + 9, el.x - sens, el.x + sens) && numberBetween(y - d + 56, el.y - sens, el.y + sens)) {
          x = el.x + d - 9;
          y = el.y + d - 56;
        }
        if (numberBetween(x - d + 9, el.x - sens, el.x + sens) && numberBetween(y - d - 38, el.y - sens, el.y + sens)) {
          x = el.x + d - 9;
          y = el.y + d + 38;
        }
      } else {
        if (numberBetween(y - d + 9, el.y - sens, el.y + sens) && numberBetween(x - d + 56, el.x - sens, el.x + sens)) {
          y = el.y + d - 9;
          x = el.x + d - 56;
        }
        if (numberBetween(y - d + 9, el.y - sens, el.y + sens) && numberBetween(x - d - 38, el.x - sens, el.x + sens)) {
          y = el.y + d - 9;
          x = el.x + d + 38;
        }
      }
    }
    return { x, y };
  };

  const onDragMove = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    findOne("shadow-image").setAttrs({
      x: origin.x + x - cubeSize / 2 - cubeShift,
      y: origin.y + y - cubeSize / 2 - cubeShift,
    });
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    findOne("shadow-image").setAttrs({ visible: false });
    state.addElement({
      type: "cube",
      rotation: i % 2,
      x: x - cubeSize / 2,
      y: y - cubeSize / 2,
      width: gridStep - 5,
      height: gridStep,
      image: images[i],
      color: colors["linking-cubes"][Math.floor(i / 2)],
    });
  };

  const closestGrid = (movePos) => {
    const grid = state.grid;
    let closest = grid[0];
    let d = distance2(closest, movePos);
    for (let i = 0; i < grid.length; i++) {
      if (distance2(grid[i], movePos) < d) {
        d = distance2(grid[i], movePos);
        closest = grid[i];
      }
    }
    return closest;
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {images.map((image, i) => (
        <Image key={i} x={imageX(i)} y={imageY(i)} image={image} width={width} height={height} />
      ))}
      {images.map((image, i) => (
        <Image
          key={i}
          x={imageX(i)}
          y={imageY(i)}
          image={image}
          width={width}
          height={height}
          draggable
          onDragStart={(e) => onDragStart(e, i)}
          onDragMove={(e) => onDragMove(e, i)}
          onDragEnd={(e) => onDragEnd(e, i)}
          onPointerClick={(e) => {
            findOne("shadow-image").setAttrs({ visible: false });
            addElement({
              type: "cube",
              rotation: i % 2,
              width: gridStep - 5,
              height: gridStep,
              image: images[i],
              color: colors["linking-cubes"][Math.floor(i / 2)],
            });
          }}
        />
      ))}
    </>
  );
};

export default LeftToolbar;

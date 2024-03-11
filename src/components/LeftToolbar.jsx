import { Image, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { distance2, getStageXY } from "../util";

export const leftToolbarWidth = 180;
const ids = {
  geoboard: ["band-0", "band-1", "band-2", "band-3", "band-4", "band-5"],
  "linking-cubes": ["cube-0-up", "cube-0-right"],
};

const colors = {
  geoboard: ["#d90080", "#900580", "#002a84", "#20a19a", "#fdd700", "#df040b"],
};

const LeftToolbar = ({ findOne }) => {
  const state = useAppStore();
  const { mode, origin } = state;
  const images = ids[mode].map((id) => document.getElementById(id));
  const width = images[0].width * 0.75;
  const height = images[0].height * 0.75;
  const left = (leftToolbarWidth - width) / 2;
  const margin = (state.height - images.length * height) / (images.length + 1);

  const imageX = (i) => left;
  const imageY = (i) => margin * (i + 1) + height * i;

  const onDragStart = (e, i) => {
    if (mode == "linking-cubes") {
      e.target.visible(false);
      findOne("shadow-image").setAttrs({
        visible: true,
        image: images[i],
      });
    }
  };

  const onDragMove = (e, i) => {
    if (mode == "linking-cubes") {
      const { x, y } = getStageXY(e.target.getStage(), state);
      findOne("shadow-image").setAttrs({
        x: origin.x + x - 26,
        y: origin.y + y - 26,
      });
    }
  };

  const onDragEnd = (e, i) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    switch (mode) {
      case "geoboard":
        const closest = closestGrid({ x, y });
        state.addBand(closest.x, closest.y, colors[mode][i]);
        break;
      case "linking-cubes":
        findOne("shadow-image").setAttrs({ visible: false });
        state.addElement({
          type: "cube",
          x: x - 26,
          y: y - 26,
          width: images[i].width,
          height: images[i].height,
          // color: colors[mode][i],
          image: images[i],
        });
        break;
    }
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
        />
      ))}
    </>
  );
};

export default LeftToolbar;

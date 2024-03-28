import { Image, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { distance2, getStageXY } from "../util";

export const leftToolbarWidth = 180;
const ids = ["band-0", "band-1", "band-2", "band-3", "band-4", "band-5"];
const colors = ["#d90080", "#900580", "#002a84", "#20a19a", "#fdd700", "#df040b"];

const LeftToolbar = () => {
  const state = useAppStore();
  const images = ids.map((id) => document.getElementById(id));
  const width = 110;
  const height = (width / images[0].width) * images[0].height;
  const left = (leftToolbarWidth - width) / 2;
  const margin = (state.height - images.length * height) / (images.length + 1);

  const imageX = (i) => left;
  const imageY = (i) => margin * (i + 1) + height * i;

  const onDragStart = (e, i) => {
    state.clearSelect();
  };

  const onDragEnd = (e, i) => {
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    const closest = closestGrid(getStageXY(e.target.getStage(), state));
    state.addBand(closest.x, closest.y, colors[i]);
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
          onDragEnd={(e) => onDragEnd(e, i)}
        />
      ))}
    </>
  );
};

export default LeftToolbar;

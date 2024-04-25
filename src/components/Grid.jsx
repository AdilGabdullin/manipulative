import { Line } from "react-konva";
import { colors, config } from "../config";
import { useAppStore } from "../state/store";

const Grid = ({}) => {
  const { width, height, origin, scale, offset } = useAppStore();
  const { size } = config.tile;
  const vPoints = [0, offset.y, 0, height / scale + offset.y];
  const hPoints = [offset.x, 0, width / scale + offset.x, 0];
  const lines = [];
  const x0 = Math.round(offset.x + ((origin.x - offset.x) % size));
  const xStop = width / scale + offset.x;
  for (let x = x0; x < xStop; x += size) {
    lines.push({ x: x, y: 0, points: vPoints });
  }
  const y0 = Math.round(offset.y + ((origin.y - offset.y) % size));
  const yStop = height / scale + offset.y;
  for (let y = y0; y < yStop; y += size) {
    lines.push({ x: 0, y: y, points: hPoints });
  }

  return (
    <>
      {lines.map((props, i) => (
        <Line key={i} {...props}
          stroke={colors.grey}
          // stroke={colors.black}
          strokeWidth={2}
        />
      ))}
    </>
  );
};

export default Grid;

import { Line } from "react-konva";
import { useAppStore } from "../state/store";

const Grid = () => {
  const state = useAppStore();
  const { showGrid } = state;
  if (showGrid) {
    return <LineGrid />;
  }
  return null;
};

const LineGrid = () => {
  const state = useAppStore();
  const { origin, lineGrid } = state;
  const { x, y } = origin;
  return (
    <>
      {lineGrid.map((points, i) => {
        const [x1, y1, x2, y2] = points;
        return <Line key={i} points={[x1 + x, y1 + y, x2 + x, y2 + y]} stroke={"#dddddb"} strokeWidth={1} />;
      })}
      {/* <Circle x={origin.x} y={origin.y} radius={4} fill="red" /> */}
    </>
  );
};

export default Grid;

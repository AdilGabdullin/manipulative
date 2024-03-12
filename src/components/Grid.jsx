import { Circle, Line } from "react-konva";
import { boardSize, gridStep, useAppStore } from "../state/store";

const Grid = () => {
  const state = useAppStore();
  const { mode, origin, lineGrid } = state;

  if (mode == "geoboard") {
    return (
      <>
        {state.grid.map(({ x, y }, i) => {
          let color = "#78909c";
          // if ((x == 0 && y == 0) || i == 0 || i == state.grid.length - 1) {
          //   color = "red";
          // }
          return (
            <Circle
              key={`grid-${x}-${y}`}
              x={state.origin.x + x}
              y={state.origin.y + y}
              stroke={color}
              radius={3}
              fill={color}
            />
          );
        })}
      </>
    );
  }

  if (mode == "rods") {
    const { x, y } = origin;
    return (
      <>
        {lineGrid.map((points, i) => {
          const [x1, y1, x2, y2] = points;
          return <Line key={i} points={[x1 + x, y1 + y, x2 + x, y2 + y]} stroke={"#dddddb"} strokeWidth={1} />;
        })}
      </>
    );
  }
};

export default Grid;

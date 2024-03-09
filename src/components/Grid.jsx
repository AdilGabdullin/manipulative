import { Circle } from "react-konva";
import { useAppStore } from "../state/store";

const Grid = () => {
  const state = useAppStore();
  return (
    <>
      {state.grid.map(({ x, y }, i) => {
        let color = "#78909c";
        if ((x == 0 && y == 0) || i == 0 || i == state.grid.length - 1) {
          color = "red";
        }
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
};

export default Grid;

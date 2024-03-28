import { Circle } from "react-konva";
import { useAppStore } from "../state/store";

const GeoboardGrid = () => {
  const state = useAppStore();
  return (
    <>
      {state.grid.map(({ x, y }, i) => {
        let color = "#78909c";
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

export default GeoboardGrid;

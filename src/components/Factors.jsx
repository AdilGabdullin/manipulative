import { Group, Line } from "react-konva";
import { useAppStore } from "../state/store";
import { workspace } from "../config";
import { baseSize } from "./Tile";
import { commonProps, solvingRectProps } from "./Solving";

const factorsSize = Math.round(baseSize * 1.5);

const Factors = () => {
  const state = useAppStore();
  const { origin } = state;
  if (!state.width || state.workspace != workspace.factors) return null;
  const rect = solvingRectProps(state);
  const { x, y, width, height } = rect;

  return (
    <Group x={Math.round(origin.x + x)} y={Math.round(origin.y + y)}>
      <Line x={0} y={0} points={[-1, 0, width, 0]} {...commonProps} />
      <Line x={0} y={factorsSize} points={[0, 0, width, 0]} {...commonProps} />
      <Line x={0} y={0} points={[0, -1, 0, height]} {...commonProps} />
      <Line x={factorsSize} y={0} points={[0, 0, 0, height]} {...commonProps} />
    </Group>
  );
};

export default Factors;

import { Group, Rect } from "react-konva";
import { config } from "../config";
import { useAppStore } from "../state/store";

const size = config.tile.size;

const Wall = ({}) => {
  const { origin } = useAppStore();

  const width = size * 12;
  const height = size * 9;
  return <Group x={origin.x - width / 2} y={origin.y - height / 2}>
    <Rect x={0} y={0} width={width} />

  </Group>;
};

export default Wall;

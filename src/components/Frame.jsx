import { Group, Rect } from "react-konva";
import { useAppStore } from "../state/store";

const Frame = ({ id, x, y, width, height, resizable }) => {
  const { origin } = useAppStore();
  return (
    <Group id={id} x={Math.round(origin.x + x)} y={Math.round(origin.y + y)}>
      <Rect x={0} y={0} width={width} height={height} strokeWidth={2} stroke={"black"} />
    </Group>
  );
};

export default Frame;

import { Group, Rect } from "react-konva";
import { useAppStore } from "../state/store";

const Frame = ({ id, x, y, width, height, resizable, visible }) => {
  const { origin } = useAppStore();
  x = Math.round(origin.x + (x || 0));
  y = Math.round(origin.y + (y || 0));
  return (
    <Group id={id} x={x} y={y} visible={visible}>
      <Rect x={0} y={0} width={width} height={height} strokeWidth={2} stroke={"black"} />
    </Group>
  );
};

export default Frame;

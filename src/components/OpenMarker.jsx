import { Group, Rect } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";

const OpenMarker = ({ id, x, y, width, height, visible }) => {
  const state = useAppStore();
  const { origin } = state;

  const top = {
    width: width / 20,
    height: width * 0.4,
  };
  const window = {
    width: width * 0.8,
    height: width * 0.8,
    margin: width * 0.1,
  };

  const onDragStart = (e) => {};

  const onDragMove = (e) => {};

  const onDragEnd = (e) => {};

  return (
    <Group
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      <Rect width={width} height={height} stroke={"black"} />
      <Rect
        x={width / 2 - top.width / 2}
        y={0}
        width={top.width}
        height={top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
      />
      <Rect
        x={0}
        y={top.height}
        width={width}
        height={height - top.height}
        stroke={colors.yellow}
        fill={colors.yellow}
        cornerRadius={8}
      />
      <Rect
        x={window.margin}
        y={top.height + window.margin}
        width={window.width}
        height={window.height}
        fill={"white"}
      />
    </Group>
  );
};

export default OpenMarker;

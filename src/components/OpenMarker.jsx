import { Group, Rect } from "react-konva";
import { colors } from "../state/colors";
import { useAppStore } from "../state/store";

const OpenMarker = ({ id, x, y, width, height, visible, locked }) => {
  const state = useAppStore();
  const { origin, selectIds, relocateElement } = state;

  const top = {
    width: width / 20,
    height: width * 0.4,
  };
  const window = {
    width: width * 0.8,
    height: width * 0.8,
    margin: width * 0.1,
  };

  const pos = {
    x: origin.x + x,
    y: origin.y + y,
  };

  return (
    <Group
      id={id}
      x={pos.x}
      y={pos.y}
      visible={visible !== undefined ? visible : true}
      draggable
      onDragEnd={(e) => {
        relocateElement(id, e.target.x() - pos.x, e.target.y() - pos.y);
      }}
      onPointerClick={() => selectIds([id], locked)}
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

import { Group, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { menuHeight } from "./Menu";

const MinValueDropdown = () => {
  const { minValueDropdown } = useAppStore();

  return (
    <Group x={463 - 200 / 2} y={menuHeight + 8} visible={minValueDropdown}>
      <Rect
        name="color-drawer"
        x={0}
        y={0}
        width={200}
        height={400}
        stroke="grey"
        strokeWidth={1}
        cornerRadius={12}
        fill="#ffffff"
        shadowColor="grey"
        shadowBlur={5}
        shadowOffset={{ x: 3, y: 3 }}
        shadowOpacity={0.5}
      />
    </Group>
  );
};

export default MinValueDropdown;

import { Circle, Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import { menuHeight } from "./Menu";

const margin = 10;
const buttonHeight = 60;
const buttonWidth = 140;
const scrollSize = 14;
const stroke = "grey";

const commonProps = {
  cornerRadius: 6,
  stroke: stroke,
  strokeWidth: 2,
};

const textProps = {
  stroke: "#299af3",
  fill: "#299af3",
  align: "center",
  fontFamily: "Calibri",
};

const Comparing = () => {
  const { origin, width, height, fullscreen } = useAppStore();
  if (!width) return null;

  const totalWidth = Math.min(width - leftToolbarWidth - 45, 750);
  let totalHeight = (height - margin * 2 - menuHeight - scrollSize);

  if (fullscreen ) {
    totalHeight = Math.min(totalHeight, 600);
  }

  const mainHeight = totalHeight - buttonHeight - margin;

  const x = origin.x - totalWidth / 2;
  const y = origin.y - (totalHeight + scrollSize) / 2;
  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={totalWidth} height={mainHeight} {...commonProps} />
      <Line x={totalWidth / 2} y={0} points={[0, 0, 0, mainHeight]} {...commonProps} />

      <Button x={totalWidth / 4 - buttonWidth / 2} y={mainHeight + margin} value={100} />
      <CenterCircle x={totalWidth / 2} y={mainHeight + margin + buttonHeight / 2} value={"="} />
      <Button x={(totalWidth * 3) / 4 - buttonWidth / 2} y={mainHeight + margin} value={100} />
    </Group>
  );
};

const CenterCircle = ({ x, y, value }) => {
  const r = buttonHeight / 2;
  const fontSize = 40;
  return (
    <Group x={x} y={y}>
      <Circle x={0} y={0} radius={r} {...commonProps} />
      <Text x={-r} y={-fontSize / 2} width={2 * r} text={value} fontSize={fontSize} {...textProps} />
    </Group>
  );
};

const Button = ({ x, y, value }) => {
  const fontSize = 32;
  return (
    <Group x={x} y={y}>
      <Rect x={0} y={0} width={buttonWidth} height={buttonHeight} {...commonProps} />
      <Text
        x={0}
        y={(buttonHeight - fontSize) / 2}
        width={buttonWidth}
        text={value}
        fontSize={fontSize}
        {...textProps}
      />
    </Group>
  );
};

export default Comparing;

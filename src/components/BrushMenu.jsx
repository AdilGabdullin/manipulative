import { Circle, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";

const colors = [
  "#ffffff",
  "#f06292",
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#2196f3",
  "#4caf50",
  "#ffeb3b",
  "#ff9800",
  "#795548",
  "#616161",
  "#000000",
];

const widthSelectorColor = "#153450";
const grey = "#aeaeae";
const blue1 = "#299af3";
const blue2 = "#03a9f4";
const circleRadius = 14;

const BrushMenu = (props) => {
  const state = useAppStore();
  const { x, y, height } = props;
  const { fdBrushColor, fdMode } = state;
  const circleY = y + height / 2;
  return (
    <>
      {fdMode == "brush" && <WidthSelector x={x + 10} y={y + height / 2 - circleRadius} />}
      {fdMode == "brush" &&
        colors.map((color, i) => (
          <ColorCircle key={i} color={color} x={x + i * 40 + 120} y={circleY} selected={fdBrushColor == color} />
        ))}
      <EraseAll x={fdMode == "brush" ? x + colors.length * 40 + 110 : x + 10} y={y + height / 2 - circleRadius} />
    </>
  );
};

const ColorCircle = (props) => {
  const state = useAppStore();
  const { color, x, y, selected } = props;
  const onPointerClick = () => {
    state.setValue("fdBrushColor", color);
  };
  return (
    <>
      <Circle
        x={x}
        y={y}
        color={color}
        radius={circleRadius}
        stroke={selected ? blue1 : grey}
        strokeWidth={selected ? 2 : 1}
      />
      <Circle
        x={x}
        y={y}
        color={color}
        radius={circleRadius - 4}
        fill={color}
        stroke={"grey"}
        strokeWidth={1}
        onPointerClick={onPointerClick}
      />
    </>
  );
};

const WidthSelector = (props) => {
  const state = useAppStore();
  const { fdBrushSize } = state;
  const { x, y } = props;
  const width = 80;
  const height = circleRadius * 2;
  const buttonWidth = 24;
  const onPointerClick = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (pos.x - x < buttonWidth) {
      if (fdBrushSize > 2) state.setValue("fdBrushSize", fdBrushSize - 2);
    }
    if (pos.x - x > width - buttonWidth && pos.x - x < width) {
      if (fdBrushSize < 40) state.setValue("fdBrushSize", fdBrushSize + 2);
    }
  };
  return (
    <>
      <Rect
        onPointerClick={onPointerClick}
        x={x}
        y={y}
        width={80}
        height={height}
        stroke={widthSelectorColor}
        strokeWidth={2}
        cornerRadius={4}
      />
      <Line
        onPointerClick={onPointerClick}
        points={[x + buttonWidth, y, x + buttonWidth, y + height]}
        strokeWidth={2}
        stroke={widthSelectorColor}
      />
      <Line
        onPointerClick={onPointerClick}
        points={[x + width - buttonWidth, y, x + width - buttonWidth, y + height]}
        strokeWidth={2}
        stroke={widthSelectorColor}
      />
      <Text
        onPointerClick={onPointerClick}
        x={x + 9}
        y={y + 5}
        text={"-"}
        fill={widthSelectorColor}
        fontSize={20}
        fontFamily="Calibri"
      />
      <Text
        x={x + width / 2 + (fdBrushSize > 9 ? -10 : -5)}
        y={y + 5}
        text={fdBrushSize}
        fill={widthSelectorColor}
        fontSize={20}
        fontFamily="Calibri"
      />
      <Text
        onPointerClick={onPointerClick}
        x={x + width - 17}
        y={y + 5}
        text={"+"}
        fill={widthSelectorColor}
        fontSize={20}
        fontFamily="Calibri"
      />
    </>
  );
};

const EraseAll = (props) => {
  const state = useAppStore();

  const { x, y } = props;
  const onPointerClick = () => {
    state.fdRemoveAll();
  };
  return (
    <>
      <Rect
        onPointerClick={onPointerClick}
        x={x}
        y={y}
        width={80}
        height={circleRadius * 2}
        fill={blue2}
        cornerRadius={circleRadius}
      />
      <Text
        onPointerClick={onPointerClick}
        x={x + 8}
        y={y + 6}
        text={"Erase All"}
        fill={"#ffffff"}
        fontSize={18}
        fontFamily="Calibri"
      />
    </>
  );
};

export default BrushMenu;

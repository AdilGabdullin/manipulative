import { Circle, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { arrayChunk } from "../util";
import { Fragment } from "react";

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

const strokeColor = "#153450";
const grey = "#aeaeae";
const blue1 = "#299af3";
const blue2 = "#03a9f4";
const circleRadius = 14;
const padding = 8;

const BrushMenu = (props) => {
  const state = useAppStore();
  const { x, y, height } = props;
  const { fdBrushColor, fdMode } = state;
  const circleY = y + height / 2;
  const openDrawer = (e) => {
    for (const node of e.target.getStage().find(".color-drawer")) {
      node.visible(true);
    }
  };
  return (
    <>
      <EraseAll x={x + 10} y={y + height / 2 - circleRadius} />
      {fdMode == "brush" && (
        <>
          <Circle
            color={fdBrushColor}
            x={x + 120}
            y={circleY}
            radius={circleRadius}
            fill={fdBrushColor}
            stroke={strokeColor}
            strokeWidth={2}
            onPointerClick={openDrawer}
          />
          <WidthSelector x={x + 150} y={y + height / 2 - circleRadius} />
          <Drawer
            x={x + 120 - (circleRadius * 8 + padding * 5) / 2}
            y={y + height + padding}
            width={circleRadius * 8 + padding * 5}
            height={circleRadius * 6 + padding * 4}
          />
        </>
      )}
    </>
  );
};

const Drawer = (props) => {
  const state = useAppStore();
  const { x, y, width, height } = props;
  const step = circleRadius * 2 + padding;
  const onPointerClick = (color) => (e) => {
    state.setValue("fdBrushColor", color);
    for (const node of e.target.getStage().find(".color-drawer")) {
      node.visible(false);
    }
  };
  return (
    <>
      <Rect
        name="color-drawer"
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="grey"
        strokeWidth={1}
        cornerRadius={12}
        fill="#ffffff"
        shadowColor="grey"
        shadowBlur={5}
        shadowOffset={{ x: 3, y: 3 }}
        shadowOpacity={0.5}
        visible={false}
      />
      {arrayChunk(colors, 4).map((row, i) => {
        return (
          <Fragment key={i}>
            {row.map((color, j) => {
              return (
                <Circle
                  key={j}
                  name="color-drawer"
                  x={x + circleRadius + padding + j * step}
                  y={y + circleRadius + padding + i * step}
                  radius={circleRadius}
                  fill={color}
                  stroke={color == "#ffffff" ? grey : color}
                  strokeWidth={1}
                  visible={false}
                  onPointerClick={onPointerClick(color)}
                />
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
};

const WidthSelector = (props) => {
  const state = useAppStore();
  const { fdBrushSize } = state;
  const { x, y } = props;
  const width = 85;
  const buttonWidth = circleRadius * 2;
  const increase = () => {
    if (fdBrushSize < 40) state.setValue("fdBrushSize", fdBrushSize + 2);
  };
  const decrease = () => {
    if (fdBrushSize > 2) state.setValue("fdBrushSize", fdBrushSize - 2);
  };

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={buttonWidth}
        height={buttonWidth}
        stroke={strokeColor}
        strokeWidth={2}
        cornerRadius={4}
        onPointerClick={decrease}
      />
      <Line
        points={[x + 6, y + buttonWidth / 2, x + buttonWidth - 6, y + buttonWidth / 2]}
        strokeWidth={2}
        stroke={strokeColor}
        onPointerClick={decrease}
      />
      <Rect
        x={x + width - buttonWidth}
        y={y}
        width={buttonWidth}
        height={buttonWidth}
        stroke={strokeColor}
        strokeWidth={2}
        cornerRadius={4}
        onPointerClick={increase}
      />
      <Line
        points={[x + width - buttonWidth + 6, y + buttonWidth / 2, x + width - 6, y + buttonWidth / 2]}
        strokeWidth={2}
        stroke={strokeColor}
        onPointerClick={increase}
      />
      <Line
        points={[x + width - buttonWidth / 2, y + 6, x + width - buttonWidth / 2, y + buttonWidth - 6]}
        strokeWidth={2}
        stroke={strokeColor}
        onPointerClick={increase}
      />
      <Text
        x={x + width / 2 + (fdBrushSize > 9 ? -10 : -5)}
        y={y + 5}
        text={fdBrushSize}
        fill={strokeColor}
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
        stroke={blue1}
        strokeWidth={2}
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

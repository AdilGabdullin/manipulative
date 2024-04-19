import { Group, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import BrushMenu from "./BrushMenu";
import config from "../config";

export const menuHeight = 50;

const Menu = () => {
  const state = useAppStore();
  const { width, height, fdMode } = state;
  const x = config.leftToolbar.width;
  const y = 0;
  return (
    <>
      <Line id="bottom-menu-line" points={[x, y + menuHeight, width, y + menuHeight]} stroke="#c0c0c0" />
      <Rect id="bottom-menu-rect" fill="#ffffff" x={x} y={y} width={width} height={menuHeight} />
      {fdMode ? (
        <BrushMenu x={x} y={y} height={menuHeight} />
      ) : (
        <DefaultMenu x={x} y={y} height={menuHeight} width={width - config.leftToolbar.width} />
      )}
    </>
  );
};

const DefaultMenu = (props) => {
  const state = useAppStore();
  const colors = config.colors;
  let { x, y } = props;

  const buttons = [
    {
      text: "Labels",
      field: "showLabels",
      fill: state.showLabels,
      width: 70,
      onClick: () => state.setValue("showLabels", !state.showLabels),
    },
    {
      text: "Summary",
      field: "showSummary",
      fill: state.showSummary,
      width: 70,
      onClick: () => state.setValue("showSummary", !state.showSummary),
    },
    {
      text: "Multi-colored",
      field: "multiColored",
      fill: state.multiColored,
      width: 100,
      onClick: () => state.setValue("multiColored", !state.multiColored),
    },
  ];
  const padding = 8;
  const buttonHeight = 20;

  x += padding;
  return (
    <>
      {buttons.map(({ text, width, fill, onClick }, i) => {
        x += width + padding * 3;
        return (
          <Group
            key={text}
            onPointerClick={(e) => {
              e.cancelBubble = true;
              onClick();
            }}
          >
            <Rect
              x={x - width - padding * 3}
              y={y + padding}
              width={width + padding * 2}
              height={buttonHeight + padding * 2}
              cornerRadius={5}
              fill={fill ? colors.solitude : colors.white}
            />
            <Text
              x={x - width - padding * 2}
              y={y + padding * 2}
              text={text}
              fill={"black"}
              fontSize={18}
              fontFamily="Calibri"
            />
          </Group>
        );
      })}
    </>
  );
};

export default Menu;

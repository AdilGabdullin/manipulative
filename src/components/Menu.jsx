import { Image, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import BrushMenu from "./BrushMenu";
import { Fragment } from "react";
import { colors } from "../config";

export const menuHeight = 50;

const Menu = () => {
  const state = useAppStore();
  const { width, height, fdMode } = state;
  const x = leftToolbarWidth;
  const y = 0;
  return (
    <>
      <Line id="bottom-menu-line" points={[x, y + menuHeight, width, y + menuHeight]} stroke="#c0c0c0" />
      <Rect id="bottom-menu-rect" fill="#ffffff" x={x} y={y} width={width} height={menuHeight} />
      {fdMode ? (
        <BrushMenu x={x} y={y} height={menuHeight} />
      ) : (
        <DefaultMenu x={x} y={y} height={menuHeight} width={width - leftToolbarWidth} />
      )}
    </>
  );
};

const DefaultMenu = (props) => {
  const state = useAppStore();
  let { x, y } = props;

  const buttons = [
    {
      text: "Y-Tiles",
      field: "showYTiles",
      fill: state.showYTiles,
      width: 50,
    },
    {
      text: "Summary",
      field: "showSummary",
      fill: state.showSummary,
      width: 70,
    },
    {
      text: "Multi-colored",
      field: "multiColored",
      fill: state.multiColored,
      width: 100,
    },
  ];
  const padding = 8;
  const buttonHeight = 20;

  const onPointerClick = (field, text) => (e) => {
    e.cancelBubble = true;
    state.toggleGlobal(field);
  };

  x += padding;
  return (
    <>
      {buttons.map(({ text, field, width, fill }, i) => {
        x += width + padding * 3;
        return (
          <Fragment key={text}>
            <Rect
              x={x - width - padding * 3}
              y={y + padding}
              width={width + padding * 2}
              height={buttonHeight + padding * 2}
              cornerRadius={5}
              fill={fill ? colors.solitude : colors.white}
              onPointerClick={onPointerClick(field, text)}
            />
            <Text
              x={x - width - padding * 2}
              y={y + padding * 2}
              text={text}
              fill={"black"}
              fontSize={18}
              fontFamily="Calibri"
              onPointerClick={onPointerClick(field, text)}
            />
          </Fragment>
        );
      })}
    </>
  );
};

export default Menu;

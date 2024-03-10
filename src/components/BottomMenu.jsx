import { Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import BrushMenu from "./BrushMenu";
import { Fragment } from "react";

export const bottomMenuHeight = 50;

const BottomMenu = () => {
  const state = useAppStore();
  const { width, height, fdMode, mode } = state;
  const x = leftToolbarWidth;
  const y = height - bottomMenuHeight;
  return (
    <>
      <Line id="bottom-menu-line" points={[x, y, width, y]} stroke="#c0c0c0" />
      <Rect id="bottom-menu-rect" fill="#ffffff" x={x} y={y} width={width} height={bottomMenuHeight} />
      {!fdMode && mode == "geoboard" && <DefaultMenu x={x} y={y} height={bottomMenuHeight} />}
      {fdMode && <BrushMenu x={x} y={y} height={bottomMenuHeight} />}
    </>
  );
};

const DefaultMenu = (props) => {
  const state = useAppStore();
  const { x, y, height } = props;
  const {} = state;

  const buttons = [
    { text: "Fills", field: "fill" },
    { text: "Angle Measure", field: "measures" },
  ];
  const padding = 8;
  const buttonHeight = 20;
  const buttonWidth = 110;

  return (
    <>
      {buttons.map(({ text, field }, i) => (
        <Fragment key={text}>
          <Rect
            x={x + padding + (padding * 3 + buttonWidth) * i}
            y={y + padding}
            width={buttonWidth + padding * 2}
            height={buttonHeight + padding * 2}
            cornerRadius={5}
            fill={state[field] ? "#e8f4fe" : "#ffffff"}
            onMouseUp={(e) => {
              e.cancelBubble = true;
              state.toggleGlobal(field);
            }}
          />
          <Text
            x={x + padding * 2 + (padding * 3 + buttonWidth) * i}
            y={y + padding * 2}
            text={text}
            fill={"black"}
            fontSize={18}
            fontFamily="Calibri"
            onMouseUp={(e) => {
              e.cancelBubble = true;
              state.toggleGlobal(field);
            }}
          />
        </Fragment>
      ))}
    </>
  );
};

export default BottomMenu;

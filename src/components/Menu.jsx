import { Image, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import BrushMenu from "./BrushMenu";
import { Fragment } from "react";

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
  const { x, y } = props;

  let buttons = [
    {
      text: "Labels",
      field: "showLabels",
      width: 46,
      shift: 0,
      fill: state.showLabels,
    },
    {
      text: "Fractions",
      field: "mixedNumbers",
      width: 66,
      shift: -40,
      fill: !state.mixedNumbers,
    },
    {
      text: "Mixed numbers",
      field: "mixedNumbers",
      width: 110,
      shift: -60,
      fill: state.mixedNumbers,
    },
  ];

  if (state.workspace != "Fractions") {
    buttons = [buttons[0]];
  }

  const padding = 8;
  const buttonHeight = 20;
  const buttonWidth = 110;

  const onPointerClick = (field, text) => (e) => {
    e.cancelBubble = true;
    state.toggle(field);
  };

  return (
    <>
      {buttons.map(({ text, field, image, width, shift, fill }, i) => {
        return (
          <Fragment key={text}>
            <Rect
              x={x + padding + buttonWidth * i + shift}
              y={y + padding}
              width={width + padding * 2}
              height={buttonHeight + padding * 2}
              cornerRadius={5}
              fill={fill ? "#e8f4fe" : "#ffffff"}
              onPointerClick={onPointerClick(field, text)}
            />
            {image && (
              <Image
                image={image}
                x={x + padding + buttonWidth * i + 4 + shift}
                y={y + padding + 4}
                width={30}
                height={(image.height / image.width) * 30}
                onPointerClick={onPointerClick(field, text)}
              />
            )}
            <Text
              x={x + padding * 2 + buttonWidth * i + (image ? 33 : 0) + shift}
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

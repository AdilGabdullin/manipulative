import { Image, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import BrushMenu from "./BrushMenu";
import { Fragment } from "react";
import ShapesMenu from "./ShapesMenu";

export const bottomMenuHeight = 50;

const Menu = () => {
  const state = useAppStore();
  const { width, height, fdMode } = state;
  const x = leftToolbarWidth;
  const y = height - bottomMenuHeight;
  return (
    <>
      <Line id="bottom-menu-line" points={[x, y, width, y]} stroke="#c0c0c0" />
      <Rect id="bottom-menu-rect" fill="#ffffff" x={x} y={y} width={width} height={bottomMenuHeight} />
      {fdMode ? (
        <BrushMenu x={x} y={y} height={bottomMenuHeight} />
      ) : (
        <DefaultMenu x={x} y={y} height={bottomMenuHeight} width={width - leftToolbarWidth} />
      )}
    </>
  );
};

const DefaultMenu = (props) => {
  const state = useAppStore();
  const { x, y } = props;
  const { mode } = state;

  let buttons = [
    {
      text: "Fills",
      visible: ["geoboard", "rods", "fractions"],
      field: "fill",
      image: document.getElementById("fill-button"),
      width: 70,
      shift: 0,
    },
    {
      text: "Angle Measure",
      visible: ["geoboard"],
      field: "measures",
      image: document.getElementById("angle-button"),
      width: 150,
      shift: 0,
    },
    {
      text: "Grid",
      visible: ["rods"],
      field: "showLineGrid",
      image: null,
      width: 35,
      shift: 0,
    },
    {
      text: "Groups",
      visible: ["linking-cubes"],
      field: "showGroups",
      image: null,
      width: 50,
      shift: 0,
    },
    {
      text: "Labels",
      visible: ["rods"],
      field: "labels",
      image: null,
      width: 47,
      shift: -40,
    },
    {
      text: "Fractions",
      visible: ["fractions"],
      field: "labelMode",
      image: null,
      width: 65,
      shift: -10,
    },
    {
      text: "Decimals",
      visible: ["fractions"],
      field: "labelMode",
      image: null,
      width: 68,
      shift: -25,
    },
    {
      text: "Percents",
      visible: ["fractions"],
      field: "labelMode",
      image: null,
      width: 62,
      shift: -35,
    },
    {
      text: "Blank",
      visible: ["fractions"],
      field: "labelMode",
      image: null,
      width: 42,
      shift: -54,
    },
  ];
  buttons = buttons.filter((b) => b.visible.includes(mode));
  const padding = 8;
  const buttonHeight = 20;
  const buttonWidth = 110;

  const onPointerClick = (field, text) => (e) => {
    e.cancelBubble = true;
    if (field == "labelMode") {
      state.setValue("labelMode", text);
    } else {
      state.toggleGlobal(field);
    }
  };

  return (
    <>
      {buttons.map(({ text, field, image, width, shift }, i) => (
        <Fragment key={text}>
          <Rect
            x={x + padding + buttonWidth * i + shift}
            y={y + padding}
            width={width + padding * 2}
            height={buttonHeight + padding * 2}
            cornerRadius={5}
            fill={
              (field == "labelMode" && state.labelMode == text) || (field != "labelMode" && state[field])
                ? "#e8f4fe"
                : "#ffffff"
            }
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
      ))}
      <ShapesMenu {...props} />
    </>
  );
};

export default Menu;

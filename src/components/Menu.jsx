import { Image, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { leftToolbarWidth } from "./LeftToolbar";
import BrushMenu from "./BrushMenu";
import { Fragment } from "react";

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
        <DefaultMenu x={x} y={y} height={bottomMenuHeight} />
      )}
    </>
  );
};

const DefaultMenu = (props) => {
  const state = useAppStore();
  const { x, y, height } = props;
  const { mode } = state;

  let buttons = [
    {
      text: "Fills",
      visible: ["geoboard", "rods", "fractions"],
      field: "fill",
      image: document.getElementById("fill-button"),
      width: 70,
    },
    {
      text: "Angle Measure",
      visible: ["geoboard"],
      field: "measures",
      image: document.getElementById("angle-button"),
      width: 150,
    },
    {
      text: "Grid",
      visible: ["rods"],
      field: "showLineGrid",
      image: null,
      width: 35,
    },
  ];
  buttons = buttons.filter((b) => b.visible.includes(mode));
  const padding = 8;
  const buttonHeight = 20;
  const buttonWidth = 110;

  const onPointerClick = (field) => (e) => {
    e.cancelBubble = true;
    state.toggleGlobal(field);
  };

  return (
    <>
      {buttons.map(({ text, field, image, width }, i) => (
        <Fragment key={text}>
          <Rect
            x={x + padding + buttonWidth * i}
            y={y + padding}
            width={width + padding * 2}
            height={buttonHeight + padding * 2}
            cornerRadius={5}
            fill={state[field] ? "#e8f4fe" : "#ffffff"}
            onPointerClick={onPointerClick(field)}
          />
          {image && (
            <Image
              image={image}
              x={x + padding + buttonWidth * i + 4}
              y={y + padding + 4}
              width={30}
              height={(image.height / image.width) * 30}
              onPointerClick={onPointerClick(field)}
              />
          )}
          <Text
            x={x + padding * 2 + buttonWidth * i + (image ? 33 : 0)}
            y={y + padding * 2}
            text={text}
            fill={"black"}
            fontSize={18}
            fontFamily="Calibri"
            onPointerClick={onPointerClick(field)}
          />
        </Fragment>
      ))}
    </>
  );
};

export default Menu;

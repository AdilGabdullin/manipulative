import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { Fragment } from "react";

const ShapesMenu = (props) => {
  const state = useAppStore();
  const buttons = [
    {
      title: "Text",
      onPointerClick: (e) => {
        state.addElement({ type: "text", x: 0, y: 0, text: "Text", fontSize: 24 });
      },
    },
    {
      title: "Rectangle",
      onPointerClick: (e) => {
        state.addElement({ type: "rect", x: 0, y: 0, width: 100, height: 100 });
      },
    },
    {
      title: "Ellipse",
      onPointerClick: (e) => {
        state.addElement({ type: "ellipse", x: 0, y: 0, radiusX: 100, radiusY: 100 });
      },
    },
    {
      title: "Line",
      onPointerClick: (e) => {
        state.addElement({ type: "line", points: [0, 0, 100, 0] });
      },
    },
  ];
  const margin = 15;
  const buttonWidth = 30;
  const left = props.x + props.width - (buttonWidth + margin) * buttons.length;
  const y = props.y + (props.height - 30) / 2;
  return (
    <>
      {buttons.map(({ title, onPointerClick }, i) => (
        <Fragment key={i}>
          <Rect
            x={left + (buttonWidth + margin) * i}
            y={y}
            width={30}
            height={30}
            stroke={"black"}
            title={title}
            onPointerClick={onPointerClick}
          />
        </Fragment>
      ))}
      <></>
    </>
  );
};

export default ShapesMenu;

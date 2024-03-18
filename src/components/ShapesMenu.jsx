import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";

const color = "purple";
const buttonSize = 30;

const ShapesMenu = (props) => {
  const state = useAppStore();
  const margin = 15;
  const left = props.x + props.width - (buttonSize + margin) * 4;
  const y = props.y + (props.height - 30) / 2;
  return (
    <>
      <TextButton
        x={left + (buttonSize + margin) * 0}
        y={y}
        onPointerClick={() => {
          state.addElement({ type: "text", x: 0, y: 0, text: "Text", fontSize: 24 });
        }}
      />
      <RectButton
        x={left + (buttonSize + margin) * 1}
        y={y}
        onPointerClick={() => {
          state.addElement({ type: "rect", x: 0, y: 0, width: 100, height: 100 });
        }}
      />
      <EllipseButton
        x={left + (buttonSize + margin) * 2}
        y={y}
        onPointerClick={() => {
          state.addElement({ type: "ellipse", x: 0, y: 0, radiusX: 100, radiusY: 100 });
        }}
      />
      <LineButton
        x={left + (buttonSize + margin) * 3}
        y={y}
        onPointerClick={() => {
          state.addElement({ type: "line", x: 0, y: 0, x2: 100, y2: 100 });
        }}
      />
    </>
  );
};

const TextButton = ({ x, y, onPointerClick }) => {
  return (
    <>
      <Rect x={x} y={y} width={buttonSize} height={buttonSize} onPointerClick={onPointerClick} />
      <Text
        text="T"
        fontSize={40}
        x={x + 6}
        y={y - 2}
        fill={color}
        stroke={color}
        fontFamily="Calibri"
        onPointerClick={onPointerClick}
      />
    </>
  );
};

const RectButton = ({ x, y, onPointerClick }) => {
  return (
    <>
      <Rect x={x} y={y} width={buttonSize} height={buttonSize} stroke={color} onPointerClick={onPointerClick} />
    </>
  );
};

const EllipseButton = ({ x, y, onPointerClick }) => {
  return (
    <>
      <Rect x={x} y={y} width={buttonSize} height={buttonSize} onPointerClick={onPointerClick} />
      <Ellipse
        x={x + buttonSize / 2}
        y={y + buttonSize / 2}
        radiusX={buttonSize / 2}
        radiusY={buttonSize / 2}
        stroke={color}
        onPointerClick={onPointerClick}
      />
    </>
  );
};

const LineButton = ({ x, y, onPointerClick }) => {
  return (
    <>
      <Rect x={x} y={y} width={buttonSize} height={buttonSize} onPointerClick={onPointerClick} />
      <Line
        x={x}
        y={y + buttonSize / 2}
        points={[0, 0, buttonSize, 0]}
        stroke={color}
        onPointerClick={onPointerClick}
      />
    </>
  );
};

export default ShapesMenu;

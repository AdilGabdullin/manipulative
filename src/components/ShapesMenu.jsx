import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { getStageXY } from "../util";

const color = "purple";
const buttonSize = 30;
const margin = 15;
let shadowNode = null;
function getShadowNode(e, id) {
  if (!shadowNode || shadowNode.id() != id) {
    shadowNode = e.target.getStage().findOne("#" + id);
  }
  return shadowNode;
}

const ShapesMenu = (props) => {
  const left = props.x + props.width - (buttonSize + margin) * 4;
  const y = props.y + (props.height - 30) / 2;

  return (
    <>
      <TextButton x={left + (buttonSize + margin) * 0} y={y} />
      <RectButton x={left + (buttonSize + margin) * 1} y={y} />
      <EllipseButton x={left + (buttonSize + margin) * 2} y={y} />
      <LineButton x={left + (buttonSize + margin) * 3} y={y} />
    </>
  );
};

const TextButton = (props) => {
  const { x, y } = props;
  const state = useAppStore();
  const { origin } = state;

  const onPointerClick = () => {
    state.addElement({
      type: "text",
      x: -40,
      y: -20,
      text: "Text",
      fontSize: 36,
      width: 100,
      height: 36,
      newText: true,
    });
  };

  const onDragStart = (e) => {
    getShadowNode(e, "shadow-text").setAttrs({
      visible: true,
    });
  };

  const onDragMove = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    getShadowNode(e, "shadow-text").setAttrs({
      x: x + origin.x - 40,
      y: y + origin.y - 20,
    });
  };

  const onDragEnd = (e) => {
    getShadowNode(e, "shadow-text").setAttrs({
      visible: false,
    });
    const { x, y } = getStageXY(e.target.getStage(), state);
    state.addElement({
      type: "text",
      x: x - 40,
      y: y - 20,
      text: "Text",
      fontSize: 36,
      width: 100,
      height: 36,
      newText: true,
    });
  };

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={buttonSize}
        height={buttonSize}
        onPointerClick={onPointerClick}
        draggable
        onDragStart={onDragStart}
        onDragMove={(e) => {
          e.target.setAttrs({ x, y });
          onDragMove(e);
        }}
        onDragEnd={onDragEnd}
      />
      <Text
        text="T"
        fontSize={40}
        x={x + 6}
        y={y - 2}
        fill={color}
        stroke={color}
        fontFamily="Calibri"
        onPointerClick={onPointerClick}
        draggable
        onDragStart={onDragStart}
        onDragMove={(e) => {
          e.target.setAttrs({ x: x + 6, y: y - 2 });
          onDragMove(e);
        }}
        onDragEnd={onDragEnd}
      />
    </>
  );
};

const RectButton = (props) => {
  const { x, y } = props;
  const state = useAppStore();
  const { origin } = state;

  const onPointerClick = () => {
    state.addElement({ type: "rect", x: -60, y: -60, width: 120, height: 120 });
  };

  const onDragStart = (e) => {
    getShadowNode(e, "shadow-rect").setAttrs({
      visible: true,
      fill: null,
      stroke: "black",
      width: 120,
      height: 120,
    });
  };

  const onDragMove = (e) => {
    e.target.setAttrs({ x: props.x, y: props.y });
    const { x, y } = getStageXY(e.target.getStage(), state);
    getShadowNode(e, "shadow-rect").setAttrs({
      x: x + origin.x - 60,
      y: y + origin.y - 60,
    });
  };

  const onDragEnd = (e) => {
    getShadowNode(e, "shadow-rect").setAttrs({
      visible: false,
    });
    const { x, y } = getStageXY(e.target.getStage(), state);
    state.addElement({ type: "rect", x: x - 60, y: y - 60, width: 120, height: 120 });
  };

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={buttonSize}
        height={buttonSize}
        stroke={color}
        onPointerClick={onPointerClick}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
    </>
  );
};

const EllipseButton = (props) => {
  const { x, y } = props;
  const state = useAppStore();
  const { origin } = state;

  const onPointerClick = () => {
    state.addElement({ type: "ellipse", x: 0, y: 0, radiusX: 60, radiusY: 60 });
  };

  const onDragStart = (e) => {
    getShadowNode(e, "shadow-ellipse").setAttrs({
      visible: true,
      fill: null,
      stroke: "black",
      width: 120,
      height: 120,
    });
  };

  const onDragMove = (e) => {
    e.target.setAttrs({ x: props.x + buttonSize / 2, y: props.y + buttonSize / 2 });
    const { x, y } = getStageXY(e.target.getStage(), state);
    getShadowNode(e, "shadow-ellipse").setAttrs({
      x: x + origin.x,
      y: y + origin.y,
    });
  };

  const onDragEnd = (e) => {
    getShadowNode(e, "shadow-ellipse").setAttrs({
      visible: false,
    });
    const { x, y } = getStageXY(e.target.getStage(), state);
    state.addElement({ type: "ellipse", x: x, y: y, radiusX: 60, radiusY: 60 });
  };

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
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
    </>
  );
};

const LineButton = (props) => {
  const { x, y } = props;
  const state = useAppStore();
  const { origin } = state;

  const onPointerClick = () => {
    state.addElement({ type: "line", x: -60, y: 0, x2: 120, y2: 0 });
  };

  const onDragStart = (e) => {
    getShadowNode(e, "shadow-line").setAttrs({
      visible: true,
      fill: null,
      stroke: "black",
      points: [-60, 0, 60, 0],
    });
  };

  const onDragMove = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    getShadowNode(e, "shadow-line").setAttrs({
      x: x + origin.x,
      y: y + origin.y,
    });
  };

  const onDragEnd = (e) => {
    getShadowNode(e, "shadow-line").setAttrs({
      visible: false,
    });
    const { x, y } = getStageXY(e.target.getStage(), state);
    state.addElement({ type: "line", x: x - 60, y: y, x2: 120, y2: 0 });
  };

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={buttonSize}
        height={buttonSize}
        onPointerClick={onPointerClick}
        draggable
        onDragStart={onDragStart}
        onDragMove={(e) => {
          e.target.setAttrs({ x, y });
          onDragMove(e);
        }}
        onDragEnd={onDragEnd}
      />
      <Line
        x={x}
        y={y + buttonSize / 2}
        points={[0, 0, buttonSize, 0]}
        stroke={color}
        onPointerClick={onPointerClick}
        draggable
        onDragStart={onDragStart}
        onDragMove={(e) => {
          e.target.setAttrs({ x, y: y + buttonSize / 2 });
          onDragMove(e);
        }}
        onDragEnd={onDragEnd}
        lineJoin="round"
        lineCap="round"
      />
    </>
  );
};

export default ShapesMenu;

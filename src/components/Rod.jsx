import { Line, Rect, Text } from "react-konva";
import { gridStep, useAppStore } from "../state/store";

const Rod = ({ id, x, y, width, height, fill, fillColor, stroke, locked }) => {
  const state = useAppStore();
  const { origin, elements, fdMode, labelMode } = state;

  let dragNodes = null;
  const getNodes = (e) => {
    if (dragNodes) return dragNodes;
    dragNodes = [];
    const ids = `#${id},#${id}-label-0,#${id}-label-1,#${id}-label-2`;
    for (const node of e.target.getStage().find(ids)) {
      dragNodes.push({ node, x: node.x(), y: node.y() });
    }
    return dragNodes;
  };
  const onDragStart = (e) => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    dx -= dx % (gridStep / 2);
    dy -= dy % (gridStep / 2);
    for (const { node, x, y } of getNodes(e)) {
      node.setAttrs({ x: x + dx, y: y + dy });
    }
  };

  const onDragEnd = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    dx -= dx % (gridStep / 2);
    dy -= dy % (gridStep / 2);
    // setVisibility(e, true);
    state.relocateElement(id, dx, dy);
  };

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
  };

  let text = ((width > height ? width : height) + 2) / gridStep;
  if (text < 1) text = "";
  return (
    <>
      <Rect
        id={id}
        x={origin.x + x}
        y={origin.y + y}
        width={width}
        height={height}
        draggable={!locked && !fdMode}
        fill={fill ? fillColor : null}
        stroke={stroke}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onPointerClick={onPointerClick}
      />
      {labelMode == "Whole Numbers" && (
        <WholeLabel id={id} x={origin.x + x + width / 2} y={origin.y + y + height / 2} text={text} />
      )}
      {labelMode == "Fractions" && (
        <FractionLabel id={id} x={origin.x + x + width / 2} y={origin.y + y + height / 2} text={text} />
      )}
      {labelMode == "Decimals" && (
        <DecimalLabel id={id} x={origin.x + x + width / 2} y={origin.y + y + height / 2} text={text / 10} />
      )}
      <Rect
        x={origin.x + x}
        y={origin.y + y}
        width={width}
        height={height}
        draggable={!locked && !fdMode}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onPointerClick={onPointerClick}
      />
    </>
  );
};

const WholeLabel = ({ id, x, y, text }) => {
  return (
    <Text
      id={`${id}-label-0`}
      name="drag-hidden"
      text={text}
      x={x - 7 - (text % 1 !== 0 ? 10 : 0)}
      y={y - 12}
      stroke={"black"}
      fill={"black"}
      fontSize={30}
      fontFamily="Calibri"
    />
  );
};

const DecimalLabel = ({ id, x, y, text }) => {
  if (text == 1) {
    text = "1.0";
  }
  return (
    <Text
      id={`${id}-label-0`}
      name="drag-hidden"
      text={text}
      x={x - 17 - ((text * 10) % 1 !== 0 ? 9 : 0)}
      y={y - 12}
      stroke={"black"}
      fill={"black"}
      fontSize={30}
      fontFamily="Calibri"
    />
  );
};

const FractionLabel = ({ id, x, y, text }) => {
  if (text == 10) {
    return <WholeLabel x={x} y={y} text={1} />;
  }

  const nominator = text;
  const denominator = 10;

  return (
    <>
      <Text
        id={`${id}-label-0`}
        name="drag-hidden"
        text={nominator}
        x={x - 7 - (nominator > 9 ? 6 : 0)}
        y={y - 12 - 15}
        stroke={"black"}
        fill={"black"}
        fontSize={26}
        fontFamily="Calibri"
      />
      <Line
        id={`${id}-label-1`}
        name="drag-hidden"
        x={x}
        y={y}
        points={[-13, 0, 13, 0]}
        stroke={"black"}
        strokeWidth={2}
      />
      <Text
        id={`${id}-label-2`}
        name="drag-hidden"
        text={denominator}
        x={x - 7 - (denominator > 9 ? 6 : 0)}
        y={y - 12 + 15}
        stroke={"black"}
        fill={"black"}
        fontSize={26}
        fontFamily="Calibri"
      />
    </>
  );
};

export default Rod;

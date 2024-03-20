import { Line, Rect, Text } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { gcd, setVisibility } from "../util";

const Rod = ({ id, x, y, width, height, fill, fillColor, stroke, locked }) => {
  const state = useAppStore();
  const { origin, elements, fdMode, labelMode } = state;

  const onDragStart = (e) => {
    state.clearSelect();
    setVisibility(e, false);
  };

  const onDragMove = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    dx -= dx % (gridStep / 2);
    dy -= dy % (gridStep / 2);
    e.target.setAttrs({ x: origin.x + x + dx, y: origin.y + y + dy });
  };

  const onDragEnd = (e) => {
    let dx = e.target.x() - x - origin.x;
    let dy = e.target.y() - y - origin.y;
    dx -= dx % (gridStep / 2);
    dy -= dy % (gridStep / 2);
    setVisibility(e, true);
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
        <WholeLabel x={origin.x + x + width / 2} y={origin.y + y + height / 2} text={text} />
      )}
      {labelMode == "Fractions" && (
        <FractionLabel x={origin.x + x + width / 2} y={origin.y + y + height / 2} text={text} />
      )}
      {labelMode == "Decimals" && (
        <DecimalLabel x={origin.x + x + width / 2} y={origin.y + y + height / 2} text={text / 10} />
      )}
    </>
  );
};

const WholeLabel = ({ x, y, text }) => {
  return (
    <Text
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

const DecimalLabel = ({ x, y, text }) => {
  return (
    <Text
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

const FractionLabel = ({ x, y, text }) => {
  if (text == 10) {
    return <WholeLabel x={x} y={y} text={1} />;
  }

  const devisor = gcd(text * 2, 20);
  const nominator = (text * 2) / devisor;
  const denominator = 20 / devisor;

  return (
    <>
      <Text
        name="drag-hidden"
        text={nominator}
        x={x - 7 - (nominator > 9 ? 6 : 0)}
        y={y - 12 - 15}
        stroke={"black"}
        fill={"black"}
        fontSize={26}
        fontFamily="Calibri"
      />
      <Line name="drag-hidden" points={[x - 13, y, x + 13, y]} stroke={"black"} strokeWidth={2} />
      <Text
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

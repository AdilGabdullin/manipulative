import { Rect, Text } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { setVisibility } from "../util";

const Rod = ({ id, x, y, width, height, fill, fillColor, stroke, locked }) => {
  const state = useAppStore();
  const { origin, elements, fdMode, labels } = state;

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
      {labels && (
        <Text
          name="cube-group"
          text={text}
          x={origin.x + x + width / 2 - 7 - (text % 1 !== 0 ? 10 : 0)}
          y={origin.y + y + height / 2 - 12}
          stroke={"black"}
          fill={"black"}
          fontSize={30}
          fontFamily="Calibri"
        />
      )}
    </>
  );
};

export default Rod;

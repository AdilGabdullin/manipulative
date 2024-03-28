import { Rect } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { getStageXY } from "../util";
import { Fragment } from "react";
import ResizableIcon from "./ResizableIcon";

export const leftToolbarWidth = 180;

const colors = {
  rods: [
    ["#efefef", "#bdbdbd"],
    ["#f44336", "#d32f2f"],
    ["#8bc34a", "#689f38"],
    ["#9c27b0", "#7b1fa2"],
    ["#ffeb3b", "#fdd835"],
    ["#009688", "#00796b"],
    ["#616161", "#2b2e31"],
    ["#795548", "#5d4037"],
    ["#3f51b5", "#303f9f"],
    ["#ff5722", "#e64a19"],
    ["#e91e63", "#c2185b"],
  ],
};

const LeftToolbar = ({ findOne }) => {
  const state = useAppStore();
  const { origin, fullscreen } = state;
  const margin = fullscreen ? 20 : 10;
  const height = (i) => (state.height - margin * 17) / 10;
  const width = (i) => (height(i) * (i + 10)) / 10;
  const imageX = (i) => (leftToolbarWidth - width(i)) / 2;
  const imageY = (i) => margin * (i + 2) + height(i) * i;
  const fill = (i) => colors["rods"][i][0];
  const stroke = (i) => colors["rods"][i][1];

  const onDragStart = (e, i) => {
    state.clearSelect();
    e.target.visible(false);
    findOne("shadow-rect").setAttrs({
      visible: true,
      fill: fill(i),
      stroke: stroke(i),
      width: gridStep * (i + 1) - 2,
      height: gridStep - 2,
    });
  };

  const magnet = (i, { x, y }) => {
    x = x - (gridStep * (i + 1)) / 2;
    x -= x % (gridStep / 2);
    y = y - gridStep / 2;
    y -= y % (gridStep / 2);
    return { x: x + 1, y: y + 1 };
  };

  const onDragMove = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    findOne("shadow-rect").setAttrs({
      x: origin.x + x,
      y: origin.y + y,
    });
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    findOne("shadow-rect").setAttrs({ visible: false });
    state.addElement({
      type: "rod",
      x: x,
      y: y,
      width: gridStep * (i + 1) - 2,
      height: gridStep - 2,
      fill: state.fill,
      stroke: stroke(i),
      fillColor: fill(i),
      resizable: i == colors["rods"].length - 1,
    });
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {colors["rods"].map((color, i) => {
        const last = i == colors["rods"].length - 1;
        return (
          <Fragment key={i}>
            <Rect x={imageX(i)} y={imageY(i)} width={width(i)} height={height(i)} fill={color[0]} stroke={color[1]} />
            <Rect
              x={imageX(i)}
              y={imageY(i)}
              width={width(i)}
              height={height(i)}
              fill={color[0]}
              stroke={color[1]}
              draggable
              onDragStart={(e) => onDragStart(e, i)}
              onDragMove={(e) => onDragMove(e, i)}
              onDragEnd={(e) => onDragEnd(e, i)}
            />

            {last && (
              <ResizableIcon
                width={width(i) / 3}
                height={height(i) / 4}
                x={imageX(i) + width(i) - width(i) / 3 / 2}
                y={imageY(i) + height(i) / 2}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
};

export default LeftToolbar;

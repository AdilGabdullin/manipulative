import { Arc, Circle, Rect } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { fractionMagnet, getStageXY } from "../util";
import { Fragment } from "react";

export const leftToolbarWidth = 180;

const colors = {
  fractions: [
    ["#f44336", "#d73130"],
    ["#f06292", "#e92467"],
    ["#ff9800", "#f57f07"],
    ["#ffeb3b", "#fed936"],
    ["#4caf50", "#388f3d"],
    ["#03a9f4", "#0a8cd2"],
    ["#3f51b5", "#3240a0"],
    ["#9c27b0", "#7d22a3"],
    ["#616161", "#2b2e31"],
  ],
};

const LeftToolbar = ({ findOne }) => {
  const state = useAppStore();
  const { origin } = state;
  const margin = 20;
  const height = (i) => (state.height - margin * 12) / 10;
  const imageX = (i) => leftToolbarWidth / 2;
  const imageY = (i) => margin * (i + 2) + height(i) * (i + 1);
  const angle = [360, 180, 120, 90, 72, 60, 45, 36, 30];
  const rotation = (i) => (180 - angle[i]) / 2;

  let shadowNode = null;

  const onDragStart = (e, i) => {
    state.clearSelect();
    e.target.visible(false);
    if (i > 0) {
      shadowNode = findOne("shadow-arc");
      shadowNode.setAttrs({
        visible: true,
        innerRadius: 0,
        outerRadius: gridStep * 2,
        angle: angle[i],
        rotation: rotation(i),
        fill: colors["fractions"][i][0],
        stroke: colors["fractions"][i][1],
      });
    } else {
      shadowNode = findOne("shadow-circle");
      shadowNode.setAttrs({
        visible: true,
        radius: gridStep * 2,
        fill: colors["fractions"][i][0],
        stroke: colors["fractions"][i][1],
      });
    }
  };

  const magnet = (i, { x, y }) => {
    shadowNode = findOne("shadow-arc");
    const node = shadowNode;
    let magnet = null;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id()) continue;
      magnet = fractionMagnet({ x, y }, el, angle[i], origin) || magnet;
    }
    return magnet || { x: x + origin.x, y: y + origin.y, rotation: rotation(i) };
  };

  const onDragMove = (e, i) => {
    const { x, y, rotation } = magnet(i, getStageXY(e.target.getStage(), state));

    findOne(i > 0 ? "shadow-arc" : "shadow-circle").setAttrs({
      x: x,
      y: y,
      rotation,
    });
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    const shadow = findOne(i > 0 ? "shadow-arc" : "shadow-circle");
    shadow.setAttrs({ visible: false });
    state.addElement({
      type: "fraction",
      x: x - origin.x,
      y: y - origin.y,
      innerRadius: 0,
      outerRadius: height(i) * 2,
      angle: angle[i],
      rotation: shadow.getAttr("rotation"),
      fill: state.fill,
      fillColor: colors["fractions"][i][0],
      stroke: colors["fractions"][i][1],
    });
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      <Circle
        x={imageX(0)}
        y={margin * 2 + height(0)}
        radius={height(0)}
        fill={colors["fractions"][0][0]}
        stroke={colors["fractions"][0][1]}
        strokeWidth={2}
      />
      <Circle
        x={imageX(0)}
        y={margin * 2 + height(0)}
        radius={height(0)}
        fill={colors["fractions"][0][0]}
        stroke={colors["fractions"][0][1]}
        strokeWidth={2}
        draggable
        onDragStart={(e) => onDragStart(e, 0)}
        onDragMove={(e) => onDragMove(e, 0)}
        onDragEnd={(e) => onDragEnd(e, 0)}
      />
      {colors["fractions"].map(
        (color, i) =>
          i > 0 && (
            <Fragment key={i}>
              <Arc
                x={imageX(i)}
                y={imageY(i)}
                innerRadius={0}
                outerRadius={height(i)}
                angle={angle[i]}
                rotation={rotation(i)}
                fill={color[0]}
                stroke={color[1]}
                strokeWidth={2}
                lineJoin="round"
                lineCap="round"
              />
              <Arc
                x={imageX(i)}
                y={imageY(i)}
                innerRadius={0}
                outerRadius={height(i)}
                angle={angle[i]}
                rotation={rotation(i)}
                fill={color[0]}
                stroke={color[1]}
                strokeWidth={2}
                lineJoin="round"
                lineCap="round"
                draggable
                onDragStart={(e) => onDragStart(e, i)}
                onDragMove={(e) => onDragMove(e, i)}
                onDragEnd={(e) => onDragEnd(e, i)}
              />
            </Fragment>
          )
      )}
    </>
  );
};

export default LeftToolbar;

import { Arc, Circle, Image, Rect, Text } from "react-konva";
import { cubeSize, gridStep, useAppStore } from "../state/store";
import { fractionMagnet, getStageXY, setVisibility } from "../util";
import Cube from "./Cube";
import CubeGroups, { createGroups } from "./CubeGroups";

const Elements = ({ findOne }) => {
  const state = useAppStore();
  const { origin, mode } = state;
  return (
    <>
      {mode == "rods" && <Rods findOne={findOne} />}
      {mode == "linking-cubes" && <Cubes />}
      {mode == "fractions" && <Fractions />}
      <Image id="shadow-image" x={origin.x} y={origin.y} width={cubeSize} height={cubeSize} />
      <Rect id="shadow-rect" />
      <Arc id="shadow-arc" />
      <Circle id="shadow-circle" />
    </>
  );
};

const Cubes = () => {
  const state = useAppStore();
  const { elements, showGroups } = state;

  const list = Object.keys(elements).map((id) => elements[id]);
  list.sort((a, b) => {
    if (a.rotation < b.rotation) {
      return -1;
    }
    if (a.rotation > b.rotation) {
      return 1;
    }
    if (a.rotation == 1) {
      return a.x - b.x;
    }
    if (a.rotation == 0) {
      return b.y - a.y;
    }
  });

  const groups = createGroups(list);

  return (
    <>
      {list.map(({ id }) => {
        const group = [...groups.find((g) => g.some((c) => c.id == id))];
        const index = group.findIndex((c) => c.id == id);

        return (
          <Cube
            key={id}
            {...elements[id]}
            onPointerClick={() => {
              state.selectIds([id], elements[id].locked);
            }}
            group={group.slice(index + 1)}
          />
        );
      })}
      {showGroups && <CubeGroups groups={groups} />}
    </>
  );
};

const Rods = ({ findOne }) => {
  const state = useAppStore();
  const elements = Object.values(state.elements).toSorted((a, b) => a.x + a.y - b.x - b.y);
  return (
    <>
      {elements.map((element) => (
        <Rod key={element.id} {...element} findOne={findOne} />
      ))}
    </>
  );
};

const Rod = ({ id, x, y, width, height, fill, fillColor, stroke, locked, findOne }) => {
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
          x={origin.x + x + width / 2 - 7-(text % 1 !== 0 ? 10: 0)}
          y={origin.y + y + height / 2 - 12 }
          stroke={"black"}
          fill={"black"}
          fontSize={30}
          fontFamily="Calibri"
        />
      )}
    </>
  );
};

const Fractions = () => {
  const state = useAppStore();
  const { elements } = state;
  return (
    <>
      {Object.values(elements).map((element) => {
        return (
          <Fraction
            key={element.id}
            {...element}
            onPointerClick={() => state.selectIds([element.id], element.locked)}
          />
        );
      })}
    </>
  );
};

const Fraction = ({ id, x, y, angle, rotation, fill, fillColor, stroke, locked }) => {
  const state = useAppStore();
  const { origin, fdMode, elements } = state;

  const onDragStart = () => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    const node = e.target;
    let { x, y } = getStageXY(e.target.getStage(), state);
    let magnet = null;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id()) continue;
      magnet = fractionMagnet({ x, y }, el, angle, origin) || magnet;
    }
    e.target.setAttrs(magnet || { x: node.x(), y: node.y(), rotation });
  };
  const onDragEnd = (e) => {
    const node = e.target;
    state.updateElement(id, {
      x: node.x() - origin.x,
      y: node.y() - origin.y,
      rotation: node.rotation(),
    });
  };

  const onPointerClick = (e) => {
    if (fdMode) return;
    state.selectIds([id], elements[id].locked);
  };

  return angle < 360 ? (
    <Arc
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      innerRadius={0}
      outerRadius={gridStep * 2}
      angle={angle}
      rotation={rotation}
      fill={fill ? fillColor : null}
      stroke={stroke}
      strokeWidth={2}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
    />
  ) : (
    <Circle
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      radius={gridStep * 2}
      fill={fill ? fillColor : null}
      stroke={stroke}
      strokeWidth={2}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
    />
  );
};

export default Elements;

import { Arc, Circle, Image, Rect } from "react-konva";
import { cubeShift, cubeSize, gridStep, useAppStore } from "../state/store";
import { cos, fractionMagnet, getStageXY, isPointCloseToLine, numberBetween, sin } from "../util";

const Elements = () => {
  const state = useAppStore();
  const { origin, mode } = state;
  return (
    <>
      {mode == "rods" && <Rods />}
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
  const { elements } = state;

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

  return (
    <>
      {list.map(({ id }) => {
        return <Cube key={id} {...elements[id]} onPointerClick={() => state.selectIds([id], elements[id].locked)} />;
      })}
    </>
  );
};

const Cube = ({ id, x, y, width, height, image, onPointerClick, rotation, locked }) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const d = 47;
  const sens = 12;

  const onDragStart = () => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    const node = e.target;
    const x = node.x() - origin.x;
    const y = node.y() - origin.y;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id() || el.rotation != rotation) continue;
      if (rotation == 1) {
        if (numberBetween(x - d, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x - cubeShift + d);
          e.target.y(el.y + origin.y - cubeShift);
        }
        if (numberBetween(x + d, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x - cubeShift - d);
          e.target.y(el.y + origin.y - cubeShift);
        }
      } else {
        if (numberBetween(y - d, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y - cubeShift + d);
          e.target.x(el.x + origin.x - cubeShift);
        }
        if (numberBetween(y + d, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y - cubeShift - d);
          e.target.x(el.x + origin.x - cubeShift);
        }
      }
    }
  };
  const onDragEnd = (e) => {
    const dx = e.target.x() - x - origin.x + cubeShift;
    const dy = e.target.y() - y - origin.y + cubeShift;
    state.relocateElement(id, dx, dy);
  };
  return (
    <Image
      id={id}
      x={origin.x + x - cubeShift}
      y={origin.y + y - cubeShift}
      width={cubeSize}
      height={cubeSize}
      image={image}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
    />
  );
};

const Rods = () => {
  const state = useAppStore();
  const elements = Object.values(state.elements).toSorted((a, b) => a.x + a.y - b.x - b.y);
  return (
    <>
      {elements.map((element) => (
        <Rod key={element.id} {...element} />
      ))}
    </>
  );
};

const Rod = ({ id, x, y, width, height, fill, fillColor, stroke, locked }) => {
  const state = useAppStore();
  const { origin, elements, fdMode } = state;

  const onDragStart = () => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    const node = e.target;
    let x = node.x() - origin.x;
    let y = node.y() - origin.y;
    x -= x % (gridStep / 2);
    y -= y % (gridStep / 2);
    node.setAttrs({ x: origin.x + x + 1, y: origin.y + y + 1 });
  };
  const onDragEnd = (e) => {
    const dx = e.target.x() - x - origin.x;
    const dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };

  const onPointerClick = (e) => {
    state.selectIds([id], elements[id].locked);
  };

  return (
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
  );
};

const Fractions = () => {
  const state = useAppStore();
  const { elements } = state;
  return (
    <>
      {Object.values(elements).map((element) => {
        return <Fraction key={element.id} {...element} onPointerClick={() => state.selectIds([element.id], element.locked)} />;
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
    let { x, y } = getStageXY(e.target.getStage(), state)
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
      draggable
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
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onPointerClick={onPointerClick}
    />
  );
};

export default Elements;

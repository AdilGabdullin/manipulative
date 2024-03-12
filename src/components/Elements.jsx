import { Arc, Circle, Image, Rect } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { numberBetween } from "../util";

const Elements = () => {
  const state = useAppStore();
  const { origin, mode } = state;
  return (
    <>
      {mode == "rods" && <Rods />}
      {mode == "linking-cubes" && <Cubes />}
      {mode == "fractions" && <Fractions />}
      <Image id="shadow-image" x={origin.x} y={origin.y} />
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
        return <Cube key={id} {...elements[id]} onClick={() => state.selectIds([id], elements[id].locked)} />;
      })}
    </>
  );
};

const Cube = ({ id, x, y, image, onClick, rotation, locked }) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const sens = 10;

  const onDragStart = () => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    const node = e.target;
    const x = node.x() - origin.x;
    const y = node.y() - origin.y;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id || el.rotation != rotation) continue;
      if (rotation == 1) {
        if (numberBetween(x - 50, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x + 50);
          e.target.y(el.y + origin.y);
        }
        if (numberBetween(x + 50, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x - 50);
          e.target.y(el.y + origin.y);
        }
      } else {
        if (numberBetween(y - 50, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y + 50);
          e.target.x(el.x + origin.x);
        }
        if (numberBetween(y + 50, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y - 50);
          e.target.x(el.x + origin.x);
        }
      }
    }
  };
  const onDragEnd = (e) => {
    const dx = e.target.x() - x - origin.x;
    const dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };
  return (
    <Image
      id={id}
      x={origin.x + x}
      y={origin.y + y}
      image={image}
      draggable={!locked && !fdMode}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onClick={onClick}
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

  const onClick = (e) => {
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
      onClick={onClick}
    />
  );
};

const Fractions = () => {
  const state = useAppStore();
  const { elements } = state;
  return (
    <>
      {Object.values(elements).map((element) => {
        return <Fraction key={element.id} {...element} onClick={() => state.selectIds([element.id], element.locked)} />;
      })}
    </>
  );
};

const Fraction = ({ id, x, y, angle, rotation, fill, fillColor, stroke, locked }) => {
  const state = useAppStore();
  const { origin, fdMode } = state;
  const sens = 10;

  const onDragStart = () => {
    state.clearSelect();
  };

  const onDragMove = (e) => {
    return;
    const node = e.target;
    const x = node.x() - origin.x;
    const y = node.y() - origin.y;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id || el.rotation != rotation) continue;
      if (rotation == 1) {
        if (numberBetween(x - 50, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x + 50);
          e.target.y(el.y + origin.y);
        }
        if (numberBetween(x + 50, el.x - sens, el.x + sens) && numberBetween(y, el.y - sens, el.y + sens)) {
          e.target.x(el.x + origin.x - 50);
          e.target.y(el.y + origin.y);
        }
      } else {
        if (numberBetween(y - 50, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y + 50);
          e.target.x(el.x + origin.x);
        }
        if (numberBetween(y + 50, el.y - sens, el.y + sens) && numberBetween(x, el.x - sens, el.x + sens)) {
          e.target.y(el.y + origin.y - 50);
          e.target.x(el.x + origin.x);
        }
      }
    }
  };
  const onDragEnd = (e) => {
    return;
    const dx = e.target.x() - x - origin.x;
    const dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };

  return (
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
    />
  );
};

export default Elements;

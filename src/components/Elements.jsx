import { Circle, Image } from "react-konva";
import { useAppStore } from "../state/store";
import { getStageXY, numberBetween } from "../util";

const Elements = () => {
  const state = useAppStore();
  const { origin, elements } = state;
  return (
    <>
      {Object.keys(elements).map((id) => {
        return <Element key={id} {...elements[id]} onClick={() => state.selectIds([id], elements[id].locked)} />;
      })}
      <Image id="shadow-image" x={origin.x} y={origin.y} />
    </>
  );
};

const Element = (props) => {
  switch (props.type) {
    case "cube":
      return <Cube {...props} />;
      break;
  }
  return;
};

const Cube = ({ id, x, y, image, onClick, rotation }) => {
  const state = useAppStore();
  const { origin } = state;

  const sens = 10;
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
      draggable
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onClick={onClick}
    />
  );
};

export default Elements;

import { Circle, Image } from "react-konva";
import { useAppStore } from "../state/store";

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

const Cube = ({ id, x, y, image, onClick }) => {
  const state = useAppStore();
  const { origin } = state;
  const onDragMove = (e) => {};
  const onDragEnd = (e) => {
    const dx = e.target.x() - x - origin.x;
    const dy = e.target.y() - y - origin.y;
    state.relocateElement(id, dx, dy);
  };
  return (
    <Image id={id} x={origin.x + x} y={origin.y + y} image={image} draggable onDragEnd={onDragEnd} onClick={onClick} />
  );
};

export default Elements;

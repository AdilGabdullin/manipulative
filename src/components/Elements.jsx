import { Circle, Image } from "react-konva";
import { useAppStore } from "../state/store";

const Elements = () => {
  const state = useAppStore();
  const { origin, elements } = state;
  return (
    <>
      {Object.keys(elements).map((key) => {
        const element = elements[key];
        const { id, x, y, image } = element;
        return <Cube key={id} id={id} x={origin.x + x} y={origin.y + y} image={image} />;
      })}
      <Image id="shadow-image" x={origin.x} y={origin.y} />
    </>
  );
};

const Cube = ({ id, x, y, image }) => {
  const state = useAppStore();
  const onDragMove = (e) => {};
  const onDragEnd = (e) => {
    const dx = e.target.x() - x;
    const dy = e.target.y() - y;
    state.relocateElement(id, dx, dy);
  };
  return <Image id={id} x={x} y={y} image={image} draggable onDragEnd={onDragEnd}/>;
};

export default Elements;

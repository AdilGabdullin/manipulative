import { Arc, Circle, Image, Rect } from "react-konva";
import { cubeSize, useAppStore } from "../state/store";
import Cube from "./Cube";
import CubeGroups, { createGroups } from "./CubeGroups";
import Rod from "./Rod";
import Fraction from "./Fraction";
import LineElement from "./LineElement";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";

const Elements = () => {
  const state = useAppStore();
  const { mode } = state;
  return (
    <>
      {mode == "rods" && <Rods />}
      {mode == "linking-cubes" && <Cubes />}
      {mode == "fractions" && <Fractions />}
      <CommonElements />
      <Image id="shadow-image" x={-100} y={-100} width={cubeSize} height={cubeSize} />
      <Rect id="shadow-rect" x={-100} y={-100} />
      <Arc id="shadow-arc" x={-100} y={-100} />
      <Circle id="shadow-circle" x={-100} y={-100} />
    </>
  );
};

const CommonElements = () => {
  const state = useAppStore();
  const { elements } = state;
  return (
    <>
      {Object.values(elements).map((element) => {
        switch (element.type) {
          case "text":
            return <TextElement key={element.id} {...element} />;
            break;
          case "rect":
            return <RectElement key={element.id} {...element} />;
            break;
          case "ellipse":
            return <EllipseElement key={element.id} {...element} />;
            break;
          case "line":
            return <LineElement key={element.id} {...element} />;
            break;
        }
      })}
    </>
  );
};

const Cubes = () => {
  const state = useAppStore();
  const { elements, showGroups } = state;

  const list = Object.values(elements).filter((e) => e.type == "cube");
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

const Rods = () => {
  const state = useAppStore();

  const elements = Object.values(state.elements)
    .filter((e) => e.type == "rod")
    .toSorted((a, b) => a.x + a.y - b.x - b.y);
  return (
    <>
      {elements.map((element) => (
        <Rod key={element.id} {...element} />
      ))}
    </>
  );
};

const Fractions = () => {
  const state = useAppStore();
  const { elements } = state;
  return (
    <>
      {Object.values(elements)
        .filter((e) => e.type == "fraction")
        .map((element) => {
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

export default Elements;

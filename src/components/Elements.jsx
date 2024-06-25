import { Ellipse, Image, Line, Rect, Text } from "react-konva";
import { cubeSize, useAppStore } from "../state/store";
import Cube from "./Cube";
import CubeGroups, { createGroups } from "./CubeGroups";
import LineElement from "./LineElement";
import TextElement, { KIND, initialProps } from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";

const Elements = () => {
  const state = useAppStore();
  const { elements, showGroups } = state;

  const list = sortedElements(elements);

  const groups = createGroups(list);
  return (
    <>
      {list.map((element) => {
        const id = element.id;
        switch (element.type) {
          case "text":
            return <TextElement key={id} {...element} />;
            break;
          case "rect":
            return <RectElement key={id} {...element} />;
            break;
          case "ellipse":
            return <EllipseElement key={id} {...element} />;
            break;
          case "line":
            return <LineElement key={id} {...element} />;
            break;
          case "cube":
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
            break;
        }
      })}
      {showGroups && <CubeGroups groups={groups} />}
      <Image id="shadow-image" visible={false} width={cubeSize} height={cubeSize} />
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <TextElement {...initialProps[KIND.fraction]} id="shadow-fraction" visible={false} editing={-1} />
      <TextElement {...initialProps[KIND.mixed]} id="shadow-mixed" visible={false} editing={-1} />
      <TextElement {...initialProps[KIND.exponent]} id="shadow-exponent" visible={false} editing={-1} />
    </>
  );
};

function sortedElements(elements) {
  return Object.values(elements).toSorted((a, b) => {
    if (a.type != "cube" || b.type != "cube") return 0;
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
}

export default Elements;

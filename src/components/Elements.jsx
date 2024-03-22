import { Arc, Circle, Ellipse, Image, Line, Rect, Text } from "react-konva";
import { cubeSize, useAppStore } from "../state/store";
import Cube from "./Cube";
import CubeGroups, { createGroups } from "./CubeGroups";
import Rod from "./Rod";
import Fraction from "./Fraction";
import LineElement from "./LineElement";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import Pattern from "./Pattern";
import { Fragment } from "react";

const Elements = () => {
  const state = useAppStore();
  const { mode, elements, showGroups } = state;

  const list = sortedElements(elements, mode);

  const groups = mode == "linking-cubes" ? createGroups(list) : [];
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
          case "rod":
            return <Rod key={id} {...element} />;
            break;
          case "fraction":
            return <Fraction key={id} {...element} onPointerClick={() => state.selectIds([id], element.locked)} />;
            break;
          case "pattern":
            return <Pattern key={id} {...element} />;
            break;
          case "template":
            return (
              <Fragment key={id}>
                {element.patterns.map((p) => (
                  <Pattern key={p.id} {...p} template={element} />
                ))}
              </Fragment>
            );
            break;
        }
      })}
      {showGroups && <CubeGroups groups={groups} />}
      <Image id="shadow-image" visible={false} width={cubeSize} height={cubeSize} />
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Arc id="shadow-arc" visible={false} lineJoin="round" lineCap="round" />
      <Circle id="shadow-circle" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
    </>
  );
};

function sortedElements(elements, mode) {
  if (mode == "rods") {
    return Object.values(elements).toSorted((a, b) => {
      if (a.type != "rod" || b.type != "rod") return 0;
      return a.x + a.y - b.x - b.y;
    });
  }
  if (mode == "linking-cubes") {
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
  if (mode == "pattern-blocks") {
    return Object.values(elements).toSorted((a, b) => {
      if (a.type == "pattern" && b.type == "template") return 1;
      if (a.type == "template" && b.type == "pattern") return -1;
      return 0;
    });
  }

  return Object.values(elements);
}

export default Elements;

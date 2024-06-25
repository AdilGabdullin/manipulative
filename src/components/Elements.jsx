import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import LineElement from "./LineElement";
import TextElement, { KIND, initialProps } from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import Pattern from "./Pattern";
import { Fragment } from "react";

const Elements = () => {
  const state = useAppStore();
  const { elements } = state;

  const list = sortedElements(elements);

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
        }
      })}
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
    if (a.type == "pattern" && b.type == "template") return 1;
    if (a.type == "template" && b.type == "pattern") return -1;
    return 0;
  });
}

export default Elements;

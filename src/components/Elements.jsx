import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import Rod from "./Rod";
import LineElement from "./LineElement";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";

const Elements = () => {
  const state = useAppStore();
  const {  elements } = state;
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
          case "rod":
            return <Rod key={id} {...element} />;
            break;
        }
      })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
    </>
  );
};

function sortedElements(elements) {
  return Object.values(elements).toSorted((a, b) => {
    if (a.type != "rod" || b.type != "rod") return 0;
    return a.x + a.y - b.x - b.y;
  });
}

export default Elements;

import { Arc, Circle, Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import Fraction from "./Fraction";
import LineElement from "./LineElement";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";

const Elements = () => {
  const state = useAppStore();
  const { elements, showGroups } = state;

  return (
    <>
      {Object.values(elements).map((element) => {
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
          case "fraction":
            return <Fraction key={id} {...element} onPointerClick={() => state.selectIds([id], element.locked)} />;
            break;
        }
      })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Arc id="shadow-arc" visible={false} lineJoin="round" lineCap="round" />
      <Circle id="shadow-circle" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
    </>
  );
};

export default Elements;

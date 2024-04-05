import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import LineElement from "./LineElement";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import NumberLine, { nlHeight, nlWidth } from "./NumberLine";
import OpenMarker, { omHeight, omWidth } from "./OpenMarker";
import Arrow, { arHeight, arWidth } from "./Arrow";
import Marker, { mHeight, mWidth } from "./Marker";

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
          case "number-line":
            return <NumberLine key={id} {...element} />;
            break;
          case "open-marker":
            return <OpenMarker key={id} {...element} />;
            break;
          case "marker":
            return <Marker key={id} {...element} />;
            break;
          case "arrow":
            return <Arrow key={id} {...element} />;
            break;
        }
      })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <NumberLine id="shadow-number-line" x={0} y={0} visible={false} width={nlWidth} height={nlHeight} />
      <OpenMarker id="shadow-open-marker" x={0} y={0} visible={false} width={omWidth} height={omHeight} />
      <Marker id="shadow-marker" x={0} y={0} visible={false} width={mWidth} height={mHeight} />
      <Arrow id="shadow-arrow-blue" x={0} y={0} visible={false} width={arWidth} height={arHeight} isBlue={true} />
      <Arrow id="shadow-arrow-red" x={0} y={0} visible={false} width={arWidth} height={arHeight} isBlue={false} />
    </>
  );
};

function sortedElements(elements) {
  return Object.values(elements);
}

export default Elements;

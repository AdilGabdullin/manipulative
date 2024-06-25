import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import TextElement, { KIND, initialProps } from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import LineElement from "./LineElement";
import { BoardTile, Tile, tileType } from "./Tile";

const Elements = () => {
  const state = useAppStore();
  const { elements, finishAnimations, finishDelay } = state;

  if (finishDelay) {
    setTimeout(finishAnimations, finishDelay + 50);
  }

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
          case tileType:
            return <BoardTile key={id} {...element} />;
            break;
        }
      })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <TextElement {...initialProps[KIND.fraction]} id="shadow-fraction" visible={false} editing={-1} />
      <TextElement {...initialProps[KIND.mixed]} id="shadow-mixed" visible={false} editing={-1} />
      <TextElement {...initialProps[KIND.exponent]} id="shadow-exponent" visible={false} editing={-1} />
      <Tile id="shadow-tile" visible={false} />
    </>
  );
};

function sortedElements(elements) {
  return Object.values(elements).toSorted((one, two) => one.x + one.y - two.x - two.y);
}

export default Elements;

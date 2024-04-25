import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import LineElement from "./LineElement";
import { BoardTile, Tile, getSize } from "./Tile";
import { config, workspace } from "../config";
import NumberLine from "./NumberLine";

const elementList = {
  text: TextElement,
  rect: RectElement,
  ellipse: EllipseElement,
  line: LineElement,
  tile: BoardTile,
};

const Elements = () => {
  const state = useAppStore();
  const { elements, finishDelay, finishAnimations, numberLine } = state;

  if (finishDelay) {
    setTimeout(finishAnimations, finishDelay + 50);
  }
  return (
    <>
      {Object.values(elements)
        .toSorted((e1, e2) => e1.x - e2.x - (e1.y - e2.y) * 100)
        .map((element) => {
          const Element = elementList[element.type];
          return <Element key={element.id} {...element} />;
        })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <Tile id="shadow-tile" visible={true} size={config.tile.size} />
      {state.workspace == workspace.numberLine && <NumberLine {...numberLine} />}
    </>
  );
};

export default Elements;

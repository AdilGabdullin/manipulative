import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import TextElement, { KIND, initialProps } from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import LineElement from "./LineElement";
import { BoardTile, Tile, getSize } from "./Tile";
import { config, workspace } from "../config";
import NumberLine from "./NumberLine";
import Graph, { GraphLines } from "./Graph";
import Wall from "./Wall";

const elementList = {
  text: TextElement,
  rect: RectElement,
  ellipse: EllipseElement,
  line: LineElement,
  tile: BoardTile,
};

const Elements = () => {
  const state = useAppStore();
  const { elements, finishDelay, finishAnimations } = state;

  if (finishDelay) {
    setTimeout(finishAnimations, finishDelay + 50);
  }
  return (
    <>
      {state.workspace == workspace.graph && <GraphLines />}
      {Object.values(elements)
        .toSorted((e1, e2) => e1.x + e1.y - e2.x - e2.y)
        .map((element) => {
          const Element = elementList[element.type];
          return Element && <Element key={element.id} {...element} />;
        })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <Tile id="shadow-tile" visible={true} width={config.tile.size} height={config.tile.size} />
      <TextElement {...initialProps[KIND.fraction]} id="shadow-fraction" visible={false} editing={-1} />
      <TextElement {...initialProps[KIND.mixed]} id="shadow-mixed" visible={false} editing={-1} />
      <TextElement {...initialProps[KIND.exponent]} id="shadow-exponent" visible={false} editing={-1} />
      {state.workspace == workspace.numberLine && <NumberLine {...elements.numberLine} />}
      {state.workspace == workspace.graph && <Graph />}
      {state.workspace == workspace.wall && <Wall />}
    </>
  );
};

export default Elements;

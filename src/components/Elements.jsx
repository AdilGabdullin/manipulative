import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import LineElement from "./LineElement";
import { BoardTile, Tile } from "./Tile";
import { config, workspace } from "../config";
import PartPartWhole from "./PartPartWhole";
import Frame from "./Frame";

const elementList = {
  text: TextElement,
  rect: RectElement,
  ellipse: EllipseElement,
  line: LineElement,
  tile: BoardTile,
  frame: Frame,
};

const Elements = () => {
  const state = useAppStore();
  const { elements, finishDelay, finishAnimations } = state;

  if (finishDelay) {
    setTimeout(finishAnimations, finishDelay + 50);
  }

  const frameSize = config.frame.size;
  return (
    <>
      {state.workspace == workspace.ppw && <PartPartWhole />}
      {sortElements(elements).map((element) => {
        const Element = elementList[element.type];
        return Element && <Element key={element.id} {...element} />;
      })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <Tile id="shadow-tile+" visible={true} size={config.tile.size} text="+" fill={config.tile.options[0].fill}/>
      <Tile id="shadow-tile-" visible={true} size={config.tile.size} text="-" fill={config.tile.options[1].fill}/>
      <Tile id="shadow-tile0" visible={true} size={config.tile.size} text="0" fill={config.tile.options[2].fill}/>
      <Frame id="shadow-frame-5" visible={false} width={5 * frameSize} height={1 * frameSize} />
      <Frame id="shadow-frame-10" visible={false} width={5 * frameSize} height={2 * frameSize} />
      <Frame id="shadow-frame-resizable" visible={false} width={4 * frameSize} height={3 * frameSize} />
    </>
  );
};

function sortElements(elements) {
  elements = Object.values(elements);
  const back = (e) => ["rect", "ellipse", "frame"].includes(e.type);
  const front = (e) => ["text", "line"].includes(e.type);
  const others = (e) => !["rect", "ellipse", "frame", "text", "line"].includes(e.type);
  return [
    ...elements.filter(back),
    ...elements.filter(others).toSorted((e1, e2) => e1.x - e2.x - (e1.y - e2.y) * 100),
    ...elements.filter(front),
  ];
}

export default Elements;

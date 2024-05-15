import { Ellipse, Line, Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import TextElement from "./TextElement";
import RectElement from "./RectElement";
import EllipseElement from "./EllipseElement";
import config from "../config";
import { Block, BoardBlock } from "./Block";
import LineElement from "./LineElement";

const elementList = {
  text: TextElement,
  rect: RectElement,
  ellipse: EllipseElement,
  line: LineElement,
  block: BoardBlock,
};

const Elements = () => {
  const state = useAppStore();
  const { elements, finishDelay, finishAnimations } = state;

  if (finishDelay) {
    setTimeout(finishAnimations, finishDelay + 50);
  }
  const scale = [config.workspace.addition, config.workspace.subtraction].includes(state.workspace)
    ? config.block.size / 2
    : config.block.size;

  return (
    <>
      {sortElements(elements).map((element) => {
        const Element = elementList[element.type];
        return <Element key={element.id} {...element} />;
      })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <Block id="shadow-block-1" visible={false} label={"1"} scale={scale} />
      <Block id="shadow-block-10" visible={false} label={"10"} scale={scale} />
      <Block id="shadow-block-10-h" visible={false} size={[10, 1, 1]} label={"10"} scale={scale} />
      <Block id="shadow-block-100" visible={false} label={"100"} scale={scale} />
      <Block id="shadow-block-1000" visible={false} label={"1000"} scale={scale} />
    </>
  );
};

function sortElements(elements) {
  elements = Object.values(elements);
  const typeRectOrEllipse = (e) => ["rect", "ellipse"].includes(e.type);
  const typeTextOrLine = (e) => ["text", "line"].includes(e.type);
  const typeOther = (e) => !["rect", "ellipse", "text", "line"].includes(e.type);
  return [
    ...elements.filter(typeRectOrEllipse),
    ...elements.filter(typeOther).toSorted((e1, e2) => e2.x - e1.x - (e1.y - e2.y) * 100),
    ...elements.filter(typeTextOrLine),
  ];
}

export default Elements;

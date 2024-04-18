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
  const { elements } = state;

  return (
    <>
      {Object.values(elements)
        .toSorted((e1, e2) => e1.x - e2.x - e1.y + e2.y)
        .map((element) => {
          const Element = elementList[element.type];
          return <Element key={element.id} {...element} />;
        })}
      <Rect id="shadow-rect" visible={false} />
      <Ellipse id="shadow-ellipse" visible={false} />
      <Line id="shadow-line" visible={false} lineCap={"round"} lineJoin={"round"} />
      <Text id="shadow-text" visible={false} fill={"black"} fontSize={36} text="Text" fontFamily="Calibri" />
      <Block id="shadow-block-1" visible={false} label={"1"} scale={config.block.size} />
      <Block id="shadow-block-10" visible={false} label={"10"} scale={config.block.size} />
      <Block id="shadow-block-100" visible={false} label={"100"} scale={config.block.size} />
      <Block id="shadow-block-1000" visible={false} label={"1000"} scale={config.block.size} />
    </>
  );
};

export default Elements;
